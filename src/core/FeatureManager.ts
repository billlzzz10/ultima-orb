import { App, Notice } from "obsidian";

/**
 * 🎯 Feature Manager - จัดการฟีเจอร์ Free vs Max Mode
 * ปรับปรุงให้มีฟีเจอร์ฟรีครบถ้วนเหมือน Cursor และ Continue จริงๆ
 */
export class FeatureManager {
  private app: App;
  private licenseType: "free" | "max" = "free";

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 🆓 Get Free Mode Features (ปรับปรุงให้ครบถ้วน)
   */
  getFreeFeatures(): string[] {
    return [
      // ===== AI FEATURES (ครบถ้วนเหมือน Cursor/Continue) =====
      "ai-chat", // AI Chat ครบทุก provider
      "ai-code-completion", // Code completion
      "ai-code-explanation", // อธิบายโค้ด
      "ai-code-debugging", // Debug โค้ด
      "ai-code-refactoring", // Refactor โค้ด
      "ai-code-generation", // สร้างโค้ด
      "ai-code-review", // Review โค้ด
      "ai-documentation", // สร้างเอกสาร
      "ai-testing", // สร้าง tests
      "ai-optimization", // ปรับปรุงประสิทธิภาพ

      // ===== AGENT FEATURES (ครบถ้วน) =====
      "agent-mode", // Agent Mode ครบทุกประเภท
      "agent-flow-mode", // Agent Flow Mode
      "agent-build-mode", // Build Agent Mode
      "agent-customization", // ปรับแต่ง Agent

      // ===== COMMAND FEATURES (ครบถ้วน) =====
      "at-commands", // @ Commands ครบทุกประเภท
      "custom-commands", // Custom Commands ไม่จำกัด
      "command-palette", // Command Palette
      "keyboard-shortcuts", // Keyboard shortcuts

      // ===== KNOWLEDGE FEATURES (ครบถ้วน) =====
      "knowledge-base", // Knowledge Base ไม่จำกัด
      "knowledge-search", // ค้นหาข้อมูล
      "knowledge-indexing", // สร้าง index
      "knowledge-import", // นำเข้าข้อมูล
      "knowledge-export", // ส่งออกข้อมูล

      // ===== INTEGRATION FEATURES (ครบถ้วน) =====
      "mcp-integrations", // MCP Integrations ครบทุกตัว
      "notion-integration", // Notion
      "clickup-integration", // ClickUp
      "airtable-integration", // Airtable
      "github-integration", // GitHub
      "gitlab-integration", // GitLab

      // ===== UI/UX FEATURES (ครบถ้วน) =====
      "sidebar-views", // Sidebar Views
      "chat-interface", // Chat Interface
      "knowledge-view", // Knowledge View
      "settings-dashboard", // Settings Dashboard
      "command-palette-ui", // Command Palette UI
      "responsive-design", // Responsive Design

      // ===== VISUALIZATION FEATURES (ครบถ้วน) =====
      "markmap-integration", // Markmap
      "mermaid-integration", // Mermaid
      "canvas-tools", // Canvas Tools
      "graph-enhancement", // Graph Enhancement
      "timeline-view", // Timeline View
      "chart-tools", // Chart Tools

      // ===== PRODUCTIVITY FEATURES (ครบถ้วน) =====
      "kanban-board", // Kanban Board
      "calendar-view", // Calendar View
      "task-management", // Task Management
      "project-tracking", // Project Tracking

      // ===== DATA FEATURES (ครบถ้วน) =====
      "table-tools", // Table Tools
      "data-processing", // Data Processing
      "data-visualization", // Data Visualization
      "data-export", // Data Export

      // ===== DOCUMENT FEATURES (ครบถ้วน) =====
      "prompt-doc-tool", // Prompt Doc Tool
      "template-system", // Template System
      "document-processing", // Document Processing
      "chat-document-integration", // Chat Document Integration

      // ===== ASSISTANT FEATURES (ครบถ้วน) =====
      "assistant-tool", // Assistant Tool
      "tool-enhancement", // Tool Enhancement
      "code-optimization", // Code Optimization
      "integration-helper", // Integration Helper

      // ===== DEVELOPMENT FEATURES (ครบถ้วน) =====
      "code-analysis", // Code Analysis
      "performance-monitoring", // Performance Monitoring
      "error-tracking", // Error Tracking
      "debugging-tools", // Debugging Tools

      // ===== COLLABORATION FEATURES (พื้นฐาน) =====
      "basic-collaboration", // Basic Collaboration
      "file-sharing", // File Sharing
      "comment-system", // Comment System
    ];
  }

  /**
   * 💎 Get Max Mode Features (ฟีเจอร์ขั้นสูง)
   */
  getMaxFeatures(): string[] {
    return [
      // ===== ADVANCED AI FEATURES =====
      "advanced-ai-orchestration", // Advanced AI Orchestration
      "multi-model-load-balancing", // Multi-model Load Balancing
      "cost-optimization", // Cost Optimization
      "performance-tuning", // Performance Tuning

      // ===== ADVANCED ANALYTICS =====
      "usage-analytics", // Usage Analytics
      "performance-metrics", // Performance Metrics
      "user-behavior-tracking", // User Behavior Tracking
      "predictive-analytics", // Predictive Analytics

      // ===== REAL-TIME COLLABORATION =====
      "real-time-collaboration", // Real-time Collaboration
      "live-editing", // Live Editing
      "user-presence", // User Presence
      "conflict-resolution", // Conflict Resolution
      "version-control", // Version Control

      // ===== ADVANCED INTEGRATIONS =====
      "enterprise-integrations", // Enterprise Integrations
      "custom-api-integrations", // Custom API Integrations
      "webhook-support", // Webhook Support
      "advanced-authentication", // Advanced Authentication

      // ===== PRIORITY SUPPORT =====
      "priority-support", // Priority Support
      "dedicated-support", // Dedicated Support
      "custom-training", // Custom Training
      "onboarding-assistance", // Onboarding Assistance

      // ===== ADVANCED SECURITY =====
      "advanced-security", // Advanced Security
      "audit-logs", // Audit Logs
      "compliance-tools", // Compliance Tools
      "data-encryption", // Data Encryption
    ];
  }

