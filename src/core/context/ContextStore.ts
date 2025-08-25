import { App } from "obsidian";
import { ContextBoundary, ContextQuery, PluginState } from "../interfaces";

/**
 * 🧠 Context Store - จัดการ Context Boundaries และ Context-aware Operations
 */
export class ContextStore {
  private app: App;
  private contexts: Map<string, ContextBoundary> = new Map();
  private globalContext: ContextBoundary;
  private sessionContext: ContextBoundary | null = null;
  private auditTrail: string[] = [];

  constructor(app: App) {
    this.app = app;

    // สร้าง Global Context
    this.globalContext = {
      id: "global",
      source: "system",
      scope: "global",
      payload: {
        app: "Ultima-Orb",
        version: "1.0.0",
        platform: "obsidian",
        timestamp: Date.now(),
      },
      auditTrail: [],
      createdAt: Date.now(),
      priority: "high",
    };

    this.contexts.set("global", this.globalContext);
  }

  /**
   * 📝 สร้าง Context Boundary
   */
  createContext(config: {
    id: string;
    source: "user" | "agent" | "tool" | "system";
    scope: "global" | "session" | "tool";
    payload: Record<string, any>;
    expiresAt?: number;
  }): ContextBoundary {
    const context: ContextBoundary = {
      id: config.id,
      source: config.source,
      scope: config.scope,
      payload: config.payload,
      expiresAt: config.expiresAt,
      auditTrail: [],
      createdAt: Date.now(),
      priority: "medium",
    };

    this.contexts.set(config.id, context);
    this.auditTrail.push(`Created context: ${config.id} (${config.scope})`);

    return context;
  }

  /**
   * 📋 รับ Context
   */
  getContext(id: string): ContextBoundary | undefined {
    const context = this.contexts.get(id);

    if (context && context.expiresAt && Date.now() > context.expiresAt) {
      // Context หมดอายุ
      this.contexts.delete(id);
      this.auditTrail.push(`Expired context removed: ${id}`);
      return undefined;
    }

    return context;
  }

  /**
   * 🔄 อัปเดต Context
   */
  updateContext(id: string, updates: Partial<ContextBoundary>): boolean {
    const context = this.contexts.get(id);
    if (!context) {
      return false;
    }

    // อัปเดต payload
    if (updates.payload) {
      context.payload = { ...context.payload, ...updates.payload };
    }

    // อัปเดต audit trail
    if (updates.auditTrail) {
      context.auditTrail = [...context.auditTrail, ...updates.auditTrail];
    }

    // อัปเดต expiresAt
    if (updates.expiresAt) {
      context.expiresAt = updates.expiresAt;
    }

    this.auditTrail.push(`Updated context: ${id}`);
    return true;
  }

  /**
   * 🗑️ ลบ Context
   */
  removeContext(id: string): boolean {
    if (id === "global") {
      return false; // ไม่ให้ลบ global context
    }

    const removed = this.contexts.delete(id);
    if (removed) {
      this.auditTrail.push(`Removed context: ${id}`);
    }

    return removed;
  }

