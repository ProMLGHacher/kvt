import { CompositeDisposable } from './disposable'
import type { Disposable } from './disposable'

/**
 * Presentation state holder inspired by Android ViewModel.
 *
 * ViewModels expose immutable UI state, receive user intents from the UI, call
 * use cases and own cleanup for long-lived presentation work.
 */
export abstract class ViewModel {
  private readonly disposables = new CompositeDisposable()
  private initialized = false
  private cleared = false

  /**
   * Called once by UI adapters after the ViewModel is first resolved.
   *
   * Return a cleanup function or Disposable when setup starts long-lived work.
   */
  protected onInit(): void | Disposable | (() => void) {}

  initialize() {
    if (this.initialized) {
      return
    }

    this.initialized = true
    const cleanup = this.onInit()
    if (typeof cleanup === 'function') {
      this.addDisposable({ dispose: cleanup })
    } else if (cleanup) {
      this.addDisposable(cleanup)
    }
  }

  clear() {
    if (this.cleared) {
      return
    }

    this.cleared = true
    this.onCleared()
    this.disposables.dispose()
  }

  protected addDisposable(disposable: Disposable): Disposable {
    return this.disposables.add(disposable)
  }

  /**
   * Override for custom cleanup before registered disposables are released.
   */
  protected onCleared() {}
}

/**
 * Stores ViewModels by key so UI adapters can keep instances stable across renders.
 *
 * The store owns ViewModels until the key is cleared or the entire store is
 * disposed, similar to Android's ViewModelStore owner boundary.
 */
export class ViewModelStore implements Disposable {
  private readonly instances = new Map<string, ViewModel>()
  private readonly scopedDisposables = new Map<string, Disposable>()

  has(key: string): boolean {
    return this.instances.has(key)
  }

  /**
   * Returns an existing ViewModel or creates one for the given owner key.
   *
   * This mirrors Android's ViewModelStore: render lifecycles can come and go,
   * but the ViewModel lives until its owning store or explicit key is cleared.
   */
  get<TViewModel extends ViewModel>(
    key: string,
    factory: () => TViewModel,
    scopedDisposable?: Disposable
  ): TViewModel {
    const existing = this.instances.get(key)
    if (existing) {
      scopedDisposable?.dispose()
      return existing as TViewModel
    }

    const viewModel = factory()
    this.instances.set(key, viewModel)
    if (scopedDisposable) {
      this.scopedDisposables.set(key, scopedDisposable)
    }
    return viewModel
  }

  clear(key: string) {
    const viewModel = this.instances.get(key)
    if (!viewModel) {
      return
    }

    this.instances.delete(key)
    viewModel.clear()
    this.scopedDisposables.get(key)?.dispose()
    this.scopedDisposables.delete(key)
  }

  dispose() {
    for (const viewModel of this.instances.values()) {
      viewModel.clear()
    }
    this.instances.clear()
    for (const disposable of this.scopedDisposables.values()) {
      disposable.dispose()
    }
    this.scopedDisposables.clear()
  }
}
