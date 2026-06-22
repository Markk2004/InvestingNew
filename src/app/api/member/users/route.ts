// ─────────────────────────────────────────────────────────────
//  GET  /api/member/users        → list all users (owner only)
//  PATCH /api/member/users       → update user role/tier/status
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, UserRole } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  tier: string;
  role: UserRole;
  telegram_name: string | null;
  xp: number;
  is_active: number;
  created_at: Date;
  last_login: Date | null;
}

// ─── Auth helper ──────────────────────────────────────────────
async function requireOwner(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = await verifyToken(authHeader.slice(7));
  if (!payload || payload.role !== "owner") return null;
  return payload;
}

// ─── GET /api/member/users ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json(
      { error: "Access denied — owner only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";

    let whereClause = "WHERE 1=1";
    const values: unknown[] = [];

    if (search) {
      whereClause += " AND (username LIKE ? OR telegram_name LIKE ?)";
      const likeQuery = `%${search}%`;
      values.push(likeQuery, likeQuery);
    }

    if (filter === "active") {
      whereClause += " AND is_active = 1";
    } else if (filter === "suspended") {
      whereClause += " AND is_active = 0";
    } else if (filter === "owner") {
      whereClause += " AND role = 'owner'";
    } else if (filter === "member") {
      whereClause += " AND role = 'member'";
    }

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      values
    );
    const total = countRows[0].total as number;

    // Get data
    const query = `
      SELECT id, username, tier, role, telegram_name, xp, is_active, created_at, last_login
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    values.push(limit, offset);

    const [rows] = await pool.query<UserRow[]>(query, values);

    return NextResponse.json({
      users: rows.map((u) => ({
        userId: u.id,
        username: u.username,
        tier: u.tier,
        role: u.role,
        telegramName: u.telegram_name,
        xp: u.xp,
        isActive: Boolean(u.is_active),
        createdAt: u.created_at,
        lastLogin: u.last_login,
      })),
      total,
      hasMore: offset + rows.length < total,
    });
  } catch (err) {
    console.error("[member/users GET] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── PATCH /api/member/users ───────────────────────────────────
// Body: { userId, role?, tier?, isActive? }
export async function PATCH(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json(
      { error: "Access denied — owner only" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, role, tier, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // ป้องกัน owner ลด role ตัวเอง
    if (userId === owner.userId && role === "member") {
      return NextResponse.json(
        { error: "ไม่สามารถลด role ของตัวเองได้" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (role !== undefined) {
      if (!["member", "owner"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.push("role = ?");
      values.push(role);
    }
    if (tier !== undefined) {
      if (!["FREE", "PLUS", "SUPER", "ULTRA"].includes(tier)) {
        return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
      }
      updates.push("tier = ?");
      values.push(tier);
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true, userId });
  } catch (err) {
    console.error("[member/users PATCH] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── DELETE /api/member/users ──────────────────────────────────
export async function DELETE(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json(
      { error: "Access denied — owner only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const userIdStr = searchParams.get("userId");
    if (!userIdStr) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // ป้องกัน owner ลบตัวเอง
    if (userId === owner.userId) {
      return NextResponse.json(
        { error: "ไม่สามารถลบบัญชีตัวเองได้" },
        { status: 400 }
      );
    }

    await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    return NextResponse.json({ success: true, message: `User #${userId} has been deleted.` });
  } catch (err) {
    console.error("[member/users DELETE] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
