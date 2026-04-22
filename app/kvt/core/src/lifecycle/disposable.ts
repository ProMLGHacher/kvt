/**
 * Common lifecycle cleanup contract used by flows, ViewModels and runtime scopes.
 *
 * If an API starts long-lived work, such as a subscription, timer, listener or
 * socket, it should return a Disposable so the owner can stop that work later.
 */
export interface Disposable {
  dispose(): void
}

/**
 * Wraps a cleanup callback and guarantees that it runs only once.
 *
 * Use Subscription when adapting APIs with their own cleanup names, such as
 * unsubscribe(), removeEventListener(), abort() or close().
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
 *
 * This is useful for ViewModels and scopes that collect multiple subscriptions
 * and need one deterministic cleanup point.
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
