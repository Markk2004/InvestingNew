-- ╔══════════════════════════════════════════════════════════╗
-- ║  PixelTrade — Remove Email Column Migration              ║
-- ║  ลบ email column และ index ออกจาก users table             ║
-- ║  Run: mysql -u root -p pixeltrade < db-migration-remove-email.sql ║
-- ╚══════════════════════════════════════════════════════════╝

USE pixeltrade;

-- ─────────────────────────────────────────────────────────────
--  1. ลบ INDEX และ COLUMN email ออกจาก users table
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users DROP INDEX IF EXISTS idx_email;
ALTER TABLE users DROP COLUMN IF EXISTS email;

-- ─────────────────────────────────────────────────────────────
--  2. ตรวจสอบผลลัพธ์
-- ─────────────────────────────────────────────────────────────
DESCRIBE users;
