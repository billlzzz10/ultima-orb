# 🔗 MCP Integration Guide - Ultima-Orb

## 📋 ภาพรวม

Ultima-Orb รองรับ **Model Context Protocol (MCP)** สำหรับการเชื่อมต่อกับบริการภายนอก 3 แบบ:

1. **Streamable HTTP** (แนะนำ) - ประสิทธิภาพดีที่สุด
2. **SSE (Server-Sent Events)** - การสื่อสารแบบ event-driven
3. **STDIO** - การสื่อสารแบบ local process

---

## 🚀 การตั้งค่า MCP

### 1. เปิด MCP Settings

1. **เปิด Obsidian Settings** (Ctrl/Cmd + ,)
2. **ไปที่ Community Plugins**
3. **เปิดใช้งาน Ultima Orb**
4. **ไปที่ Settings ของ Ultima Orb**
5. **เลือกแท็บ "MCP Integration"**

### 2. เลือก Connection Type

#### **🌐 Streamable HTTP (แนะนำ)**
```json
{
  "mcpServers": {
    "Notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**ข้อดี:**
- ประสิทธิภาพดีที่สุด
- Real-time streaming
- เหมาะสำหรับการใช้งานทั่วไป

#### **📡 SSE (Server-Sent Events)**
```json
{
  "mcpServers": {
    "Notion": {
      "url": "https://mcp.notion.com/sse"
    }
  }
}
```

**ข้อดี:**
- Event-driven communication
- เหมาะสำหรับการอัปเดตแบบ real-time

#### **💻 STDIO (Local Server)**
```json
{
  "mcpServers": {
    "notionMCP": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.notion.com/mcp"]
    }
  }
}
```

**ข้อดี:**
- การสื่อสารแบบ local
- เหมาะสำหรับการพัฒนาและทดสอบ

---

## 🔧 การตั้งค่า Notion MCP

### 1. สร้าง Notion Integration

1. **ไปที่ [Notion Integrations](https://www.notion.so/my-integrations)**
2. **คลิก "New integration"**
3. **ตั้งชื่อและเลือก workspace**
4. **คัดลอก Integration Token** (เริ่มต้นด้วย `secret_`)

### 2. ตั้งค่าใน Ultima-Orb

1. **ไปที่ MCP Settings**
2. **เลือก Connection Type** (แนะนำ: Streamable HTTP)
3. **กรอก Notion Integration Token**
4. **กรอก MCP URL** (default: `https://mcp.notion.com/mcp`)
5. **คลิก "Test Connection"**

### 3. แชร์หน้า/ฐานข้อมูล

1. **เปิดหน้า Notion ที่ต้องการใช้**
2. **คลิก "Share"**
3. **เพิ่ม Integration ที่สร้างไว้**
4. **ให้สิทธิ์ "Can edit"**

---

## 📋 การตั้งค่า ClickUp MCP

### 1. สร้าง ClickUp API Key

1. **ไปที่ [ClickUp Settings](https://app.clickup.com/settings)**
2. **เลือก "Apps" → "API"**
3. **คลิก "Generate API Key"**
4. **คัดลอก API Key** (เริ่มต้นด้วย `pk_`)

### 2. ตั้งค่าใน Ultima-Orb

1. **ไปที่ MCP Settings**
2. **เลือก Connection Type**
3. **กรอก ClickUp API Key**
4. **กรอก MCP URL** (default: `https://mcp.clickup.com/mcp`)
5. **คลิก "Test Connection"**

---

## 📊 การตั้งค่า Airtable MCP

### 1. สร้าง Airtable API Key

1. **ไปที่ [Airtable Account](https://airtable.com/account)**
2. **เลือก "API"**
3. **คลิก "Generate API key"**
4. **คัดลอก API Key**

### 2. ตั้งค่าใน Ultima-Orb

1. **ไปที่ MCP Settings**
2. **เลือก Connection Type**
3. **กรอก Airtable API Key**
4. **กรอก MCP URL** (default: `https://mcp.airtable.com/mcp`)
5. **คลิก "Test Connection"**

---

## 🧪 การทดสอบการเชื่อมต่อ

### 1. ทดสอบแต่ละบริการ

ใน MCP Settings แต่ละบริการจะมีปุ่ม **"Test Connection"**:

- **✅ Connected** - เชื่อมต่อสำเร็จ
- **❌ Failed** - เชื่อมต่อไม่สำเร็จ
- **❌ Error** - เกิดข้อผิดพลาด

### 2. ทดสอบทั้งหมดพร้อมกัน

คลิกปุ่ม **"Test All"** เพื่อทดสอบการเชื่อมต่อทั้งหมดพร้อมกัน

---

## 🎯 ฟีเจอร์ที่ใช้งานได้

### Notion MCP
- **สร้างหน้าใหม่**
- **อัปเดตเนื้อหา**
- **ค้นหาข้อมูล**
- **จัดการฐานข้อมูล**
- **สร้าง/แก้ไข blocks**

### ClickUp MCP
- **สร้าง task ใหม่**
- **อัปเดตสถานะ**
- **จัดการ projects**
- **ติดตามเวลา**
- **สร้าง comments**

### Airtable MCP
- **สร้าง/แก้ไข records**
- **ค้นหาข้อมูล**
- **จัดการฐานข้อมูล**
- **สร้าง views**
- **อัปเดต fields**

---

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Connection Failed
**สาเหตุ:** API Key ไม่ถูกต้องหรือหมดอายุ
**วิธีแก้:**
- ตรวจสอบ API Key
- สร้าง API Key ใหม่
- ตรวจสอบสิทธิ์การเข้าถึง

#### 2. Permission Denied
**สาเหตุ:** ไม่มีสิทธิ์เข้าถึงข้อมูล
**วิธีแก้:**
- แชร์หน้า/ฐานข้อมูลกับ Integration
- ตรวจสอบสิทธิ์ใน workspace

#### 3. Network Error
**สาเหตุ:** ปัญหาการเชื่อมต่ออินเทอร์เน็ต
**วิธีแก้:**
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ลองเปลี่ยน Connection Type
- ตรวจสอบ Firewall settings

### การ Debug

1. **เปิด Developer Tools** (F12)
2. **ดู Console logs**
3. **ตรวจสอบ Network tab**
4. **ดู Error messages**

---

## 📚 ตัวอย่างการใช้งาน

### สร้างหน้าใหม่ใน Notion
```
"Create a new page in Notion with title 'Project Plan' and content about our upcoming project"
```

### สร้าง task ใน ClickUp
```
"Create a new task in ClickUp with title 'Review Code' and assign it to the development team"
```

### เพิ่มข้อมูลใน Airtable
```
"Add a new record to Airtable with customer information: name, email, and phone number"
```

---

## 🔄 การอัปเดต

### อัปเดต MCP Configuration
1. **ไปที่ MCP Settings**
2. **เปลี่ยน Connection Type** หากต้องการ
3. **อัปเดต API Keys** หากจำเป็น
4. **ทดสอบการเชื่อมต่อ**

### อัปเดต Plugin
1. **ดาวน์โหลดเวอร์ชันใหม่**
2. **แทนที่ไฟล์เก่า**
3. **รีสตาร์ท Obsidian**
4. **ตรวจสอบการตั้งค่า**

---

## 📞 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. **ตรวจสอบ Console logs**
2. **ดู Error messages**
3. **ทดสอบการเชื่อมต่อ**
4. **รายงานปัญหาใน GitHub Issues**

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-20  
**Author**: Dollawatt Chidjai
