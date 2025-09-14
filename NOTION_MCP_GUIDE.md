# 🔗 Notion API Integration Guide for Ultima-Orb

## 📋 ภาพรวม

Ultima-Orb ได้รวม **Notion API** เข้าไว้เพื่อให้คุณสามารถเชื่อมต่อและใช้งาน Notion ได้อย่างเต็มประสิทธิภาพผ่าน AI Agents และ Tools ต่างๆ โดยไม่ต้องพึ่งพา MCP server ภายนอก

---

## 🚀 การเริ่มต้นใช้งาน

### 1. การตั้งค่า Notion API

Ultima-Orb ใช้ **Notion API** โดยตรงผ่าน token ของคุณ:

```typescript
// Token ที่ใช้: NOTION-TOKEN
// API Endpoint: https://api.notion.com/v1
// Version: 2022-06-28
```

### 2. การเปิดใช้งานใน Ultima-Orb

1. เปิด **Ultima-Orb Settings** ใน Obsidian
2. ไปที่แท็บ **"Notion API Integration"**
3. กดปุ่ม **"Initialize"** เพื่อเริ่มต้น Notion API client
4. กดปุ่ม **"Test Connection"** เพื่อทดสอบการเชื่อมต่อ

---

## 🛠️ Notion Tools ที่พร้อมใช้งาน

### Database Operations
- `notion:query_database` - ค้นหาข้อมูลใน database
- `notion:create_database` - สร้าง database ใหม่
- `notion:update_database` - อัปเดต database

### Page Operations
- `notion:create_page` - สร้างหน้าใหม่
- `notion:update_page` - อัปเดตหน้า
- `notion:get_page` - ดึงข้อมูลหน้า
- `notion:get_page_blocks` - ดึง blocks ของหน้า
- `notion:append_blocks` - เพิ่ม blocks ลงในหน้า

### Search Operations
- `notion:search_pages` - ค้นหาหน้า
- `notion:search_databases` - ค้นหา database

---

## 💡 ตัวอย่างการใช้งาน

### 1. สร้างหน้าใหม่ใน Notion

```typescript
// ผ่าน AI Agent
await toolManager.executeTool('notion:create_page', {
    parentId: 'your-parent-page-id',
    properties: {
        title: {
            title: [
                {
                    text: {
                        content: 'หน้าใหม่จาก Ultima-Orb'
                    }
                }
            ]
        }
    }
});
```

### 2. ค้นหาข้อมูลใน Database

```typescript
// ค้นหางานที่ยังไม่เสร็จ
await toolManager.executeTool('notion:query_database', {
    databaseId: 'your-database-id',
    filter: {
        property: 'Status',
        select: {
            does_not_equal: 'Done'
        }
    }
});
```

### 3. ค้นหาหน้าใน Notion

```typescript
// ค้นหาหน้าที่เกี่ยวกับโปรเจกต์
await toolManager.executeTool('notion:search_pages', {
    query: 'project documentation'
});
```

---

## 🤖 การใช้งานผ่าน AI Agent

### ตัวอย่างคำสั่งสำหรับ AI Agent

> **"ช่วยสร้างหน้าใหม่ใน Notion สำหรับโปรเจกต์ 'Ultima-Orb Development' พร้อมรายละเอียดและสถานะ 'In Progress'"**

AI Agent จะ:
1. ใช้ `notion:create_page` เพื่อสร้างหน้าใหม่
2. ตั้งค่า properties ที่เหมาะสม
3. รายงานผลลัพธ์กลับมา

### ตัวอย่างคำสั่งสำหรับการค้นหา

> **"ช่วยหางานที่ยังค้างอยู่ใน Notion database และสรุปให้ฟัง"**

AI Agent จะ:
1. ใช้ `notion:query_database` เพื่อค้นหางานที่ยังไม่เสร็จ
2. ใช้ `notion:get_page` เพื่อดึงรายละเอียดของแต่ละงาน
3. สรุปผลลัพธ์ให้คุณ

