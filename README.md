# Ultima-Orb: AI-Powered Knowledge Management System

Ultima-Orb เป็น Obsidian plugin ที่ใช้ AI ช่วยในการจัดการความรู้ โดยมีฟีเจอร์หลักคือ AI Orchestrator, Canvas Tools, และระบบ Integrations ที่ครอบคลุม

**เวอร์ชั่นปัจจุบัน: 1.0.1** 🚀

## 🎨 Writer's Intent Design System

โปรเจกต์นี้ใช้ **Writer's Intent Design System** ซึ่งเป็นระบบออกแบบที่สมบูรณ์สำหรับ AI-powered applications

### ฟีเจอร์หลัก

- **Dual Theme System:** รองรับทั้ง Light Theme (GitHub) และ Dark Theme (Writer's Intent)
- **Typography Scale:** ระบบขนาดฟอนต์ที่ลดหลั่นกันอย่างมีมาตรฐาน
- **Icon System:** Line-style icons ที่มีความโค้งมน
- **Code Syntax Highlighting:** Tokyo Night สำหรับ Dark Mode, GitHub สำหรับ Light Mode

### การใช้งาน

#### 1. ไฟล์ CSS หลัก
```html
<link rel="stylesheet" href="styles/writers-intent-design-system.css">
```

#### 2. การสลับธีม
```javascript
document.body.classList.toggle('theme-dark');
```

#### 3. ดูตัวอย่าง
เปิดไฟล์ `examples/preview.html` เพื่อดูภาพรวมของ Design System

### ไฟล์ที่เกี่ยวข้อง

- `styles/writers-intent-design-system.css` - ไฟล์ CSS หลัก
- `examples/preview.html` - ตัวอย่างการใช้งาน
- `.cursor/rules/writers-intent-design-system.mdc` - Cursor Rules สำหรับ AI

## 🚀 ฟีเจอร์หลัก

### 1. AI Orchestrator
- รองรับ multiple AI providers (OpenAI, Anthropic, Google, Local)
- Mode system (Ask, Write, Learn, Research)
- Dynamic tool registration
- Context management

### 2. Canvas & Mind Map Tools
- สร้าง mind maps ด้วย Mermaid.js
- Interactive canvas tools
- Visual knowledge representation

### 3. AI Memory & Personalization
- ระบบจำ preferences และ patterns
- Personalized responses
- Learning from user interactions

### 4. Agent Mode
- ทำงานอัตโนมัติ
- เรียกใช้ tools อัตโนมัติ
- Background processing

### 5. UI Views
- **ChatView:** AI conversation interface
- **ToolTemplateView:** Tool management interface
- **KnowledgeView:** Knowledge visualization

### 6. Integrations
- **Notion API:** Sync with Notion databases and pages
- **Airtable:** Database integration
- **ClickUp:** Project management
- **Webhook Integration:** Custom webhook support

## 🛠️ Tools & Automation

### Core Tools
- **APIManagerTool:** จัดการ API keys และ providers แบบรวมศูนย์
- **NotionAIAssistantTool:** วิเคราะห์และจัดการข้อมูล Notion ด้วย AI
- **NotionDataAutomationTool:** สร้าง automation workflows สำหรับ Notion
- **AirtableIntegrationTool:** เชื่อมต่อและจัดการข้อมูล Airtable
- **FileImportTool:** นำเข้าและประมวลผลไฟล์ต่างๆ
- **ObsidianBasesTool:** จัดการ Obsidian vault และ bases
- **WebhookIntegrationTool:** เชื่อมต่อกับ external services ผ่าน webhooks

### Analysis Tools
- **NotionAnalysisTool:** วิเคราะห์โครงสร้างและข้อมูล Notion
- **NotionDataAnalyzer:** สร้างรายงานและ insights จากข้อมูล Notion

## 🔒 Security Features

### Git Hooks
- **pre-commit:** ตรวจสอบ API keys, ไฟล์ต้องห้าม, ไฟล์ขนาดใหญ่
- **post-commit:** ให้ feedback และ reminders
- **pre-push:** ตรวจสอบความปลอดภัยและคุณภาพแบบครอบคลุม

### Security Measures
- ไม่มี API keys hardcode ในโค้ด
- ใช้ environment variables สำหรับ sensitive data
- ตรวจสอบไฟล์ต้องห้ามก่อน commit
- แจ้งเตือนเมื่อพบ console.log statements

## 🛠️ การพัฒนา

### Prerequisites
- Node.js 18+
- Obsidian
- TypeScript

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Testing
```bash
npm test
npm run test:ui
npm run test:coverage
```

## 📁 โครงสร้างโปรเจกต์

```
Ultima-Orb/
├── src/
│   ├── main.ts                 # Entry point
│   ├── services/               # Core services
│   ├── core/                   # Business logic
│   │   └── tools/              # Tool system
│   ├── ai/                     # AI providers
│   │   └── providers/          # AI provider implementations
│   ├── tools/                  # Tool implementations
│   │   ├── APIManagerTool.ts
│   │   ├── NotionAIAssistantTool.ts
│   │   ├── NotionDataAutomationTool.ts
│   │   ├── AirtableIntegrationTool.ts
│   │   ├── FileImportTool.ts
│   │   └── ObsidianBasesTool.ts
│   ├── tests/                  # Test files
│   │   ├── integration/        # Integration tests
│   │   └── NotionAnalysisTest.ts
│   ├── analysis/               # Analysis tools
│   └── ui/                     # UI components
│       └── views/              # UI views
├── styles/
│   └── writers-intent-design-system.css  # Design system
├── examples/
│   └── preview.html            # Design system preview
├── .cursor/
│   └── rules/                  # Cursor Rules
├── .git/hooks/                 # Git hooks for security
├── analysis-results/           # Generated analysis reports
└── references/                 # Project documentation
```

## 📊 Current Status

### ✅ Completed Features (85%)
- AI Orchestration system
- Multiple AI providers integration
- Tool registration system
- Basic UI components
- Notion integration tools
- Security implementation
- Git hooks for quality control

### 🔄 In Progress (70%)
- Agent Mode automation
- Advanced workflow features
- Canvas & visualization tools
- Performance optimization

### 📋 Remaining (40%)
- Comprehensive testing
- Documentation completion
- Mobile optimization
- Advanced customization features

## 🎯 Roadmap

### Phase 1: Core Features ✅ (Completed)
- [x] AI Orchestrator
- [x] Tool System
- [x] Basic Integrations
- [x] Security Implementation

### Phase 2: Advanced Features 🔄 (In Progress)
- [ ] Advanced Agent Mode
- [ ] Canvas & Mind Map Tools
- [ ] Advanced AI Memory System
- [ ] Performance Optimization

### Phase 3: Polish & Optimization 📋 (Planned)
- [ ] Comprehensive Testing
- [ ] User Experience Improvements
- [ ] Mobile Optimization
- [ ] Advanced Customization

## 🔧 Development Guidelines

### Code Style
- ใช้ TypeScript เต็มรูปแบบ
- ใช้ conventional commit format
- ตรวจสอบ type safety
- ใช้ ESLint และ Prettier

### Security
- ไม่ hardcode API keys
- ใช้ environment variables
- ตรวจสอบด้วย Git hooks
- ใช้ secure coding practices

### Testing
- Unit tests สำหรับ core logic
- Integration tests สำหรับ tools
- Mock external dependencies
- Test error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Run tests and security checks
5. Submit a pull request

## 📚 Documentation

- [API Reference](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Obsidian](https://obsidian.md/)
- [Writer's Intent Design System](./styles/writers-intent-design-system.css)
- [Preview Example](./examples/preview.html)
- [Security Guidelines](./SECURITY.md)
