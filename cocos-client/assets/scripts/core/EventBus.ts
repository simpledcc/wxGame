export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus<Events extends object = Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<EventHandler<any>>>();

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    const bucket = this.handlers.get(event) || new Set<EventHandler<any>>();
    bucket.add(handler);
    this.handlers.set(event, bucket);
    return () => this.off(event, handler);
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}
