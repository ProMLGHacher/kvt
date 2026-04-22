import type { KvtRuntime, LazyModuleLoader, LoadedModule } from '@kvt/core'
import type { ComponentType, ReactNode } from 'react'
import { useMemo } from 'react'
import {
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  type LoaderFunctionArgs,
  type RouteObject
} from 'react-router'
import { useKvt } from '../hooks/use-kvt'

export { Link as KvtLink, Outlet as KvtOutlet }

type LoadedRouteComponent =
  | ComponentType
  | { default: ComponentType }
  | { Component: ComponentType }
type RouteComponentLoader = () => Promise<LoadedRouteComponent>
type RouteLoader = (args: LoaderFunctionArgs) => unknown | Promise<unknown>

interface BaseRouteDefinition {
  readonly path?: string
  readonly fallback?: ReactNode
  readonly children?: readonly KvtRouteDefinition[]
  readonly loader?: RouteLoader
}

export interface KvtLayoutRouteDefinition extends BaseRouteDefinition {
  readonly type: 'layout'
  readonly element: ReactNode
}

export interface KvtScreenRouteDefinition extends BaseRouteDefinition {
  readonly type: 'screen'
  readonly index?: boolean
  readonly element: ReactNode
}

export interface KvtFeatureRouteDefinition extends BaseRouteDefinition {
  readonly type: 'feature'
  readonly index?: boolean
  readonly moduleKey?: string
  readonly module: LazyModuleLoader | (() => Promise<LoadedModule | Record<string, unknown>>)
  readonly component: RouteComponentLoader
}

export type KvtRouteDefinition =
  | KvtLayoutRouteDefinition
  | KvtScreenRouteDefinition
  | KvtFeatureRouteDefinition

export interface KvtRouterProviderProps {
  readonly routes: readonly KvtRouteDefinition[]
}

export function kvtLayoutRoute(
  definition: Omit<KvtLayoutRouteDefinition, 'type'>
): KvtLayoutRouteDefinition {
  return {
    ...definition,
    type: 'layout'
  }
}

export function kvtRoute(
  definition: Omit<KvtScreenRouteDefinition, 'type'>
): KvtScreenRouteDefinition {
  return {
    ...definition,
    type: 'screen'
  }
}

export function kvtFeatureRoute(
  definition: Omit<KvtFeatureRouteDefinition, 'type'>
): KvtFeatureRouteDefinition {
  return {
    ...definition,
    type: 'feature'
  }
}

/**
 * Framework-owned React Router provider.
 *
 * Feature routes declare their module dependency. The provider wires that
 * declaration into the route loader so DI is installed before the screen asks
 * for its ViewModel.
 */
export function KvtRouterProvider({ routes }: KvtRouterProviderProps) {
  const runtime = useKvt()
  const router = useMemo(
    () => createBrowserRouter(routes.map((route) => toRouteObject(route, runtime))),
    [routes, runtime]
  )

  return <RouterProvider router={router} />
}

function toRouteObject(route: KvtRouteDefinition, runtime: KvtRuntime): RouteObject {
  const baseRouteObject = {
    path: route.path,
    hydrateFallbackElement: route.fallback,
    children: route.children?.map((childRoute) => toRouteObject(childRoute, runtime))
  }

  if (route.type === 'screen') {
    return route.index
      ? {
          index: true,
          element: route.element,
          loader: route.loader
        }
      : {
          ...baseRouteObject,
          element: route.element,
          loader: route.loader
        }
  }

  if (route.type === 'layout') {
    return {
      ...baseRouteObject,
      element: route.element,
      loader: route.loader
    }
  }

  const loader = async (args: LoaderFunctionArgs) => {
    const moduleKey = route.moduleKey ?? route.path ?? 'index'
    await runtime.container.loadModule(moduleKey, async () =>
      normalizeLoadedModule(await route.module())
    )
    return route.loader?.(args)
  }
  const lazy = async () => {
    return {
      Component: normalizeRouteComponent(await route.component())
    }
  }

  return route.index
    ? {
        index: true,
        loader,
        lazy
      }
    : {
        ...baseRouteObject,
        loader,
        lazy
      }
}

function normalizeRouteComponent(loadedComponent: LoadedRouteComponent): ComponentType {
  if (typeof loadedComponent === 'function') {
    return loadedComponent
  }

  return 'Component' in loadedComponent ? loadedComponent.Component : loadedComponent.default
}

function normalizeLoadedModule(loadedModule: LoadedModule | Record<string, unknown>): LoadedModule {
  if (typeof loadedModule === 'function' || 'default' in loadedModule || 'module' in loadedModule) {
    return loadedModule as LoadedModule
  }

  throw new Error('Lazy DI module must export default module or named "module"')
}
