# 🔗 Synapse-Core: ปลั๊กอินแกนกลางสำหรับการซิงค์ข้อมูล

## 📋 **แผนการแยกส่วนจาก Ultima-Orb**

### 🎯 **วัตถุประสงค์**
- แยกส่วนแกนกลาง (Core) ออกมาเป็นปลั๊กอินอิสระ
- สร้าง API Layer สำหรับปลั๊กอินส่วนขยาย
- วางรากฐานสำหรับ "ตระกูลปลั๊กอิน" Synapse

---

## 🏗️ **โครงสร้าง Synapse-Core**

```
Synapse-Core/
├── 📄 ไฟล์คอนฟิก
│   ├── package.json
│   ├── tsconfig.json
│   ├── esbuild.config.mjs
│   ├── manifest.json
│   └── .eslintrc.js
│
├── src/
│   ├── main.ts                    // Entry Point
│   ├── SynapseCorePlugin.ts       // ปลั๊กอินหลัก
│   ├── settings.ts                // การตั้งค่า
│   ├── types/
│   │   ├── core.d.ts
│   │   ├── notion.d.ts
│   │   └── mcp.d.ts
│   ├── core/                      // ระบบจัดการแกนกลาง
│   │   ├── PluginStateManager.ts
│   │   ├── FeatureManager.ts
│   │   ├── ToolDatabaseManager.ts
│   │   ├── MCPManager.ts
│   │   └── ContextManager.ts
│   ├── integrations/              // การเชื่อมต่อข้อมูล
│   │   ├── NotionMCPClient.ts
│   │   ├── NotionDatabaseUpdater.ts
│   │   └── mcp/
│   └── services/                  // บริการพื้นฐาน
│       ├── Storage.ts
│       ├── Logger.ts
│       └── EventsBus.ts
│
├── docs/
│   ├── README.md
│   ├── API.md
│   └── INTEGRATION_GUIDE.md
├── .github/
└── tests/
```

---

## 🔌 **API Layer สำหรับปลั๊กอินส่วนขยาย**

### 📡 **Public API Interface**

```typescript
// Synapse-Core API
export interface SynapseCoreAPI {
  // Core Management
  getPluginState(): PluginState;
  updatePluginState(state: Partial<PluginState>): void;
  
  // Feature Management
  hasFeature(feature: string): boolean;
  checkFeatureLimit(feature: string, currentUsage: number): boolean;
  
  // Tool Database
  getToolDatabase(): ToolDatabase;
  updateToolInDatabase(tool: Tool): void;
  syncToolsWithNotion(): Promise<void>;
  
  // Notion Integration
  getNotionClient(): NotionMCPClient;
  updateNotionDatabase(tool: Tool): Promise<void>;
  
  // MCP Management
  getMCPManager(): MCPManager;
  connectToService(service: string): Promise<boolean>;
  
  // Storage
  getStorage(): Storage;
  saveData(key: string, data: any): void;
  loadData(key: string): any;
  
  // Events
  subscribe(event: string, callback: Function): void;
  publish(event: string, data: any): void;
}
```

---

## 🔄 **ขั้นตอนการแยกส่วน**

### **Phase 1: สร้าง Synapse-Core Repository**
1. สร้าง GitHub Repository ใหม่: `synapse-core`
2. คัดลอกไฟล์แกนกลางจาก Ultima-Orb
3. ปรับแก้โค้ดให้ทำงานได้โดยอิสระ
4. สร้าง API Layer

### **Phase 2: ปรับปรุง Ultima-Orb**
1. ลบไฟล์ที่ย้ายไป Synapse-Core
2. เพิ่ม dependency ไปยัง Synapse-Core
3. ปรับแก้โค้ดให้ใช้ API ของ Synapse-Core
4. ทดสอบการทำงานร่วมกัน

### **Phase 3: สร้างปลั๊กอินส่วนขยาย**
1. **Synapse-AI**: ฟีเจอร์ AI ทั้งหมด
2. **Synapse-UI**: UI Components และ Command Palettes
3. **Synapse-Views**: Visualization Tools
4. **Synapse-Productivity**: Productivity Tools

---

## 📦 **รายการไฟล์ที่จะย้าย**

### ✅ **ย้ายไป Synapse-Core**

#### **Core Files**
- `src/core/PluginStateManager.ts`
- `src/core/FeatureManager.ts`
- `src/core/ToolDatabaseManager.ts`
- `src/core/MCPManager.ts`
- `src/core/ContextManager.ts`

#### **Integration Files**
- `src/integrations/NotionMCPClient.ts`
- `src/integrations/NotionDatabaseUpdater.ts`
- `src/integrations/mcp/`

#### **Service Files**
- `src/services/Storage.ts`
- `src/services/Logger.ts`
- `src/services/EventsBus.ts`

#### **Main Files**
- `main.ts` (ปรับปรุง)
- `UltimaOrbPlugin.ts` → `SynapseCorePlugin.ts`
- `settings.ts`

#### **Type Files**
- `src/types/notion.d.ts`
- `src/types/mcp.d.ts`

### ⏳ **เหลือใน Ultima-Orb**

#### **AI Features**
- `src/ai/` (ทั้งหมด)

#### **UI Components**
- `src/ui/` (ทั้งหมด)

#### **Visualization**
- `src/visualization/` (ทั้งหมด)

#### **Productivity**
- `src/productivity/` (ทั้งหมด)

#### **Commands**
- `src/commands/` (ทั้งหมด)

#### **Agents**
- `src/agents/` (ทั้งหมด)

#### **Scripting**
- `src/scripting/` (ทั้งหมด)

---

## 🎯 **ประโยชน์ของการแยกส่วน**

### **🔧 สำหรับนักพัฒนา**
- **Modularity**: พัฒนาแต่ละส่วนได้อิสระ
- **Maintainability**: บำรุงรักษาง่ายขึ้น
- **Scalability**: ขยายฟีเจอร์ได้ไม่จำกัด
- **Testing**: ทดสอบแต่ละส่วนได้แยกกัน

### **👥 สำหรับผู้ใช้**
- **Flexibility**: เลือกใช้เฉพาะฟีเจอร์ที่ต้องการ
- **Performance**: โหลดเฉพาะส่วนที่จำเป็น
- **Customization**: ปรับแต่งได้ตามต้องการ
- **Updates**: อัพเดตแต่ละส่วนได้อิสระ

---

## 🚀 **แผนการดำเนินการ**

### **Week 1: สร้าง Synapse-Core**
- [ ] สร้าง Repository ใหม่
- [ ] ย้ายไฟล์แกนกลาง
- [ ] สร้าง API Layer
- [ ] ทดสอบการทำงาน

### **Week 2: ปรับปรุง Ultima-Orb**
- [ ] ลบไฟล์ที่ย้ายแล้ว
- [ ] เพิ่ม dependency
- [ ] ปรับแก้โค้ด
- [ ] ทดสอบ integration

### **Week 3: สร้างปลั๊กอินส่วนขยาย**
- [ ] Synapse-AI
- [ ] Synapse-UI
- [ ] Synapse-Views
- [ ] Synapse-Productivity

---

## 📊 **สถานะปัจจุบัน**

- **Ultima-Orb**: 35% เสร็จแล้ว
- **Synapse-Core**: 0% (ยังไม่ได้เริ่ม)
- **ปลั๊กอินส่วนขยาย**: 0% (ยังไม่ได้เริ่ม)

**เป้าหมาย**: เสร็จ Synapse-Core ภายใน 1 สัปดาห์
