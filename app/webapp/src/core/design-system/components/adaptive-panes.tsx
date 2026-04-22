import { type ReactNode } from 'react'
import { usePaneNavigator } from '../adaptive'
import { cn } from '../utils'

export type SupportingPaneRole = 'main' | 'supporting'
export type ListDetailPaneRole = 'list' | 'detail' | 'extra'

export interface SupportingPaneScaffoldProps {
  mainPane: ReactNode
  supportingPane: ReactNode
  className?: string
  compactBehavior?: 'single' | 'stack'
  initialPane?: SupportingPaneRole
  mainPaneClassName?: string
  supportingPaneClassName?: string
}

export function SupportingPaneScaffold({
  mainPane,
  supportingPane,
  className,
  compactBehavior = 'single',
  initialPane = 'main',
  mainPaneClassName,
  supportingPaneClassName
}: SupportingPaneScaffoldProps) {
  const navigator = usePaneNavigator<SupportingPaneRole>(['main', 'supporting'], {
    paneCount: 2,
    compactBehavior,
    initialPane
  })

  return (
    <div
      className={cn(
        'grid gap-5',
        navigator.directive.mode === 'dual' &&
          'md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]',
        navigator.directive.mode === 'stack' && 'grid-cols-1',
        className
      )}
      data-pane-mode={navigator.directive.mode}
      data-window-width-class={navigator.windowSizeClass.width}
    >
      {navigator.isPaneVisible('main') && <div className={mainPaneClassName}>{mainPane}</div>}
      {navigator.isPaneVisible('supporting') && (
        <aside className={supportingPaneClassName}>{supportingPane}</aside>
      )}
    </div>
  )
}

export interface ListDetailPaneScaffoldProps {
  listPane: ReactNode
  detailPane: ReactNode
  extraPane?: ReactNode
  className?: string
  compactBehavior?: 'single' | 'stack'
  initialPane?: ListDetailPaneRole
  listPaneClassName?: string
  detailPaneClassName?: string
  extraPaneClassName?: string
}

export function ListDetailPaneScaffold({
  listPane,
  detailPane,
  extraPane,
  className,
  compactBehavior = 'single',
  initialPane = 'list',
  listPaneClassName,
  detailPaneClassName,
  extraPaneClassName
}: ListDetailPaneScaffoldProps) {
  const roles: ListDetailPaneRole[] = extraPane ? ['list', 'detail', 'extra'] : ['list', 'detail']
  const navigator = usePaneNavigator<ListDetailPaneRole>(roles, {
    paneCount: extraPane ? 3 : 2,
    compactBehavior,
    initialPane
  })

  return (
    <div
      className={cn(
        'grid gap-5',
        navigator.directive.mode === 'dual' &&
          'md:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.25fr)]',
        navigator.directive.mode === 'triple' &&
          'xl:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)_minmax(18rem,0.8fr)]',
        navigator.directive.mode === 'stack' && 'grid-cols-1',
        className
      )}
      data-pane-mode={navigator.directive.mode}
      data-window-width-class={navigator.windowSizeClass.width}
    >
      {navigator.isPaneVisible('list') && <aside className={listPaneClassName}>{listPane}</aside>}
      {navigator.isPaneVisible('detail') && <div className={detailPaneClassName}>{detailPane}</div>}
      {extraPane && navigator.isPaneVisible('extra') && (
        <aside className={extraPaneClassName}>{extraPane}</aside>
      )}
    </div>
  )
}
