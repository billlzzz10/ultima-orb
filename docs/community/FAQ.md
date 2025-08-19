# ❓ Ultima-Orb: คำถามที่พบบ่อย (FAQ)

## 📋 สารบัญ
1. [การติดตั้งและการตั้งค่า](#การติดตั้งและการตั้งค่า)
2. [AI Providers](#ai-providers)
3. [การใช้งาน Chat Interface](#การใช้งาน-chat-interface)
4. [การเชื่อมต่อกับบริการภายนอก](#การเชื่อมต่อกับบริการภายนอก)
5. [การจัดการความรู้](#การจัดการความรู้)
6. [การแก้ไขปัญหา](#การแก้ไขปัญหา)
7. [การตั้งค่าและปรับแต่ง](#การตั้งค่าและปรับแต่ง)
8. [การพัฒนาและการมีส่วนร่วม](#การพัฒนาและการมีส่วนร่วม)

---

## 🚀 การติดตั้งและการตั้งค่า

### Q: วิธีการติดตั้ง Ultima-Orb?
**A:** 
1. เปิด Obsidian
2. ไปที่ **Settings** → **Community plugins**
3. ปิด **Safe mode**
4. คลิก **Browse** และค้นหา "Ultima-Orb"
5. คลิก **Install** และ **Enable**

### Q: ต้องการ API keys อะไรบ้าง?
**A:** ขึ้นอยู่กับ AI Providers ที่คุณต้องการใช้:
- **OpenAI**: API key จาก [OpenAI Platform](https://platform.openai.com/)
- **Claude**: API key จาก [Anthropic Console](https://console.anthropic.com/)
- **Gemini**: API key จาก [Google AI Studio](https://aistudio.google.com/)
- **Ollama**: ไม่ต้องการ API key (ใช้งาน local)
- **AnythingLLM**: API key จาก AnythingLLM instance ของคุณ

### Q: วิธีการตั้งค่า API keys?
**A:**
1. ไปที่ **Settings** → **Ultima-Orb** → **AI Providers**
2. เลือก Provider ที่ต้องการ
3. กรอก API key และข้อมูลที่จำเป็น
4. คลิก **Test Connection** เพื่อทดสอบ
5. คลิก **Save** เพื่อบันทึก

### Q: ต้องการ Obsidian เวอร์ชันไหน?
**A:** Ultima-Orb ต้องการ Obsidian เวอร์ชัน 1.0.0 หรือใหม่กว่า

---

## 🤖 AI Providers

### Q: AI Provider ไหนดีที่สุด?
**A:** ขึ้นอยู่กับประเภทงาน:
- **OpenAI**: เหมาะสำหรับงานทั่วไป, การเขียน, การวิเคราะห์
- **Claude**: เหมาะสำหรับการวิเคราะห์เชิงลึก, การเขียนเชิงวิชาการ
- **Gemini**: เหมาะสำหรับงานที่ต้องการข้อมูลล่าสุด
- **Ollama**: เหมาะสำหรับงานที่ต้องการความเป็นส่วนตัว
- **AnythingLLM**: เหมาะสำหรับงานที่ต้องการความรู้เฉพาะ

### Q: วิธีการสลับ AI Provider?
**A:**
1. เปิด Chat Interface
2. คลิก dropdown ที่ Provider
3. เลือก Provider ที่ต้องการ
4. ข้อความถัดไปจะใช้ Provider ที่เลือก

### Q: ทำไม AI ไม่ตอบสนอง?
**A:** ตรวจสอบ:
1. API key ถูกต้องหรือไม่
2. การเชื่อมต่ออินเทอร์เน็ต
3. Provider มีเครดิตเหลือหรือไม่
4. ลองเปลี่ยน Provider อื่น

### Q: วิธีการดูเครดิตที่เหลือ?
**A:** ไปที่ **Settings** → **Ultima-Orb** → **AI Providers** และดูข้อมูลเครดิตของแต่ละ Provider

---

## 💬 การใช้งาน Chat Interface

### Q: วิธีการเปิด Chat Interface?
**A:**
1. ใช้ **Command Palette** (Ctrl/Cmd + P)
2. พิมพ์ "Ultima-Orb: Open Chat"
3. หรือคลิกไอคอน Ultima-Orb ใน sidebar

### Q: วิธีการล้างประวัติการสนทนา?
**A:**
1. คลิกไอคอน **Clear History** ใน Chat Interface
2. ยืนยันการล้างประวัติ
3. หรือใช้ keyboard shortcut: `Ctrl/Cmd + Shift + C`

### Q: วิธีการแนบไฟล์?
**A:**
1. คลิกไอคอน **Attach File** ใน Chat Interface
2. เลือกไฟล์ที่ต้องการ (รองรับ PDF, DOCX, TXT)
3. AI จะวิเคราะห์เนื้อหาในไฟล์

### Q: ขนาดไฟล์สูงสุดที่แนบได้?
**A:** ขนาดไฟล์สูงสุด 10MB

### Q: วิธีการส่งข้อความ?
**A:**
1. พิมพ์ข้อความในช่องข้อความ
2. กด **Enter** หรือคลิก **Send**
3. หรือใช้ keyboard shortcut: `Ctrl/Cmd + Enter`

---

## 🔗 การเชื่อมต่อกับบริการภายนอก

### Q: วิธีการเชื่อมต่อกับ Notion?
**A:**
1. สร้าง Integration ใน [Notion Integrations](https://www.notion.so/my-integrations)
2. ไปที่ **Settings** → **Ultima-Orb** → **Integrations** → **Notion**
3. กรอก Integration Token และ Database ID
4. คลิก **Test Connection**

### Q: วิธีการเชื่อมต่อกับ Airtable?
**A:**
1. ไปที่ [Airtable API](https://airtable.com/api) เพื่อดู API key
2. ไปที่ **Settings** → **Ultima-Orb** → **Integrations** → **Airtable**
3. กรอก API Key และ Base ID
4. คลิก **Test Connection**

### Q: วิธีการเชื่อมต่อกับ ClickUp?
**A:**
1. ไปที่ [ClickUp API](https://clickup.com/api) เพื่อดู API key
2. ไปที่ **Settings** → **Ultima-Orb** → **Integrations** → **ClickUp**
3. กรอก API Key และ Workspace ID
4. คลิก **Test Connection**

### Q: ทำไมไม่สามารถเชื่อมต่อได้?
**A:** ตรวจสอบ:
1. API keys ถูกต้องหรือไม่
2. สิทธิ์การเข้าถึง (permissions)
3. การเชื่อมต่ออินเทอร์เน็ต
4. ข้อมูล ID ถูกต้องหรือไม่

---

## 📚 การจัดการความรู้

### Q: วิธีการสร้าง Workspace?
**A:**
1. ไปที่ **Knowledge** tab
2. คลิก **Create Workspace**
3. กรอกชื่อ, คำอธิบาย, และ tags
4. คลิก **Create**

### Q: วิธีการอัปโหลดเอกสาร?
**A:**
1. เลือก workspace
2. คลิก **Upload Document**
3. เลือกไฟล์ (รองรับ PDF, DOCX, TXT)
4. รอการประมวลผล

### Q: วิธีการใช้งานความรู้ใน Chat?
**A:**
1. เปิด Chat Interface
2. เลือก workspace ที่ต้องการ
3. AI จะใช้ความรู้จากเอกสารที่อัปโหลด

### Q: จำนวนเอกสารสูงสุดที่อัปโหลดได้?
**A:** ไม่มีข้อจำกัด แต่แนะนำไม่เกิน 100 เอกสารต่อ workspace เพื่อประสิทธิภาพ

---

## 🔧 การแก้ไขปัญหา

### Q: Plugin ไม่ทำงาน?
**A:** ตรวจสอบ:
1. Plugin เปิดใช้งานแล้วหรือไม่
2. Restart Obsidian
3. ตรวจสอบ error logs
4. อัปเดต plugin เป็นเวอร์ชันล่าสุด

### Q: Performance ช้า?
**A:** ลอง:
1. ลดจำนวนเอกสารใน Knowledge Base
2. ปิด Provider ที่ไม่ใช้
3. ล้าง cache ใน Settings
4. ปิด plugin อื่นๆ ที่ไม่จำเป็น

### Q: ข้อผิดพลาด "API key invalid"?
**A:**
1. ตรวจสอบ API key ถูกต้องหรือไม่
2. ตรวจสอบเครดิตเหลือหรือไม่
3. ตรวจสอบการตั้งค่า Provider
4. ทดสอบการเชื่อมต่อใหม่

### Q: ไฟล์แนบไม่ทำงาน?
**A:** ตรวจสอบ:
1. ขนาดไฟล์ไม่เกิน 10MB
2. ประเภทไฟล์ที่รองรับ
3. ลองรีสตาร์ท Obsidian
4. ตรวจสอบสิทธิ์การเข้าถึงไฟล์

### Q: ไม่สามารถเชื่อมต่อ Notion ได้?
**A:** ตรวจสอบ:
1. Integration Token ถูกต้องหรือไม่
2. Database ID ถูกต้องหรือไม่
3. สิทธิ์การเข้าถึง database
4. Integration เปิดใช้งานใน Notion

---

## ⚙️ การตั้งค่าและปรับแต่ง

### Q: วิธีการตั้งค่า Keyboard Shortcuts?
**A:**
1. ไปที่ **Settings** → **Hotkeys**
2. ค้นหา "Ultima-Orb"
3. ตั้งค่า shortcuts ที่ต้องการ
4. คลิก **Save**

### Q: วิธีการเปลี่ยน Theme?
**A:**
1. ไปที่ **Settings** → **Ultima-Orb** → **Appearance**
2. เลือก Theme ที่ต้องการ
3. ปรับแต่งสีและสไตล์
4. คลิก **Save**

### Q: วิธีการตั้งค่า Default Provider?
**A:**
1. ไปที่ **Settings** → **Ultima-Orb** → **AI Providers**
2. เลือก Provider ที่ต้องการเป็น default
3. คลิก **Set as Default**

### Q: วิธีการตั้งค่า Auto-save?
**A:**
1. ไปที่ **Settings** → **Ultima-Orb** → **General**
2. เปิดใช้งาน **Auto-save chat history**
3. ตั้งค่าช่วงเวลาการบันทึก

---

## 🛠️ การพัฒนาและการมีส่วนร่วม

### Q: วิธีการรายงาน Bug?
**A:**
1. ไปที่ [GitHub Issues](https://github.com/ultima-orb/issues)
2. คลิก **New Issue**
3. เลือก **Bug Report** template
4. กรอกข้อมูลตามที่กำหนด

### Q: วิธีการขอคุณสมบัติใหม่?
**A:**
1. ไปที่ [GitHub Issues](https://github.com/ultima-orb/issues)
2. คลิก **New Issue**
3. เลือก **Feature Request** template
4. อธิบายคุณสมบัติที่ต้องการ

### Q: วิธีการมีส่วนร่วมในการพัฒนา?
**A:**
1. Fork repository บน GitHub
2. สร้าง branch ใหม่
3. พัฒนาคุณสมบัติหรือแก้ไข bug
4. สร้าง Pull Request

### Q: วิธีการทดสอบ Plugin?
**A:**
1. Clone repository
2. รัน `npm install`
3. รัน `npm run dev`
4. ทดสอบใน `.test-vault`

---

## 📞 การสนับสนุน

### Q: วิธีการขอความช่วยเหลือ?
**A:** ช่องทางการติดต่อ:
1. **GitHub Issues**: สำหรับ bugs และ feature requests
2. **GitHub Discussions**: สำหรับคำถามทั่วไป
3. **Discord Server**: สำหรับการสนทนาสด
4. **Email**: support@ultima-orb.com

### Q: วิธีการเข้าร่วมชุมชน?
**A:**
1. เข้าร่วม [Discord Server](https://discord.gg/ultima-orb)
2. ติดตาม [GitHub Repository](https://github.com/ultima-orb)
3. เข้าร่วม [GitHub Discussions](https://github.com/ultima-orb/discussions)

### Q: วิธีการอัปเดต Plugin?
**A:**
1. ไปที่ **Settings** → **Community plugins**
2. คลิก **Check for updates**
3. คลิก **Update** สำหรับ Ultima-Orb
4. Restart Obsidian

---

## 🔄 การอัปเดต

### Q: ความถี่ในการอัปเดต?
**A:** อัปเดตเป็นประจำทุก 2-4 สัปดาห์

### Q: วิธีการดูเวอร์ชันปัจจุบัน?
**A:** ไปที่ **Settings** → **Community plugins** และดูเวอร์ชันของ Ultima-Orb

### Q: การอัปเดตจะสูญเสียข้อมูลหรือไม่?
**A:** ไม่สูญเสียข้อมูล การตั้งค่าและประวัติการสนทนาจะถูกเก็บไว้

---

## 📚 ทรัพยากรเพิ่มเติม

### เอกสาร
- [Quick Start Guide](../tutorials/QUICK_START_GUIDE.md)
- [Interactive Tutorials](../tutorials/INTERACTIVE_TUTORIALS.md)
- [User Guide](../USER_GUIDE.md)
- [Development Guide](../DEVELOPMENT_GUIDE.md)

### ช่องทางการสื่อสาร
- [GitHub Issues](https://github.com/ultima-orb/issues)
- [GitHub Discussions](https://github.com/ultima-orb/discussions)
- [Discord Server](https://discord.gg/ultima-orb)
- [Email Support](mailto:support@ultima-orb.com)

---

**💡 ไม่พบคำตอบที่ต้องการ? กรุณาติดต่อเราเพื่อขอความช่วยเหลือ!**
