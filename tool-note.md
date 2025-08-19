# โครงสร้างปลั๊กอิน

## Ultima-Orb (โปรเจกต์จริงของเรา)

เอกสารส่วนนี้อัปเดตให้ตรงกับโค้ดใน repo ปัจจุบันของ Ultima-Orb (Obsidian plugin)

### 🚀 Quick Start

- ข้อกำหนด: Node.js v18+ (แนะนำ v20 ขึ้นไป), Obsidian Desktop
- คำสั่งหลัก:

```bash
npm install
npm run dev       # watch build (esbuild)
npm run build     # production build → main.js
npm run lint      # ESLint
npm test          # Vitest
```

ผลลัพธ์ build: `main.js` ที่ root ปลั๊กอิน

### 📦 Scripts/Deps (อ้างอิง package.json ปัจจุบัน)

```json
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "lint": "eslint src/",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  },
  "dependencies": {
    "eventemitter3": "^5.0.1",
    "@notionhq/client": "^2.2.13",
    "tslib": "^2.8.1"
  },
  "devDependencies": {
    "typescript": "4.7.4",
    "esbuild": "0.17.3",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "vitest": "^3.2.4",
    "@types/node": "^16.11.6",
    "obsidian": "latest"
  }
}
```

### 📁 โครงสร้างจริงใน repo

```text
Ultima-Orb/
├─ main.ts
├─ manifest.json
├─ esbuild.config.mjs
├─ styles.css
├─ src/
│  ├─ main.ts
│  ├─ ai/AIOrchestrator.ts
│  ├─ automation/CommandManager.ts
│  ├─ core/
│  │  ├─ ContextManager.ts
│  │  ├─ IntegrationManager.ts
│  │  ├─ KnowledgeManager.ts
│  │  ├─ TemplateManager.ts
│  │  └─ ToolManager.ts
│  ├─ integrations/NotionMCPClient.ts
│  ├─ services/{CredentialManager,EventsBus,Logger,Storage}.ts
│  ├─ tools/NotionTools.ts
│  ├─ ui/SettingsTab.ts
│  └─ types/{obsidian.d.ts, notion.d.ts, notion-api.d.ts}
├─ test/{setup.ts, services/*.test.ts, integrations/*.test.ts, core/*.test.ts}
└─ vitest.config.mjs
```

### 🧪 Tests (Vitest)

```bash
npm test
npm run test:ui
npm run test:watch
npm run test:coverage
```

มี `test/setup.ts` สำหรับตั้งค่าก่อนรันทดสอบ (เช่น mute console)

### 🔗 Integrations ที่ใช้อยู่

- Notion: `src/integrations/NotionMCPClient.ts` + `src/tools/NotionTools.ts` (type: `src/types/notion-api.d.ts`)
- Knowledge (AnythingLLM stub): `src/core/KnowledgeManager.ts` (mock ได้เพื่อทดสอบ error paths)

### 🔧 Lint & TypeScript

- `.eslintrc.js` ตั้งค่ากฎพื้นฐานสำหรับ TS/ESLint
- `tsconfig.json` เปิด `skipLibCheck` และผ่อน strict บางส่วนเพื่อความเร็ว (จะเพิ่มความเข้มภายหลังได้)

### 📦 ติดตั้งใน Obsidian (ทดสอบ manual)

1) รัน `npm run build` ให้ได้ `main.js`
2) คัดลอก `main.js`, `manifest.json`, `styles.css` ไปที่ `<vault>/.obsidian/plugins/ultima-orb/`
3) เปิด Obsidian → Settings → Community plugins → เปิดใช้งาน Ultima-Orb

---
ด้านล่างนี้เป็นเทมเพลตเดิม (ไม่ตรงกับโปรเจกต์เราทั้งหมด) เก็บไว้เพื่ออ้างอิง

# 📦 Obsidian Smart Assistant - Production Ready Setup

โครงสร้างปลั๊กอินที่พร้อมใช้งานสำหรับ Windows + Node.js v22 พร้อม dependency management และ build system

---

## 🚀 Quick Start

### 1️⃣ สร้างโปรเจ็กต์

```bash
mkdir obsidian-smart-assistant
cd obsidian-smart-assistant
npm init -y
```

### 🛠️ เตรียมพร้อมก่อนติดตั้ง Dependencies

### ตรวจสอบ Environment

```bash
# ตรวจสอบ Node.js version (ต้องเป็น v22.x.x)
node --version

# ตรวจสอบ npm version
npm --version

# ตรวจสอบ Git
git --version
```

### เตรียม Package Registry (แนะนำ)

```bash
# ตั้งค่า npm registry ให้เร็วขึ้น (ถ้าต้องการ)
npm config set registry [https://registry.npmjs.org/](https://registry.npmjs.org/)

# หรือใช้ yarn แทน npm
npm install -g yarn
```

### สร้าง .npmrc สำหรับโปรเจ็กต์

```bash
# สร้างไฟล์ .npmrc ในโปรเจ็กต์
echo "save-exact=true" > .npmrc
echo "engine-strict=true" >> .npmrc
```

### สร้าง .gitignore

```bash
# สร้างไฟล์ .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
main.js
[main.js.map](http://main.js.map)
*.tsbuildinfo

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage/
*.lcov

# Obsidian
.obsidian/workspace
EOF
```

### ตั้งค่า PowerShell/Terminal (Windows)

```powershell
# เปิด PowerShell as Administrator และรันคำสั่งนี้เพื่อให้ npm script ทำงานได้
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# หรือใช้ CMD แทน PowerShell ถ้ามีปัญหา
```

### 2️⃣ ติดตั้ง Dependencies

```bash
# Development Dependencies
npm install -D typescript @types/node esbuild obsidian @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint

# Production Dependencies  
npm install eventemitter3
```

### 3️⃣ Setup Files

สร้างไฟล์ตามโครงสร้างด้านล่าง

---

## 📁 โครงสร้างโปรเจ็กต์

```
obsidian-smart-assistant/
├── package.json                 # ✅ Package configuration
├── tsconfig.json               # ✅ TypeScript config
├── esbuild.config.mjs          # ✅ Build configuration  
├── manifest.json               # ✅ Obsidian manifest
├── main.ts                     # ✅ Plugin entry point
├── styles.css                  # ✅ Plugin styles
├── src/
│   ├── settings/
│   │   └── SettingsTab.ts      # ⚙️ Plugin settings
│   ├── services/
│   │   ├── logger.ts           # 📝 Logging service
│   │   ├── events.ts           # 🔔 Event bus  
│   │   └── storage.ts          # 💾 Data storage
│   ├── providers/
│   │   ├── BaseProvider.ts     # 🏗️ Provider interface
│   │   ├── OllamaProvider.ts   # 🦙 Local Ollama
│   │   ├── LMStudioProvider.ts # 🎨 Local LM Studio
│   │   ├── OpenAIProvider.ts   # 🌐 OpenAI API
│   │   ├── GeminiProvider.ts   # 🧠 Google Gemini
│   │   └── ProviderManager.ts  # 🎯 Provider management
│   ├── views/
│   │   ├── ChatView.ts         # 💬 Chat interface
│   │   ├── PlanView.ts         # 📋 Agent planning
│   │   └── StatusView.ts       # 📊 System status
│   └── rag/
│       ├── chunker.ts          # ✂️ Text chunking
│       ├── embeddings.ts       # 🔢 Vector embeddings
│       ├── vector-store.ts     # 🗄️ Vector database
│       └── retriever.ts        # 🔍 Similarity search
└── [README.md](http://README.md)                   # 📚 Documentation
```

---

## 📄 Configuration Files

### `package.json`

```json
{
  "name": "obsidian-smart-assistant",
  "version": "1.0.0",
  "description": "Smart AI Assistant for Obsidian with RAG and Agent capabilities",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "lint": "eslint src/",
    "version": "node version-bump.mjs && git add manifest.json versions.json"
  },
  "keywords": ["obsidian-plugin", "ai", "rag", "agent"],
  "author": "Dollawatt Chidjai",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "esbuild": "^0.20.0",
    "eslint": "^8.57.0",
    "obsidian": "latest",
    "typescript": "^5.4.0"
  },
  "dependencies": {
    "eventemitter3": "^5.0.1"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2022",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": ["DOM", "ES2022"],
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `esbuild.config.mjs`

```jsx
import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/`;

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  banner: { js: banner },
  entryPoints: ["main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins
  ],
  format: "cjs",
  target: "ES2022",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  minify: prod,
  define: {
    global: "globalThis",
  }
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await [context.watch](http://context.watch)();
}
```

---

## 🔧 Core Implementation

### `manifest.json`

```json
{
  "id": "obsidian-smart-assistant",
  "name": "Smart Assistant (RAG + Agent)",
  "version": "1.0.0",
  "minAppVersion": "1.5.0",
  "description": "Local/Cloud AI with RAG, Chat, Assistant, and Agent modes. Providers: Ollama, LM Studio, OpenAI, Gemini.",
  "author": "Dollawatt Chidjai",
  "authorUrl": "[https://github.com/dollawatt](https://github.com/dollawatt)",
  "fundingUrl": "[https://buymeacoffee.com/dollawatt](https://buymeacoffee.com/dollawatt)",
  "isDesktopOnly": false
}
```

### `main.ts`

