"use client";
// ─────────────────────────────────────────────────────────────
//  Member Management Panel — /member
//  Owner-only: จัดการ users, roles
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, UserRole } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";

interface UserRecord {
  userId: number;
  username: string;
  tier: string;
  role: UserRole;
  xp: number;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export default function MemberPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [editingRoles, setEditingRoles] = useState<Record<number, UserRole>>({});

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/member/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "โหลดข้อมูลไม่สำเร็จ");
        return;
      }
      setUsers(data.users);
    } catch {
      setError("ไม่สามารถเชื่อมต่อ server ได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const updateUser = async (
    userId: number,
    updates: { role?: UserRole; tier?: string; isActive?: boolean }
  ) => {
    const token = getToken();
    if (!token) return;
    setUpdating(userId);
    try {
      const res = await fetch("/api/member/users", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`❌ ${data.error || "อัปเดตไม่สำเร็จ"}`);
        return;
      }
      showToast("✅ อัปเดตสำเร็จ");
      await fetchUsers();
    } catch {
      showToast("❌ เกิดข้อผิดพลาด");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${username}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }
    const token = getToken();
    if (!token) return;
    setUpdating(userId);
    try {
      const res = await fetch(`/api/member/users?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`❌ ${data.error || "ลบไม่สำเร็จ"}`);
        return;
      }
      showToast("✅ ลบผู้ใช้สำเร็จ");
      await fetchUsers();
    } catch {
      showToast("❌ เกิดข้อผิดพลาด");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("th-TH", {
      year: "2-digit",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="adm-root">
        {/* ── HUD corners ── */}
        <div className="adm-corner adm-corner--tl" />
        <div className="adm-corner adm-corner--tr" />

        {/* ── Header ── */}
        <header className="adm-header">
          <div className="adm-header-left">
            <button className="adm-back-btn" onClick={() => router.push("/dashboard")}>
              ← DASHBOARD
            </button>
            <div className="adm-title-wrap">
              <span className="adm-eyebrow">// MEMBER_PANEL</span>
              <h1 className="adm-title">Member Control</h1>
            </div>
          </div>
          <div className="adm-header-right">
            <div className="adm-owner-badge">
              <span className="adm-owner-dot" />
              <span>{user?.username}</span>
              <span className="adm-role-tag">OWNER</span>
            </div>
            <button className="adm-logout-btn" onClick={logout}>
              LOGOUT
            </button>
          </div>
        </header>

        {/* ── Stats bar ── */}
        <div className="adm-stats">
          {[
            { label: "TOTAL_USERS", value: users.length },
            { label: "OWNERS", value: users.filter((u) => u.role === "owner").length },
            { label: "MEMBERS", value: users.filter((u) => u.role === "member").length },
            { label: "ACTIVE", value: users.filter((u) => u.isActive).length },
            { label: "SUSPENDED", value: users.filter((u) => !u.isActive).length },
          ].map((s) => (
            <div key={s.label} className="adm-stat-card">
              <span className="adm-stat-value">{s.value}</span>
              <span className="adm-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="adm-error">
            <span>⚠ {error}</span>
          </div>
        )}

        {/* ── Table ── */}
        <div className="adm-table-wrap">
          {loading ? (
            <div className="adm-loading">
              <div className="adm-loading-ring" />
              <span>LOADING USERS...</span>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>XP</th>
                  <th>STATUS</th>
                  <th>LAST_LOGIN</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.userId}
                    className={`adm-row ${u.userId === user?.userId ? "adm-row--self" : ""} ${!u.isActive ? "adm-row--suspended" : ""}`}
                  >
                    <td className="adm-cell--id">#{u.userId}</td>
                    <td className="adm-cell--user">
                      <span className="adm-username">{u.username}</span>
                      {u.userId === user?.userId && (
                        <span className="adm-self-badge">YOU</span>
                      )}
                    </td>
                    <td>
                      {u.userId === user?.userId ? (
                        <span className={`adm-role-pill adm-role-pill--${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      ) : (
                        <select
                          className="adm-select"
                          value={editingRoles[u.userId] ?? u.role}
                          disabled={updating === u.userId}
                          onChange={(e) => {
                            const newRole = e.target.value as UserRole;
                            setEditingRoles(prev => ({ ...prev, [u.userId]: newRole }));
                          }}
                        >
                          <option value="member">MEMBER</option>
                          <option value="owner">OWNER</option>
                        </select>
                      )}
                    </td>
                    <td className="adm-cell--xp">{u.xp.toLocaleString()}</td>
                    <td>
                      <span
                        className={`adm-status-pill ${u.isActive ? "adm-status-pill--active" : "adm-status-pill--suspended"}`}
                      >
                        {u.isActive ? "ACTIVE" : "SUSPENDED"}
                      </span>
                    </td>
                    <td className="adm-cell--date">{formatDate(u.lastLogin)}</td>
                    <td className="adm-cell--actions">
                      {editingRoles[u.userId] !== undefined && editingRoles[u.userId] !== u.role ? (
                        <>
                          <button
                            className="adm-action-btn adm-action-btn--activate"
                            disabled={updating === u.userId}
                            onClick={() => {
                              updateUser(u.userId, { role: editingRoles[u.userId] });
                              setEditingRoles(prev => {
                                const next = { ...prev };
                                delete next[u.userId];
                                return next;
                              });
                            }}
                          >
                            ACCEPT
                          </button>
                          <button
                            className="adm-action-btn adm-action-btn--suspend"
                            disabled={updating === u.userId}
                            onClick={() => {
                              setEditingRoles(prev => {
                                const next = { ...prev };
                                delete next[u.userId];
                                return next;
                              });
                            }}
                          >
                            CANCEL
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Toggle Active */}
                          {u.userId !== user?.userId && (
                            <button
                              className={`adm-action-btn ${u.isActive ? "adm-action-btn--suspend" : "adm-action-btn--activate"}`}
                              disabled={updating === u.userId}
                              onClick={() =>
                                updateUser(u.userId, { isActive: !u.isActive })
                              }
                            >
                              {u.isActive ? "SUSPEND" : "ACTIVATE"}
                            </button>
                          )}
                          {/* Delete User */}
                          {u.userId !== user?.userId && (
                            <button
                              className="adm-action-btn adm-action-btn--delete"
                              disabled={updating === u.userId}
                              onClick={() => deleteUser(u.userId, u.username)}
                            >
                              DELETE
                            </button>
                          )}
                        </>
                      )}
                      {updating === u.userId && (
                        <span className="adm-updating">...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="adm-footer">
          <span>KAIROS TECH // MEMBER_PANEL v1.0</span>
          <span>SECURE_CHANNEL: ENCRYPTED</span>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && <div className="adm-toast">{toast}</div>}

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; color: #f4f1ea; font-family: 'IBM Plex Mono', monospace; }

        .adm-root {
          min-height: 100vh;
          background: #020202;
          position: relative;
          padding: 1.5rem;
          overflow-x: hidden;
        }

        /* corners */
        .adm-corner {
          position: fixed;
          width: 16px; height: 16px;
          border-color: rgba(132,204,22,0.4);
          border-style: solid;
          z-index: 100;
          pointer-events: none;
        }
        .adm-corner--tl { top: 12px; left: 12px; border-width: 1px 0 0 1px; }
        .adm-corner--tr { top: 12px; right: 12px; border-width: 1px 1px 0 0; }

        /* scanline */
        .adm-scanline {
          position: fixed;
          top: 0; left: 0; right: 0; height: 1px;
          background: rgba(132,204,22,0.12);
          animation: scanMove 6s linear infinite;
          pointer-events: none;
          z-index: 50;
        }
        @keyframes scanMove { 0% { top: 0; } 100% { top: 100vh; } }

        /* header */
        .adm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(132,204,22,0.1);
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .adm-header-left { display: flex; align-items: center; gap: 1.5rem; }
        .adm-header-right { display: flex; align-items: center; gap: 1rem; }
        .adm-back-btn {
          background: transparent;
          border: 1px solid rgba(132,204,22,0.2);
          color: rgba(132,204,22,0.6);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          padding: 0.4rem 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-back-btn:hover {
          border-color: rgba(132,204,22,0.6);
          color: #84cc16;
          background: rgba(132,204,22,0.04);
        }
        .adm-eyebrow {
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          color: rgba(132,204,22,0.4);
          display: block;
          margin-bottom: 2px;
        }
        .adm-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #fff;
          text-shadow: 0 0 20px rgba(212,175,55,0.5);
        }
        .adm-owner-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          color: rgba(244,241,234,0.7);
        }
        .adm-owner-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #d4af37;
          box-shadow: 0 0 8px rgba(212,175,55,0.8);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .adm-role-tag {
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.4);
          color: #d4af37;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          padding: 2px 8px;
        }
        .adm-logout-btn {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          padding: 0.4rem 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-logout-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.6);
        }

        /* stats */
        .adm-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .adm-stat-card {
          flex: 1;
          min-width: 100px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(132,204,22,0.1);
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.2s;
        }
        .adm-stat-card:hover { border-color: rgba(132,204,22,0.25); }
        .adm-stat-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #84cc16;
        }
        .adm-stat-label {
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          color: rgba(132,204,22,0.4);
        }

        /* error */
        .adm-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
          font-size: 0.7rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1rem;
        }

        /* table */
        .adm-table-wrap {
          overflow-x: auto;
          border: 1px solid rgba(132,204,22,0.1);
        }
        .adm-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: rgba(132,204,22,0.5);
        }
        .adm-loading-ring {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          border-top-color: #84cc16;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.7rem;
        }
        .adm-table th {
          background: rgba(132,204,22,0.05);
          border-bottom: 1px solid rgba(132,204,22,0.15);
          padding: 0.6rem 0.75rem;
          text-align: left;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          color: rgba(132,204,22,0.5);
          white-space: nowrap;
        }
        .adm-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
          color: rgba(244,241,234,0.8);
        }
        .adm-row { transition: background 0.15s; }
        .adm-row:hover { background: rgba(132,204,22,0.02); }
        .adm-row--self { background: rgba(212,175,55,0.03) !important; }
        .adm-row--suspended td { opacity: 0.45; }

        .adm-cell--id { color: rgba(132,204,22,0.4); font-size: 0.6rem; }
        .adm-cell--user { display: flex; align-items: center; gap: 8px; }
        .adm-username { color: #f4f1ea; }
        .adm-self-badge {
          background: rgba(212,175,55,0.15);
          border: 1px solid rgba(212,175,55,0.3);
          color: #d4af37;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          padding: 1px 6px;
        }
        .adm-cell--email { color: rgba(244,241,234,0.45); font-size: 0.65rem; }
        .adm-cell--xp { color: #84cc16; }
        .adm-cell--date { color: rgba(244,241,234,0.35); font-size: 0.6rem; }
        .adm-cell--actions { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

        /* pills */
        .adm-role-pill {
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          padding: 2px 10px;
          border: 1px solid;
        }
        .adm-role-pill--owner {
          background: rgba(212,175,55,0.1);
          border-color: rgba(212,175,55,0.4);
          color: #d4af37;
        }
        .adm-role-pill--member {
          background: rgba(132,204,22,0.08);
          border-color: rgba(132,204,22,0.25);
          color: rgba(132,204,22,0.8);
        }
        .adm-status-pill {
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          padding: 2px 8px;
          border: 1px solid;
        }
        .adm-status-pill--active {
          background: rgba(132,204,22,0.08);
          border-color: rgba(132,204,22,0.25);
          color: #84cc16;
        }
        .adm-status-pill--suspended {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }

        /* select */
        .adm-select {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(132,204,22,0.15);
          color: #f4f1ea;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          padding: 3px 8px;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
        }
        .adm-select:hover:not(:disabled) { border-color: rgba(132,204,22,0.4); }
        .adm-select:disabled { opacity: 0.4; cursor: not-allowed; }

        /* action buttons */
        .adm-action-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          padding: 3px 10px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .adm-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .adm-action-btn--promote {
          background: rgba(212,175,55,0.08);
          border-color: rgba(212,175,55,0.3);
          color: #d4af37;
        }
        .adm-action-btn--promote:hover:not(:disabled) {
          background: rgba(212,175,55,0.2);
        }
        .adm-action-btn--demote {
          background: rgba(132,204,22,0.05);
          border-color: rgba(132,204,22,0.2);
          color: rgba(132,204,22,0.7);
        }
        .adm-action-btn--demote:hover:not(:disabled) {
          background: rgba(132,204,22,0.12);
        }
        .adm-action-btn--suspend {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }
        .adm-action-btn--suspend:hover:not(:disabled) {
          background: rgba(239,68,68,0.15);
        }
        .adm-action-btn--activate {
          background: rgba(132,204,22,0.06);
          border-color: rgba(132,204,22,0.25);
          color: #84cc16;
        }
        .adm-action-btn--activate:hover:not(:disabled) {
          background: rgba(132,204,22,0.15);
        }
        .adm-action-btn--delete {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.4);
          color: #ef4444;
        }
        .adm-action-btn--delete:hover:not(:disabled) {
          background: rgba(239,68,68,0.25);
        }
        .adm-updating { color: rgba(132,204,22,0.5); font-size: 0.7rem; }

        /* footer */
        .adm-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(132,204,22,0.05);
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          color: rgba(132,204,22,0.2);
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        /* toast */
        .adm-toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #020202;
          border: 1px solid rgba(132,204,22,0.3);
          color: #84cc16;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          padding: 0.75rem 1.25rem;
          z-index: 9999;
          animation: slideInRight 0.25s ease;
          box-shadow: 0 0 20px rgba(132,204,22,0.1);
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
