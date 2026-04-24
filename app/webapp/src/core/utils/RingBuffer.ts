export class RingBuffer<T> {
  private readonly data: Array<T | undefined>
  private start = 0
  private count = 0

  constructor(
    private readonly capacity: number,
    initial: readonly T[] = []
  ) {
    this.data = new Array<T | undefined>(capacity)

    for (const item of initial.slice(-capacity)) {
      this.push(item)
    }
  }

  push(item: T): void {
    if (this.count < this.capacity) {
      const index = (this.start + this.count) % this.capacity
      this.data[index] = item
      this.count++
      return
    }

    this.data[this.start] = item
    this.start = (this.start + 1) % this.capacity
  }

  clear(): void {
    this.data.fill(undefined)
    this.start = 0
    this.count = 0
  }

  toArray(): T[] {
    const result = new Array<T>(this.count)

    for (let i = 0; i < this.count; i++) {
      result[i] = this.data[(this.start + i) % this.capacity]!
    }

    return result
  }

  get size(): number {
    return this.count
  }
}
