import { describe, it, expect, beforeEach, vi } from "vitest";
import { ContextStore } from "../../../src/core/context/ContextStore";
import { App } from "obsidian";

// Mock Obsidian App
const mockApp = {
  vault: {
    read: vi.fn(),
    write: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  },
  workspace: {
    onLayoutReady: vi.fn(),
    getActiveViewOfType: vi.fn(),
    getLeavesOfType: vi.fn(),
  },
} as unknown as App;

describe("ContextStore", () => {
  let contextStore: ContextStore;

  beforeEach(() => {
    contextStore = new ContextStore(mockApp);
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("Constructor", () => {
    it("should initialize with global context", () => {
      const globalContext = contextStore.getContext("global");
      expect(globalContext).toBeDefined();
      expect(globalContext?.id).toBe("global");
      expect(globalContext?.scope).toBe("global");
      expect(globalContext?.source).toBe("system");
    });

    it("should have correct global context payload", () => {
      const globalContext = contextStore.getContext("global");
      expect(globalContext?.payload).toEqual({
        app: "Ultima-Orb",
        version: "1.0.0",
        platform: "obsidian",
        timestamp: expect.any(Number),
      });
    });
  });

  describe("createContext", () => {
    it("should create a new context successfully", () => {
      const context = contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
      });

      expect(context.id).toBe("test-context");
      expect(context.source).toBe("user");
      expect(context.scope).toBe("session");
      expect(context.payload).toEqual({ test: "data" });
      expect(context.createdAt).toBeDefined();
      expect(context.priority).toBe("medium");
    });

    it("should add context to internal storage", () => {
      contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
      });

      const retrieved = contextStore.getContext("test-context");
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe("test-context");
    });

    it("should add audit entry when creating context", () => {
      contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
      });

      const auditTrail = contextStore.getAuditTrail();
      expect(auditTrail).toContain("Created context: test-context (session)");
    });
  });

  describe("getContext", () => {
    it("should return undefined for non-existent context", () => {
      const context = contextStore.getContext("non-existent");
      expect(context).toBeUndefined();
    });

    it("should return context for existing context", () => {
      const created = contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
      });

      const retrieved = contextStore.getContext("test-context");
      expect(retrieved).toEqual(created);
    });

    it("should remove expired context", () => {
      const expiredContext = contextStore.createContext({
        id: "expired-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      });

      // Manually set expiresAt to simulate expired context
      (expiredContext as any).expiresAt = Date.now() - 1000;

      const retrieved = contextStore.getContext("expired-context");
      expect(retrieved).toBeUndefined();
    });
  });

  describe("updateContext", () => {
    it("should update context payload", () => {
      const context = contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { original: "data" },
      });

      const success = contextStore.updateContext("test-context", {
        payload: { updated: "data" },
      });

      expect(success).toBe(true);

      const updated = contextStore.getContext("test-context");
      expect(updated?.payload).toEqual({ updated: "data" });
    });

    it("should update audit trail", () => {
      contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
      });

      contextStore.updateContext("test-context", {
        auditTrail: ["test-entry"],
      });

      const updated = contextStore.getContext("test-context");
      expect(updated?.auditTrail).toContain("test-entry");
    });

    it("should return false for non-existent context", () => {
      const success = contextStore.updateContext("non-existent", {
        payload: { test: "data" },
      });

      expect(success).toBe(false);
    });
  });

  describe("removeContext", () => {
    it("should remove existing context", () => {
      contextStore.createContext({
        id: "test-context",
        source: "user",
        scope: "session",
        payload: { test: "data" },
      });

      const removed = contextStore.removeContext("test-context");
      expect(removed).toBe(true);

      const retrieved = contextStore.getContext("test-context");
      expect(retrieved).toBeUndefined();
    });

    it("should not remove global context", () => {
      const removed = contextStore.removeContext("global");
      expect(removed).toBe(false);

      const globalContext = contextStore.getContext("global");
      expect(globalContext).toBeDefined();
    });

    it("should return false for non-existent context", () => {
      const removed = contextStore.removeContext("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("searchContexts", () => {
    beforeEach(() => {
      // Create test contexts
      contextStore.createContext({
        id: "session-1",
        source: "user",
        scope: "session",
        payload: { type: "session", data: "1" },
        expiresAt: Date.now() + 3600000, // 1 hour from now
      });

      contextStore.createContext({
        id: "tool-1",
        source: "tool",
        scope: "tool",
        payload: { type: "tool", data: "1" },
        expiresAt: Date.now() + 3600000,
      });

      contextStore.createContext({
        id: "session-2",
        source: "user",
        scope: "session",
        payload: { type: "session", data: "2" },
        expiresAt: Date.now() + 3600000,
      });
    });

    it("should filter by scope", () => {
      const sessionContexts = contextStore.searchContexts({ scope: "session" });
      expect(sessionContexts).toHaveLength(2);
      expect(sessionContexts.every((ctx) => ctx.scope === "session")).toBe(
        true
      );
    });

    it("should filter by source", () => {
      const userContexts = contextStore.searchContexts({ source: ["user"] });
      expect(userContexts).toHaveLength(2);
      expect(userContexts.every((ctx) => ctx.source === "user")).toBe(true);
    });

    it("should limit results", () => {
      const limited = contextStore.searchContexts({ limit: 1 });
      expect(limited).toHaveLength(1);
    });

    it("should sort by createdAt", () => {
      const sorted = contextStore.searchContexts({
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(sorted.length).toBeGreaterThan(1);
      if (sorted[0] && sorted[1]) {
        expect(sorted[0].createdAt).toBeGreaterThan(sorted[1].createdAt);
      }
    });
  });

  describe("Session Management", () => {
    it("should create session context", () => {
      const session = contextStore.createSessionContext("test-session", {
        userId: "user123",
        preferences: { theme: "dark" },
      });

      expect(session.id).toBe("session_test-session");
      expect(session.scope).toBe("session");
      expect(session.source).toBe("user");
      expect(session.payload.sessionId).toBe("test-session");
      expect(session.payload.userId).toBe("user123");
      expect(session.payload.preferences).toEqual({ theme: "dark" });
    });

    it("should get current session", () => {
      const session = contextStore.createSessionContext("test-session", {});
      const current = contextStore.getCurrentSession();

      expect(current).toEqual(session);
    });

    it("should switch sessions", () => {
      const session1 = contextStore.createSessionContext("session-1", {});
      const session2 = contextStore.switchSession("session-2", { new: "data" });

      expect(session2.id).toBe("session_session-2");
      expect(session2.payload.new).toBe("data");

      // Previous session should be updated with endTime
      const updatedSession1 = contextStore.getContext("session_session-1");
      expect(updatedSession1?.payload.endTime).toBeDefined();
    });
  });

  describe("mergeContexts", () => {
    it("should merge multiple contexts", () => {
      contextStore.createContext({
        id: "ctx-1",
        source: "user",
        scope: "session",
        payload: { a: 1, b: 2 },
      });

      contextStore.createContext({
        id: "ctx-2",
        source: "tool",
        scope: "tool",
        payload: { b: 3, c: 4 },
      });

      const merged = contextStore.mergeContexts(["ctx-1", "ctx-2"]);
      expect(merged).toEqual({ a: 1, b: 3, c: 4 }); // Later context overrides
    });

    it("should handle non-existent contexts", () => {
      const merged = contextStore.mergeContexts([
        "non-existent-1",
        "non-existent-2",
      ]);
      expect(merged).toEqual({});
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", () => {
      // Create some contexts
      contextStore.createContext({
        id: "active-1",
        source: "user",
        scope: "session",
        payload: {},
        expiresAt: Date.now() + 3600000,
      });

      contextStore.createContext({
        id: "expired-1",
        source: "user",
        scope: "session",
        payload: {},
        expiresAt: Date.now() - 1000,
      });

      const stats = contextStore.getStats();

      expect(stats.totalContexts).toBeGreaterThan(0);
      expect(stats.globalContext).toBe(true);
      expect(stats.sessionContext).toBe(false); // No current session
      expect(stats.auditTrailLength).toBeGreaterThan(0);
    });
  });

  describe("cleanup", () => {
    it("should remove expired contexts", () => {
      // Create expired context
      contextStore.createContext({
        id: "expired-1",
        source: "user",
        scope: "session",
        payload: {},
        expiresAt: Date.now() - 1000,
      });

      const cleanedCount = contextStore.cleanup();
      expect(cleanedCount).toBe(1);

      const retrieved = contextStore.getContext("expired-1");
      expect(retrieved).toBeUndefined();
    });

    it("should not remove global context", () => {
      const cleanedCount = contextStore.cleanup();
      expect(cleanedCount).toBe(0);

      const globalContext = contextStore.getContext("global");
      expect(globalContext).toBeDefined();
    });
  });

  describe("Audit Trail", () => {
    it("should add audit entries", () => {
      contextStore.addAuditEntry("Test audit entry");

      const auditTrail = contextStore.getAuditTrail();
      expect(auditTrail).toContain("Test audit entry");
    });

    it("should limit audit trail size", () => {
      // Add many entries to trigger size limit
      for (let i = 0; i < 1500; i++) {
        contextStore.addAuditEntry(`Entry ${i}`);
      }

      const auditTrail = contextStore.getAuditTrail();
      expect(auditTrail.length).toBeLessThanOrEqual(1000);
    });

    it("should limit audit trail when requested", () => {
      for (let i = 0; i < 100; i++) {
        contextStore.addAuditEntry(`Entry ${i}`);
      }

      const limitedTrail = contextStore.getAuditTrail(10);
      expect(limitedTrail.length).toBe(10);
    });
  });

  describe("State Management", () => {
    it("should export state", () => {
      contextStore.createSessionContext("test-session", { test: "data" });

      const state = contextStore.exportState();

      expect(state.contexts).toBeDefined();
      expect(state.sessionContextId).toBe("session_test-session");
      expect(state.auditTrail).toBeDefined();
      expect(state.timestamp).toBeDefined();
    });

    it("should import state", () => {
      const originalState = contextStore.exportState();

      // Clear and reimport
      contextStore.importState(originalState);

      const newState = contextStore.exportState();
      expect(newState.contexts).toEqual(originalState.contexts);
    });
  });
});
