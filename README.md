# Cprompt — AI Content Generator

Chrome Extension สำหรับสร้างคอนเทนต์อัตโนมัติด้วย AI — Image, Video และ Storytelling

## ✨ Features

### 📸 Images Tab
- อัพโหลดรูปสินค้า + รูปนางแบบ (Ref)
- เลือกคาแรคเตอร์ (Human Model) — ทั่วไป / อาชีพ / สูงวัย / ระบุเอง
- Smart Auto — AI คิดชุด/ฉาก/สไตล์ ให้เอง
- สุ่มสไตล์ / ฉากหลัง / ชุด — Random mode
- โหมด Human หรือ Mascot 3D

### 🎬 Video Tab
- Automated video generation ผ่าน Google AI Studio (Veo)
- เลือก video style — UGC, รีวิว, สอน, Voiceover, B-Roll
- เสียงพากย์ไทย — กลาง / อีสาน / เหนือ
- Custom script — ใส่บทพูดเองได้
- Download auto — ดาวน์โหลดคลิปอัตโนมัติ

### 📖 Storytelling Tab (NEW)
- **AI Script Generation** — ใส่หัวข้อ → Gemini gen บทแบ่งฉากอัตโนมัติ
- **Auto Scene Count** — ให้ AI วิเคราะห์เนื้อหาแล้วแบ่งฉากให้เหมาะสม
- **Story Styles** — 8 presets: ลึกลับ, สยองขวัญ, สารคดี, ตลก, แรงบันดาลใจ, เรื่องแปลก, ตำนาน, ระบุเอง
- **Script Structures** — 5 presets: Hook→Twist→CTA, 3-Act Classic, Hero's Journey, Problem→Solution, เล่าเรื่องธรรมดา
- **Image Styles** — 6 presets + custom: Cinematic, ภาพวาด, สมจริง, อนิเมะ, สีน้ำ, Dark Art
- **Voice & Dialect** — กลาง / อีสาน / เหนือ / ใต้ × หญิง / ชาย / วัยรุ่น
- **Aspect Ratio** — 9:16 (Shorts/TikTok), 16:9 (YouTube), 1:1 (Facebook)
- **Background Music** — 9 presets: ไม่มี, ภาพยนตร์, Ambient, ดราม่า, สนุก, ดนตรีไทย, สยองขวัญ, Corporate, ระบุเอง
- **Full Auto** — automation逐ฉาก: fill prompt → กดสร้าง → รอเรนเดอร์ → จับภาพ

## 🚀 Installation

1. โหลด zip จาก [Releases](https://github.com/manattrakun/Cprompt/releases) หรือ clone repo นี้
2. เปิด Chrome → ไปที่ `chrome://extensions/`
3. เปิด **Developer mode** (มุมขวาบน)
4. กด **Load unpacked** → เลือก folder `Cprompt`
5. Extension จะปรากฏใน toolbar → คลิกเพื่อเปิด Side Panel

## 📋 Usage

### Images Mode
1. อัพโหลดรูปสินค้า (และรูปนางแบบถ้าต้องการ)
2. ใส่ชื่อสินค้า / เลือกคาแรคเตอร์ / ตั้งค่าสไตล์
3. กด **START GENERATE** → Extension จะ automate การสร้างภาพให้

### Video Mode
1. อัพโหลด source images
2. เลือก video style + เสียงพากย์
3. (optional) ใส่ custom script
4. กด **START VIDEO** → Extension จะ automate การสร้างวิดีโอ

### Storytelling Mode
1. ใส่หัวข้อเรื่อง + รายละเอียดเพิ่มเติม
2. ตั้งค่า: สไตล์เรื่อง, โครงสร้างบท, เสียงพากย์, สไตล์ภาพ, ดนตรีประกอบ
3. กด **✨ Generate Story** → AI จะสร้างบทแบ่งฉากให้
4. กด **▶️ START FULL AUTO** → Extension จะ automate逐ฉาก

## ⚙️ Configuration

- **Gemini API Key** — กดปุ่ม ⚙️ ใน extension เพื่อใส่ API key
- **Aspect Ratio** — ตั้งค่าใน Settings modal (9:16 หรือ 16:9)
- **Delays** — แก้ไขใน `config.js` สำหรับปรับความเร็ว automation

## 🏗️ Architecture

```
Cprompt/
├── manifest.json      # Chrome Extension V3 config
├── background.js      # Service worker (side panel)
├── sidebar.html       # UI — 3 tabs: Images, Video, Storytelling
├── sidebar.css        # Dark theme styles
├── sidebar.js         # Core logic + automation
├── config.js          # Delay configuration
├── generate-icons.html # Icon generator tool
└── icons/             # Extension icons
```

## 📝 Notes

- Extension นี้ใช้ `chrome.scripting` API เพื่อควบคุมหน้า Google AI Studio
- Automation ใช้ randomized delays เพื่อเลี่ยง bot detection
- ไม่มีระบบ authentication — ใช้ส่วนตัว

## 📄 License

MIT
