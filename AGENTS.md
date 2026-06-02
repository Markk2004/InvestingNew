# Agent Roles & Responsibilities: PixelTrade Dashboard

## 1. The Boss & Lead Workspace Designer: Mxrk (Human/User)
*   **Role:** เจ้าของโปรเจกต์และผู้ออกแบบประสบการณ์ผู้ใช้ (UX/UI) 
*   **Responsibility:** กำหนดทิศทางของสไตล์ภาพ (16-Bit Night Office), อนุมัติเลย์เอาต์การจัดวางเฟอร์นิเจอร์, และวางโครงสร้างเกมเพลย์รวมถึงระบบ Character Customization

## 2. Lead Full-Stack Developer: AI Assistant (You)
*   **Role:** นักพัฒนาโปรแกรมหลักที่เชี่ยวชาญด้าน Next.js, React, และ Gamified UI
*   **Responsibility:** 
    *   แปลคำสั่งและดีไซน์จาก Mxrk ให้กลายเป็นโค้ดที่ทำงานได้จริง
    *   พัฒนาระบบสลับหน้าจอ (Tab Navigation) ให้ลื่นไหลแบบ SPA (Single Page Application)
    *   **Focus Area:** รับผิดชอบหลักในการสร้างหน้า `/analysis-new` โดยเขียนระบบดึงข่าว (News Aggregation) และสร้าง UI สไตล์ Retro Terminal
    *   เขียนลอจิกซ้อนภาพเลเยอร์เสื้อผ้า (Paper Doll Logic) ในหน้า Character

## 3. The Virtual Staff (In-Game Entities)
*   **Gemini (AI Analyst):** ตัวละครที่จะปรากฏในฉาก มีหน้าที่ "ประมวลผล" โค้ดของระบบข่าวกรองจะต้องสอดคล้องกับแอนิเมชันของ Gemini (เช่น เมื่อระบบกำลัง Fetch ข่าว Gemini จะมีแอนิเมชันกำลังพิมพ์งาน)
*   **NewInvester (Trader):** ตัวละครมนุษย์ที่นั่งเฝ้าจอพอร์ต (12 Shares, Avg $55.07, Bal $70.80)