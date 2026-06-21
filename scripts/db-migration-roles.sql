-- ╔══════════════════════════════════════════════════════════╗
-- ║  PixelTrade — Role System Migration                      ║
-- ║  เพิ่ม role column: 'member' | 'owner'                  ║
-- ║  Run: mysql -u root -p pixeltrade < db-migration-roles.sql ║
-- ╚══════════════════════════════════════════════════════════╝

USE pixeltrade;

-- ──────────────────nnnnnnnnnnnnnnnnnnnnnnnnnn ใน users table
--     DEFAULT 'member' — สมาชิกทั่วไป
--     'owner'          — เจ้าของระบบ / admin
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role ENUM('member', 'owner') NOT NULL DEFAULT 'member'
  AFTER tier;

-- เพิ่ม index สำหรับ role filtering
ALTER TABLE users
  ADD INDEX IF NOT EXISTS idx_role (role);

-- ─────────────────────────────────────────────────────────────
--  2. อัปเดต db-init.sql schema (ถ้า drop & recreate)
--     (สำหรับ fresh install ใช้ scripts/db-init.sql ที่อัปเดตแล้ว)
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
--  3. ตรวจสอบผลลัพธ์
-- ─────────────────────────────────────────────────────────────
-- DESCRIBE users;
-- SELECT id, username, email, role, tier FROM users;
