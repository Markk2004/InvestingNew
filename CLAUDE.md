# Developer Guidelines & Tech Stack (PixelTrade)

## 1. Tech Stack
*   **Framework:** Next.js (App Router), React
*   **Styling:** Tailwind CSS (สำหรับ Layout) และ Vanilla CSS (สำหรับ Keyframe Animations)
*   **Game Engine:** ห้ามใช้ Canvas, WebGL, Phaser หรือ Game Engine ที่หนักเกินไป ให้ใช้ HTML/SVG DOM ปกติ

## 2. Art & UI Constraints (กฎเหล็กด้านภาพ)
*   **Strict Pixel Art:** องค์ประกอบภาพทั้งหมดต้องรองรับสไตล์ 16-Bit Retro
*   **Image Rendering:** ต้องใส่คำสั่ง `image-rendering: pixelated;` เสมอเมื่อมีการแสดงผลภาพ Sprite หรือ Avatar เพื่อป้องกันภาพเบลอ
*   **Layout:** ใช้ Absolute Positioning (`position: absolute`) ควบคู่กับ `z-index` ในการจัดวางเฟอร์นิเจอร์และตัวละครในหน้า Office Overview เพื่อให้ซ้อนทับกันได้อย่างถูกต้องตามหลัก 2.5D Isometric
*   **Character Layering:** ระบบแต่งตัวละครต้องแยก PNG พื้นใสเป็นชิ้นๆ (Base Body, Shirt, Hat) แล้วนำมาซ้อนทับกันด้วยแกน X, Y ที่ตรงกัน

## 3. Data Flow & Logic
*   **Portfolio State:** ระบบวิเคราะห์ข่าวในแท็บ `/analysis-new` ต้องสามารถดึงค่าคงที่เหล่านี้ไปใช้คำนวณผลกระทบได้:
    *   `active_shares`: 12
    *   `average_cost`: 55.07
    *   `cash_balance`: 70.80
*   **Terminal UI:** การแสดงผลข่าวใน `/analysis-new` ควรใช้ฟอนต์สไตล์ Monospace มีสีพื้นหลังทึบ และใช้สีเน้น (Accent Colors) แบบ Neon (เช่น เขียวแจ้งกำไร, แดงแจ้งขาดทุน) เพื่อคุมโทน Night Office

## 4. Coding Standard
*   ใช้ Functional Components และ React Hooks (`useState`, `useEffect`)
*   แยกไฟล์ Components ให้ชัดเจน (เช่น `OfficeScene.tsx`, `NewsTerminal.tsx`, `CharacterCreator.tsx`)