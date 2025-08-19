# 🎮 Ultima-Orb: Interactive Tutorials

## 📚 ภาพรวม

Interactive Tutorials นี้จะพาคุณเรียนรู้ Ultima-Orb ผ่านการปฏิบัติจริง โดยแต่ละ tutorial จะมี:
- **🎯 เป้าหมายการเรียนรู้**
- **📋 ขั้นตอนการปฏิบัติ**
- **✅ การตรวจสอบผลลัพธ์**
- **💡 เคล็ดลับและคำแนะนำ**

---

## 🚀 Tutorial 1: การเริ่มต้นใช้งานครั้งแรก

### 🎯 เป้าหมาย
เรียนรู้การติดตั้งและตั้งค่า Ultima-Orb พื้นฐาน

### 📋 ขั้นตอนการปฏิบัติ

#### ขั้นตอนที่ 1: ติดตั้ง Plugin
```bash
# 1. เปิด Obsidian
# 2. ไปที่ Settings → Community plugins
# 3. ปิด Safe mode
# 4. คลิก Browse และค้นหา "Ultima-Orb"
# 5. คลิก Install และ Enable
```

**✅ ตรวจสอบ**: Plugin แสดงในรายการ Community plugins

#### ขั้นตอนที่ 2: ตั้งค่า AI Provider แรก
```bash
# 1. ไปที่ Settings → Ultima-Orb → AI Providers
# 2. เลือก OpenAI
# 3. กรอก API Key: sk-your-openai-api-key
# 4. เลือก Model: gpt-3.5-turbo
# 5. คลิก Test Connection
```

**✅ ตรวจสอบ**: แสดง "Connection successful"

#### ขั้นตอนที่ 3: ทดสอบการใช้งานครั้งแรก
```bash
# 1. ใช้ Command Palette (Ctrl/Cmd + P)
# 2. พิมพ์ "Ultima-Orb: Open Chat"
# 3. พิมพ์ข้อความ: "สวัสดี! ช่วยแนะนำการใช้งาน Ultima-Orb หน่อย"
# 4. กด Enter
```

**✅ ตรวจสอบ**: AI ตอบกลับด้วยคำแนะนำ

### 💡 เคล็ดลับ
- เริ่มต้นด้วย OpenAI เพราะใช้งานง่ายและเสถียร
- เก็บ API key ไว้ในที่ปลอดภัย
- ทดสอบการเชื่อมต่อก่อนใช้งานจริง

---

## 💬 Tutorial 2: การใช้งาน Chat Interface

### 🎯 เป้าหมาย
เรียนรู้การใช้งาน Chat Interface และการจัดการข้อความ

### 📋 ขั้นตอนการปฏิบัติ

#### ขั้นตอนที่ 1: เปิด Chat Interface
```bash
# 1. ใช้ Command Palette (Ctrl/Cmd + P)
# 2. พิมพ์ "Ultima-Orb: Open Chat"
# 3. ดูที่ sidebar ด้านขวา
```

**✅ ตรวจสอบ**: Chat interface แสดงใน sidebar

#### ขั้นตอนที่ 2: ส่งข้อความแรก
```bash
# 1. พิมพ์: "ช่วยเขียนบทความสั้นๆ เกี่ยวกับ AI หน่อย"
# 2. เลือก Provider: OpenAI
# 3. กด Enter
# 4. รอการตอบกลับ
```

**✅ ตรวจสอบ**: AI สร้างบทความเกี่ยวกับ AI

#### ขั้นตอนที่ 3: สลับ Provider
```bash
# 1. คลิก dropdown ที่ Provider
# 2. เลือก Claude (ถ้ามี)
# 3. พิมพ์: "ช่วยวิเคราะห์บทความที่เพิ่งเขียนให้หน่อย"
# 4. กด Enter
```

**✅ ตรวจสอบ**: Claude วิเคราะห์บทความที่ OpenAI เขียน

