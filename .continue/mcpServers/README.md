# MCP Servers Configuration Guide

## 📋 ไฟล์ที่ใช้งานได้

### 1. `working-mcp-servers.yaml` - ไฟล์หลักที่แนะนำ
- มีเฉพาะ servers ที่ทดสอบแล้วว่าทำงานได้
- การตั้งค่าถูกต้องและใช้งานได้ทันที

### 2. `mcp.json` - ไฟล์ JSON format
- รองรับการตั้งค่าแบบ JSON
- ใช้งานได้กับ Continue และ Cursor

## 🔧 MCP Servers ที่ใช้งานได้

### ✅ ใช้งานได้ทันที
1. **Notion MCP Server**
   - Package: `@notionhq/notion-mcp-server@latest`
   - Type: stdio
   - ต้องการ: NOTION_TOKEN

2. **Memory Server**
   - Package: `@modelcontextprotocol/server-memory`
   - Type: stdio
   - ใช้เก็บข้อมูลใน memory

3. **Sequential Thinking Server**
   - Package: `@modelcontextprotocol/server-sequential-thinking`
   - Type: stdio
   - ช่วยในการคิดแบบเป็นลำดับ

### 🌐 HTTP-based Servers (ใช้งานได้)
4. **GitHub Copilot**
   - URL: `https://api.githubcopilot.com/mcp/`
   - Type: streamable-http

5. **Hugging Face**
   - URL: `https://hf.co/mcp`
   - Type: streamable-http

6. **Prisma Postgres**
   - URL: `https://mcp.prisma.io/mcp`
   - Type: streamable-http

## ❌ Servers ที่มีปัญหา

### ต้องติดตั้งเพิ่มเติม
- **Codacy**: ต้องการ API key และการตั้งค่าเพิ่มเติม
- **MongoDB**: ต้องการ MongoDB connection string
- **Azure/Azure DevOps**: ต้องการ authentication
- **Markitdown**: ต้องการ uvx package manager

## 🛠️ วิธีการแก้ไขปัญหา

### 1. ติดตั้ง Dependencies
```bash
# ติดตั้ง Node.js packages
npm install -g npx

# สำหรับ Markitdown (ถ้าต้องการ)
pip install uvx
```

### 2. ตั้งค่า Environment Variables
```bash
# Notion Token
export NOTION_TOKEN="your-notion-token"

# Memory file path
export MEMORY_FILE_PATH="./memory.json"
```

### 3. ทดสอบ Server
```bash
# ทดสอบ Notion server
npx -y @notionhq/notion-mcp-server@latest

# ทดสอบ Memory server
npx -y @modelcontextprotocol/server-memory
```

## 📝 การใช้งาน

### ใน Continue/Cursor
1. ใช้ไฟล์ `working-mcp-servers.yaml` เป็นหลัก
2. ตรวจสอบ environment variables
3. รีสตาร์ท Continue/Cursor หลังแก้ไข

### การแก้ไขปัญหา
- ถ้า server ไม่ทำงาน: ตรวจสอบ package name และ version
- ถ้า authentication ผิด: ตรวจสอบ tokens และ API keys
- ถ้า connection ผิด: ตรวจสอบ network และ firewall

## 🔄 การอัพเดท
- อัพเดท packages เป็นประจำ: `npx -y package-name@latest`
- ตรวจสอบ breaking changes ใน changelog
- ทดสอบหลังอัพเดทเสมอ