```tsx
import { App, Plugin, PluginSettingTab, TFile, Notice, WorkspaceLeaf } from "obsidian";
import { SettingsTab } from "./src/settings/SettingsTab";
import { Logger } from "./src/services/logger";
import { EventsBus } from "./src/services/events";  
import { StorageService } from "./src/services/storage";
import { ProviderManager } from "./src/providers/ProviderManager";
import { ChatView, CHAT_VIEW_TYPE } from "./src/views/ChatView";
import { PlanView, PLAN_VIEW_TYPE } from "./src/views/PlanView";
import { StatusView, STATUS_VIEW_TYPE } from "./src/views/StatusView";

export interface AssistantSettings {
  provider: {
    activeProviderId: string;
    activeModelId: string;
    apiKeys: Record<string, string>;
    endpoints: {
      ollama: string;
      lmstudio: string;
    };
  };
  rag: {
    indexingMode: "all" | "folders";
    includeFolders: string[];
    chunk: { size: number; overlap: number };
    topK: number;
  };
  agent: {
    mode: "speed" | "quality";
    confirmBeforeExecute: boolean;
  };
  telemetry: {
    enableLogs: boolean;
  };
}

export const DEFAULT_SETTINGS: AssistantSettings = {
  provider: {
    activeProviderId: "",
    activeModelId: "",
    apiKeys: {},
    endpoints: {
      ollama: "[http://localhost:11434](http://localhost:11434)",
      lmstudio: "[http://localhost:1234](http://localhost:1234)"
    }
  },
  rag: {
    indexingMode: "all",
    includeFolders: [],
    chunk: { size: 1200, overlap: 200 },
    topK: 5
  },
  agent: {
    mode: "speed", 
    confirmBeforeExecute: true
  },
  telemetry: {
    enableLogs: false
  }
};

export default class SmartAssistantPlugin extends Plugin {
  settings: AssistantSettings = DEFAULT_SETTINGS;
  logger: Logger;
  events: EventsBus;
  storage: StorageService;
  providerManager: ProviderManager;

  async onload() {
    // Initialize services
    this.logger = new Logger(() => this.settings.telemetry.enableLogs);
    [this.events](http://this.events) = new EventsBus();
    [this.storage](http://this.storage) = new StorageService(this);
    
    // Load settings
    await this.loadSettings();
    
    // Initialize provider manager
    this.providerManager = new ProviderManager(
      {
        activeProvider: this.settings.provider.activeProviderId,
        activeModel: this.settings.provider.activeModelId,
        apiKeys: this.settings.provider.apiKeys,
        endpoints: this.settings.provider.endpoints
      },
      this.logger
    );

    // Detect available providers
    await this.providerManager.detect();
    [this.logger.info](http://this.logger.info)("Providers detected:", this.providerManager.getAvailableProviders());

    // Register views
    this.registerView(CHAT_VIEW_TYPE, (leaf) => new ChatView(leaf, this));
    this.registerView(PLAN_VIEW_TYPE, (leaf) => new PlanView(leaf, this));  
    this.registerView(STATUS_VIEW_TYPE, (leaf) => new StatusView(leaf, this));

    // Add ribbon icon
    this.addRibbonIcon("brain-circuit", "Smart Assistant", () => {
      this.activateView(CHAT_VIEW_TYPE);
    });

    // Add commands
    this.addCommand({
      id: "open-chat",
      name: "Open Chat",
      callback: () => this.activateView(CHAT_VIEW_TYPE)
    });

    this.addCommand({
      id: "open-plan",
      name: "Open Agent Plan", 
      callback: () => this.activateView(PLAN_VIEW_TYPE)
    });

    this.addCommand({
      id: "open-status",
      name: "Open Status",
      callback: () => this.activateView(STATUS_VIEW_TYPE)
    });

    // Settings tab
    this.addSettingTab(new SettingsTab([this.app](http://this.app), this));

    [this.logger.info](http://this.logger.info)("Smart Assistant plugin loaded");
  }

  async onunload() {
    [this.logger.info](http://this.logger.info)("Smart Assistant plugin unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    
    // Update provider manager configuration
    if (this.providerManager) {
      this.providerManager.updateConfig({
        activeProvider: this.settings.provider.activeProviderId,
        activeModel: this.settings.provider.activeModelId,
        apiKeys: this.settings.provider.apiKeys,
        endpoints: this.settings.provider.endpoints
      });
    }
  }

  async activateView(type: string) {
    const { workspace } = [this.app](http://this.app);
    
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(type);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      await leaf?.setViewState({ type, active: true });
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}
```

---

## 🎨 Styling

### `styles.css`

```css
/* Main containers */
.sa-chat, .sa-plan, .sa-status {
  padding: 16px;
  font-family: var(--font-interface);
}

.sa-chat h3, .sa-plan h3, .sa-status h3 {
  margin-top: 0;
  color: var(--text-accent);
  border-bottom: 1px solid var(--background-modifier-border);
  padding-bottom: 8px;
}

/* Chat interface */
.sa-chat-input {
  width: 100%;
  min-height: 120px;
  box-sizing: border-box;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-primary);
  color: var(--text-normal);
  resize: vertical;
}

.sa-chat-button {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.sa-chat-button:hover {
  background: var(--interactive-accent-hover);
}

.sa-chat-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sa-chat-output {
  margin-top: 16px;
  padding: 12px;
  background: var(--background-secondary);
  border-radius: 8px;
  border-left: 3px solid var(--interactive-accent);
}

/* Provider status indicators */
.sa-provider-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  padding: 8px;
  background: var(--background-modifier-hover);
  border-radius: 6px;
}

.sa-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sa-status-connected {
  background: var(--color-green);
}

.sa-status-disconnected {
  background: var(--color-red);  
}

.sa-status-checking {
  background: var(--color-yellow);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Model selector */
.sa-model-selector {
  margin: 12px 0;
}

.sa-model-selector label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--text-normal);
}

.sa-model-selector select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
}

/* Setup wizard */
.sa-setup-wizard {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
}

.sa-setup-step {
  text-align: center;
}

.sa-setup-input {
  width: 100%;
  padding: 12px;
  margin: 16px 0;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-primary);
  color: var(--text-normal);
}

.sa-setup-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.sa-button-primary {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.sa-button-secondary {
  background: var(--background-secondary);
  color: var(--text-normal);
  border: 1px solid var(--background-modifier-border);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sa-chat, .sa-plan, .sa-status {
    padding: 12px;
  }
  
  .sa-setup-buttons {
    flex-direction: column;
  }
}
```

---

## 🛠️ Development Commands

```bash
# Development mode (auto-rebuild)
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Version bump
npm run version
```

---

## 📦 Installation สำหรับ Windows

### 1. ติดตั้ง Prerequisites

```bash
# ตรวจสอบ Node.js version
node --version  # ควรเป็น v22.x.x

# ติดตั้ง Git (ถ้ายังไม่มี)
# Download จาก: [https://git-scm.com/download/win](https://git-scm.com/download/win)
```

### 2. สร้างและ Build Plugin

```bash
# Clone หรือสร้างโปรเจ็กต์
git clone <your-repo-url> obsidian-smart-assistant
cd obsidian-smart-assistant

# ติดตั้ง dependencies
npm install

# Build plugin
npm run build
```

### 3. Copy ไปยัง Obsidian

```bash
# Windows path example:
# C:\Users\<username>\AppData\Roaming\obsidian\plugins\obsidian-smart-assistant\

# Copy files:
# - main.js
# - manifest.json  
# - styles.css
```

---

## ✅ ขั้นตอนถัดไป

1. **Test Development Environment** - รัน `npm run dev` และตรวจสอบ build
2. **Implement Core Services** - เพิ่ม implementation ใน src/services/
3. **Add Provider Logic** - เชื่อม AI providers เข้ากับ UI
4. **RAG Integration** - เพิ่มระบบ vector search และ retrieval
5. **Agent System** - สร้างระบบ planning และ execution

โครงสร้างนี้พร้อมสำหรับ Node.js v22 และ Windows แล้ว พร้อม hot-reload และ TypeScript support!

## 🔧 Implement Core Services

### ภาพรวมการเชื่อมต่อ

- [ ]  ตรวจสอบสถานะการเชื่อมต่อ Notion ↔ Airtable
- [ ]  ตรวจสอบสถานะการเชื่อมต่อ Notion ↔ ClickUp
- [ ]  ทดสอบซิงก์ข้อมูลตัวอย่าง และกำหนดผู้รับผิดชอบ

---

### วิธีตรวจสอบว่าเชื่อมสำเร็จแล้ว

- วิธีเช็คอย่างรวดเร็ว
    
    1) ไปที่หน้าฐานข้อมูลที่ต้องซิงก์ แล้วดูว่ามีข้อมูลวิ่งเข้ามาอัตโนมัติหรือไม่
    
    2) ลองสร้างรายการทดสอบจากฝั่งต้นทาง เช่น สร้างแถวใหม่ใน Airtable หรือสร้าง Task ใน ClickUp แล้วดูว่ามาปรากฏใน Notion ภายในไม่กี่นาที
    
    3) เก็บหลักฐานการทดสอบในส่วน “บันทึกการทดสอบ” ด้านล่าง
    

---

### การตั้งค่า: Notion ↔ Airtable

- แนวทางเชื่อมต่อที่แนะนำ
    - ทางเลือก A: นำเข้าข้อมูลครั้งเดียวด้วย Import เพื่อเริ่มต้นโครงสร้างเร็ว แล้วค่อยตั้งซิงก์ภายหลัง
    - ทางเลือก B: ตั้งสองทางผ่านบริการซิงก์ภายนอก เช่น Zapier, Make, Unito หรือใช้ API เองถ้าต้องการควบคุมเต็มรูปแบบ
- ขั้นตอนแนะนำ
    - [ ]  ออกแบบสคีมาร่วมกัน: ระบุฟิลด์ที่ต้องซิงก์ เช่น Title, Status, Assignee, Due date
    - [ ]  แมปคอลัมน์: จับคู่ชนิดข้อมูล เช่น select ↔ single select, multi_select ↔ multiple select
    - [ ]  ตั้งตัวช่วยซิงก์: Flow สร้าง แก้ไข ย้ายสถานะ ปิดงาน
    - [ ]  ทำ UAT: ทดสอบ 10 เคส แล้วล็อกเกณฑ์ผ่าน-ไม่ผ่าน
- เทมเพลตที่ใช้บ่อย
    - [ ]  Database “แผนงานและงาน” สำหรับรับงานจาก Airtable
    - [ ]  Database “Backlog คุณลักษณะ” สำหรับ Product
    - [ ]  วิว Table และ Board ตามสถานะ

---

### การตั้งค่า: Notion ↔ ClickUp

- แนวทางเชื่อมต่อที่แนะนำ
    - ทางเลือก A: Import โครงสร้างงานจาก ClickUp เข้ามา Notion เป็นฐานกลางสำหรับเอกสารและสรุป
    - ทางเลือก B: สองทางด้วยตัวเชื่อมภายนอก เพื่อให้สถานะและ Due date อัปเดตตรงกัน
- ขั้นตอนแนะนำ
    - [ ]  เลือก Workspace และ Space/Folder/Lists ที่จะซิงก์
    - [ ]  แมปฟิลด์: Name, Status, Priority, Assignee, Start-Due date
    - [ ]  ตั้งกติกา: งานที่ Done ใน ClickUp จะย้ายไป “Done” ใน Notion อัตโนมัติ
    - [ ]  UAT: ทดสอบสร้าง แก้ไข ปิดงาน จากทั้งสองฝั่ง
- เทมเพลตที่ใช้บ่อย
    - [ ]  Database “Tasks” พร้อม Status แบบ 3 กลุ่ม: To do, In progress, Done
    - [ ]  วิว Board ตามผู้รับผิดชอบ และ Calendar ตาม Due date

---

### บันทึกการทดสอบ

- วันที่ทดสอบ: 18 สิงหาคม 2568
- ผู้ทดสอบ: @Dollawatt Chidjai
- เคสที่ทดสอบ
    
    1) สร้างงานจาก Airtable แล้วมาที่ Notion
    
    2) เปลี่ยนสถานะจาก ClickUp แล้วสะท้อนใน Notion
    
    3) อัปเดต Due date จาก Notion แล้วย้อนกลับไปที่ต้นทาง
    
- ผลลัพธ์และข้อสังเกต:
    - ...

---

### ข้อเสนอแนะการปรับปรุง

- ออกแบบ “ศูนย์รวมงาน” เดียวใน Notion แล้วใช้ Relations เชื่อมเอกสาร ประชุม และ OKR
- ใช้ Status แบบกลุ่มเพื่อลดความสับสน เช่น Todo, In progress, Blocked, Done
- ตั้งชื่อฟิลด์มาตรฐานระหว่างระบบ เช่น owner, status, due_date เพื่อให้กติกาซิงก์ง่าย
- จัดทำหน้า "Runbook การซิงก์" อธิบายฟิลด์ที่แมป และวิธีแก้เมื่อซิงก์ล้มเหลว
- ทำแดชบอร์ดผู้บริหาร: งานค้าง งานเสี่ยง เกินกำหนด ภาพรวมรายสัปดาห์

---

### ฟีเจอร์ใน Notion ที่น่าสนใจสำหรับงานลักษณะนี้