#### ขั้นตอนที่ 4: จัดการประวัติการสนทนา
```bash
# 1. คลิกไอคอน Clear History
# 2. ยืนยันการล้างประวัติ
# 3. ดูว่าประวัติหายไป
```

**✅ ตรวจสอบ**: ประวัติการสนทนาถูกล้าง

### 💡 เคล็ดลับ
- ใช้ Provider ต่างๆ ตามประเภทงาน
- เก็บประวัติการสนทนาสำหรับงานที่สำคัญ
- ใช้ keyboard shortcuts เพื่อความรวดเร็ว

---

## ✨ Tutorial 3: การใช้งาน AI Generation Tools

### 🎯 เป้าหมาย
เรียนรู้การใช้งาน AI Generation Tools และ Templates

### 📋 ขั้นตอนการปฏิบัติ

#### ขั้นตอนที่ 1: ใช้งาน Quick Actions
```bash
# 1. เปิด Chat Interface
# 2. พิมพ์: "การพัฒนา AI ในปัจจุบัน"
# 3. กด Enter และรอการตอบกลับ
# 4. คลิกปุ่ม "Continue Writing"
```

**✅ ตรวจสอบ**: AI ต่อยอดข้อความเดิม

#### ขั้นตอนที่ 2: ใช้งาน Templates
```bash
# 1. คลิก "Templates" ใน Chat Interface
# 2. เลือก "Blog Post"
# 3. กรอกข้อมูล:
#    - Topic: "ประโยชน์ของ AI ในชีวิตประจำวัน"
#    - Tone: "เป็นมิตร"
#    - Length: "สั้น"
# 4. คลิก "Generate"
```

**✅ ตรวจสอบ**: AI สร้างบทความตาม template

#### ขั้นตอนที่ 3: ใช้งาน Text Improvement
```bash
# 1. พิมพ์ข้อความที่มีข้อผิดพลาด:
#    "ผมชอบกินข้าวมากๆ และชอบอ่านหนังสือด้วย"
# 2. คลิกปุ่ม "Improve Text"
# 3. ดูการปรับปรุงข้อความ
```

**✅ ตรวจสอบ**: ข้อความได้รับการปรับปรุง

#### ขั้นตอนที่ 4: ใช้งาน Translation
```bash
# 1. พิมพ์ข้อความภาษาไทย:
#    "สวัสดีครับ วันนี้อากาศดีมาก"
# 2. คลิกปุ่ม "Translate"
# 3. เลือกภาษา: English
```

**✅ ตรวจสอบ**: ข้อความถูกแปลเป็นภาษาอังกฤษ

### 💡 เคล็ดลับ
- ใช้ Templates สำหรับงานที่ทำบ่อย
- Quick Actions ช่วยประหยัดเวลา
- ลองใช้ Provider ต่างๆ กับงานเดียวกัน

---

## 🔗 Tutorial 4: การเชื่อมต่อกับ Notion

### 🎯 เป้าหมาย
เรียนรู้การเชื่อมต่อและใช้งาน Notion Integration

### 📋 ขั้นตอนการปฏิบัติ

#### ขั้นตอนที่ 1: ตั้งค่า Notion Integration
```bash
# 1. ไปที่ https://www.notion.so/my-integrations
# 2. คลิก "New integration"
# 3. ตั้งชื่อ: "Ultima-Orb Integration"
# 4. เลือก Workspace
# 5. คลิก "Submit"
# 6. คัดลอก Internal Integration Token
```

#### ขั้นตอนที่ 2: ตั้งค่าใน Ultima-Orb
```bash
# 1. ไปที่ Settings → Ultima-Orb → Integrations → Notion
# 2. กรอก Integration Token
# 3. กรอก Database ID (จาก URL ของ database)
# 4. คลิก "Test Connection"
```

**✅ ตรวจสอบ**: แสดง "Connection successful"

