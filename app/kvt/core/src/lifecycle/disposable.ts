/**
 * A small lifecycle contract used by flows, ViewModels and runtime scopes.
 */
export interface Disposable {
  dispose(): void
}

/**
 * Wraps a cleanup callback and guarantees that it runs only once.
 */
export class Subscription implements Disposable {
  private disposed = false

  constructor(private readonly disposeFn: () => void) {}

  dispose() {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.disposeFn()
  }
}

/**
 * Owns many disposables and releases them together.
 */
export class CompositeDisposable implements Disposable {
  private readonly disposables = new Set<Disposable>()
  private disposed = false

  add(disposable: Disposable): Disposable {
    if (this.disposed) {
      disposable.dispose()
      return disposable
    }

    this.disposables.add(disposable)
    return new Subscription(() => {
      this.disposables.delete(disposable)
      disposable.dispose()
    })
  }

  dispose() {
    if (this.disposed) {
      return
    }

    this.disposed = true
    for (const disposable of this.disposables) {
      disposable.dispose()
    }
    this.disposables.clear()
  }
}