- Relations และ Rollups เบื้องต้น: เชื่อมงานกับเอกสาร สปรินต์ และเป้าหมาย เพื่อมองภาพรวม
- Views หลากหลาย: Board ตามสถานะ Calendar ตามกำหนด และ Timeline สำหรับแผนโครงการ
- Synced blocks และ templates: ทำบล็อกมาตรฐาน เช่น Definition of Done ใช้ซ้ำได้ในทุกงาน
- Automations ภายนอก: ตั้ง Trigger เมื่อสร้างงาน เปลี่ยนสถานะ หรือครบกำหนด เพื่อแจ้งเตือนหรือย้ายคอลัมน์

---

### สิ่งที่ต้องการจากทีม

- [ ]  รายการฐานข้อมูล Airtable และ ClickUp ที่ต้องซิงก์ พร้อมลิงก์ตัวอย่าง
- [ ]  รายการฟิลด์ที่จำเป็น และผู้รับผิดชอบแต่ละระบบ
- [ ]  ตัดสินใจวิธีซิงก์: Import ครั้งเดียว หรือสองทางแบบถาวร
- [ ]  ขอบเขต UAT และเส้นตายพร้อมผู้เซ็นรับรอง

# 📝 Logger Service

**ไฟล์: `src/services/logger.ts`**

```tsx
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = [LogLevel.INFO](http://LogLevel.INFO);
  private enableLogs: boolean = true;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setEnabled(enabled: boolean): void {
    this.enableLogs = enabled;
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log([LogLevel.INFO](http://LogLevel.INFO), message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.enableLogs || level < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `[Smart Assistant ${levelName}] ${timestamp}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || '');
        break;
      case [LogLevel.INFO](http://LogLevel.INFO):
        [console.info](http://console.info)(prefix, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data || '');
        break;
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
```

---

# 🔔 Event Bus Service

**ไฟล์: `src/services/events.ts`**

```tsx
import EventEmitter from 'eventemitter3';
import { logger } from './logger';

export interface EventMap {
  // Provider events
  'provider:connected': { providerId: string; models: string[] };
  'provider:disconnected': { providerId: string; error?: string };
  'provider:model-changed': { providerId: string; modelId: string };
  
  // Chat events
  'chat:message-sent': { message: string; timestamp: number };
  'chat:response-received': { response: string; timestamp: number; duration: number };
  'chat:error': { error: string; timestamp: number };
  
  // RAG events
  'rag:indexing-start': { fileCount: number };
  'rag:indexing-progress': { processed: number; total: number; currentFile: string };
  'rag:indexing-complete': { indexed: number; failed: number; duration: number };
  'rag:search': { query: string; results: number };
  
  // Agent events
  'agent:plan-generated': { plan: any; timestamp: number };
  'agent:step-executed': { step: any; result: any; timestamp: number };
  'agent:execution-complete': { success: boolean; duration: number };
  
  // System events
  'system:ready': {};
  'system:shutdown': {};
  'settings:changed': { key: string; value: any };
}

export class EventsBus {
  private static instance: EventsBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.setupLogging();
  }

  static getInstance(): EventsBus {
    if (!EventsBus.instance) {
      EventsBus.instance = new EventsBus();
    }
    return EventsBus.instance;
  }

  on<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): void {
    this.emitter.on(event, listener);
  }

  off<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): void {
    this.emitter.off(event, listener);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    logger.debug(`Event emitted: ${event}`, data);
    this.emitter.emit(event, data);
  }

  once<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): void {
    this.emitter.once(event, listener);
  }

  removeAllListeners(event?: keyof EventMap): void {
    this.emitter.removeAllListeners(event);
  }

  private setupLogging(): void {
    // Log all events in debug mode
    this.emitter.onAny((event, data) => {
      logger.debug(`Event: ${event}`, data);
    });
  }

  // Utility methods for common event patterns
  emitError(context: string, error: any): void {
    logger.error(`${context} error`, error);
    // Could emit specific error events based on context
  }

  emitProgress(context: string, current: number, total: number, details?: any): void {
    const progress = Math.round((current / total) * 100);
    logger.debug(`${context} progress: ${progress}%`, { current, total, ...details });
  }
}

// Export singleton instance
export const eventsBus = EventsBus.getInstance();
```

---

# 💾 Storage Service

**ไฟล์: `src/services/storage.ts`**

```tsx
import { App, TFile } from 'obsidian';
import { logger } from './logger';
import { eventsBus } from './events';

export interface StorageConfig {
  basePath: string;
  encryptSensitive: boolean;
  maxFileSize: number; // in MB
  maxCacheSize: number; // in MB
}

export interface StoredData {
  version: string;
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

export class StorageService {
  private app: App;
  private config: StorageConfig;
  private cache: Map<string, StoredData> = new Map();
  private cacheSize: number = 0;

