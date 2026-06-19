# Project Context: PixelTrade Night Office Simulation & Intelligence Center

**Document Type:** Project Onboarding, Vision & Advanced System Architecture
**Author:** Mxrk (CEO & Lead Workspace Designer)
**Project:** Gamified Investment Dashboard & Autonomous AI Workspace (16-Bit Retro Style)

---

## 🏢 วิสัยทัศน์และการออกแบบ (The Vision)

PixelTrade ไม่ใช่แค่กระดานเทรดหรือแดชบอร์ดทั่วไป แต่คือ **"Autonomous Night Office"** ที่ผสานระหว่างความเงียบสงบของบรรยากาศทำงานรอบดึกในสไตล์ 16-Bit Pixel Art เข้ากับระบบประมวลผลข้อมูลระดับกองทุน (Institutional-Grade Intelligence) 

เป้าหมายสูงสุดคือการเปลี่ยนหน้าจอแดชบอร์ดให้กลายเป็นสถานีควบคุมกลางที่ผู้ใช้สามารถบริหารพอร์ตการลงทุน มอนิเตอร์เหตุการณ์มหภาคระดับโลก และดูการทำงานของ AI Agents ที่สามารถเรียนรู้ พัฒนาตัวเอง และเก็บสะสมประสบการณ์ได้จริงเสมือนเป็นพนักงานในบริษัทควบคุมระบบ

---

## 💻 โครงสร้างระบบหลัก (Core Architecture & System Topology)

ระบบแอปพลิเคชันจะเชื่อมต่อผ่าน Next.js (Frontend), MySQL (Knowledge & XP Backend) และ External APIs (Telegram/Financial Data) โดยแบ่งออกเป็น 3 เมนูหลักที่มีการทำงานประสานกันดังนี้:

### 1. Office Overview (ศูนย์ควบคุมการปฏิบัติการกลาง - Central Monitor)
ทำหน้าที่เป็น **Master Monitor** ที่สะท้อนสถานะแบบเรียลไทม์ของระบบทั้งหมด ไม่ใช่เพียงแค่ภาพแอนิเมชันตกแต่ง:
* **Live Data & Chart Integration:** มอนิเตอร์บนโต๊ะทำงานของตัวละครจะแสดงกราฟหุ้นและสถานะพอร์ตจริง ข้อมูลเปลี่ยนตามสภาวะตลาด
* **Agent Activity Sync:** แอนิเมชันของพนักงาน (Staff) จะผูกกับ Background Jobs ในระบบ เช่น เมื่อ `Gemini` กำลังประมวลผลข่าวการประชุม FED แอนิเมชันในฉากจะเปลี่ยนเป็นสถานะกำลังวิเคราะห์ข้อมูลอย่างเร่งด่วน
* **XP Display:** แสดงระดับเลเวลและแถบค่าประสบการณ์ (XP Bar) บนหัวหรือในสถานะของ Staff แต่ละตัว เพื่อบอกความเชี่ยวชาญปัจจุบัน

### 2. AnalysisNew & Global Intelligence System (ศูนย์วิเคราะห์ข่าวกรองและสัญญานเทรด)
ระบบวิเคราะห์ความเสี่ยงและจังหวะตลาดเชิงลึก ครอบคลุมปัจจัยมหภาค (Macroeconomics):
* **Multi-Domain Analysis:** ดึงข้อมูลและวิเคราะห์ผลกระทบจาก ตลาดหุ้น, ดัชนีการเงิน, นโยบาย FED, การเมืองระหว่างประเทศ และความขัดแย้ง/สงครามภูมิรัฐศาสตร์
* **Signal & Graph Rendering:** หน้าจอ Terminal สไตล์ Monospace ผสานกราฟเทคนิคัล เพื่อประเมินผลกระทบต่อสินทรัพย์ในพอร์ตโฟลิโอ
* **Telegram Alert Pipeline:** เมื่อระบบตรวจพบข่าวสารระดับ Critical (เช่น FED ปรับดอกเบี้ยกระทันหัน, สัญญาณข่าวสงคราม) ระบบจะสั่งการให้ Bot ส่งสรุปบทวิเคราะห์เชิงลึก (Sentiment & Impact) เข้าสู่ **Telegram Channel** ของผู้ใช้โดยทันที เพื่อไม่ให้พลาดเหตุการณ์สำคัญแม้อยู่จัดหน้าจอ

### 3. Knowledge Base & Customization (ห้องแต่งตัวและคลังสมองของระบบ)
การบริหารจัดการตัวละครและคลังความรู้ที่ Agent สะสมมา:
* **Character Paper Doll & XP System:** (อยู่ระหว่างการวางแผนพัฒนาในอนาคต) ระบบแต่งตัวละครพิกเซลซ้อนเลเยอร์ (Base, Shirt, Hat) ควบคู่กับการผูกค่าประสบการณ์ (XP) ทุกครั้งที่ Staff ทำงานสำเร็จ (เช่น วิเคราะห์ข่าวถูกต้อง, ทำกำไรให้พอร์ต) ค่า XP ในฐานข้อมูลจะเพิ่มขึ้น และส่งผลต่อประสิทธิภาพการทำงานในอนาคต
* **System-Wide Knowledge Base UI:** หน้าต่างแสดงผล "คลังความรู้สาธารณะของระบบ" ที่ดึงข้อมูลมาจาก Backend เพื่อให้ผู้ใช้เปิดอ่านสิ่งที่ AI เรียนรู้มาได้ตลอดเวลา

---

## 🧠 สถาปัตยกรรมการเรียนรู้ของ AI (Agent Memory System)

เพื่อให้ AI พัฒนาตัวเองได้เรื่อยๆ โดยไม่สูญเสียความจำเมื่อรีเฟรชหน้าจอ (State Loss) ระบบจะใช้สถาปัตยกรรมแบบ **Retrieval-Augmented Generation (RAG)**:

---

## Language

**Agent Memory**:
A retrieval-augmented generation (RAG) system using a MySQL database to inject historical context (e.g., past analyses, trade outcomes) into AI prompts.
_Avoid_: Machine Learning Backend, Closed-Loop Feedback System, Model Training

**Critical News**:
A news event that passes a rule-based pre-filter (e.g., keywords) and is subsequently scored 8-10 for impact by the LLM, triggering an immediate Telegram alert.
_Avoid_: Breaking News, Important Update

**Agent XP**:
A cosmetic progression metric representing an agent's tenure and the volume of tasks completed. It serves as a visual indicator of experience and can unlock cosmetic customizations (e.g., paper doll outfits), but does not alter the underlying AI logic or capabilities.
_Avoid_: Machine Learning Training, Intelligence Level, Functional Unlock

**Autonomous Execution**:
A frontend-driven simulation loop where AI analysis, news fetching, and agent activities only run while the user has the dashboard open in their browser. If the browser is closed, all operations pause.
_Avoid_: 24/7 Server Daemon, Backend Background Worker, Always-On Cron

**Live Market Data**:
Real-world financial and macroeconomic news fetched dynamically from external sources (e.g., RSS feeds, public APIs) to be summarized and analyzed by the Agent.
_Avoid_: Simulated News, Mock Data, LLM Generated Events