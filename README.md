# Ultima-Orb: AI-Powered Knowledge Management System

Ultima-Orb เป็น Obsidian plugin ที่ใช้ AI ช่วยในการจัดการความรู้ โดยมีฟีเจอร์หลักคือ AI Orchestrator, Canvas Tools, และระบบ Integrations ที่ครอบคลุม

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
- **Notion API:** Sync with Notion
- **Airtable:** Database integration
- **ClickUp:** Project management

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

## 📁 โครงสร้างโปรเจกต์

```
Ultima-Orb/
├── src/
│   ├── main.ts                 # Entry point
│   ├── services/               # Core services
│   ├── core/                   # Business logic
│   ├── ai/                     # AI providers
│   │   └── providers/          # AI provider implementations
│   └── ui/                     # UI components
│       └── views/              # UI views
├── styles/
│   └── writers-intent-design-system.css  # Design system
├── examples/
│   └── preview.html            # Design system preview
├── .cursor/
│   └── rules/                  # Cursor Rules
└── references/                 # Project documentation
```

## 🎯 Roadmap

### Phase 1: Core Features (2-3 สัปดาห์)
- [ ] Canvas Tool & Mind Map Tool
- [ ] AI Memory System
- [ ] Basic Agent Mode

### Phase 2: Advanced Features (1-2 เดือน)
- [ ] Advanced Integrations
- [ ] Custom UI Views
- [ ] Advanced AI Orchestration

### Phase 3: Polish & Optimization (1 เดือน)
- [ ] Performance optimization
- [ ] User experience improvements
- [ ] Advanced customization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Obsidian](https://obsidian.md/)
- [Writer's Intent Design System](./styles/writers-intent-design-system.css)
- [Preview Example](./examples/preview.html)