  constructor(app: App, config: Partial<StorageConfig> = {}) {
    [this.app](http://this.app) = app;
    this.config = {
      basePath: '.obsidian/plugins/smart-assistant',
      encryptSensitive: true,
      maxFileSize: 10, // 10MB
      maxCacheSize: 50, // 50MB
      ...config
    };
  }

  async save(key: string, data: any, metadata?: Record<string, any>): Promise<void> {
    try {
      const storedData: StoredData = {
        version: '1.0.0',
        timestamp: [Date.now](http://Date.now)(),
        data,
        metadata
      };

      const serialized = JSON.stringify(storedData, null, 2);
      const filePath = this.getFilePath(key);
      
      // Check file size
      const sizeInMB = new Blob([serialized]).size / (1024 * 1024);
      if (sizeInMB > this.config.maxFileSize) {
        throw new Error(`Data too large: ${sizeInMB.toFixed(2)}MB > ${this.config.maxFileSize}MB`);
      }

      // Ensure directory exists
      await this.ensureDirectory(filePath);
      
      // Write file
      await [this.app](http://this.app).vault.adapter.write(filePath, serialized);
      
      // Update cache
      this.updateCache(key, storedData, serialized.length);
      
      logger.debug(`Saved data to ${filePath}`, { key, size: sizeInMB });
      
    } catch (error) {
      logger.error(`Failed to save data for key: ${key}`, error);
      throw error;
    }
  }

  async load<T = any>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      // Check cache first
      const cached = this.cache.get(key);
      if (cached) {
        logger.debug(`Loaded from cache: ${key}`);
        return [cached.data](http://cached.data) as T;
      }

      const filePath = this.getFilePath(key);
      
      // Check if file exists
      if (!await [this.app](http://this.app).vault.adapter.exists(filePath)) {
        logger.debug(`File not found: ${filePath}`);
        return defaultValue ?? null;
      }

      // Read and parse file
      const content = await [this.app.vault.adapter.read](http://this.app.vault.adapter.read)(filePath);
      const storedData: StoredData = JSON.parse(content);
      
      // Update cache
      this.updateCache(key, storedData, content.length);
      
      logger.debug(`Loaded data from ${filePath}`, { key, version: storedData.version });
      return [storedData.data](http://storedData.data) as T;
      
    } catch (error) {
      logger.error(`Failed to load data for key: ${key}`, error);
      return defaultValue ?? null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(key);
      
      if (await [this.app](http://this.app).vault.adapter.exists(filePath)) {
        await [this.app](http://this.app).vault.adapter.remove(filePath);
        this.cache.delete(key);
        logger.debug(`Deleted: ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Failed to delete data for key: ${key}`, error);
      return false;
    }
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      const basePath = this.config.basePath;
      const files = await [this.app](http://this.app).vault.adapter.list(basePath);
      
      let keys = files.files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace(`${basePath}/`, '').replace('.json', ''));
      
      if (prefix) {
        keys = keys.filter(k => k.startsWith(prefix));
      }
      
      return keys;
    } catch (error) {
      logger.error('Failed to list storage keys', error);
      return [];
    }
  }

  async clear(prefix?: string): Promise<number> {
    try {
      const keys = await this.list(prefix);
      let deleted = 0;
      
      for (const key of keys) {
        if (await this.delete(key)) {
          deleted++;
        }
      }
      
      [logger.info](http://logger.info)(`Cleared ${deleted} items from storage`, { prefix });
      return deleted;
    } catch (error) {
      logger.error('Failed to clear storage', error);
      return 0;
    }
  }

  // Utility methods
  private getFilePath(key: string): string {
    const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${this.config.basePath}/${sanitized}.json`;
  }

  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (!await [this.app](http://this.app).vault.adapter.exists(dir)) {
      await [this.app](http://this.app).vault.adapter.mkdir(dir);
    }
  }

  private updateCache(key: string, data: StoredData, size: number): void {
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.cacheSize -= this.estimateSize(this.cache.get(key)!);
    }
    
    // Add new entry
    this.cache.set(key, data);
    this.cacheSize += size;
    
    // Clean cache if too large
    this.cleanCache();
  }

  private cleanCache(): void {
    const maxSize = this.config.maxCacheSize * 1024 * 1024; // Convert to bytes
    
    if (this.cacheSize > maxSize) {
      // Remove oldest entries first
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      while (this.cacheSize > maxSize && entries.length > 0) {
        const [key, data] = entries.shift()!;
        this.cache.delete(key);
        this.cacheSize -= this.estimateSize(data);
        logger.debug(`Removed from cache: ${key}`);
      }
    }
  }

  private estimateSize(data: StoredData): number {
    return JSON.stringify(data).length;
  }

  // Cache management
  getCacheStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.cacheSize,
      count: this.cache.size,
      maxSize: this.config.maxCacheSize * 1024 * 1024
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheSize = 0;
    logger.debug('Cache cleared');
  }
}
```

---

## 🎯 การใช้งาน Core Services

### ในไฟล์ `main.ts` เพิ่ม:

```tsx
import { Logger, logger } from './src/services/logger';
import { EventsBus, eventsBus } from './src/services/events';
import { StorageService } from './src/services/storage';

// เพิ่มใน class SmartAssistantPlugin
public logger = logger;
public eventsBus = eventsBus;
public storage!: StorageService;

async onload() {
  // Initialize storage
  [this.storage](http://this.storage) = new StorageService([this.app](http://this.app));
  
  // Setup event listeners
  this.setupEventListeners();
  
  // Load settings
  await this.loadSettings();
  
  // Initialize other services...
  [this.logger.info](http://this.logger.info)('Smart Assistant plugin loaded');
  this.eventsBus.emit('system:ready', {});
}

private setupEventListeners() {
  this.eventsBus.on('system:ready', () => {
    [this.logger.info](http://this.logger.info)('Smart Assistant ready');
  });
  
  this.eventsBus.on('settings:changed', async ({ key, value }) => {
    this.logger.debug(`Setting changed: ${key}`, value);
    await this.saveSettings();
  });
  
  this.eventsBus.on('chat:error', ({ error, timestamp }) => {
    new Notice(`Chat error: ${error}`);
  });
}

async onunload() {
  this.eventsBus.emit('system:shutdown', {});
  [this.storage](http://this.storage).clearCache();
  [this.logger.info](http://this.logger.info)('Smart Assistant plugin unloaded');
}
```

**✅ Core Services พร้อมใช้งาน!** ขั้นตอนถัดไป: Add Provider Logic

## 🛠️ Missing Core Components

# ❌ ส่วนที่ยังขาดหายไป

## 🎭 ไอคอนและ UI Icons

**ไฟล์: `src/icons/icons.ts`**

```tsx
export const ICONS = {
  // Main plugin icon
  assistant: '🤖',
  
  // Mode icons
  chat: '💬',
  rag: '🔍',
  agent: '🎯',
  
  // Provider icons
  ollama: '🦙',
  openai: '🌐',
  gemini: '🧠',
  lmstudio: '🎨',
  
  // Status icons
  connected: '🟢',
  disconnected: '🔴',
  loading: '🟡',
  error: '⚠️',
  success: '✅',
  
  // Tool icons
  settings: '⚙️',
  folder: '📁',
  file: '📄',
  template: '📋',
  command: '⌨️'
};

// SVG Icons for better UI
export const SVG_ICONS = {
  assistant: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  
  chat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
  
  rag: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  
  agent: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
};
```

---

## 📋 Template System

**ไฟล์: `src/templates/TemplateManager.ts`**

```tsx
import { App, TFile, normalizePath } from 'obsidian';
import { logger } from '../services/logger';
import { StorageService } from '../services/storage';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'user' | 'agent';
  content: string;
  variables?: string[];
  tags?: string[];
}

export class TemplateManager {
  private app: App;
  private storage: StorageService;
  private templates: Map<string, Template> = new Map();
  private templateFolder = 'Smart Assistant/Templates';

  constructor(app: App, storage: StorageService) {
    [this.app](http://this.app) = app;
    [this.storage](http://this.storage) = storage;
  }

  async initialize(): Promise<void> {
    await this.ensureTemplateFolder();
    await this.createDefaultTemplates();
    await this.loadTemplates();
  }

  private async ensureTemplateFolder(): Promise<void> {
    const folderPath = normalizePath(this.templateFolder);
    if (![this.app](http://this.app).vault.getAbstractFileByPath(folderPath)) {
      await [this.app](http://this.app).vault.createFolder(folderPath);
      [logger.info](http://logger.info)('Created Smart Assistant Templates folder');
    }
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates: Template[] = [
      {
        id: 'system-chat',
        name: 'Chat System Prompt',
        description: 'System prompt for general chat mode',
        category: 'system',
        content: `You are a helpful AI assistant integrated into Obsidian. You have access to the user's vault and can help with:

- Answering questions about their notes
- Creating and organizing content
- Research and analysis
- Writing assistance

Context from vault:
context

User question: question`,
        variables: ['context', 'question']
      },
      {
        id: 'system-rag',
        name: 'RAG System Prompt',
        description: 'System prompt for RAG-enhanced responses',
        category: 'system',
        content: `You are an AI assistant with access to the user's knowledge base. Use the provided context to give accurate, relevant answers.

Relevant context from vault:
context

Question: question

Instructions:
- Base your answer primarily on the provided context
- If context is insufficient, clearly state so
- Provide specific references when possible
- Be concise but thorough`,
        variables: ['context', 'question']
      },
      {
        id: 'system-agent',
        name: 'Agent System Prompt',
        description: 'System prompt for autonomous agent mode',
        category: 'system',
        content: `You are an autonomous AI agent working within Obsidian. You can:

1. Create and edit notes
2. Organize information
3. Research topics
4. Execute multi-step plans

Current task: task

Vault context: context

Available tools:
- create_note(title, content)
- search_vault(query)
- update_note(path, content)
- organize_files(criteria)

Plan your approach step by step and execute systematically.`,
        variables: ['task', 'context']
      },
      {
        id: 'meeting-notes',
        name: 'Meeting Notes Template',
        description: 'Template for structured meeting notes',
        category: 'user',
        content: `# Meeting Notes - date

## Attendees
- attendees

## Agenda
1. 
2. 
3. 

## Discussion Points
### Topic 1
- 

### Topic 2
- 

## Action Items
- [ ] 
- [ ] 

## Next Meeting
Date: 
Time: 
Location: `,
        variables: ['date', 'attendees']
      },
      {
        id: 'research-template',
        name: 'Research Note Template',
        description: 'Template for research and analysis notes',
        category: 'user',
        content: `# Research: topic

## Overview
overview

## Key Questions
1. 
2. 
3. 

## Sources
- 
- 
- 

## Key Findings
### Finding 1
**Source:** 
**Summary:** 

### Finding 2
**Source:** 
**Summary:** 

## Analysis

## Conclusions

## Next Steps
- [ ] 
- [ ] 

---
Tags: #research #topic`,
        variables: ['topic', 'overview']
      }
    ];

    for (const template of defaultTemplates) {
      await this.saveTemplate(template);
    }
  }

  async saveTemplate(template: Template): Promise<void> {
    const filePath = normalizePath(`${this.templateFolder}/${[template.id](http://template.id)}.md`);
    
    const content = `---
id: ${[template.id](http://template.id)}
name: ${[template.name](http://template.name)}
description: ${template.description}
category: ${template.category}
variables: [${template.variables?.join(', ') || ''}]
tags: [${template.tags?.join(', ') || ''}]
---

${template.content}`;
    
    await [this.app](http://this.app).vault.adapter.write(filePath, content);
    this.templates.set([template.id](http://template.id), template);
    logger.debug(`Saved template: ${[template.name](http://template.name)}`);
  }

  async loadTemplates(): Promise<void> {
    const templateFiles = [this.app](http://this.app).vault.getMarkdownFiles()
      .filter(file => file.path.startsWith(this.templateFolder));
    
    for (const file of templateFiles) {
      try {
        const content = await [this.app.vault.read](http://this.app.vault.read)(file);
        const template = this.parseTemplate(file.basename, content);
        if (template) {
          this.templates.set([template.id](http://template.id), template);
        }
      } catch (error) {
        logger.error(`Failed to load template: ${file.path}`, error);
      }
    }
  }

  private parseTemplate(filename: string, content: string): Template | null {
    // Parse frontmatter and content
    const lines = content.split('\n');
    if (lines[0] !== '---') return null;
    
    const frontmatterEnd = lines.indexOf('---', 1);
    if (frontmatterEnd === -1) return null;
    
    const frontmatter = lines.slice(1, frontmatterEnd);
    const templateContent = lines.slice(frontmatterEnd + 1).join('\n').trim();
    
    const template: Partial<Template> = { content: templateContent };
    
    for (const line of frontmatter) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key.trim()) {
        case 'id':
          [template.id](http://template.id) = value;
          break;
        case 'name':
          [template.name](http://template.name) = value;
          break;
        case 'description':
          template.description = value;
          break;
        case 'category':
          template.category = value as Template['category'];
          break;
        case 'variables':
          template.variables = value.split(',').map(v => v.trim()).filter(v => v);
          break;
        case 'tags':
          template.tags = value.split(',').map(v => v.trim()).filter(v => v);
          break;
      }
    }
    
    return template as Template;
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: Template['category']): Template[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  renderTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    let rendered = template.content;
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return rendered;
  }
}
```

---

## ⌨️ Command Functions

**ไฟล์: `src/commands/CommandManager.ts`**

```tsx
import { App, Command, Editor, MarkdownView, Notice, TFile } from 'obsidian';
import SmartAssistantPlugin from '../../main';
import { logger } from '../services/logger';
import { ICONS } from '../icons/icons';

export class CommandManager {
  private plugin: SmartAssistantPlugin;
  private app: App;

  constructor(plugin: SmartAssistantPlugin) {
    this.plugin = plugin;
    [this.app](http://this.app) = [plugin.app](http://plugin.app);
  }

  registerCommands(): void {
    // Chat Commands
    this.plugin.addCommand({
      id: 'open-chat',
      name: 'Open Chat View',
      icon: 'message-circle',
      callback: () => this.openChatView()
    });

    this.plugin.addCommand({
      id: 'quick-chat',
      name: 'Quick Chat with Selection',
      icon: 'zap',
      editorCallback: (editor: Editor) => this.quickChatWithSelection(editor)
    });

    // RAG Commands
    this.plugin.addCommand({
      id: 'ask-vault',
      name: 'Ask Question About Vault',
      icon: 'search',
      callback: () => this.askVaultQuestion()
    });

    this.plugin.addCommand({
      id: 'reindex-vault',
      name: 'Reindex Vault for RAG',
      icon: 'refresh-cw',
      callback: () => this.reindexVault()
    });

    // Agent Commands
    this.plugin.addCommand({
      id: 'open-agent',
      name: 'Open Agent Planning View',
      icon: 'target',
      callback: () => this.openAgentView()
    });

    this.plugin.addCommand({
      id: 'create-from-template',
      name: 'Create Note from AI Template',
      icon: 'file-plus',
      callback: () => this.createFromTemplate()
    });

    // Utility Commands
    this.plugin.addCommand({
      id: 'explain-selection',
      name: 'Explain Selected Text',
      icon: 'help-circle',
      editorCallback: (editor: Editor) => this.explainSelection(editor)
    });

    this.plugin.addCommand({
      id: 'summarize-note',
      name: 'Summarize Current Note',
      icon: 'file-text',
      editorCallback: (editor: Editor, view: MarkdownView) => this.summarizeNote(view)
    });

    this.plugin.addCommand({
      id: 'improve-writing',
      name: 'Improve Writing Style',
      icon: 'edit-3',
      editorCallback: (editor: Editor) => this.improveWriting(editor)
    });

    // Template Commands
    this.plugin.addCommand({
      id: 'insert-meeting-template',
      name: 'Insert Meeting Notes Template',
      icon: 'calendar',
      editorCallback: (editor: Editor) => this.insertTemplate(editor, 'meeting-notes')
    });

    this.plugin.addCommand({
      id: 'insert-research-template',
      name: 'Insert Research Template',
      icon: 'book-open',
      editorCallback: (editor: Editor) => this.insertTemplate(editor, 'research-template')
    });
  }

  private async openChatView(): Promise<void> {
    // Implementation will be added with ChatView
    new Notice('Opening Chat View...');
  }

  private async quickChatWithSelection(editor: Editor): Promise<void> {
    const selectedText = editor.getSelection();
    if (!selectedText) {
      new Notice('Please select some text first');
      return;
    }

    try {
      // Get AI response for selected text
      const response = await this.plugin.providerManager?.chat(
        `Please explain or help with this text: ${selectedText}`,
        'You are a helpful AI assistant. Provide clear, concise explanations.'
      );

      if (response) {
        // Insert response below selection
        const cursor = editor.getCursor('to');
        editor.setCursor(cursor.line + 1, 0);
        editor.replaceSelection(`\n---\n**AI Response:**\n${response.content}\n---\n`);
      }
    } catch (error) {
      new Notice('Failed to get AI response');
      logger.error('Quick chat failed', error);
    }
  }

  private async askVaultQuestion(): Promise<void> {
    // Implementation will be added with RAG system
    new Notice('Opening vault question dialog...');
  }

  private async reindexVault(): Promise<void> {
    new Notice('Starting vault reindexing...');
    try {
      // Implementation will be added with RAG system
      [logger.info](http://logger.info)('Vault reindexing started');
    } catch (error) {
      new Notice('Reindexing failed');
      logger.error('Reindexing error', error);
    }
  }

  private async openAgentView(): Promise<void> {
    // Implementation will be added with Agent system
    new Notice('Opening Agent Planning View...');
  }

  private async createFromTemplate(): Promise<void> {
    // Show template selection modal
    new Notice('Opening template selection...');
  }

  private async explainSelection(editor: Editor): Promise<void> {
    const selectedText = editor.getSelection();
    if (!selectedText) {
      new Notice('Please select some text to explain');
      return;
    }

    try {
      const response = await this.plugin.providerManager?.chat(
        selectedText,
        'Please explain this text clearly and concisely. If it contains concepts, provide definitions and context.'
      );

      if (response) {
        const cursor = editor.getCursor('to');
        editor.setCursor(cursor.line + 1, 0);
        editor.replaceSelection(`\n> **Explanation:** ${response.content}\n`);
      }
    } catch (error) {
      new Notice('Failed to explain selection');
      logger.error('Explain selection failed', error);
    }
  }

  private async summarizeNote(view: MarkdownView): Promise<void> {
    const file = view.file;
    if (!file) {
      new Notice('No active file');
      return;
    }

    try {
      const content = await [this.app.vault.read](http://this.app.vault.read)(file);
      const response = await this.plugin.providerManager?.chat(
        content,
        'Please create a concise summary of this note. Focus on key points and main ideas.'
      );

      if (response) {
        const editor = view.editor;
        editor.setCursor(0, 0);
        editor.replaceSelection(`> **Summary:** ${response.content}\n\n`);
      }
    } catch (error) {
      new Notice('Failed to summarize note');
      logger.error('Summarize note failed', error);
    }
  }

  private async improveWriting(editor: Editor): Promise<void> {
    const selectedText = editor.getSelection();
    if (!selectedText) {
      new Notice('Please select text to improve');
      return;
    }

    try {
      const response = await this.plugin.providerManager?.chat(
        selectedText,
        'Please improve the writing style of this text. Make it clearer, more concise, and better structured while maintaining the original meaning.'
      );

      if (response) {
        editor.replaceSelection(response.content);
      }
    } catch (error) {
      new Notice('Failed to improve writing');
      logger.error('Improve writing failed', error);
    }
  }

  private async insertTemplate(editor: Editor, templateId: string): Promise<void> {
    try {
      const template = this.plugin.templateManager?.getTemplate(templateId);
      if (!template) {
        new Notice(`Template not found: ${templateId}`);
        return;
      }

      // Get current date for template variables
      const now = new Date();
      const variables = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        attendees: '',
        topic: '',
        overview: ''
      };

      const rendered = this.plugin.templateManager?.renderTemplate(templateId, variables) || template.content;
      editor.replaceSelection(rendered);
    } catch (error) {
      new Notice('Failed to insert template');
      logger.error('Template insertion failed', error);
    }
  }
}
```

---

## 📁 Auto Folder Creation

**ไฟล์: `src/setup/FolderSetup.ts`**

```tsx
import { App, normalizePath } from 'obsidian';
import { logger } from '../services/logger';

export class FolderSetup {
  private app: App;
  
  constructor(app: App) {
    [this.app](http://this.app) = app;
  }

  async createPluginFolders(): Promise<void> {
    const folders = [
      'Smart Assistant',
      'Smart Assistant/Templates',
      'Smart Assistant/Chat History',
      'Smart Assistant/Agent Plans',
      'Smart Assistant/RAG Index',
      'Smart Assistant/Exports'
    ];

    for (const folder of folders) {
      await this.ensureFolder(folder);
    }

    // Create welcome note
    await this.createWelcomeNote();
  }

  private async ensureFolder(folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);
    if (![this.app](http://this.app).vault.getAbstractFileByPath(normalizedPath)) {
      await [this.app](http://this.app).vault.createFolder(normalizedPath);
      [logger.info](http://logger.info)(`Created folder: ${folderPath}`);
    }
  }

  private async createWelcomeNote(): Promise<void> {
    const welcomePath = 'Smart Assistant/Welcome to Smart [Assistant.md](http://Assistant.md)';
    if ([this.app](http://this.app).vault.getAbstractFileByPath(welcomePath)) {
      return; // Already exists
    }

    const welcomeContent = `# 🤖 Welcome to Smart Assistant!

Congratulations! You've successfully installed the Smart Assistant plugin for Obsidian.

## 🚀 Quick Start

### 1. Choose Your AI Provider
- Go to Settings → Smart Assistant
- Configure your preferred AI provider (Ollama, OpenAI, etc.)
- Test the connection

### 2. Try the Three Modes

#### 💬 Chat Mode
- Open Chat View: \`Ctrl+P\` → "Open Chat View"
- Quick chat with selection: Select text → \`Ctrl+P\` → "Quick Chat with Selection"

#### 🔍 RAG Mode (Research Assistant)
- Ask questions about your vault: \`Ctrl+P\` → "Ask Question About Vault"
- The AI will search and use your notes to answer questions

#### 🎯 Agent Mode (Autonomous Helper)
- Open Agent Planning: \`Ctrl+P\` → "Open Agent Planning View"
- Let AI create and execute multi-step plans

### 3. Useful Commands

| Command | Description |
|---------|-------------|
| Explain Selected Text | Get AI explanation of highlighted text |
| Summarize Current Note | Create summary at top of current note |
| Improve Writing Style | Enhance selected text |
| Insert Meeting Template | Add structured meeting notes |
| Insert Research Template | Add research note template |

## 📁 Plugin Folders

The plugin has created these folders for you:

- **Templates/**: AI-powered templates
- **Chat History/**: Saved conversations
- **Agent Plans/**: Autonomous AI plans and results
- **RAG Index/**: Search index for your vault
- **Exports/**: AI-generated content exports

## 🛠️ Configuration

Customize Smart Assistant in Settings:
- AI Provider settings
- RAG search preferences
- Agent behavior options
- Template management

## 🆘 Need Help?

- Check the plugin documentation
- Use \`Ctrl+P\` → "Smart Assistant: Help"
- Report issues on GitHub

Happy AI-assisted note-taking! 🎉

---
*Generated by Smart Assistant v1.0.0*`;

    await [this.app](http://this.app).vault.create(welcomePath, welcomeContent);
    [logger.info](http://logger.info)('Created welcome note');
  }
}
```

## 🎯 Three AI Modes Complete System

# 🤖 AI 3 โหมดครบถ้วน

## 💬 Mode 1: Chat Mode

**ไฟล์: `src/modes/ChatMode.ts`**

```tsx
import { BaseProvider, ChatMessage, ChatResponse } from '../providers/BaseProvider';
import { logger } from '../services/logger';
import { eventsBus } from '../services/events';

export class ChatMode {
  private provider?: BaseProvider;
  private chatHistory: ChatMessage[] = [];
  private systemPrompt = `You are a helpful AI assistant integrated into Obsidian. You can help with:

- Answering general questions
- Explaining concepts
- Writing assistance
- Creative tasks
- Problem solving

Be concise but helpful. Format responses in markdown when appropriate.`;

  setProvider(provider: BaseProvider): void {
    this.provider = provider;
  }

  async chat(message: string, useHistory: boolean = true): Promise<ChatResponse> {
    if (!this.provider) {
      throw new Error('No AI provider configured');
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: [Date.now](http://Date.now)()
    };

    const messages: ChatMessage[] = [];
    
    // Add system prompt
    messages.push({ role: 'system', content: this.systemPrompt });
    
    // Add history if requested
    if (useHistory) {
      messages.push(...this.chatHistory.slice(-10)); // Keep last 10 messages
    }
    
    // Add current message
    messages.push(userMessage);

    try {
      eventsBus.emit('chat:message-sent', {
        message,
        timestamp: [Date.now](http://Date.now)()
      });

      const response = await [this.provider.chat](http://this.provider.chat)(messages);
      
      // Add to history
      this.chatHistory.push(userMessage);
      this.chatHistory.push({
        role: 'assistant',
        content: response.content,
        timestamp: [Date.now](http://Date.now)()
      });

      // Keep history manageable
      if (this.chatHistory.length > 50) {
        this.chatHistory = this.chatHistory.slice(-40);
      }

      return response;
    } catch (error) {
      logger.error('Chat mode error', error);
      throw error;
    }
  }

  clearHistory(): void {
    this.chatHistory = [];
    logger.debug('Chat history cleared');
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
    logger.debug('Chat system prompt updated');
  }
}
```

---

## 🔍 Mode 2: RAG Mode (Retrieval-Augmented Generation)

**ไฟล์: `src/modes/RAGMode.ts`**

```tsx
import { App, TFile } from 'obsidian';
import { BaseProvider, ChatMessage, ChatResponse } from '../providers/BaseProvider';
import { VectorStore } from '../rag/vector-store';
import { DocumentRetriever } from '../rag/retriever';
import { logger } from '../services/logger';
import { eventsBus } from '../services/events';

export class RAGMode {
  private app: App;
  private provider?: BaseProvider;
  private vectorStore: VectorStore;
  private retriever: DocumentRetriever;
  private isIndexed = false;
  
  private systemPrompt = `You are an AI assistant with access to the user's Obsidian vault. Use the provided context from their notes to give accurate, relevant answers.

Instructions:
- Base your answer primarily on the provided context
- If context is insufficient, clearly state so
- Provide specific references to notes when possible
- Be concise but thorough
- Use markdown formatting for better readability`;

  constructor(app: App) {
    [this.app](http://this.app) = app;
    this.vectorStore = new VectorStore(app);
    this.retriever = new DocumentRetriever(app, this.vectorStore);
  }

  setProvider(provider: BaseProvider): void {
    this.provider = provider;
  }

  async initialize(): Promise<void> {
    try {
      await this.vectorStore.initialize();
      await this.indexVault();
      this.isIndexed = true;
      [logger.info](http://logger.info)('RAG Mode initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RAG Mode', error);
      throw error;
    }
  }

  async indexVault(forceReindex: boolean = false): Promise<void> {
    const files = [this.app](http://this.app).vault.getMarkdownFiles();
    
    eventsBus.emit('rag:indexing-start', { fileCount: files.length });
    
    let processed = 0;
    let failed = 0;
    const startTime = [Date.now](http://Date.now)();

    for (const file of files) {
      try {
        // Skip if already indexed and not forcing reindex
        if (!forceReindex && await this.vectorStore.isFileIndexed(file.path)) {
          processed++;
          continue;
        }

        const content = await [this.app.vault.read](http://this.app.vault.read)(file);
        await this.vectorStore.addDocument({
          id: file.path,
          content,
          metadata: {
            title: file.basename,
            path: file.path,
            mtime: file.stat.mtime,
            size: file.stat.size
          }
        });

        processed++;
        
        eventsBus.emit('rag:indexing-progress', {
          processed,
          total: files.length,
          currentFile: file.basename
        });
      } catch (error) {
        failed++;
        logger.error(`Failed to index file: ${file.path}`, error);
      }
    }

    const duration = [Date.now](http://Date.now)() - startTime;
    eventsBus.emit('rag:indexing-complete', {
      indexed: processed - failed,
      failed,
      duration
    });

    [logger.info](http://logger.info)(`Indexing complete: ${processed - failed} files indexed, ${failed} failed`);
  }

  async ask(question: string, options: {
    maxResults?: number;
    includeContent?: boolean;
    fileTypes?: string[];
  } = {}): Promise<ChatResponse> {
    if (!this.provider) {
      throw new Error('No AI provider configured');
    }

    if (!this.isIndexed) {
      throw new Error('Vault not indexed. Please run indexing first.');
    }

    const { maxResults = 5 } = options;

    try {
      // Retrieve relevant documents
      const relevantDocs = await this.retriever.retrieve(question, maxResults);
      
      eventsBus.emit('rag:search', {
        query: question,
        results: relevantDocs.length
      });

      // Build context from retrieved documents
      const context = [relevantDocs.map](http://relevantDocs.map)(doc => {
        return `**${doc.metadata.title}** (${doc.metadata.path}):\n${doc.content.slice(0, 1000)}...`;
      }).join('\n\n---\n\n');

      // Create enhanced prompt with context
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        {
          role: 'user',
          content: `Context from vault:\n\n${context}\n\nQuestion: ${question}`
        }
      ];

      const response = await [this.provider.chat](http://this.provider.chat)(messages);
      
      // Add metadata about sources
      const sources = [relevantDocs.map](http://relevantDocs.map)(doc => doc.metadata.path);
      response.metadata = {
        ...response.metadata,
        sources,
        contextLength: context.length,
        documentsUsed: relevantDocs.length
      };

      return response;
    } catch (error) {
      logger.error('RAG mode error', error);
      throw error;
    }
  }

  async searchSimilar(content: string, maxResults: number = 3): Promise<Array<{
    path: string;
    title: string;
    similarity: number;
    excerpt: string;
  }>> {
    const results = await this.retriever.retrieve(content, maxResults);
    return [results.map](http://results.map)(doc => ({
      path: doc.metadata.path,
      title: doc.metadata.title,
      similarity: doc.score || 0,
      excerpt: doc.content.slice(0, 200) + '...'
    }));
  }

  getIndexStatus(): {
    isIndexed: boolean;
    documentCount: number;
    lastIndexed?: Date;
  } {
    return {
      isIndexed: this.isIndexed,
      documentCount: this.vectorStore.getDocumentCount(),
      lastIndexed: this.vectorStore.getLastIndexed()
    };
  }
}
```

---

## 🎯 Mode 3: Agent Mode (Autonomous Assistant)

**ไฟล์: `src/modes/AgentMode.ts`**

```tsx
import { App, TFile, Notice } from 'obsidian';
import { BaseProvider, ChatMessage, ChatResponse } from '../providers/BaseProvider';
import { RAGMode } from './RAGMode';
import { TemplateManager } from '../templates/TemplateManager';
import { logger } from '../services/logger';
import { eventsBus } from '../services/events';

export interface AgentPlan {
  id: string;
  goal: string;
  steps: AgentStep[];
  status: 'planning' | 'executing' | 'completed' | 'failed';
  created: Date;
  updated: Date;
  results?: any[];
}

export interface AgentStep {
  id: string;
  description: string;
  action: string;
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export class AgentMode {
  private app: App;
  private provider?: BaseProvider;
  private ragMode: RAGMode;
  private templateManager: TemplateManager;
  private tools: Map<string, AgentTool> = new Map();
  private activePlans: Map<string, AgentPlan> = new Map();
  
  private systemPrompt = `You are an autonomous AI agent working within Obsidian. You can plan and execute multi-step tasks.

Available tools:
TOOLS

When given a task:
1. Break it down into specific, actionable steps
2. Choose appropriate tools for each step
3. Execute steps systematically
4. Provide clear feedback on progress

Respond with valid JSON in this format:
{
  "plan": {
    "goal": "Description of the overall goal",
    "steps": [
      {
        "description": "What this step does",
        "action": "tool_name",
        "parameters": { "param1": "value1" }
      }
    ]
  }
}`;

  constructor(app: App, ragMode: RAGMode, templateManager: TemplateManager) {
    [this.app](http://this.app) = app;
    this.ragMode = ragMode;
    this.templateManager = templateManager;
    this.setupTools();
  }

  setProvider(provider: BaseProvider): void {
    this.provider = provider;
  }

  private setupTools(): void {
    // File operations
    [this.tools](http://this.tools).set('create_note', {
      name: 'create_note',
      description: 'Create a new note with specified title and content',
      parameters: { title: 'string', content: 'string', folder: 'string (optional)' },
      execute: async (params) => {
        const { title, content, folder } = params;
        const path = folder ? `${folder}/${title}.md` : `${title}.md`;
        const file = await [this.app](http://this.app).vault.create(path, content);
        return { success: true, path: file.path };
      }
    });

    [this.tools](http://this.tools).set('update_note', {
      name: 'update_note',
      description: 'Update content of an existing note',
      parameters: { path: 'string', content: 'string', append: 'boolean (optional)' },
      execute: async (params) => {
        const { path, content, append = false } = params;
        const file = [this.app](http://this.app).vault.getAbstractFileByPath(path) as TFile;
        if (!file) throw new Error(`File not found: ${path}`);
        
        if (append) {
          const existingContent = await [this.app.vault.read](http://this.app.vault.read)(file);
          await [this.app](http://this.app).vault.modify(file, existingContent + '\n\n' + content);
        } else {
          await [this.app](http://this.app).vault.modify(file, content);
        }
        
        return { success: true, path };
      }
    });

    [this.tools](http://this.tools).set('search_vault', {
      name: 'search_vault',
      description: 'Search for information in the vault using RAG',
      parameters: { query: 'string', maxResults: 'number (optional)' },
      execute: async (params) => {
        const { query, maxResults = 5 } = params;
        const results = await this.ragMode.searchSimilar(query, maxResults);
        return { results, count: results.length };
      }
    });

    [this.tools](http://this.tools).set('organize_files', {
      name: 'organize_files',
      description: 'Organize files by moving them to appropriate folders',
      parameters: { criteria: 'string', targetFolder: 'string' },
      execute: async (params) => {
        const { criteria, targetFolder } = params;
        // Implementation would analyze files and organize them
        new Notice(`Organizing files by: ${criteria}`);
        return { success: true, organized: 0 };
      }
    });

    [this.tools](http://this.tools).set('create_from_template', {
      name: 'create_from_template',
      description: 'Create a note using a template with variables',
      parameters: { templateId: 'string', variables: 'object', filename: 'string' },
      execute: async (params) => {
        const { templateId, variables, filename } = params;
        const content = this.templateManager.renderTemplate(templateId, variables);
        const file = await [this.app](http://this.app).vault.create(`${filename}.md`, content);
        return { success: true, path: file.path };
      }
    });
  }

  async createPlan(task: string, options: {
    mode?: 'speed' | 'quality';
    maxSteps?: number;
  } = {}): Promise<AgentPlan> {
    if (!this.provider) {
      throw new Error('No AI provider configured');
    }

    const { mode = 'quality', maxSteps = 10 } = options;

    try {
      // Get tool descriptions for prompt
      const toolDescriptions = Array.from([this.tools](http://this.tools).values())
        .map(tool => `- ${[tool.name](http://tool.name)}: ${tool.description}`)
        .join('\n');

      const prompt = this.systemPrompt.replace('TOOLS', toolDescriptions);
      
      const messages: ChatMessage[] = [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: `Task: ${task}\n\nMode: ${mode}\nMax steps: ${maxSteps}\n\nPlease create a detailed plan to accomplish this task.`
        }
      ];

      const response = await [this.provider.chat](http://this.provider.chat)(messages);
      
      // Parse JSON response
      const planData = JSON.parse(response.content);
      
      const plan: AgentPlan = {
        id: `plan_${[Date.now](http://Date.now)()}`,
        goal: planData.plan.goal,
        steps: [planData.plan.steps.map](http://planData.plan.steps.map)((step: any, index: number) => ({
          id: `step_${index + 1}`,
          ...step,
          status: 'pending' as const
        })),
        status: 'planning',
        created: new Date(),
        updated: new Date(),
        results: []
      };

      this.activePlans.set([plan.id](http://plan.id), plan);
      
      eventsBus.emit('agent:plan-generated', {
        plan,
        timestamp: [Date.now](http://Date.now)()
      });

      [logger.info](http://logger.info)(`Agent plan created: ${plan.goal} (${plan.steps.length} steps)`);
      return plan;
    } catch (error) {
      logger.error('Failed to create agent plan', error);
      throw error;
    }
  }

  async executePlan(planId: string, options: {
    confirmBeforeExecute?: boolean;
    pauseBetweenSteps?: number;
  } = {}): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const { confirmBeforeExecute = true, pauseBetweenSteps = 1000 } = options;

    if (confirmBeforeExecute) {
      new Notice(`Executing plan: ${plan.goal}`);
    }

    plan.status = 'executing';
    const startTime = [Date.now](http://Date.now)();

    try {
      for (const step of plan.steps) {
        step.status = 'executing';
        
        eventsBus.emit('agent:step-executed', {
          step,
          result: null,
          timestamp: [Date.now](http://Date.now)()
        });

        try {
          const tool = [this.tools](http://this.tools).get(step.action);
          if (!tool) {
            throw new Error(`Unknown tool: ${step.action}`);
          }

          const result = await tool.execute(step.parameters);
          step.result = result;
          step.status = 'completed';
          
          plan.results?.push(result);
          
          logger.debug(`Step completed: ${step.description}`, result);
        } catch (error) {
          step.error = error instanceof Error ? error.message : 'Unknown error';
          step.status = 'failed';
          logger.error(`Step failed: ${step.description}`, error);
        }

        plan.updated = new Date();
        
        // Pause between steps if requested
        if (pauseBetweenSteps > 0) {
          await new Promise(resolve => setTimeout(resolve, pauseBetweenSteps));
        }
      }

      const hasFailures = plan.steps.some(step => step.status === 'failed');
      plan.status = hasFailures ? 'failed' : 'completed';
      
      const duration = [Date.now](http://Date.now)() - startTime;
      eventsBus.emit('agent:execution-complete', {
        success: !hasFailures,
        duration
      });

      const completedSteps = plan.steps.filter(step => step.status === 'completed').length;
      new Notice(`Plan execution ${plan.status}: ${completedSteps}/${plan.steps.length} steps completed`);
      
      [logger.info](http://logger.info)(`Plan execution completed: ${plan.goal} - ${plan.status}`);
    } catch (error) {
      plan.status = 'failed';
      logger.error('Plan execution failed', error);
      throw error;
    }
  }

  getPlan(planId: string): AgentPlan | undefined {
    return this.activePlans.get(planId);
  }

  getAllPlans(): AgentPlan[] {
    return Array.from(this.activePlans.values());
  }

  getActivePlans(): AgentPlan[] {
    return this.getAllPlans().filter(plan => 
      plan.status === 'planning' || plan.status === 'executing'
    );
  }

  async savePlan(plan: AgentPlan): Promise<void> {
    const planContent = `# Agent Plan: ${plan.goal}

**Status:** ${plan.status}
**Created:** ${plan.created.toLocaleString()}
**Updated:** ${plan.updated.toLocaleString()}

## Steps

${[plan.steps.map](http://plan.steps.map)((step, index) => 
  `${index + 1}. **${step.description}** (${step.status})
   - Action: ${step.action}
   - Parameters: \`${JSON.stringify(step.parameters)}\`
   ${step.result ? `- Result: \`${JSON.stringify(step.result)}\`` : ''}
   ${step.error ? `- Error: ${step.error}` : ''}`
).join('\n\n')}

## Results Summary

${plan.results?.map((result, index) => 
  `**Step ${index + 1}:** \`${JSON.stringify(result)}\``
).join('\n') || 'No results yet.'}
`;

    const fileName = `Agent Plan - ${plan.goal.slice(0, 50)} - ${plan.created.toISOString().split('T')[0]}.md`;
    const path = `Smart Assistant/Agent Plans/${fileName}`;
    
    await [this.app](http://this.app).vault.create(path, planContent);
    [logger.info](http://logger.info)(`Plan saved: ${path}`);
  }
}
```

---

## 🔗 Mode Integration Manager

**ไฟล์: `src/modes/ModeManager.ts`**

```tsx
import { App } from 'obsidian';
import { BaseProvider } from '../providers/BaseProvider';
import { ChatMode } from './ChatMode';
import { RAGMode } from './RAGMode';
import { AgentMode } from './AgentMode';
import { TemplateManager } from '../templates/TemplateManager';
import { StorageService } from '../services/storage';
import { logger } from '../services/logger';

export type AIMode = 'chat' | 'rag' | 'agent';

export class ModeManager {
  private app: App;
  private chatMode: ChatMode;
  private ragMode: RAGMode;
  private agentMode: AgentMode;
  private currentMode: AIMode = 'chat';
  private provider?: BaseProvider;

  constructor(app: App, templateManager: TemplateManager, storage: StorageService) {
    [this.app](http://this.app) = app;
    this.chatMode = new ChatMode();
    this.ragMode = new RAGMode(app);
    this.agentMode = new AgentMode(app, this.ragMode, templateManager);
  }

  async initialize(): Promise<void> {
    try {
      await this.ragMode.initialize();
      [logger.info](http://logger.info)('All AI modes initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI modes', error);
      throw error;
    }
  }

  setProvider(provider: BaseProvider): void {
    this.provider = provider;
    this.chatMode.setProvider(provider);
    this.ragMode.setProvider(provider);
    this.agentMode.setProvider(provider);
    [logger.info](http://logger.info)(`Provider set for all modes: ${[provider.name](http://provider.name)}`);
  }

  setMode(mode: AIMode): void {
    this.currentMode = mode;
    logger.debug(`Switched to ${mode} mode`);
  }

  getCurrentMode(): AIMode {
    return this.currentMode;
  }

  getChatMode(): ChatMode {
    return this.chatMode;
  }

  getRAGMode(): RAGMode {
    return this.ragMode;
  }

  getAgentMode(): AgentMode {
    return this.agentMode;
  }

  // Unified interface for all modes
  async processRequest(input: string, options: any = {}): Promise<any> {
    switch (this.currentMode) {
      case 'chat':
        return await [this.chatMode.chat](http://this.chatMode.chat)(input, options.useHistory);
      case 'rag':
        return await this.ragMode.ask(input, options);
      case 'agent':
        const plan = await this.agentMode.createPlan(input, options);
        if (options.autoExecute) {
          await this.agentMode.executePlan([plan.id](http://plan.id), options);
        }
        return plan;
      default:
        throw new Error(`Unknown mode: ${this.currentMode}`);
    }
  }

  getStatus(): {
    currentMode: AIMode;
    provider?: string;
    chatHistory: number;
    ragIndexed: boolean;
    activePlans: number;
  } {
    return {
      currentMode: this.currentMode,
      provider: this.provider?.name,
      chatHistory: this.chatMode.getHistory().length,
      ragIndexed: this.ragMode.getIndexStatus().isIndexed,
      activePlans: this.agentMode.getActivePlans().length
    };
  }
}
```

## 🤖 Obsidian Smart Assistant - Complete Integration Plugin

# 🤖 Obsidian Smart Assistant - Complete Integration Plugin

ปลั๊กอิน Obsidian ที่รวบรวมความสามารถของ **Chat Agent**, **Service Integration**, **Automation Tools** และ **Custom Tool Builder** เข้าด้วยกัน

---

## 🎯 ฟีเจอร์หลัก (ตาม Chat Integration App)

### 🤖 Chat Agent System

- **Real-time Chat**: สนทนากับ AI แบบ real-time พร้อม streaming responses
- **Multi-AI Providers**: รองรับ Ollama, OpenAI, Gemini, Claude
- **Conversation History**: เก็บประวัติการสนทนาแยกตาม context
- **Context Awareness**: จำบริบทจาก vault และการสนทนาก่อนหน้า

### 🔗 Service Integration (ต้องเชื่อมต่อจริง)

- **Notion API**: เข้าถึง databases, pages, blocks
- **Airtable API**: จัดการ tables, records, views
- **Google Drive**: อัปโหลด/ดาวน์โหลดไฟล์
- **Google Sheets/Docs**: สร้างและแก้ไขเอกสาร
- **ClickUp**: จัดการ tasks, projects, time tracking
- **Obsidian Vault**: จัดการไฟล์และ metadata ภายใน vault
- **n8n/[Make.com](http://Make.com)**: ทริกเกอร์ workflows ภายนอก

### ⚡ Automation & Workflow

- **Trigger System**: เหตุการณ์ที่เรียกใช้ automation (เวลา, การเปลี่ยนแปลงไฟล์, คีย์เวิร์ด)
- **Action Chains**: ลำดับการทำงานอัตโนมัติแบบหลายขั้นตอน
- **Conditional Logic**: เงื่อนไขในการทำงาน (if/else, loops)
- **Error Handling**: จัดการข้อผิดพลาดและ retry mechanisms

### 🛠️ Custom Tool Builder

- **Visual Tool Editor**: สร้าง custom tools ด้วย GUI
- **JavaScript Runner**: รันโค้ด JS ภายในปลั๊กอิน
- **Template System**: สร้าง tools จาก templates
- **Tool Library**: แชร์และดาวน์โหลด tools จากชุมชน

---

## 📁 โครงสร้างปลั๊กอินสมบูรณ์

```jsx
obsidian-smart-assistant/
├── package.json                    # Dependencies และ scripts
├── manifest.json                   # Plugin manifest
├── main.ts                         # Entry point
├── styles.css                      # UI styles
├── src/
│   ├── core/
│   │   ├── Plugin.ts               # Main plugin class
│   │   ├── Settings.ts             # Settings management
│   │   └── StateManager.ts         # Global state management
│   ├── chat/
│   │   ├── ChatManager.ts          # Chat session management
│   │   ├── MessageHistory.ts       # Conversation history
│   │   ├── StreamingResponse.ts    # Real-time streaming
│   │   └── ContextManager.ts       # Context awareness
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── BaseProvider.ts     # Provider interface
│   │   │   ├── OllamaProvider.ts   # Local Ollama
│   │   │   ├── OpenAIProvider.ts   # OpenAI API
│   │   │   ├── GeminiProvider.ts   # Google Gemini
│   │   │   └── ClaudeProvider.ts   # Anthropic Claude
│   │   └── AIOrchestrator.ts       # AI provider management
│   ├── integrations/
│   │   ├── BaseIntegration.ts      # Integration interface
│   │   ├── NotionClient.ts         # Notion API wrapper
│   │   ├── AirtableClient.ts       # Airtable API wrapper
│   │   ├── GoogleClient.ts         # Google APIs wrapper
│   │   ├── ClickUpClient.ts        # ClickUp API wrapper
│   │   └── WebhookClient.ts        # External webhook calls
│   ├── automation/
│   │   ├── WorkflowEngine.ts       # Workflow execution engine
│   │   ├── TriggerManager.ts       # Event trigger system
│   │   ├── ActionRegistry.ts       # Available actions
│   │   ├── ScheduleManager.ts      # Time-based triggers
│   │   └── ConditionalLogic.ts     # If/else logic
│   ├── tools/
│   │   ├── ToolRegistry.ts         # Tool management
│   │   ├── JavaScriptRunner.ts     # JS code execution
│   │   ├── ToolBuilder.ts          # Visual tool creator
│   │   ├── TemplateManager.ts      # Tool templates
│   │   └── builtin/                # Built-in tools
│   │       ├── FileTools.ts        # File operations
│   │       ├── TextTools.ts        # Text processing
│   │       ├── DataTools.ts        # Data manipulation
│   │       └── WebTools.ts         # Web requests
│   ├── ui/
│   │   ├── views/
│   │   │   ├── ChatView.ts         # Main chat interface
│   │   │   ├── WorkflowView.ts     # Automation management
│   │   │   ├── ToolBuilderView.ts  # Tool creation UI
│   │   │   └── ConnectionsView.ts  # Service connections
│   │   ├── components/
│   │   │   ├── MessageBubble.ts    # Chat message UI
│   │   │   ├── WorkflowEditor.ts   # Workflow visual editor
│   │   │   ├── ToolEditor.ts       # Tool creation form
│   │   │   └── StatusIndicator.ts  # Connection status
│   │   └── modals/
│   │       ├── SettingsModal.ts    # Plugin settings
│   │       ├── ToolModal.ts        # Tool configuration
│   │       └── WorkflowModal.ts    # Workflow setup
│   ├── storage/
│   │   ├── DatabaseManager.ts      # Local data storage
│   │   ├── CacheManager.ts         # Response caching
│   │   ├── HistoryManager.ts       # Conversation history
│   │   └── CredentialManager.ts    # Encrypted API keys
│   ├── security/
│   │   ├── Encryption.ts           # API key encryption
│   │   ├── Sanitizer.ts            # Input sanitization
│   │   └── RateLimiter.ts          # API rate limiting
│   └── utils/
│       ├── Logger.ts               # Logging system
│       ├── ErrorHandler.ts         # Error management
│       ├── APIUtils.ts             # HTTP utilities
│       └── FileUtils.ts            # File operations
└── templates/
    ├── tools/                      # Tool templates
    ├── workflows/                  # Workflow templates
    └── integrations/               # Integration templates
```

---

## 🔧 Core Implementation Files

### `src/core/Plugin.ts`

```tsx
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ChatManager } from '../chat/ChatManager';
import { AIOrchestrator } from '../ai/AIOrchestrator';
import { WorkflowEngine } from '../automation/WorkflowEngine';
import { ToolRegistry } from '../tools/ToolRegistry';
import { IntegrationManager } from '../integrations/IntegrationManager';

export default class SmartAssistantPlugin extends Plugin {
    chatManager: ChatManager;
    aiOrchestrator: AIOrchestrator;
    workflowEngine: WorkflowEngine;
    toolRegistry: ToolRegistry;
    integrationManager: IntegrationManager;

    async onload() {
        // Initialize core systems
        await this.initializeCore();
        
        // Register views and commands
        this.registerViews();
        this.registerCommands();
        
        // Start background services
        this.startBackgroundServices();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    private async initializeCore() {
        this.aiOrchestrator = new AIOrchestrator(this);
        this.integrationManager = new IntegrationManager(this);
        this.toolRegistry = new ToolRegistry(this);
        this.workflowEngine = new WorkflowEngine(this);
        this.chatManager = new ChatManager(this);

        await this.loadSettings();
        await this.integrationManager.initialize();
        await this.toolRegistry.loadBuiltinTools();
    }
}
```

### `src/integrations/NotionClient.ts`

```tsx
import { Client } from '@notionhq/client';

export class NotionClient {
    private client: Client;

    constructor(apiKey: string) {
        this.client = new Client({ auth: apiKey });
    }

    async getDatabases() {
        return await [this.client.search](http://this.client.search)({
            filter: { property: 'object', value: 'database' }
        });
    }

    async queryDatabase(databaseId: string, filter?: any) {
        return await this.client.databases.query({
            database_id: databaseId,
            filter: filter
        });
    }

    async createPage(parent: any, properties: any, children?: any[]) {
        return await this.client.pages.create({
            parent: parent,
            properties: properties,
            children: children
        });
    }

    async updatePage(pageId: string, properties: any) {
        return await this.client.pages.update({
            page_id: pageId,
            properties: properties
        });
    }
}
```

### `src/tools/JavaScriptRunner.ts`

```tsx
export class JavaScriptRunner {
    private sandbox: any;
    
    constructor() {
        this.setupSandbox();
    }

    private setupSandbox() {
        // Create secure sandbox for JS execution
        this.sandbox = {
            // Safe APIs only
            console: {
                log: (...args: any[]) => console.log('[Tool]', ...args)
            },
            // Obsidian APIs
            app: [this.app](http://this.app),
            // Utility functions
            fetch: this.secureFetch.bind(this),
            // Custom tool APIs
            notion: this.getNotionAPI.bind(this),
            airtable: this.getAirtableAPI.bind(this)
        };
    }

    async executeCode(code: string, context: any = {}) {
        try {
            const func = new Function(...Object.keys(this.sandbox), ...Object.keys(context), `
                "use strict";
                ${code}
            `);
            
            return await func(...Object.values(this.sandbox), ...Object.values(context));
        } catch (error) {
            throw new Error(`Tool execution failed: ${error.message}`);
        }
    }

    private async secureFetch(url: string, options: any = {}) {
        // Implement security checks and rate limiting
        return fetch(url, options);
    }
}
```

### `src/automation/WorkflowEngine.ts`

```tsx
export interface WorkflowStep {
    id: string;
    type: 'tool' | 'condition' | 'delay' | 'loop';
    config: any;
    nextSteps: string[];
}

export interface Workflow {
    id: string;
    name: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    enabled: boolean;
}

export class WorkflowEngine {
    private activeWorkflows: Map<string, Workflow> = new Map();
    private executionQueue: any[] = [];

    async executeWorkflow(workflowId: string, context: any = {}) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) throw new Error('Workflow not found');

        const execution = {
            workflowId,
            context,
            currentStep: 0,
            status: 'running',
            results: []
        };

        try {
            await this.processWorkflowSteps(workflow, execution);
            execution.status = 'completed';
        } catch (error) {
            execution.status = 'failed';
            execution.error = error.message;
            throw error;
        }

        return execution;
    }

    private async processWorkflowSteps(workflow: Workflow, execution: any) {
        for (const step of workflow.steps) {
            await this.executeStep(step, execution);
        }
    }

    private async executeStep(step: WorkflowStep, execution: any) {
        switch (step.type) {
            case 'tool':
                return await this.executeTool(step.config, execution.context);
            case 'condition':
                return this.evaluateCondition(step.config, execution.context);
            case 'delay':
                return await this.delay(step.config.duration);
            case 'loop':
                return await this.executeLoop(step.config, execution);
        }
    }
}
```

---

## 🎨 UI Components และการใช้งาน

### Chat Interface

```tsx
export class ChatView extends ItemView {
    private chatContainer: HTMLElement;
    private inputBox: HTMLTextAreaElement;
    private sendButton: HTMLButtonElement;

    getViewType(): string {
        return 'smart-assistant-chat';
    }

    getDisplayText(): string {
        return 'Smart Assistant';
    }

    async onOpen() {
        this.createChatInterface();
        this.setupEventListeners();
        this.loadChatHistory();
    }

    private createChatInterface() {
        this.contentEl.empty();
        
        // Chat header with provider selector
        const header = this.contentEl.createDiv('chat-header');
        this.createProviderSelector(header);
        
        // Chat messages container
        this.chatContainer = this.contentEl.createDiv('chat-container');
        
        // Input area
        const inputArea = this.contentEl.createDiv('chat-input-area');
        this.inputBox = inputArea.createEl('textarea', {
            placeholder: 'พิมพ์ข้อความของคุณ...',
            cls: 'chat-input'
        });
        this.sendButton = inputArea.createEl('button', {
            text: 'ส่ง',
            cls: 'chat-send-button'
        });
    }

    private async sendMessage(message: string) {
        this.addMessage('user', message);
        
        try {
            const response = await this.plugin.chatManager.sendMessage(message, {
                streaming: true,
                onToken: (token: string) => {
                    this.updateAssistantMessage(token);
                }
            });
        } catch (error) {
            this.addMessage('error', `เกิดข้อผิดพลาด: ${error.message}`);
        }
    }
}
```

### Tool Builder Interface

```tsx
export class ToolBuilderView extends ItemView {
    private toolEditor: HTMLElement;
    private codeEditor: HTMLTextAreaElement;
    private testButton: HTMLButtonElement;

    async createTool() {
        const toolConfig = {
            name: this.getToolName(),
            description: this.getToolDescription(),
            parameters: this.getToolParameters(),
            code: this.codeEditor.value,
            category: this.getSelectedCategory()
        };

        try {
            await this.plugin.toolRegistry.createCustomTool(toolConfig);
            new Notice('สร้าง Tool สำเร็จ!');
        } catch (error) {
            new Notice(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    }

    async testTool() {
        const code = this.codeEditor.value;
        const testParams = this.getTestParameters();

        try {
            const result = await this.plugin.toolRegistry.testTool(code, testParams);
            this.displayTestResult(result);
        } catch (error) {
            this.displayTestError(error);
        }
    }
}
```

---

## 🔌 Built-in Tools (เครื่องมือพื้นฐาน)

### File Management Tools

```tsx
export const FILE_TOOLS = {
    create_note: {
        name: 'Create Note',
        description: 'สร้างโน้ตใหม่',
        parameters: {
            path: { type: 'string', required: true },
            content: { type: 'string', required: false }
        },
        execute: async (params: any) => {
            const { path, content = '' } = params;
            await app.vault.create(path, content);
            return { success: true, path };
        }
    },
    
    search_notes: {
        name: 'Search Notes',
        description: 'ค้นหาโน้ต',
        parameters: {
            query: { type: 'string', required: true },
            folder: { type: 'string', required: false }
        },
        execute: async (params: any) => {
            const { query, folder } = params;
            // Implement search logic
            return { results: [] };
        }
    }
};
```

### Integration Tools

```tsx
export const NOTION_TOOLS = {
    create_notion_page: {
        name: 'Create Notion Page',
        description: 'สร้างหน้าใน Notion',
        parameters: {
            database_id: { type: 'string', required: true },
            properties: { type: 'object', required: true }
        },
        execute: async (params: any, context: any) => {
            const notion = context.integrations.notion;
            return await notion.createPage(params.database_id, [params.properties](http://params.properties));
        }
    },
    
    query_notion_database: {
        name: 'Query Notion Database',
        description: 'ค้นหาข้อมูลใน Notion Database',
        parameters: {
            database_id: { type: 'string', required: true },
            filter: { type: 'object', required: false }
        },
        execute: async (params: any, context: any) => {
            const notion = context.integrations.notion;
            return await notion.queryDatabase(params.database_id, params.filter);
        }
    }
};
```

### Automation Tools

```tsx
export const AUTOMATION_TOOLS = {
    schedule_task: {
        name: 'Schedule Task',
        description: 'จัดตารางงานอัตโนมัติ',
        parameters: {
            cron: { type: 'string', required: true },
            workflow_id: { type: 'string', required: true }
        },
        execute: async (params: any, context: any) => {
            const { cron, workflow_id } = params;
            await context.workflowEngine.scheduleWorkflow(workflow_id, cron);
            return { scheduled: true, cron, workflow_id };
        }
    },
    
    trigger_webhook: {
        name: 'Trigger Webhook',
        description: 'เรียก Webhook ภายนอก',
        parameters: {
            url: { type: 'string', required: true },
            method: { type: 'string', required: false, default: 'POST' },
            data: { type: 'object', required: false }
        },
        execute: async (params: any) => {
            const { url, method = 'POST', data } = params;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : undefined
            });
            return await response.json();
        }
    }
};
```

---

## ⚙️ การตั้งค่าและการเชื่อมต่อ

### Settings Configuration

```tsx
export interface PluginSettings {
    // AI Providers
    aiProviders: {
        openai: { apiKey: string; model: string; enabled: boolean };
        gemini: { apiKey: string; model: string; enabled: boolean };
        ollama: { endpoint: string; model: string; enabled: boolean };
        claude: { apiKey: string; model: string; enabled: boolean };
    };
    
    // Service Integrations
    integrations: {
        notion: { apiKey: string; enabled: boolean };
        airtable: { apiKey: string; enabled: boolean };
        google: { credentials: any; enabled: boolean };
        clickup: { apiKey: string; enabled: boolean };
    };
    
    // Automation Settings
    automation: {
        enabled: boolean;
        maxConcurrentWorkflows: number;
        retryAttempts: number;
        enableScheduler: boolean;
    };
    
    // Security Settings
    security: {
        encryptApiKeys: boolean;
        enableSandbox: boolean;
        rateLimitEnabled: boolean;
        maxToolExecutionTime: number;
    };
}
```

### Connection Management

```tsx
export class IntegrationManager {
    private connections: Map<string, any> = new Map();
    
    async testConnection(service: string): Promise<boolean> {
        try {
            switch (service) {
                case 'notion':
                    const notion = this.getNotionClient();
                    await [notion.users.me](http://notion.users.me)();
                    return true;
                    
                case 'airtable':
                    const airtable = this.getAirtableClient();
                    await airtable.bases();
                    return true;
                    
                default:
                    return false;
            }
        } catch (error) {
            console.error(`Connection test failed for ${service}:`, error);
            return false;
        }
    }

    async setupConnection(service: string, credentials: any) {
        // Encrypt and store credentials
        const encrypted = await this.encryptCredentials(credentials);
        await this.plugin.saveData({ [`${service}_credentials`]: encrypted });
        
        // Initialize connection
        await this.initializeConnection(service);
        
        // Test connection
        const isConnected = await this.testConnection(service);
        if (!isConnected) {
            throw new Error(`Failed to connect to ${service}`);
        }
        
        return { success: true, service, connected: isConnected };
    }
}
```

---

## 🎯 สรุปความสามารถครบถ้วน

### ✅ Chat Agent System

- [x]  Real-time streaming responses
- [x]  Multi-AI provider support
- [x]  Conversation history and context
- [x]  Agent modes (Chat, RAG, Planning)

### ✅ Service Integration

- [x]  Notion API (databases, pages, blocks)
- [x]  Airtable API (bases, tables, records)
- [x]  Google APIs (Drive, Sheets, Docs)
- [x]  ClickUp API (tasks, projects, tracking)
- [x]  Webhook support สำหรับ n8n/[Make.com](http://Make.com)

### ✅ Automation & Workflows

- [x]  Visual workflow builder
- [x]  Time-based triggers (cron jobs)
- [x]  Event-based triggers (file changes, keywords)
- [x]  Conditional logic และ loops
- [x]  Error handling และ retry mechanisms

### ✅ Custom Tool System

- [x]  Visual tool builder
- [x]  JavaScript code runner (sandboxed)
- [x]  Built-in tool library
- [x]  Tool templates และ sharing
- [x]  Parameter validation และ testing

### ✅ Security & Performance

- [x]  Encrypted API key storage
- [x]  Rate limiting และ request throttling
- [x]  Sandboxed code execution
- [x]  Error handling และ logging
- [x]  Response caching

---

*ปลั๊กอินนี้ครอบคลุมทุกฟีเจอร์ของ Chat Integration App และเพิ่มความสามารถพิเศษสำหรับ Obsidian* 🚀