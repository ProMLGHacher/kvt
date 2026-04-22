import { describeService, type ServiceIdentifier, type ViewModel } from '@kvt/core'
import { useEffect } from 'react'
import { useKvt } from './use-kvt'

export interface UseViewModelOptions {
  key?: string
  clearOnUnmount?: boolean
}

/**
 * Resolves a stable ViewModel instance from the KVT container.
 *
 * This follows Android's ViewModelProvider shape: UI asks for a ViewModel type,
 * the runtime store keeps it stable, and DI builds the dependency graph.
 *
 * By default the ViewModel is cleared when the component that owns this hook
 * unmounts. Pass `clearOnUnmount: false` for app-level retained ViewModels.
 */
export function useViewModel<TViewModel extends ViewModel>(
  identifier: ServiceIdentifier<TViewModel>,
  options: UseViewModelOptions = {}
): TViewModel {
  const { container, viewModels } = useKvt()
  const key = options.key ?? describeService(identifier)
  const clearOnUnmount = options.clearOnUnmount ?? true
  const shouldCreate = !viewModels.has(key)
  const viewModelContainer = shouldCreate ? container.createChild() : undefined

  const viewModel = viewModels.get(
    key,
    () => {
      if (!viewModelContainer) {
        throw new Error(`ViewModel "${key}" should already exist`)
      }

      return viewModelContainer.resolve(identifier)
    },
    viewModelContainer
  )

  useEffect(() => {
    viewModel.initialize()
    return () => {
      if (clearOnUnmount) {
        viewModels.clear(key)
      }
    }
  }, [clearOnUnmount, key, viewModel, viewModels])

  return viewModel
}
