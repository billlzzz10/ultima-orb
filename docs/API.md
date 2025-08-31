# 📚 API Reference

## 🔧 Installation

```bash
npm install
```

> **Security:** เก็บ API keys ไว้ใน environment variables หรือผ่าน API Manager เท่านั้น ดูเพิ่มเติมใน [SECURITY.md](../SECURITY.md)

## 🛠️ Tools

### APIManagerTool
```ts
import { APIManagerTool } from "../src/tools/APIManagerTool";
const tool = new APIManagerTool(app);
await tool.execute({
  action: "add_key",
  provider: "openai",
  keyName: "default",
  apiKey: process.env.OPENAI_API_KEY || ""
});
```

### NotionAIAssistantTool
```ts
const tool = new NotionAIAssistantTool(app, apiManager, ai);
await tool.execute({
  action: "analyze_structure",
  databaseId: "your-db-id"
});
```

### NotionDataAutomationTool
```ts
const tool = new NotionDataAutomationTool(app, apiManager);
await tool.execute({
  action: "create_automation_rule",
  name: "Auto Tag",
  trigger: "on_create",
  actions: [{ type: "add_tag", target: "status", value: "new" }]
});
```

### AirtableIntegrationTool
```ts
const tool = new AirtableIntegrationTool(app, apiManager);
await tool.execute({
  action: "list_bases"
});
```

### FileImportTool
```ts
const tool = new FileImportTool(app, apiManager);
await tool.execute({
  action: "import_url",
  url: "https://example.com",
  targetFolder: "AI References"
});
```

### ObsidianBasesTool
```ts
const tool = new ObsidianBasesTool(app);
await tool.execute({
  action: "create_base",
  baseName: "Projects",
  properties: { title: { type: "text" } }
});
```

### WebhookIntegrationTool
```ts
const tool = new WebhookIntegrationTool(app);
await tool.execute({
  action: "registerWebhook",
  integration: "notion",
  webhookUrl: "https://example.com/webhook",
  event: "update"
});
```

### NotionAnalysisTool
```ts
const tool = new NotionAnalysisTool(app, ai);
await tool.execute({
  action: "fetchAllDatabases"
});
```

### NotionDataAnalyzer
```ts
import { NotionDataAnalyzer } from "../src/analysis/NotionDataAnalyzer";
const analyzer = new NotionDataAnalyzer();
const report = await analyzer.analyze({ databaseId: "your-db-id" });
```