#### ขั้นตอนที่ 3: สร้างหน้าใหม่ใน Notion
```bash
# 1. เปิด Chat Interface
# 2. พิมพ์: "สร้างหน้าใหม่ใน Notion ชื่อ 'My AI Notes'"
# 3. กด Enter
# 4. รอการสร้างหน้า
```

**✅ ตรวจสอบ**: หน้าใหม่ถูกสร้างใน Notion

#### ขั้นตอนที่ 4: ค้นหาข้อมูลใน Notion
```bash
# 1. พิมพ์: "ค้นหาหน้าทั้งหมดใน Notion database"
# 2. กด Enter
# 3. ดูรายการหน้าทั้งหมด
```

**✅ ตรวจสอบ**: แสดงรายการหน้าทั้งหมด

### 💡 เคล็ดลับ
- ใช้ Notion สำหรับเก็บข้อมูลที่ต้องการจัดระเบียบ
- สร้าง database structure ที่ดีก่อนใช้งาน
- ใช้ tags และ properties เพื่อจัดหมวดหมู่

---

## 📚 Tutorial 5: การจัดการความรู้

### 🎯 เป้าหมาย
เรียนรู้การใช้งาน Knowledge Management System

### 📋 ขั้นตอนการปฏิบัติ

#### ขั้นตอนที่ 1: สร้าง Workspace
```bash
# 1. ไปที่ Knowledge tab
# 2. คลิก "Create Workspace"
# 3. กรอกข้อมูล:
#    - Name: "My Research"
#    - Description: "สำหรับเก็บงานวิจัย"
#    - Tags: research, academic
# 4. คลิก "Create"
```

**✅ ตรวจสอบ**: Workspace ใหม่แสดงในรายการ

#### ขั้นตอนที่ 2: อัปโหลดเอกสาร
```bash
# 1. เลือก workspace "My Research"
# 2. คลิก "Upload Document"
# 3. เลือกไฟล์ PDF หรือ DOCX
# 4. รอการประมวลผล
```

**✅ ตรวจสอบ**: เอกสารแสดงในรายการ

#### ขั้นตอนที่ 3: ใช้งานความรู้ใน Chat
```bash
# 1. เปิด Chat Interface
# 2. เลือก workspace "My Research"
# 3. พิมพ์: "สรุปเนื้อหาจากเอกสารที่อัปโหลด"
# 4. กด Enter
```

**✅ ตรวจสอบ**: AI สรุปเนื้อหาจากเอกสาร

#### ขั้นตอนที่ 4: ค้นหาในเอกสาร
```bash
# 1. พิมพ์: "ค้นหาข้อมูลเกี่ยวกับ [หัวข้อที่สนใจ]"
# 2. กด Enter
# 3. ดูผลการค้นหา
```

**✅ ตรวจสอบ**: แสดงผลการค้นหาจากเอกสาร

### 💡 เคล็ดลับ
- จัดหมวดหมู่เอกสารด้วย tags
- ใช้ workspace แยกตามโครงการ
- อัปโหลดเอกสารที่มีคุณภาพ

---

## 🎨 Tutorial 6: การใช้งาน Advanced Features

### 🎯 เป้าหมาย
เรียนรู้การใช้งานคุณสมบัติขั้นสูงของ Ultima-Orb

### 📋 ขั้นตอนการปฏิบัติ

#### ขั้นตอนที่ 1: ใช้งาน Analytics Dashboard
```bash
# 1. ไปที่ Analytics tab
# 2. ดูสถิติการใช้งาน:
#    - จำนวนข้อความ
#    - Provider ที่ใช้บ่อย
#    - เวลาตอบสนองเฉลี่ย
# 3. คลิก "Export Data"
```

**✅ ตรวจสอบ**: แสดงข้อมูลสถิติการใช้งาน

