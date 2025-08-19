/**
 * 🚌 Events Bus Service
 * จัดการ events และการสื่อสารระหว่าง components ของ plugin
 */

export type EventHandler = (...args: any[]) => void;
export type EventMap = Record<string, EventHandler[]>;

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  id: string;
}

export class EventsBus {
  private events: EventMap = {};
  private subscriptions: Map<string, EventSubscription> = new Map();
  private subscriptionCounter = 0;

  /**
   * ลงทะเบียน event handler
   */
  public on(event: string, handler: EventHandler): string {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(handler);

    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    this.subscriptions.set(subscriptionId, {
      event,
      handler,
      id: subscriptionId
    });

    return subscriptionId;
  }

  /**
   * ลงทะเบียน event handler ที่ทำงานครั้งเดียว
   */
  public once(event: string, handler: EventHandler): string {
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };

    return this.on(event, wrappedHandler);
  }

  /**
   * ยกเลิกการลงทะเบียน event handler
   */
  public off(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      return;
    }

    const index = this.events[event].indexOf(handler);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }

    // ลบจาก subscriptions
    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.event === event && subscription.handler === handler) {
        this.subscriptions.delete(id);
        break;
      }
    }
  }

  /**
   * ยกเลิกการลงทะเบียนตาม subscription ID
   */
  public unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.off(subscription.event, subscription.handler);
    this.subscriptions.delete(subscriptionId);
    return true;
  }

  /**
   * ส่ง event
   */
  public emit(event: string, ...args: any[]): void {
    if (!this.events[event]) {
      return;
    }

    // สร้าง copy ของ handlers เพื่อป้องกันการเปลี่ยนแปลงระหว่างการ execute
    const handlers = [...this.events[event]];

    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    }
  }

  /**
   * ส่ง event แบบ async
   */
  public async emitAsync(event: string, ...args: any[]): Promise<void> {
    if (!this.events[event]) {
      return;
    }

    const handlers = [...this.events[event]];
    const promises = handlers.map(async (handler) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`Error in async event handler for "${event}":`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * ตรวจสอบว่ามี event listeners หรือไม่
   */
  public hasListeners(event: string): boolean {
    return !!(this.events[event] && this.events[event].length > 0);
  }

  /**
   * นับจำนวน listeners สำหรับ event
   */
  public listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }

  /**
   * รับรายการ events ทั้งหมด
   */
  public getEventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * ลบ event listeners ทั้งหมดสำหรับ event
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      if (this.events[event]) {
        this.events[event] = [];
      }
      
      // ลบ subscriptions ที่เกี่ยวข้อง
      for (const [id, subscription] of this.subscriptions.entries()) {
        if (subscription.event === event) {
          this.subscriptions.delete(id);
        }
      }
    } else {
      // ลบทั้งหมด
      this.events = {};
      this.subscriptions.clear();
    }
  }

  /**
   * รับรายการ subscriptions ทั้งหมด
   */
  public getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * ตรวจสอบสถานะของ EventsBus
   */
  public getStats(): {
    totalEvents: number;
    totalSubscriptions: number;
    eventsWithListeners: number;
  } {
    const totalEvents = Object.keys(this.events).length;
    const totalSubscriptions = this.subscriptions.size;
    const eventsWithListeners = Object.values(this.events).filter(handlers => handlers.length > 0).length;

    return {
      totalEvents,
      totalSubscriptions,
      eventsWithListeners
    };
  }

  /**
   * สร้าง event emitter สำหรับ namespace
   */
  public namespace(namespace: string): NamespacedEventsBus {
    return new NamespacedEventsBus(this, namespace);
  }

  /**
   * ตรวจสอบ memory leaks
   */
  public checkMemoryLeaks(): {
    orphanedEvents: string[];
    totalOrphanedHandlers: number;
  } {
    const orphanedEvents: string[] = [];
    let totalOrphanedHandlers = 0;

    for (const [event, handlers] of Object.entries(this.events)) {
      if (handlers.length === 0) {
        orphanedEvents.push(event);
      } else {
        totalOrphanedHandlers += handlers.length;
      }
    }

    return {
      orphanedEvents,
      totalOrphanedHandlers
    };
  }

  /**
   * Cleanup orphaned events
   */
  public cleanup(): void {
    for (const [event, handlers] of Object.entries(this.events)) {
      if (handlers.length === 0) {
        delete this.events[event];
      }
    }
  }
}

