import { describeService, type ServiceIdentifier, type ViewModel } from '@kvt/core'
import { useEffect } from 'react'
import { useKvt } from './use-kvt'

export interface UseViewModelOptions {
  key?: string
}

/**
 * Resolves a stable ViewModel instance from the KVT container.
 *
 * This follows Android's ViewModelProvider shape: UI asks for a ViewModel type,
 * the runtime store keeps it stable, and DI builds the dependency graph.
 */
export function useViewModel<TViewModel extends ViewModel>(
  identifier: ServiceIdentifier<TViewModel>,
  options: UseViewModelOptions = {}
): TViewModel {
  const { container, viewModels } = useKvt()
  const key = options.key ?? describeService(identifier)
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
  }, [viewModel])

  return viewModel
}
