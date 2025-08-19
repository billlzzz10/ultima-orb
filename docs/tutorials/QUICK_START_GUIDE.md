# 🚀 Ultima-Orb: Quick Start Guide

## 📋 สารบัญ
1. [การติดตั้ง (Installation)](#การติดตั้ง-installation)
2. [การตั้งค่าเริ่มต้น (Initial Setup)](#การตั้งค่าเริ่มต้น-initial-setup)
3. [การใช้งานพื้นฐาน (Basic Usage)](#การใช้งานพื้นฐาน-basic-usage)
4. [การเชื่อมต่อ AI Providers](#การเชื่อมต่อ-ai-providers)
5. [การใช้งาน Chat Interface](#การใช้งาน-chat-interface)
6. [การใช้งาน AI Generation Tools](#การใช้งาน-ai-generation-tools)
7. [การเชื่อมต่อกับบริการภายนอก](#การเชื่อมต่อกับบริการภายนอก)
8. [การจัดการความรู้](#การจัดการความรู้)
9. [การแก้ไขปัญหาเบื้องต้น](#การแก้ไขปัญหาเบื้องต้น)

---

## 🎯 การติดตั้ง (Installation)

### ขั้นตอนที่ 1: ติดตั้ง Plugin
1. เปิด Obsidian
2. ไปที่ **Settings** → **Community plugins**
3. ปิด **Safe mode**
4. คลิก **Browse** และค้นหา "Ultima-Orb"
5. คลิก **Install** และ **Enable**

### ขั้นตอนที่ 2: เปิดใช้งาน Plugin
1. ไปที่ **Settings** → **Ultima-Orb**
2. เปิดใช้งาน plugin
3. ตั้งค่า API keys (ดูส่วนถัดไป)

---

## ⚙️ การตั้งค่าเริ่มต้น (Initial Setup)

### 1. ตั้งค่า AI Providers
ไปที่ **Settings** → **Ultima-Orb** → **AI Providers**

#### OpenAI
```
API Key: sk-your-openai-api-key
Model: gpt-4 (หรือ gpt-3.5-turbo)
```

#### Claude (Anthropic)
```
API Key: sk-ant-your-claude-api-key
Model: claude-3-sonnet-20240229
```

#### Google Gemini
```
API Key: your-gemini-api-key
Model: gemini-pro
```

#### Ollama (Local)
```
URL: http://localhost:11434
Model: llama2 (หรือ model อื่นๆ)
```

#### AnythingLLM
```
URL: http://localhost:3001
API Key: your-anythingllm-api-key
```

### 2. ตั้งค่าการเชื่อมต่อภายนอก
#### Notion
```
Integration Token: secret_your-notion-token
Database ID: your-database-id
```

#### Airtable
```
API Key: key_your-airtable-api-key
Base ID: your-base-id
```

#### ClickUp
```
API Key: pk_your-clickup-api-key
Workspace ID: your-workspace-id
```

---

## 💬 การใช้งานพื้นฐาน (Basic Usage)

### เปิด Chat Interface
1. ใช้ **Command Palette** (Ctrl/Cmd + P)
2. พิมพ์ "Ultima-Orb: Open Chat"
3. หรือคลิกไอคอน Ultima-Orb ใน sidebar

### ส่งข้อความแรก
1. พิมพ์ข้อความในช่องข้อความ
2. เลือก AI Provider ที่ต้องการ
3. กด **Enter** หรือคลิก **Send**

### ตัวอย่างการใช้งาน
```
คุณ: "ช่วยอธิบายเรื่อง AI หน่อย"
AI: "AI หรือ Artificial Intelligence คือ..."

คุณ: "ช่วยเขียนสรุปบทความนี้"
AI: "บทความนี้กล่าวถึง..."
```

---

## 🤖 การเชื่อมต่อ AI Providers

### การเลือก Provider
- **OpenAI**: เหมาะสำหรับงานทั่วไป, การเขียน, การวิเคราะห์
- **Claude**: เหมาะสำหรับการวิเคราะห์เชิงลึก, การเขียนเชิงวิชาการ
- **Gemini**: เหมาะสำหรับงานที่ต้องการข้อมูลล่าสุด
- **Ollama**: เหมาะสำหรับงานที่ต้องการความเป็นส่วนตัว
- **AnythingLLM**: เหมาะสำหรับงานที่ต้องการความรู้เฉพาะ

### การสลับ Provider
1. คลิกที่ dropdown ใน Chat Interface
2. เลือก Provider ที่ต้องการ
3. ข้อความถัดไปจะใช้ Provider ที่เลือก

---

## 🎨 การใช้งาน Chat Interface

### คุณสมบัติหลัก
- **Message History**: เก็บประวัติการสนทนา
- **Provider Switching**: สลับ AI Provider ได้ทันที
- **File Attachments**: แนบไฟล์เพื่อให้ AI วิเคราะห์
- **Context Management**: จัดการบริบทการสนทนา

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: ส่งข้อความ
- `Ctrl/Cmd + Shift + C`: ล้างประวัติการสนทนา
- `Ctrl/Cmd + Shift + P`: สลับ Provider

### การแนบไฟล์
1. คลิกไอคอน **Attach File**
2. เลือกไฟล์ที่ต้องการ
3. AI จะวิเคราะห์เนื้อหาในไฟล์

---

## ✨ การใช้งาน AI Generation Tools

### Quick Actions
1. คลิกปุ่ม **Continue Writing** เพื่อต่อยอดข้อความ
2. คลิกปุ่ม **Improve Text** เพื่อปรับปรุงข้อความ
3. คลิกปุ่ม **Translate** เพื่อแปลภาษา
4. คลิกปุ่ม **Fix Grammar** เพื่อแก้ไขไวยากรณ์

### Templates
1. คลิก **Templates** ใน Chat Interface
2. เลือก template ที่ต้องการ
3. กรอกข้อมูลที่จำเป็น
4. คลิก **Generate**

### ตัวอย่าง Templates
- **Blog Post**: สร้างบทความบล็อก
- **Email**: เขียนอีเมล
- **Code Review**: ตรวจสอบโค้ด
- **Meeting Notes**: สรุปการประชุม

---

## 🔗 การเชื่อมต่อกับบริการภายนอก

### Notion Integration
1. ไปที่ **Settings** → **Integrations** → **Notion**
2. กรอก **Integration Token** และ **Database ID**
3. ทดสอบการเชื่อมต่อ
4. ใช้คำสั่ง "Create a new page in Notion"

### Airtable Integration
1. ไปที่ **Settings** → **Integrations** → **Airtable**
2. กรอก **API Key** และ **Base ID**
3. ทดสอบการเชื่อมต่อ
4. ใช้คำสั่ง "Add a record to Airtable"

### ClickUp Integration
1. ไปที่ **Settings** → **Integrations** → **ClickUp**
2. กรอก **API Key** และ **Workspace ID**
3. ทดสอบการเชื่อมต่อ
4. ใช้คำสั่ง "Create a new task in ClickUp"

---

## 📚 การจัดการความรู้

### สร้าง Workspace
1. ไปที่ **Knowledge** tab
2. คลิก **Create Workspace**
3. ตั้งชื่อและคำอธิบาย
4. เลือก tags ที่เกี่ยวข้อง

### อัปโหลดเอกสาร
1. เลือก workspace
2. คลิก **Upload Document**
3. เลือกไฟล์ (PDF, DOCX, TXT)
4. รอการประมวลผล

### การใช้งานความรู้
1. ใน Chat Interface เลือก workspace
2. AI จะใช้ความรู้จากเอกสารที่อัปโหลด
3. ใช้คำสั่ง "Search in my documents"

---

## 🔧 การแก้ไขปัญหาเบื้องต้น

### ปัญหาที่พบบ่อย

#### AI ไม่ตอบสนอง
- ตรวจสอบ API key
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ลองเปลี่ยน Provider

#### ไม่สามารถเชื่อมต่อ Notion ได้
- ตรวจสอบ Integration Token
- ตรวจสอบ Database ID
- ตรวจสอบสิทธิ์การเข้าถึง

#### ไฟล์แนบไม่ทำงาน
- ตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB)
- ตรวจสอบประเภทไฟล์
- ลองรีสตาร์ท Obsidian

#### Performance ช้า
- ลดจำนวนเอกสารใน Knowledge Base
- ปิด Provider ที่ไม่ใช้
- ล้าง cache ใน Settings

### การขอความช่วยเหลือ
1. ตรวจสอบ [FAQ](./FAQ.md)
2. ดู [Troubleshooting Guide](./TROUBLESHOOTING.md)
3. สร้าง Issue บน GitHub
4. เข้าร่วม Discord Community

---

## 🎉 ขั้นตอนถัดไป

หลังจากใช้งานพื้นฐานแล้ว คุณสามารถ:

1. **เรียนรู้ Advanced Features**
   - การสร้าง Custom Templates
   - การตั้งค่า Workflows
   - การใช้งาน Analytics Dashboard

2. **เชื่อมต่อกับบริการเพิ่มเติม**
   - การตั้งค่า Webhooks
   - การใช้งาน API
   - การสร้าง Custom Integrations

3. **ปรับแต่งการตั้งค่า**
   - การตั้งค่า Theme
   - การปรับแต่ง Keyboard Shortcuts
   - การตั้งค่า Notifications

---

## 📞 การสนับสนุน

- **Documentation**: [docs.ultima-orb.com](https://docs.ultima-orb.com)
- **GitHub**: [github.com/ultima-orb](https://github.com/ultima-orb)
- **Discord**: [discord.gg/ultima-orb](https://discord.gg/ultima-orb)
- **Email**: support@ultima-orb.com

---

**🎯 เริ่มต้นใช้งาน Ultima-Orb และปลดล็อกพลังของ AI ใน Obsidian ของคุณ!**
