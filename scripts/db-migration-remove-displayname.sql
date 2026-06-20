-- ╔══════════════════════════════════════════════════════════╗
-- ║  PixelTrade — Remove Display Name Migration              ║
-- ║  ลบ display_name column ออกจาก users table              ║
-- ║  Run: mysql -u root -p pixeltrade < db-migration-remove-displayname.sql ║
-- ╚══════════════════════════════════════════════════════════╝

USE pixeltrade;

-- ─────────────────────────────────────────────────────────────
--  1. ลบคอลัมน์ display_name ออกจาก users table
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users DROP COLUMN IF EXISTS display_name;

-- ─────────────────────────────────────────────────────────────
--  2. ตรวจสอบผลลัพธ์
-- ─────────────────────────────────────────────────────────────
DESCRIBE users;
