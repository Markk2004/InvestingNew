-- ╔══════════════════════════════════════════════════╗
-- ║  PixelTrade / Dark Hermes — Auth Schema          ║
-- ║  Database: pixeltrade                            ║
-- ╚══════════════════════════════════════════════════╝

CREATE DATABASE IF NOT EXISTS pixeltrade
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pixeltrade;

-- ─────────────────────────────────────
--  Users table
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)   UNIQUE NOT NULL COMMENT 'Unique display name',
  email         VARCHAR(100)  UNIQUE NOT NULL COMMENT 'Login email',
  password_hash VARCHAR(255)  NOT NULL        COMMENT 'bcrypt hashed password',
  display_name  VARCHAR(100)  DEFAULT NULL    COMMENT 'Full name / nickname',
  avatar_style  VARCHAR(50)   DEFAULT 'default',
  xp            INT           DEFAULT 0       COMMENT 'Experience points for gamification',
  tier          ENUM('FREE', 'PLUS', 'SUPER', 'ULTRA') DEFAULT 'FREE',
  is_active     TINYINT(1)    DEFAULT 1,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  last_login    DATETIME      DEFAULT NULL,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────
--  Sessions table  (JWT token tracking / revocation)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  token_hash  VARCHAR(255) UNIQUE NOT NULL COMMENT 'SHA-256 hash of JWT for revocation',
  ip_address  VARCHAR(45)  DEFAULT NULL,
  user_agent  TEXT         DEFAULT NULL,
  expires_at  DATETIME     NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────
--  Example: check table structure
-- ─────────────────────────────────────
-- DESCRIBE users;
-- DESCRIBE sessions;
-- SELECT * FROM users LIMIT 10;
