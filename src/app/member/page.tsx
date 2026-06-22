"use client";
// ─────────────────────────────────────────────────────────────
//  Member Management Panel — /member
//  Owner-only: จัดการ users, roles
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getToken, UserRole } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";
import { Search, Filter, Shield, User as UserIcon, ShieldAlert, Trash2, LogOut } from "lucide-react";
import ResponsiveDashboard from "@/components/ResponsiveDashboard";

interface UserRecord {
  userId: number;
  username: string;
  telegramName: string | null;
  tier: string;
  role: UserRole;
  xp: number;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

import { ChevronDown, ChevronUp } from "lucide-react";

function MobileUserCard({
  u,
  isSelf,
  editingRole,
  setEditingRole,
  cancelEditing,
  onUpdateRole,
  onToggleActive,
  onDelete,
  updating,
  formatDate
}: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex flex-col bg-[#0a0a0f] border rounded-lg overflow-hidden transition-colors ${u.isActive ? (isSelf ? 'border-[#d4af37]/30' : 'border-white/10') : 'border-red-500/30 opacity-70'}`}>
      {/* Header (Always Visible) */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {u.role === 'owner' ? <Shield size={16} className="text-[#d4af37]" /> : <UserIcon size={16} className="text-[#84cc16]/70" />}
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${u.isActive ? 'bg-[#84cc16] shadow-[0_0_5px_#84cc16]' : 'bg-red-500'}`} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{u.username}</span>
              {isSelf && <span className="text-[8px] bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.5 rounded border border-[#d4af37]/30">YOU</span>}
            </div>
            <span className="text-[10px] text-white/40">ID: #{u.userId} • XP: {u.xp.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/30">
          <span className={`text-[9px] px-2 py-0.5 rounded border ${u.role === 'owner' ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]' : 'bg-[#84cc16]/10 border-[#84cc16]/30 text-[#84cc16]'}`}>
            {u.role.toUpperCase()}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-3 border-t border-white/5 bg-white/[0.02] flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex flex-col gap-1">
              <span className="text-white/30">TELEGRAM</span>
              <span className={u.telegramName ? "text-[#84cc16]" : "text-white/20"}>{u.telegramName || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/30">LAST LOGIN</span>
              <span className="text-white/60">{formatDate(u.lastLogin)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
            <span className="text-[9px] text-white/30 tracking-widest mb-1">OPERATIVE ACTIONS</span>
            
            {editingRole !== undefined && editingRole !== u.role ? (
              <div className="flex gap-2">
                <button
                  disabled={updating}
                  onClick={onUpdateRole}
                  className="flex-1 bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] text-[10px] py-1.5 rounded disabled:opacity-50"
                >
                  CONFIRM ROLE
                </button>
                <button
                  disabled={updating}
                  onClick={cancelEditing}
                  className="flex-1 bg-white/5 border border-white/10 text-white/50 text-[10px] py-1.5 rounded disabled:opacity-50"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {!isSelf && (
                  <select
                    className="flex-1 bg-white/5 border border-white/10 text-white/80 text-[10px] py-1.5 px-2 rounded outline-none disabled:opacity-50"
                    value={u.role}
                    disabled={updating}
                    onChange={(e) => setEditingRole(e.target.value)}
                  >
                    <option value="member">ROLE: MEMBER</option>
                    <option value="owner">ROLE: OWNER</option>
                  </select>
                )}
                
                {!isSelf && (
                  <button
                    disabled={updating}
                    onClick={onToggleActive}
                    className={`flex-1 flex items-center justify-center gap-1 border text-[10px] py-1.5 rounded disabled:opacity-50 ${u.isActive ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#84cc16]/10 border-[#84cc16]/30 text-[#84cc16]'}`}
                  >
                    <ShieldAlert size={12} />
                    {u.isActive ? "SUSPEND" : "ACTIVATE"}
                  </button>
                )}
                
                {!isSelf && (
                  <button
                    disabled={updating}
                    onClick={onDelete}
                    className="w-full flex items-center justify-center gap-1 bg-red-500/20 border border-red-500/40 text-red-500 text-[10px] py-1.5 rounded mt-1 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    TERMINATE RECORD
                  </button>
                )}
              </div>
            )}
            {updating && <span className="text-[9px] text-[#84cc16]/50 text-center animate-pulse mt-1">PROCESSING COMMAND...</span>}
          </div>
        </div>
      )}
    </div>
  );
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

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const LIMIT = 20;

  const fetchUsers = useCallback(async (reset = false) => {
    const token = getToken();
    if (!token) return;
    
    if (reset) {
      setLoading(true);
    }
    
    const currentOffset = reset ? 0 : page * LIMIT;
    try {
      const res = await fetch(`/api/member/users?limit=${LIMIT}&offset=${currentOffset}&search=${encodeURIComponent(searchQuery)}&filter=${activeFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "โหลดข้อมูลไม่สำเร็จ");
        return;
      }
      
      setUsers(prev => reset ? data.users : [...prev, ...data.users]);
      setHasMore(data.hasMore);
      setTotalUsersCount(data.total);
      if (reset) setPage(0);
    } catch {
      setError("ไม่สามารถเชื่อมต่อ server ได้");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, activeFilter]);

  // Initial load and refetches on filter/search change
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite Scroll Observer
  const loaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || loading || !isMobile) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, isMobile]);

  // Load next page when page state changes
  useEffect(() => {
    if (page > 0) fetchUsers(false);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, ...updates } : u));
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
      setUsers(prev => prev.filter(u => u.userId !== userId));
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

  if (isMobile) {
    return (
      <ResponsiveDashboard activeTab="member" setActiveTab={() => {}} contentClassName="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 z-50 flex flex-col bg-[#050508] overflow-hidden font-mono text-[#f4f1ea]">
          {/* Mobile Header */}
          <div className="flex-shrink-0 bg-[#0a0a0f] border-b border-[#84cc16]/20">
            <div className="h-12 flex items-center justify-between px-4">
              <button
                onClick={() => router.push("/monitor")}
                className="flex items-center gap-2 text-xs font-bold text-[#84cc16] bg-[#84cc16]/10 px-3 py-1.5 rounded"
              >
                ◀ BACK
              </button>
              <div className="text-xs text-[#888] font-mono tracking-widest text-center">
                <span className="block text-[8px] text-[#84cc16]/50">MEMBER_PANEL</span>
                OPERATIVES
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => {
                     if (confirm("Are you sure you want to log out?")) {
                       logout();
                     }
                   }}
                   className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded flex items-center justify-center"
                 >
                   <LogOut size={14} />
                 </button>
                 <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              </div>
            </div>
            {/* Metrics */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-2 border-t border-white/5">
              <div className="flex flex-col bg-white/5 px-3 py-1 rounded min-w-[80px]">
                 <span className="text-[9px] text-[#84cc16]/50">TOTAL</span>
                 <span className="text-sm font-bold text-[#84cc16]">{totalUsersCount}</span>
              </div>
              <div className="flex flex-col bg-white/5 px-3 py-1 rounded min-w-[80px]">
                 <span className="text-[9px] text-[#84cc16]/50">ACTIVE</span>
                 <span className="text-sm font-bold text-white/80">{users.filter(u => u.isActive).length}</span>
              </div>
            </div>
            {/* Search and Filters */}
            <div className="px-4 py-2 flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input 
                  type="text" 
                  placeholder="Search operatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-8 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#84cc16]/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                 {['all', 'active', 'suspended', 'owner', 'member'].map(f => (
                   <button
                     key={f}
                     onClick={() => setActiveFilter(f)}
                     className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap border ${activeFilter === f ? 'bg-[#84cc16]/20 border-[#84cc16] text-[#84cc16]' : 'bg-transparent border-white/10 text-white/50'}`}
                   >
                     {f.toUpperCase()}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* List Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-safe">
            {error && <div className="text-red-400 text-xs text-center">{error}</div>}
            
            {users.map(u => (
              <MobileUserCard
                key={u.userId}
                u={u}
                isSelf={u.userId === user?.userId}
                editingRole={editingRoles[u.userId]}
                setEditingRole={(role: string) => setEditingRoles(p => ({...p, [u.userId]: role as UserRole}))}
                cancelEditing={() => setEditingRoles(p => { const n = {...p}; delete n[u.userId]; return n; })}
                onUpdateRole={() => {
                  updateUser(u.userId, { role: editingRoles[u.userId] });
                  setEditingRoles(p => { const n = {...p}; delete n[u.userId]; return n; });
                }}
                onToggleActive={() => updateUser(u.userId, { isActive: !u.isActive })}
                onDelete={() => deleteUser(u.userId, u.username)}
                updating={updating === u.userId}
                formatDate={formatDate}
              />
            ))}
            
            {loading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && !hasMore && users.length > 0 && (
               <div className="text-center text-[10px] text-white/30 py-4">END OF RECORDS</div>
            )}
            {!loading && users.length === 0 && (
               <div className="text-center text-xs text-white/30 py-10">NO OPERATIVES FOUND</div>
            )}
            {/* Intersection Observer target */}
            <div ref={loaderRef} className="h-4 w-full" />
          </div>

          {/* Toast */}
          {toast && (
            <div className="absolute bottom-6 right-4 left-4 bg-[#0a0a0f] border border-[#84cc16]/50 text-[#84cc16] text-xs px-4 py-3 shadow-[0_0_20px_rgba(132,204,22,0.1)] z-50 rounded">
              {toast}
            </div>
          )}
        </div>
      </ResponsiveDashboard>
    );
  }

  return (
    <>
      <div className="adm-root">
        {/* ── HUD corners ── */}
        <div className="adm-corner adm-corner--tl" />
        <div className="adm-corner adm-corner--tr" />

        {/* ── Header ── */}
        <header className="adm-header">
          <div className="adm-header-left">
            <button className="adm-back-btn" onClick={() => router.push("/monitor")}>
              ← MONITOR
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {users.map((u) => (
                <MobileUserCard
                  key={u.userId}
                  u={u}
                  isSelf={u.userId === user?.userId}
                  editingRole={editingRoles[u.userId]}
                  setEditingRole={(role: string) => setEditingRoles(p => ({...p, [u.userId]: role as UserRole}))}
                  cancelEditing={() => setEditingRoles(p => { const n = {...p}; delete n[u.userId]; return n; })}
                  onUpdateRole={() => {
                    updateUser(u.userId, { role: editingRoles[u.userId] });
                    setEditingRoles(p => { const n = {...p}; delete n[u.userId]; return n; });
                  }}
                  onToggleActive={() => updateUser(u.userId, { isActive: !u.isActive })}
                  onDelete={() => deleteUser(u.userId, u.username)}
                  updating={updating === u.userId}
                  formatDate={formatDate}
                />
              ))}
              {users.length === 0 && !loading && (
                <div className="col-span-full text-center text-xs text-white/30 py-10">NO OPERATIVES FOUND</div>
              )}
            </div>
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
        .adm-cell--telegram { color: rgba(244,241,234,0.6); font-size: 0.65rem; }
        .adm-telegram-name { color: #84cc16; }
        .adm-telegram-none { color: rgba(244,241,234,0.2); }
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
