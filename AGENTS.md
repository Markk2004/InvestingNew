# Agent Roles & Responsibilities: PixelTrade Dashboard

**Last Updated:** 2026-06-14
**Status:** Active Development — Phase 1–6

---

## 1. The Boss & Lead Workspace Designer: Mxrk (Human/User)

*   **Role:** เจ้าของโปรเจกต์, ผู้ออกแบบประสบการณ์ผู้ใช้ (UX/UI), และเซียนหุ้นผู้มีประสบการณ์ในตลาด 10-20 ปี พร้อมความรู้ด้านการเขียนเว็บไซต์
*   **Responsibility:**
    *   นำประสบการณ์ 10-20 ปีมาเป็นวิสัยทัศน์หลักในการสร้าง Dashboard และชี้แนะ Logic การเทรด
    *   กำหนดทิศทางของสไตล์ภาพ (16-Bit Night Office)
    *   อนุมัติเลย์เอาต์การจัดวางเฟอร์นิเจอร์และฉากออฟฟิศ
    *   วางโครงสร้างเกมเพลย์รวมถึงระบบ Character Customization
    *   อนุมัติ Sprite assets และ animation state แต่ละตัว
    *   กำหนด watchlist หุ้น US ที่ต้องการติดตาม

---

## 2. Lead Full-Stack Developer: AI Assistant

*   **Role:** นักพัฒนาโปรแกรมหลักที่เชี่ยวชาญด้าน Next.js, React, FastAPI และ Gamified UI
*   **Responsibility:**
    *   แปลคำสั่งและดีไซน์จาก Mxrk ให้กลายเป็นโค้ดที่ทำงานได้จริง
    *   พัฒนาระบบสลับหน้าจอ (Tab Navigation) ให้ลื่นไหลแบบ SPA
    *   สร้างและดูแล Backend API (FastAPI) ทุก endpoint
    *   เชื่อมต่อ Yahoo Finance (yfinance) และจัดการ Redis cache
    *   ออกแบบ MySQL schema สำหรับ XP, Knowledge Base และ Character

*   **Focus Areas ตาม Phase:**

    | Phase | งานหลัก |
    |---|---|
    | 1 | ตั้ง project structure, CORS, health check |
    | 2 | Backend fetcher, indicators, Redis cache, Scheduler |
    | 3 | TradingView chart, API helper, dynamic routes |
    | 4 | Scanner logic, Watchlist, MarketBreadth components |
    | 5 | OfficeScene, Sprite animation, Mini Chart ในฉาก |
    | 6 | NewsTerminal, Telegram pipeline, CharacterCreator, XP system |

---

## 3. The Virtual Staff (In-Game Entities)

### Gemini (AI Analyst)

*   **บทบาทในฉาก:** นั่งทำงานอยู่ในออฟฟิศ มีหน้าที่วิเคราะห์ข่าวและประเมิน Sentiment
*   **Animation States:**
    *   `idle` — นั่งเฉยๆ ไม่มีงาน
    *   `typing` — กำลังพิมพ์ รัน Scheduler fetch ข่าวปกติ
    *   `analyzing` — วิเคราะห์เร่งด่วน เมื่อข่าว Critical เข้า (FED, สงคราม)
*   **State Sync:** state ผูกกับ `/agent/status` endpoint — frontend polling ทุก 5 วินาที
*   **XP System:**
    *   วิเคราะห์ข่าวสำเร็จ 1 ครั้ง → +10 XP
    *   ตรวจจับข่าว Critical ได้ → +25 XP
    *   Level Up ทุก 100 XP → unlock animation ใหม่ + ความแม่น Sentiment เพิ่ม
*   **ข้อมูลในฐานข้อมูล:** ตาราง `agents` (id, name, xp, level, state)

### NewInvester (Trader)

*   **บทบาทในฉาก:** ตัวละครมนุษย์นั่งเฝ้าจอพอร์ต
*   **ข้อมูลพอร์ตปัจจุบัน:** 12 Shares · Avg $55.07 · Balance $70.80
*   **Animation States:** `idle` loop (นั่งมองจอ)
*   **จอในฉาก:** แสดง Mini Chart จริงจาก TradingView Lightweight Charts ขนาดย่อส่วน
*   **ข้อมูลในฐานข้อมูล:** ตาราง `agents` (id, name, xp, level, state)

### Dash (Market Monitor / Chart Specialist)

*   **บทบาทในฉาก:** พนักงานคอยมอนิเตอร์และดูแลระบบแสดงผล Multi-Chart (หน้าจอดูกราฟหลายตัวพร้อมกัน) และดูแล Ticker ราคาตลาดที่วิ่งอยู่ตลอดเวลา
*   **หน้าที่หลัก:** ช่วยคุณ (Mxrk) และ AI Assistant ดึงกราฟหุ้นมาแสดงผลโดยไม่ต้องคำนวณหาราคาเข้าออก แค่เน้นการจัดเรียง Data Visualization ให้ดูง่ายและอัปเดตตลอดเวลา
*   **Animation States:**
    *   `idle` — นั่งดูจอภาพรวม
    *   `monitoring` — จ้องจอเขม็งเมื่อราคาตลาด (Ticker) วิ่งเร็วหรือมีความผันผวน

---

## 4. External Systems (ระบบภายนอกที่ Agent ใช้งาน)

*   **Yahoo Finance (yfinance):** แหล่งข้อมูล OHLCV หุ้น US ฟรี ไม่ต้อง API key
*   **Telegram Bot:** ช่องทาง alert เมื่อ Gemini ตรวจพบข่าว Critical
*   **Redis:** cache ผลลัพธ์ทุก 5 นาที ป้องกัน Yahoo block
*   **MySQL:** เก็บ XP, Knowledge Base, outfit, news log ถาวร