#### ขั้นตอนที่ 2: ตั้งค่า Custom Templates
```bash
# 1. ไปที่ Settings → Templates
# 2. คลิก "Create Template"
# 3. กรอกข้อมูล:
#    - Name: "Meeting Summary"
#    - Prompt: "สรุปการประชุมเรื่อง {topic}"
#    - Variables: topic
# 4. คลิก "Save"
```

**✅ ตรวจสอบ**: Template ใหม่แสดงในรายการ

#### ขั้นตอนที่ 3: ใช้งาน File Attachments
```bash
# 1. เปิด Chat Interface
# 2. คลิกไอคอน "Attach File"
# 3. เลือกไฟล์ TXT หรือ PDF
# 4. พิมพ์: "วิเคราะห์เนื้อหาในไฟล์นี้"
# 5. กด Enter
```

**✅ ตรวจสอบ**: AI วิเคราะห์เนื้อหาในไฟล์

#### ขั้นตอนที่ 4: ตั้งค่า Keyboard Shortcuts
```bash
# 1. ไปที่ Settings → Hotkeys
# 2. ตั้งค่า:
#    - Open Chat: Ctrl+Shift+C
#    - Clear History: Ctrl+Shift+H
#    - Switch Provider: Ctrl+Shift+P
# 3. คลิก "Save"
```

**✅ ตรวจสอบ**: Keyboard shortcuts ทำงานได้

### 💡 เคล็ดลับ
- ใช้ Analytics เพื่อปรับปรุงการใช้งาน
- สร้าง Custom Templates สำหรับงานที่ทำบ่อย
- ใช้ File Attachments สำหรับเอกสารยาว

---

## 🎯 Tutorial 7: การแก้ไขปัญหา

### 🎯 เป้าหมาย
เรียนรู้การแก้ไขปัญหาที่พบบ่อย

### 📋 ขั้นตอนการปฏิบัติ

#### ปัญหา: AI ไม่ตอบสนอง
```bash
# 1. ตรวจสอบ API key
# 2. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
# 3. ลองเปลี่ยน Provider
# 4. รีสตาร์ท Obsidian
```

#### ปัญหา: ไม่สามารถเชื่อมต่อ Notion
```bash
# 1. ตรวจสอบ Integration Token
# 2. ตรวจสอบ Database ID
# 3. ตรวจสอบสิทธิ์การเข้าถึง
# 4. ทดสอบการเชื่อมต่อใหม่
```

#### ปัญหา: Performance ช้า
```bash
# 1. ลดจำนวนเอกสารใน Knowledge Base
# 2. ปิด Provider ที่ไม่ใช้
# 3. ล้าง cache ใน Settings
# 4. ปิด plugin อื่นๆ ที่ไม่จำเป็น
```

### 💡 เคล็ดลับ
- ตรวจสอบ log files สำหรับข้อผิดพลาด
- ใช้ Test Connection เพื่อตรวจสอบการเชื่อมต่อ
- อัปเดต plugin เป็นเวอร์ชันล่าสุด

---

## 🎉 สรุป

หลังจากผ่าน Interactive Tutorials ทั้งหมด คุณจะสามารถ:

✅ **ใช้งาน Ultima-Orb ได้อย่างคล่องแคล่ว**
✅ **เชื่อมต่อกับ AI Providers ต่างๆ**
✅ **ใช้งาน Integrations กับบริการภายนอก**
✅ **จัดการความรู้และเอกสาร**
✅ **แก้ไขปัญหาที่พบบ่อย**

### 🚀 ขั้นตอนถัดไป

1. **ทดลองใช้งานจริง** กับงานประจำวัน
2. **สร้าง Custom Templates** สำหรับงานของคุณ
3. **เชื่อมต่อกับบริการเพิ่มเติม**
4. **เข้าร่วม Community** เพื่อแลกเปลี่ยนประสบการณ์

---

**🎯 ยินดีด้วย! คุณพร้อมใช้งาน Ultima-Orb แล้ว!**