---

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. "Notion tools not initialized"
**วิธีแก้:** ไปที่ Settings → Notion API Integration → กด "Initialize"

#### 2. "Connection failed"
**วิธีแก้:** 
- ตรวจสอบว่า token ถูกต้อง
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบว่า Notion integration มีสิทธิ์เข้าถึง workspace
- ลองกด "Test Connection" อีกครั้ง

#### 3. "Permission denied"
**วิธีแก้:** ตรวจสอบว่า Notion integration มีสิทธิ์เข้าถึง workspace และ pages ที่ต้องการ

#### 4. "WSL Connection Issues"
**วิธีแก้:** 
- ระบบใหม่ใช้ Notion API โดยตรง ไม่ต้องพึ่งพา WSL หรือ MCP server
- ไม่มีปัญหาเรื่อง network connectivity

### การ Debug

เปิด **Developer Console** ใน Obsidian เพื่อดู logs:

```javascript
// ดู logs ของ Ultima-Orb
console.log('Ultima-Orb logs:', plugin.getLogger().getLogs());

// ทดสอบ Notion connection
await plugin.getToolManager().testNotionConnection();
```

---

## 📚 API Reference

### NotionToolParams Interface

```typescript
interface NotionToolParams {
    databaseId?: string;    // ID ของ database
    pageId?: string;        // ID ของ page
    parentId?: string;      // ID ของ parent page/database
    title?: string;         // ชื่อของ page/database
    properties?: any;       // Properties ของ page/database
    query?: string;         // คำค้นหา
    filter?: any;           // ตัวกรองสำหรับ query
    sorts?: any[];          // การเรียงลำดับ
    blocks?: NotionBlock[]; // Blocks สำหรับ append
}
```

### NotionPage Interface

```typescript
interface NotionPage {
    id: string;
    title: string;
    url: string;
    properties: any;
    created_time: string;
    last_edited_time: string;
}
```

---

## 🎯 เคล็ดลับการใช้งาน

### 1. การจัดการ Database IDs
- เก็บ Database IDs ไว้ใน Obsidian notes
- ใช้ tags เพื่อจัดหมวดหมู่
- สร้าง template สำหรับการใช้งาน

### 2. การสร้าง Templates
```markdown
# Notion Database Template

## Project Database
- ID: `your-project-db-id`
- Purpose: จัดการโปรเจกต์ต่างๆ
- Status: Active

## Tasks Database  
- ID: `your-tasks-db-id`
- Purpose: จัดการงานประจำวัน
- Status: Active
```

### 3. การใช้งานร่วมกับ AI
- ให้ AI ช่วยสร้าง properties ที่เหมาะสม
- ใช้ AI ในการวิเคราะห์และสรุปข้อมูล
- ให้ AI ช่วยในการจัดการ workflow

---

## 🔄 การอัปเดต

เมื่อมีการอัปเดต Notion API:

1. อัปเดต Ultima-Orb plugin:
   ```bash
   git pull origin main
   npm install
   npm run build
   ```

2. รีสตาร์ท Obsidian

3. ทดสอบการเชื่อมต่อใหม่

---

## ✅ ข้อดีของระบบใหม่

### 🚀 **ความเร็ว**
- เชื่อมต่อกับ Notion API โดยตรง ไม่ต้องผ่าน MCP server
- ลด latency และ network overhead

### 🔒 **ความปลอดภัย**
- ไม่ต้องติดตั้ง package เพิ่มเติม
- ไม่มีปัญหาเรื่อง WSL หรือ network connectivity
- Token ถูกจัดการอย่างปลอดภัย

### 🛠️ **ความง่าย**
- ไม่ต้องตั้งค่า MCP server
- ไม่ต้องจัดการ environment variables
- ใช้งานได้ทันทีหลัง initialize

---

**🎉 พร้อมใช้งาน Notion API กับ Ultima-Orb แล้ว!**

หากมีคำถามหรือต้องการความช่วยเหลือ เพิ่มเติม สามารถดู logs ใน Developer Console หรือติดต่อทีมพัฒนาได้ครับ