/**
 * Namespaced EventsBus สำหรับจัดการ events ใน namespace
 */
export class NamespacedEventsBus {
  private parentBus: EventsBus;
  private namespace: string;

  constructor(parentBus: EventsBus, namespace: string) {
    this.parentBus = parentBus;
    this.namespace = namespace;
  }

  private getNamespacedEvent(event: string): string {
    return `${this.namespace}:${event}`;
  }

  public on(event: string, handler: EventHandler): string {
    return this.parentBus.on(this.getNamespacedEvent(event), handler);
  }

  public once(event: string, handler: EventHandler): string {
    return this.parentBus.once(this.getNamespacedEvent(event), handler);
  }

  public off(event: string, handler: EventHandler): void {
    this.parentBus.off(this.getNamespacedEvent(event), handler);
  }

  public emit(event: string, ...args: any[]): void {
    this.parentBus.emit(this.getNamespacedEvent(event), ...args);
  }

  public async emitAsync(event: string, ...args: any[]): Promise<void> {
    await this.parentBus.emitAsync(this.getNamespacedEvent(event), ...args);
  }

  public hasListeners(event: string): boolean {
    return this.parentBus.hasListeners(this.getNamespacedEvent(event));
  }

  public listenerCount(event: string): number {
    return this.parentBus.listenerCount(this.getNamespacedEvent(event));
  }
}

// Predefined events
export const PluginEvents = {
  // Plugin lifecycle
  PLUGIN_LOAD: 'plugin:load',
  PLUGIN_UNLOAD: 'plugin:unload',
  PLUGIN_CLEANUP: 'plugin:cleanup',

  // AI events
  AI_PROVIDER_CONNECTED: 'ai:provider:connected',
  AI_PROVIDER_DISCONNECTED: 'ai:provider:disconnected',
  AI_RESPONSE_RECEIVED: 'ai:response:received',
  AI_ERROR_OCCURRED: 'ai:error:occurred',

  // Chat events
  CHAT_MESSAGE_SENT: 'chat:message:sent',
  CHAT_MESSAGE_RECEIVED: 'chat:message:received',
  CHAT_HISTORY_CLEARED: 'chat:history:cleared',

  // Integration events
  INTEGRATION_CONNECTED: 'integration:connected',
  INTEGRATION_DISCONNECTED: 'integration:disconnected',
  INTEGRATION_DATA_SYNCED: 'integration:data:synced',

  // Tool events
  TOOL_EXECUTED: 'tool:executed',
  TOOL_ERROR: 'tool:error',
  TOOL_RESULT: 'tool:result',

  // Knowledge events
  KNOWLEDGE_UPDATED: 'knowledge:updated',
  KNOWLEDGE_SEARCHED: 'knowledge:searched',
  KNOWLEDGE_IMPORTED: 'knowledge:imported',

  // Settings events
  SETTINGS_CHANGED: 'settings:changed',
  SETTINGS_SAVED: 'settings:saved',

  // UI events
  UI_OPENED: 'ui:opened',
  UI_CLOSED: 'ui:closed',
  UI_STATE_CHANGED: 'ui:state:changed',

  // Performance events
  PERFORMANCE_METRIC: 'performance:metric',
  PERFORMANCE_WARNING: 'performance:warning',

  // Error events
  ERROR_OCCURRED: 'error:occurred',
  ERROR_RESOLVED: 'error:resolved',

  // Security events
  SECURITY_EVENT: 'security:event',
  AUTHENTICATION_SUCCESS: 'authentication:success',
  AUTHENTICATION_FAILED: 'authentication:failed'
} as const;