  /**
   * 🔍 ค้นหา Context
   */
  searchContexts(query: ContextQuery): ContextBoundary[] {
    const results: ContextBoundary[] = [];
    const now = Date.now();

    for (const context of this.contexts.values()) {
      // ตรวจสอบการหมดอายุ
      if (context.expiresAt && now > context.expiresAt) {
        continue;
      }

      // ตรวจสอบ scope
      if (query.scope && context.scope !== query.scope) {
        continue;
      }

      // ตรวจสอบ source
      if (query.source && !query.source.includes(context.source)) {
        continue;
      }

      // ตรวจสอบ tags
      if (query.tags && context.tags) {
        const hasMatchingTag = query.tags.some((tag) =>
          context.tags!.includes(tag)
        );
        if (!hasMatchingTag) {
          continue;
        }
      }

      // ตรวจสอบ priority
      if (query.priority && !query.priority.includes(context.priority)) {
        continue;
      }

      results.push(context);
    }

    // เรียงลำดับ
    if (query.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (query.sortBy) {
          case "createdAt":
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case "priority":
            aValue = this.getPriorityValue(a.priority);
            bValue = this.getPriorityValue(b.priority);
            break;
          case "expiresAt":
            aValue = a.expiresAt || 0;
            bValue = b.expiresAt || 0;
            break;
          default:
            return 0;
        }

        if (query.sortOrder === "desc") {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }

    // จำกัดจำนวนผลลัพธ์
    if (query.limit) {
      return results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * 🧠 สร้าง Session Context
   */
  createSessionContext(
    sessionId: string,
    initialData: Record<string, any>
  ): ContextBoundary {
    const sessionContext = this.createContext({
      id: `session_${sessionId}`,
      source: "user",
      scope: "session",
      payload: {
        sessionId,
        startTime: Date.now(),
        ...initialData,
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 ชั่วโมง
    });

    this.sessionContext = sessionContext;
    return sessionContext;
  }

  /**
   * 📋 รับ Session Context ปัจจุบัน
   */
  getCurrentSession(): ContextBoundary | null {
    return this.sessionContext;
  }

  /**
   * 🔄 สลับ Session
   */
  switchSession(
    sessionId: string,
    data?: Record<string, any>
  ): ContextBoundary {
    // ปิด session เดิม
    if (this.sessionContext) {
      this.updateContext(this.sessionContext.id, {
        payload: {
          ...this.sessionContext.payload,
          endTime: Date.now(),
        },
      });
    }

    // สร้าง session ใหม่
    return this.createSessionContext(sessionId, data || {});
  }

  /**
   * 🧩 รวม Contexts
   */
  mergeContexts(contextIds: string[]): Record<string, any> {
    const merged: Record<string, any> = {};

    for (const id of contextIds) {
      const context = this.getContext(id);
      if (context) {
        // รวม payload โดยให้ context ที่มาทีหลัง override ตัวก่อนหน้า
        Object.assign(merged, context.payload);
      }
    }

    return merged;
  }

  /**
   * 📊 สถิติ Context Store
   */
  getStats(): {
    totalContexts: number;
    activeContexts: number;
    expiredContexts: number;
    globalContext: boolean;
    sessionContext: boolean;
    auditTrailLength: number;
  } {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;

    for (const context of this.contexts.values()) {
      if (context.expiresAt && now > context.expiresAt) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalContexts: this.contexts.size,
      activeContexts: activeCount,
      expiredContexts: expiredCount,
      globalContext: this.contexts.has("global"),
      sessionContext: this.sessionContext !== null,
      auditTrailLength: this.auditTrail.length,
    };
  }

  /**
   * 🧹 ทำความสะอาด Contexts ที่หมดอายุ
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, context] of this.contexts.entries()) {
      if (id !== "global" && context.expiresAt && now > context.expiresAt) {
        this.contexts.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.auditTrail.push(`Cleaned up ${cleanedCount} expired contexts`);
    }

    return cleanedCount;
  }

  /**
   * 📝 เพิ่ม Audit Entry
   */
  addAuditEntry(entry: string): void {
    this.auditTrail.push(`${new Date().toISOString()}: ${entry}`);

    // จำกัดขนาด audit trail
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-500);
    }
  }

  /**
   * 📋 รับ Audit Trail
   */
  getAuditTrail(limit?: number): string[] {
    if (limit) {
      return this.auditTrail.slice(-limit);
    }
    return [...this.auditTrail];
  }

  /**
   * 💾 Export Context Store State
   */
  exportState(): Record<string, any> {
    return {
      contexts: Array.from(this.contexts.entries()),
      sessionContextId: this.sessionContext?.id || null,
      auditTrail: this.auditTrail,
      timestamp: Date.now(),
    };
  }

  /**
   * 📥 Import Context Store State
   */
  importState(state: Record<string, any>): void {
    // ล้าง contexts เดิม
    this.contexts.clear();

    // โหลด contexts ใหม่
    if (state.contexts) {
      for (const [id, context] of state.contexts) {
        this.contexts.set(id, context);
      }
    }

    // โหลด session context
    if (state.sessionContextId) {
      this.sessionContext = this.contexts.get(state.sessionContextId) || null;
    }

    // โหลด audit trail
    this.auditTrail = state.auditTrail || [];

    this.addAuditEntry("Context store state imported");
  }

  // ===== PRIVATE METHODS =====

  /**
   * 🔢 แปลง Priority เป็นตัวเลข
   */
  private getPriorityValue(
    priority: "low" | "medium" | "high" | "critical"
  ): number {
    const values = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return values[priority] || 0;
  }
}
