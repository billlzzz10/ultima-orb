# 🔮 Ultima-Orb: คู่มือผู้ใช้ (User Guide)

## 📋 สารบัญ (Table of Contents)

1. [การติดตั้ง (Installation)](#การติดตั้ง-installation)
2. [การตั้งค่าเริ่มต้น (Initial Setup)](#การตั้งค่าเริ่มต้น-initial-setup)
3. [AI Providers (AI Providers)](#ai-providers-ai-providers)
4. [การใช้งาน Chat (Chat Usage)](#การใช้งาน-chat-chat-usage)
5. [AI Generation Tools (AI Generation Tools)](#ai-generation-tools-ai-generation-tools)
6. [การเชื่อมต่อกับบริการภายนอก (External Integrations)](#การเชื่อมต่อกับบริการภายนอก-external-integrations)
7. [การจัดการความรู้ (Knowledge Management)](#การจัดการความรู้-knowledge-management)
8. [การตั้งค่าขั้นสูง (Advanced Settings)](#การตั้งค่าขั้นสูง-advanced-settings)
9. [ตัวอย่างการใช้งาน Tools (Tool Usage Examples)](#ตัวอย่างการใช้งาน-tools-tool-usage-examples)
10. [การแก้ไขปัญหา (Troubleshooting)](#การแก้ไขปัญหา-troubleshooting)
11. [คำถามที่พบบ่อย (FAQ)](#คำถามที่พบบ่อย-faq)

---

## 🚀 การติดตั้ง (Installation)

### ข้อกำหนดระบบ (System Requirements)

- **Obsidian**: เวอร์ชัน 1.0.0 หรือใหม่กว่า
- **Operating System**: Windows 10+, macOS 10.15+, Linux
- **Memory**: ขั้นต่ำ 4GB RAM (แนะนำ 8GB+)
- **Storage**: 100MB สำหรับ plugin และ cache

### ขั้นตอนการติดตั้ง

1. **เปิด Obsidian** และไปที่ Settings
2. **คลิก Community plugins** ในแถบด้านซ้าย
3. **ปิด Safe mode** (ถ้าเปิดอยู่)
4. **คลิก Browse** เพื่อเปิด Community plugins
5. **ค้นหา "Ultima-Orb"** ในช่องค้นหา
6. **คลิก Install** เมื่อพบ plugin
7. **เปิดใช้งาน** plugin ใน Community plugins

### การติดตั้งแบบ Manual

หากไม่พบ plugin ใน Community plugins:

1. **ดาวน์โหลด** ไฟล์ `.zip` จาก GitHub releases
2. **แตกไฟล์** ไปยัง `.obsidian/plugins/ultima-orb/`
3. **รัน** `npm install` **ในโฟลเดอร์ plugin** (ถ้าต้องการ build)
4. **รีสตาร์ท** Obsidian
5. **เปิดใช้งาน** plugin

---

## ⚙️ การตั้งค่าเริ่มต้น (Initial Setup)

### การเปิดใช้งานครั้งแรก

เมื่อเปิดใช้งาน Ultima-Orb ครั้งแรก:

1. **ไปที่ Settings** → **Ultima-Orb**
2. **ตั้งค่า AI Provider** อย่างน้อย 1 ตัว
3. **ทดสอบการเชื่อมต่อ** เพื่อให้แน่ใจว่าทำงานได้
4. **เปิดใช้งาน** ฟีเจอร์ที่ต้องการ

### การตั้งค่าพื้นฐาน

#### 1. AI Provider Configuration

```yaml
# ตัวอย่างการตั้งค่า Ollama (Local)
Provider: Ollama
Model: llama2
Base URL: http://localhost:11434
Temperature: 0.7
Max Tokens: 1000

# ตัวอย่างการตั้งค่า OpenAI
Provider: OpenAI
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
Model: gpt-3.5-turbo
Temperature: 0.7
Max Tokens: 1000
```

#### 2. Default Settings

- **Default Provider**: เลือก AI provider ที่ต้องการใช้เป็นหลัก
- **Default Mode**: เลือกโหมดการทำงาน (Chat, Assistant, Agent, Creative, Analysis)
- **Auto-save**: เปิด/ปิดการบันทึกอัตโนมัติ
- **Context Length**: จำนวนข้อความที่ใช้เป็นบริบท

---

## 🤖 AI Providers (AI Providers)

### Ollama (Local)

**ข้อดี**: ทำงานแบบ offline, ไม่มีค่าใช้จ่าย, ความเป็นส่วนตัวสูง

**การตั้งค่า**:
1. ติดตั้ง Ollama จาก [ollama.ai](https://ollama.ai)
2. ดาวน์โหลด model: `ollama pull llama2`
3. ตั้งค่า Base URL: `http://localhost:11434`

**Models ที่แนะนำ**:
- `llama2` - ทั่วไป
- `codellama` - สำหรับเขียนโค้ด
- `mistral` - เร็วและมีประสิทธิภาพ

### Claude (Anthropic)

**ข้อดี**: คุณภาพสูง, เหมาะสำหรับการวิเคราะห์

**การตั้งค่า**:
1. สมัครบัญชีที่ [anthropic.com](https://anthropic.com)
2. สร้าง API key
3. ใส่ API key ในการตั้งค่า

### OpenAI

**ข้อดี**: เร็ว, มีฟีเจอร์หลากหลาย

**การตั้งค่า**:
1. สมัครบัญชีที่ [openai.com](https://openai.com)
2. สร้าง API key
3. ใส่ API key ในการตั้งค่า

### Gemini (Google)

**ข้อดี**: ฟรี, รองรับ multimodal

**การตั้งค่า**:
1. สมัคร Google AI Studio
2. สร้าง API key
3. ใส่ API key ในการตั้งค่า

### AnythingLLM

**ข้อดี**: Self-hosted, รองรับเอกสารส่วนตัว

**การตั้งค่า**:
1. ติดตั้ง AnythingLLM server
2. ตั้งค่า Base URL
3. สร้าง workspace และอัปโหลดเอกสาร

---

## 💬 การใช้งาน Chat (Chat Usage)

### การเปิด Chat Interface

1. **เปิด Command Palette** (`Ctrl/Cmd + P`)
2. **พิมพ์ "Ultima-Orb: Open Chat"**
3. **กด Enter** เพื่อเปิด chat interface

### ฟีเจอร์หลัก

#### 1. การส่งข้อความ
- **พิมพ์ข้อความ** ในช่องข้อความ
- **กด Enter** เพื่อส่ง
- **กด Shift + Enter** เพื่อขึ้นบรรทัดใหม่

#### 2. การเปลี่ยน AI Provider
- **คลิก dropdown** ที่ provider selector
- **เลือก provider** ที่ต้องการ
- **ระบบจะจำการตั้งค่า** สำหรับ session นี้

#### 3. การแนบไฟล์
- **คลิกปุ่มแนบไฟล์** หรือลากไฟล์มาวาง
- **รองรับไฟล์**: `.txt`, `.md`, `.pdf`, `.docx`
- **ขนาดไฟล์สูงสุด**: 10MB

#### 4. การจัดการประวัติการสนทนา
- **Clear Chat**: ลบประวัติการสนทนา
- **Export Chat**: ส่งออกเป็นไฟล์
- **Save Chat**: บันทึกเป็น note

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | ส่งข้อความ |
| `Ctrl/Cmd + Shift + C` | Clear chat |
| `Ctrl/Cmd + Shift + S` | Save chat |
| `Ctrl/Cmd + Shift + E` | Export chat |

---

## 🤖 AI Generation Tools (AI Generation Tools)

### การเข้าถึง Generation Tools

1. **เปิด Command Palette** (`Ctrl/Cmd + P`)
2. **พิมพ์ "Ultima-Orb: AI Generation Tools"**
3. **กด Enter** เพื่อเปิด tools

### Quick Actions

#### 1. Continue Writing
- **ใช้เมื่อ**: ต้องการให้ AI ต่อข้อความจากที่เขียนไว้
- **วิธีใช้**: เลือกข้อความที่ต้องการต่อ → คลิก "Continue Writing"

#### 2. Improve Text
- **ใช้เมื่อ**: ต้องการปรับปรุงข้อความให้ดีขึ้น
- **วิธีใช้**: เลือกข้อความ → คลิก "Improve Text"

#### 3. Translate
- **ใช้เมื่อ**: ต้องการแปลข้อความ
- **วิธีใช้**: เลือกข้อความ → คลิก "Translate" → เลือกภาษา

#### 4. Fix Grammar
- **ใช้เมื่อ**: ต้องการแก้ไขไวยากรณ์
- **วิธีใช้**: เลือกข้อความ → คลิก "Fix Grammar"

### Generation Templates

#### Writing Templates
- **Blog Post**: สร้างบล็อกโพสต์
- **Professional Email**: สร้างอีเมลธุรกิจ
- **Social Media Post**: สร้างโพสต์โซเชียลมีเดีย

#### Analysis Templates
- **Content Summary**: สรุปเนื้อหา
- **Research Outline**: สร้างโครงร่างการวิจัย
- **Code Explanation**: อธิบายโค้ด

#### Creative Templates
- **Brainstorming**: สร้างไอเดีย
- **Creative Writing**: เขียนสร้างสรรค์

#### Business Templates
- **Meeting Notes**: สร้างบันทึกการประชุม
- **Business Plan**: สร้างแผนธุรกิจ

#### Technical Templates
- **Code Documentation**: สร้างเอกสารโค้ด
- **Technical Report**: สร้างรายงานเทคนิค

### การสร้าง Template เอง

1. **คลิก "Add Template"** ใน Generation Tools
2. **กรอกข้อมูล**:
   - Name: ชื่อ template
   - Description: คำอธิบาย
   - Prompt: ข้อความที่ใช้กับ AI
   - Category: หมวดหมู่
   - Tags: แท็ก
3. **คลิก "Save"** เพื่อบันทึก

---

## 🔗 การเชื่อมต่อกับบริการภายนอก (External Integrations)

### Notion Integration

#### การตั้งค่า
1. **สร้าง Integration** ใน Notion
2. **เพิ่ม API Key** ในการตั้งค่า Ultima-Orb
3. **แชร์หน้า/ฐานข้อมูล** กับ integration

#### ฟีเจอร์
- **สร้างหน้าใหม่**
- **ค้นหาข้อมูล**
- **อัปเดตเนื้อหา**
- **จัดการฐานข้อมูล**

### Airtable Integration

#### การตั้งค่า
1. **สร้าง API Key** ใน Airtable
2. **เพิ่ม API Key** ในการตั้งค่า Ultima-Orb
3. **ระบุ Base ID** ที่ต้องการใช้

#### ฟีเจอร์
- **สร้าง/แก้ไข records**
- **ค้นหาข้อมูล**
- **จัดการฐานข้อมูล**

### ClickUp Integration

#### การตั้งค่า
1. **สร้าง API Key** ใน ClickUp
2. **เพิ่ม API Key** ในการตั้งค่า Ultima-Orb

#### ฟีเจอร์
- **สร้าง/แก้ไข tasks**
- **จัดการ time tracking**
- **สร้าง comments**

---

## 📚 การจัดการความรู้ (Knowledge Management)

### การสร้าง Workspace

1. **เปิด Knowledge Management**
2. **คลิก "Create Workspace"**
3. **กรอกข้อมูล**:
   - Name: ชื่อ workspace
   - Description: คำอธิบาย
   - Tags: แท็ก
4. **คลิก "Create"**

### การอัปโหลดเอกสาร

1. **เลือก workspace**
2. **คลิก "Upload Document"**
3. **เลือกไฟล์** ที่ต้องการอัปโหลด
4. **กรอกข้อมูล**:
   - Name: ชื่อเอกสาร
   - Tags: แท็ก
5. **คลิก "Upload"**

### การค้นหาเอกสาร

1. **ใช้ช่องค้นหา** ใน Knowledge Management
2. **กรอกคำค้นหา**
3. **ใช้แท็ก** เพื่อกรองผลลัพธ์
4. **คลิกเอกสาร** เพื่อดูรายละเอียด

### การใช้ความรู้กับ AI

1. **เปิด Chat** หรือ **Generation Tools**
2. **เลือก workspace** ที่ต้องการใช้
3. **AI จะใช้ข้อมูล** จาก workspace เป็นบริบท

---

## ⚙️ การตั้งค่าขั้นสูง (Advanced Settings)

### Performance Settings

#### Cache Configuration
- **Cache Size**: ขนาด cache (MB)
- **TTL**: เวลาที่ cache หมดอายุ (นาที)
- **Enable Compression**: เปิด/ปิดการบีบอัด

#### Memory Management
- **Memory Threshold**: ขีดจำกัดการใช้หน่วยความจำ (MB)
- **Auto Cleanup**: เปิด/ปิดการล้าง cache อัตโนมัติ

### Security Settings

#### API Key Management
- **Encrypt API Keys**: เข้ารหัส API keys
- **Auto-rotate Keys**: หมุนเวียน keys อัตโนมัติ
- **Key Expiry**: วันหมดอายุของ keys

#### Data Privacy
- **Local Processing**: ประมวลผลในเครื่องเท่านั้น
- **Data Retention**: ระยะเวลาเก็บข้อมูล
- **Export Data**: ส่งออกข้อมูล

### Advanced AI Settings

#### Model Configuration
- **Custom Models**: กำหนด model เอง
- **Model Parameters**: ตั้งค่าพารามิเตอร์
- **Fallback Models**: model สำรอง

#### Context Management
- **Context Window**: ขนาดหน้าต่างบริบท
- **Context Strategy**: กลยุทธ์การจัดการบริบท
- **Memory Management**: การจัดการหน่วยความจำ

---

## 🛠️ ตัวอย่างการใช้งาน Tools (Tool Usage Examples)

### APIManagerTool
```ts
const tool = new APIManagerTool(app);
await tool.execute({
  action: 'add_key',
  provider: 'openai',
  keyName: 'default',
  apiKey: process.env.OPENAI_API_KEY || ''
});
```

### NotionAIAssistantTool
```ts
const tool = new NotionAIAssistantTool(app, apiManager, ai);
await tool.execute({ action: 'analyze_structure', databaseId: 'your-db-id' });
```

### NotionDataAutomationTool
```ts
await new NotionDataAutomationTool(app, apiManager).execute({
  action: 'create_automation_rule',
  name: 'Auto Tag',
  trigger: 'on_create',
  actions: [{ type: 'add_tag', target: 'status', value: 'new' }]
});
```

### AirtableIntegrationTool
```ts
await new AirtableIntegrationTool(app, apiManager).execute({ action: 'list_bases' });
```

### FileImportTool
```ts
await new FileImportTool(app, apiManager).execute({
  action: 'import_url',
  url: 'https://example.com',
  targetFolder: 'AI References'
});
```

### ObsidianBasesTool
```ts
await new ObsidianBasesTool(app).execute({
  action: 'create_base',
  baseName: 'Projects',
  properties: { title: { type: 'text' } }
});
```

### WebhookIntegrationTool
```ts
await new WebhookIntegrationTool(app).execute({
  action: 'registerWebhook',
  integration: 'notion',
  webhookUrl: 'https://example.com/webhook',
  event: 'update'
});
```

### NotionAnalysisTool
```ts
await new NotionAnalysisTool(app, ai).execute({ action: 'fetchAllDatabases' });
```

### NotionDataAnalyzer
```ts
const analyzer = new NotionDataAnalyzer();
const report = await analyzer.analyze({ databaseId: 'your-db-id' });
```

---

## 🔧 การแก้ไขปัญหา (Troubleshooting)

### ปัญหาที่พบบ่อย

#### 1. AI Provider ไม่เชื่อมต่อ

**อาการ**: ได้ข้อความ "Connection failed"

**วิธีแก้**:
1. **ตรวจสอบ API Key** ว่าถูกต้อง
2. **ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต**
3. **ตรวจสอบ URL** ของ provider
4. **ตรวจสอบ Rate Limits**

#### 2. การตอบสนองช้า

**อาการ**: AI ตอบช้าหรือไม่ตอบ

**วิธีแก้**:
1. **เปลี่ยน AI Provider**
2. **ลด Max Tokens**
3. **ตรวจสอบการใช้งาน CPU/RAM**
4. **ล้าง cache**

#### 3. ข้อผิดพลาดในการอัปโหลดไฟล์

**อาการ**: ไม่สามารถอัปโหลดไฟล์ได้

**วิธีแก้**:
1. **ตรวจสอบขนาดไฟล์** (สูงสุด 10MB)
2. **ตรวจสอบประเภทไฟล์** ที่รองรับ
3. **ตรวจสอบสิทธิ์การเขียนไฟล์**

#### 4. การตั้งค่าไม่บันทึก

**อาการ**: การตั้งค่าหายหลังจากรีสตาร์ท

**วิธีแก้**:
1. **ตรวจสอบสิทธิ์การเขียน** ในโฟลเดอร์ Obsidian
2. **ปิด Safe Mode**
3. **รีสตาร์ท Obsidian**

### การรายงานปัญหา

หากพบปัญหา:

1. **เปิด Developer Tools** (`Ctrl/Cmd + Shift + I`)
2. **ไปที่ Console** เพื่อดู error messages
3. **คัดลอก error messages**
4. **รายงานปัญหา** ใน GitHub Issues พร้อม:
   - คำอธิบายปัญหา
   - ขั้นตอนการทำซ้ำ
   - Error messages
   - ข้อมูลระบบ

---

## ❓ คำถามที่พบบ่อย (FAQ)

### Q: Ultima-Orb ฟรีหรือไม่?
**A**: Ultima-Orb เป็น open-source และฟรี แต่การใช้งาน AI providers บางตัวอาจมีค่าใช้จ่าย

### Q: ข้อมูลของฉันปลอดภัยหรือไม่?
**A**: ข้อมูลจะถูกประมวลผลตามการตั้งค่าความปลอดภัยที่คุณเลือก Local providers จะไม่ส่งข้อมูลออกนอกเครื่อง

### Q: สามารถใช้ได้โดยไม่มีอินเทอร์เน็ตหรือไม่?
**A**: ได้ หากใช้ Ollama หรือ AnythingLLM ที่ติดตั้งในเครื่อง

### Q: รองรับภาษาอะไรบ้าง?
**A**: รองรับหลายภาษา ขึ้นอยู่กับ AI model ที่ใช้

### Q: สามารถสร้าง template เองได้หรือไม่?
**A**: ได้ สามารถสร้างและปรับแต่ง template ได้ตามต้องการ

### Q: ข้อมูลจะหายไปเมื่ออัปเดตหรือไม่?
**A**: ไม่ การตั้งค่าและข้อมูลจะถูกเก็บไว้ใน vault ของคุณ

### Q: สามารถใช้ร่วมกับ plugin อื่นได้หรือไม่?
**A**: ได้ Ultima-Orb ออกแบบมาให้ทำงานร่วมกับ plugin อื่นได้

### Q: มีการจำกัดการใช้งานหรือไม่?
**A**: ไม่มี แต่ AI providers บางตัวอาจมี rate limits

---

## 📞 การสนับสนุน (Support)

### ช่องทางการติดต่อ

- **GitHub Issues**: สำหรับรายงานปัญหาและข้อเสนอแนะ
- **Discord**: สำหรับการสนทนาและช่วยเหลือ
- **Documentation**: คู่มือและเอกสารเพิ่มเติม

### การมีส่วนร่วม

เรายินดีรับการมีส่วนร่วมจากชุมชน:
- **รายงานปัญหา**
- **เสนอแนะฟีเจอร์**
- **ส่ง Pull Request**
- **แปลเอกสาร**

---

**🎉 ขอบคุณที่ใช้ Ultima-Orb!**

หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อเราได้เสมอ
