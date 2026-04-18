import type { SignalEnvelope } from '@/features/protocol/types'

export type SignalingState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

export class SignalingClient {
  private socket: WebSocket | null = null
  private listeners = new Set<(message: SignalEnvelope) => void>()
  private stateListeners = new Set<(state: SignalingState) => void>()
  private state: SignalingState = 'idle'

  async connect(url: string) {
    this.setState('connecting')
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(url)
      socket.addEventListener('open', () => {
        this.socket = socket
        this.setState('open')
        resolve()
      })
      socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data as string) as SignalEnvelope
        this.listeners.forEach((listener) => listener(message))
      })
      socket.addEventListener('error', () => {
        this.setState('error')
        reject(new Error('websocket connection failed'))
      })
      socket.addEventListener('close', () => {
        if (this.socket === socket) {
          this.socket = null
        }
        this.setState('closed')
      })
    })
  }

  subscribe(listener: (message: SignalEnvelope) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  subscribeState(listener: (state: SignalingState) => void) {
    this.stateListeners.add(listener)
    listener(this.state)
    return () => this.stateListeners.delete(listener)
  }

  send<T>(message: SignalEnvelope<T>) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('signaling socket is not connected')
    }
    this.socket.send(JSON.stringify(message))
  }

  close() {
    if (!this.socket) {
      this.setState('closed')
      return
    }
    this.socket.close()
    this.socket = null
  }

  private setState(state: SignalingState) {
    this.state = state
    this.stateListeners.forEach((listener) => listener(state))
  }
}