  /**
   * 📊 Get Free Mode Limits (ปรับปรุงให้เหมาะสม)
   */
  getFreeLimits(): Record<string, number> {
    return {
      // ===== AI LIMITS (ไม่จำกัดเหมือน Cursor/Continue) =====
      "ai-requests-per-day": -1, // ไม่จำกัด
      "ai-tokens-per-request": -1, // ไม่จำกัด
      "ai-providers": -1, // ใช้ได้ทุก provider

      // ===== AGENT LIMITS (ไม่จำกัด) =====
      agents: -1, // ไม่จำกัดจำนวน agents
      "agent-flows": -1, // ไม่จำกัด flows
      "custom-agents": -1, // ไม่จำกัด custom agents

      // ===== COMMAND LIMITS (ไม่จำกัด) =====
      "custom-commands": -1, // ไม่จำกัด custom commands
      "at-commands": -1, // ไม่จำกัด @ commands

      // ===== KNOWLEDGE LIMITS (ไม่จำกัด) =====
      "knowledge-documents": -1, // ไม่จำกัดเอกสาร
      "knowledge-size": -1, // ไม่จำกัดขนาด

      // ===== INTEGRATION LIMITS (ไม่จำกัด) =====
      "mcp-connections": -1, // ไม่จำกัดการเชื่อมต่อ
      "external-services": -1, // ไม่จำกัด external services

      // ===== STORAGE LIMITS (ไม่จำกัด) =====
      "local-storage": -1, // ไม่จำกัด local storage
      "cloud-storage": -1, // ไม่จำกัด cloud storage

      // ===== TEMPLATE LIMITS (ไม่จำกัด) =====
      templates: -1, // ไม่จำกัด templates
      prompts: -1, // ไม่จำกัด prompts

      // ===== COLLABORATION LIMITS (จำกัดเล็กน้อย) =====
      collaborators: 5, // จำกัด 5 คน
      "shared-projects": 10, // จำกัด 10 โปรเจกต์
    };
  }

  /**
   * 💎 Get Max Mode Limits (ไม่จำกัด)
   */
  getMaxLimits(): Record<string, number> {
    return {
      "ai-requests-per-day": -1,
      "ai-tokens-per-request": -1,
      "ai-providers": -1,
      agents: -1,
      "agent-flows": -1,
      "custom-agents": -1,
      "custom-commands": -1,
      "at-commands": -1,
      "knowledge-documents": -1,
      "knowledge-size": -1,
      "mcp-connections": -1,
      "external-services": -1,
      "local-storage": -1,
      "cloud-storage": -1,
      templates: -1,
      prompts: -1,
      collaborators: -1,
      "shared-projects": -1,
    };
  }

  /**
   * ✅ Check Feature Access
   */
  hasFeature(feature: string): boolean {
    const features =
      this.licenseType === "free"
        ? this.getFreeFeatures()
        : [...this.getFreeFeatures(), ...this.getMaxFeatures()];

    return features.includes(feature);
  }

  /**
   * 📊 Check Feature Limit
   */
  checkFeatureLimit(feature: string, currentUsage: number): boolean {
    const limits =
      this.licenseType === "free" ? this.getFreeLimits() : this.getMaxLimits();

    const limit = limits[feature];
    return limit === -1 || currentUsage < limit;
  }

  /**
   * 💎 Upgrade to Max Mode
   */
  upgradeToMaxMode(): void {
    this.licenseType = "max";
    new Notice("💎 Upgraded to Max Mode! All features unlocked.");
  }

  /**
   * 🆓 Downgrade to Free Mode
   */
  downgradeToFreeMode(): void {
    this.licenseType = "free";
    new Notice(
      "ℹ️ Downgraded to Free Mode. Some advanced features are now limited."
    );
  }

  /**
   * 🔒 Show Upgrade Modal
   */
  showUpgradeModal(feature: string, action: string): void {
    new Notice(`💎 ${action} requires Max Mode upgrade`);
  }

  /**
   * 📊 Show Limit Exceeded Modal
   */
  showLimitExceededModal(limitType: string, action: string): void {
    new Notice(
      `📊 ${limitType} limit exceeded. Upgrade to Max Mode for unlimited usage.`
    );
  }

  /**
   * 📈 Get Feature Usage Report
   */
  getFeatureUsageReport(): FeatureUsageReport {
    return {
      licenseType: this.licenseType,
      freeFeatures: this.getFreeFeatures(),
      maxFeatures: this.getMaxFeatures(),
      freeLimits: this.getFreeLimits(),
      maxLimits: this.getMaxLimits(),
    };
  }

  /**
   * 🎯 Get Current License Type
   */
  getLicenseType(): "free" | "max" {
    return this.licenseType;
  }
}

/**
 * 📊 Feature Usage Report Interface
 */
interface FeatureUsageReport {
  licenseType: "free" | "max";
  freeFeatures: string[];
  maxFeatures: string[];
  freeLimits: Record<string, number>;
  maxLimits: Record<string, number>;
}
