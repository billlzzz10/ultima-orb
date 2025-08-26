# 🚀 Advanced Backend AI Agents System

ระบบ AI Agents ที่ทำงานเบื้องหลังทรงพลังสำหรับการจัดการข้อมูลและ automation

## ✨ ฟีเจอร์หลัก

### 1. Data Analysis & Business Intelligence
- วิเคราะห์แนวโน้มข้อมูล (Trend Analysis)
- สร้างโมเดลทำนาย (Predictive Modeling)
- ตรวจสอบคุณภาพข้อมูล (Data Quality Check)
- คำนวณเมตริกทางธุรกิจ (Business Metrics)

### 2. Project Management & Automation
- สร้างและจัดการโปรเจ็ค
- ติดตามความคืบหน้า
- ประเมินความเสี่ยง
- จัดสรรทรัพยากร
- สร้างรายงาน

### 3. n8n Integration & Workflow Orchestration
- เชื่อมต่อกับ n8n webhook
- จัดการ workflow automation
- ติดตามการทำงานของ workflow
- ปรับปรุงประสิทธิภาพ

### 4. Real-time Monitoring & Alerting
- ตรวจสอบสุขภาพระบบ
- ติดตามประสิทธิภาพ
- จัดการการแจ้งเตือน
- จัดการเหตุการณ์

### 5. Advanced Analytics & Reporting
- สร้างรายงานเชิงลึก
- วิเคราะห์ข้อมูลแบบ real-time
- สร้าง dashboard
- ส่งข้อมูลไปยัง n8n

## 🛠️ การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
pip install -r requirements.txt
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ `src/backend/`:
```env
N8N_WEBHOOK_URL=https://billlzzz18.app.n8n.cloud/webhook/6750baab-4c91-4c0b-b17b-15aebb86bd41
N8N_BASE_URL=https://billlzzz18.app.n8n.cloud
N8N_API_KEY=your_api_key_here
```

### 3. รันระบบ
```bash
cd src/backend
python ai-agents-system.py
```

## 📊 การใช้งาน

### การทดสอบการเชื่อมต่อ n8n
ระบบจะทดสอบการเชื่อมต่อกับ n8n webhook โดยอัตโนมัติเมื่อเริ่มต้น

### การส่งข้อมูลไปยัง n8n
```python
# ตัวอย่างการส่งข้อมูล
await n8n_integration.trigger_webhook({
    "action": "create_project",
    "project_id": "proj_001",
    "project_data": {
        "name": "My Project",
        "description": "Project description"
    },
    "timestamp": datetime.now().isoformat()
})
```

## 🔧 การปรับแต่ง

### การเพิ่ม Agent ใหม่
1. สร้าง class ใหม่ที่ inherit จาก `BaseAgent`
2. Override method `process_task()`
3. ลงทะเบียน agent ใน `AgentOrchestrator`

### การปรับแต่ง n8n Webhook
แก้ไข URL ในไฟล์ `ai-agents-system.py`:
```python
self.webhook_url = "your_n8n_webhook_url_here"
```

## 📝 โครงสร้างไฟล์

```
src/backend/
├── ai-agents-system.py    # ไฟล์หลักของระบบ
├── requirements.txt       # Dependencies
├── README.md             # คู่มือการใช้งาน
└── .env                  # Environment variables (สร้างเอง)
```

## 🚨 การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อ n8n
1. ตรวจสอบ URL ของ webhook
2. ตรวจสอบการตั้งค่า firewall
3. ตรวจสอบ API key (ถ้ามี)

### ปัญหาการรัน Python
1. ตรวจสอบ Python version (ต้องเป็น 3.8+)
2. ติดตั้ง dependencies ใหม่
3. ตรวจสอบ path ของไฟล์

## 📞 การสนับสนุน

หากมีปัญหาหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมพัฒนา

---

**หมายเหตุ**: ระบบนี้ถูกออกแบบมาเพื่อทำงานร่วมกับ n8n workflow automation และสามารถขยายฟีเจอร์ได้ตามความต้องการ
