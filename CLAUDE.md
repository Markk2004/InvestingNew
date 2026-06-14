# Developer Guidelines & Tech Stack (PixelTrade)

**Last Updated:** 2026-06-14
**Project Phase:** 1–6 Active

---

## 1. Tech Stack

| Layer | Technology | หมายเหตุ |
|---|---|---|
| Framework | Next.js 14 (App Router) + React | SPA, Functional Components |
| Styling | Tailwind CSS + Vanilla CSS | Tailwind = Layout / CSS = Keyframe animations |
| Chart | TradingView Lightweight Charts | ห้ามใช้ embed widget — ใช้ library เท่านั้น |
| Data Source | yfinance (Yahoo Finance) | US stocks ฟรี ไม่ต้อง API key |
| Backend | FastAPI (Python) | REST API + WebSocket + APScheduler |
| Database | MySQL | XP, Knowledge Base, outfit, news log |
| Cache | Redis | TTL 5 นาที ลด Yahoo request |
| Alert | Telegram Bot API | Critical news pipeline |

---

## 2. Art & UI Constraints (กฎเหล็กด้านภาพ — ห้ามละเมิด)

*   **Strict Pixel Art:** องค์ประกอบภาพทั้งหมดต้องรองรับสไตล์ 16-Bit Retro
*   **Image Rendering:** ต้องใส่ `image-rendering: pixelated;` **ทุกครั้ง** ที่มี `<img>` Sprite หรือ Avatar — ห้ามลืม
*   **Layout OfficeScene:** ใช้ `position: absolute` + `z-index` เท่านั้น สำหรับวางตัวละครและเฟอร์นิเจอร์ในฉาก 2.5D Isometric
*   **Character Layering:** แยก PNG พื้นใส (Base Body → Shirt → Hat) ซ้อนทับกันด้วย `position: absolute; top: 0; left: 0` เดียวกันทุก layer
*   **Terminal UI (`/analysis-new`):**
    *   ฟอนต์ Monospace เท่านั้น
    *   พื้นหลังสีดำทึบ
    *   Neon accent: เขียว `#00ff88` = กำไร/บวก, แดง `#ff4444` = ขาดทุน/ลบ, ส้ม `#ffaa00` = neutral
*   **ห้ามใช้:** Canvas, WebGL, Phaser หรือ Game Engine ใดๆ — ใช้ HTML/SVG DOM เท่านั้น

---

## 3. Folder Structure (มาตรฐาน)

```
pixeltrade/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # / → Office Overview
│   │   ├── analysis-new/page.tsx     # /analysis-new → Terminal
│   │   ├── character/page.tsx        # /character → Paper Doll + XP
│   │   └── charts/page.tsx           # /charts → Dash Market Monitor
│   ├── components/
│   │   ├── office/
│   │   │   ├── OfficeScene.tsx
│   │   │   ├── GeminiSprite.tsx
│   │   │   └── NewInvesterSprite.tsx
│   │   ├── chart/
│   │   │   ├── Chart.tsx
│   │   │   ├── MiniChart.tsx
│   │   │   ├── MultiChartGrid.tsx
│   │   │   └── MarketTicker.tsx
│   │   ├── dashboard/
│   │   │   ├── Watchlist.tsx
│   │   │   └── MarketBreadth.tsx
│   │   ├── terminal/
│   │   │   └── NewsTerminal.tsx
│   │   └── character/
│   │       ├── CharacterCreator.tsx
│   │       └── XPBar.tsx
│   └── lib/
│       └── api.ts
│
└── backend/
    ├── main.py
    ├── routers/
    │   ├── ohlcv.py
    │   ├── scanner.py
    │   ├── breadth.py
    │   ├── news.py
    │   ├── agent.py
    │   ├── character.py
    │   └── knowledge.py
    ├── services/
    │   ├── fetcher.py
    │   ├── indicators.py
    │   ├── scanner.py
    │   ├── news_fetcher.py
    │   ├── sentiment.py
    │   ├── telegram.py
    │   └── xp_engine.py
    ├── db/
    │   └── mysql.py
    └── cache/
        └── redis_client.py
```

---

## 4. Coding Standard

*   ใช้ Functional Components และ React Hooks (`useState`, `useEffect`) เสมอ
*   แยกไฟล์ Components ตาม folder structure ด้านบนอย่างเคร่งครัด
*   Backend แต่ละ router แยกไฟล์ชัดเจน ห้ามยัดทุกอย่างใน `main.py`
*   ทุก fetch จาก frontend ต้องผ่าน `lib/api.ts` เท่านั้น ห้ามเขียน fetch ตรงใน component
*   จัดการ error ทุก async function ทั้ง frontend และ backend
*   `time` field ใน OHLCV ต้องเป็น Unix integer เสมอ (TradingView requirement)

---

## 5. API Endpoints Reference

| Method | Path | ใช้ใน Component |
|---|---|---|
| GET | `/health` | startup check |
| GET | `/ohlcv?symbol=&period=` | Chart.tsx, MiniChart.tsx |
| GET | `/ticker?symbols=` | MarketTicker.tsx |
| GET | `/scanner/results` | Watchlist.tsx |
| GET | `/breadth` | MarketBreadth.tsx |
| GET | `/news` | NewsTerminal.tsx |
| GET | `/agent/status` | GeminiSprite.tsx |
| GET | `/agent/xp` | XPBar.tsx, GeminiSprite.tsx |
| GET | `/character/outfit` | CharacterCreator.tsx |
| PUT | `/character/outfit` | CharacterCreator.tsx |
| GET | `/knowledge` | character/page.tsx |

---

## 6. Common Pitfalls (จุดที่มักพลาด)

| ปัญหา | วิธีแก้ |
|---|---|
| Sprite เบลอ | ลืมใส่ `image-rendering: pixelated` |
| Layer ตัวละครไม่ซ้อนตรง | ทุก layer ต้องมี `position: absolute; top:0; left:0` |
| กราฟไม่แสดง | `time` field ต้องเป็น Unix integer ไม่ใช่ string |
| CORS error | `CORSMiddleware` ต้องใส่ก่อน route ทุกตัวใน `main.py` |
| Yahoo Finance โดน block | ใช้ Redis cache TTL 5 นาที ห้าม fetch ทุก request |
| Gemini state ไม่อัปเดต | ใช้ `setInterval` polling `/agent/status` ทุก 5 วินาที |

---

## 7. Superpowers AI Workflow Skills

ให้ยึดหลักการทำงาน (Planning → TDD → Execution → Review) จากไฟล์
`superpowers_combined.md` เป็นมาตรฐานการทำงานของ AI Assistant เสมอ

**ลำดับ Phase การพัฒนา:**
1. Setup → 2. Backend Core → 3. Chart → 4. Scanner → 5. Office Scene → 6. Terminal + Character