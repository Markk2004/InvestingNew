"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";
import { User, Shield, LogOut, Save, Smartphone } from "lucide-react";
import ResponsiveDashboard from "@/components/ResponsiveDashboard";

interface ProfileData {
  userId: number;
  username: string;
  avatarStyle: string;
  tier: string;
  role: string;
  xp: number;
  telegramName: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  
  // Form states
  const [telegramName, setTelegramName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setTelegramName(data.telegramName || "");
      } else {
        setError(data.error || "Failed to load profile.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ telegramName: telegramName.trim() })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("UPDATE SUCCESSFUL");
        setProfile(prev => prev ? { ...prev, telegramName: telegramName.trim() } : null);
      } else {
        showToast(`ERROR: ${data.error}`);
      }
    } catch {
      showToast("ERROR: Network failure");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveDashboard activeTab="menu" setActiveTab={() => {}} contentClassName="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[#050508] flex items-center justify-center font-mono">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#84cc16] text-xs tracking-widest animate-pulse">LOADING PROFILE...</span>
          </div>
        </div>
      </ResponsiveDashboard>
    );
  }

  return (
    <ResponsiveDashboard activeTab="menu" setActiveTab={() => {}} contentClassName="flex-1 overflow-hidden flex flex-col relative">
      <div className="flex-1 flex flex-col bg-[#050508] overflow-hidden font-mono text-[#f4f1ea] pb-safe">
        {/* Header */}
        <div className="flex-shrink-0 bg-[#0a0a0f] border-b border-[#84cc16]/20">
          <div className="h-14 flex items-center justify-center relative">
            <div className="text-sm font-bold text-[#84cc16] tracking-[0.2em]">SYSTEM SETTINGS</div>
            <div className="absolute right-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 text-xs rounded">
              ⚠ {error}
            </div>
          )}

          {profile && (
            <>
              {/* Dossier Card */}
              <div className="flex flex-col items-center bg-white/[0.02] border border-white/10 rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#84cc16] to-transparent opacity-50" />
                
                <div className="w-16 h-16 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center justify-center mb-4">
                  <User size={32} className="text-[#84cc16]" />
                </div>
                
                <h2 className="text-xl font-bold text-white tracking-wider mb-1">{profile.username}</h2>
                <div className="flex gap-2 text-[10px] text-white/50 mb-4">
                  <span>ID: #{profile.userId}</span>
                  <span>•</span>
                  <span className="text-[#84cc16]">XP: {profile.xp.toLocaleString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded text-[9px] border tracking-widest ${profile.role === 'owner' ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]' : 'bg-[#84cc16]/10 border-[#84cc16]/30 text-[#84cc16]'}`}>
                    ROLE: {profile.role.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded text-[9px] border bg-blue-500/10 border-blue-500/30 text-blue-400 tracking-widest">
                    TIER: {profile.tier}
                  </span>
                </div>
              </div>

              {/* Config Sections */}
              <div className="flex flex-col gap-4">
                
                {/* Identity */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#84cc16]/70 tracking-widest flex items-center gap-1">
                    <Shield size={12} /> IDENTITY [LOCKED]
                  </span>
                  <div className="bg-[#0a0a0f] border border-white/5 rounded p-3">
                    <label className="text-[9px] text-white/30 block mb-1">USERNAME</label>
                    <input 
                      type="text" 
                      value={profile.username} 
                      disabled 
                      className="w-full bg-transparent text-sm text-white/50 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Connections */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#84cc16]/70 tracking-widest flex items-center gap-1">
                    <Smartphone size={12} /> CONNECTIONS
                  </span>
                  <div className="bg-[#0a0a0f] border border-white/10 rounded p-3 focus-within:border-[#84cc16]/50 transition-colors">
                    <label className="text-[9px] text-white/50 block mb-1">TELEGRAM HANDLE</label>
                    <input 
                      type="text" 
                      value={telegramName} 
                      onChange={(e) => setTelegramName(e.target.value)}
                      placeholder="@your_telegram"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    />
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    disabled={saving || telegramName === (profile.telegramName || "")}
                    className="mt-1 flex items-center justify-center gap-2 w-full bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] py-3 rounded text-xs tracking-widest disabled:opacity-30 transition-all hover:bg-[#84cc16]/20"
                  >
                    {saving ? (
                      <div className="w-3 h-3 border border-t-transparent border-[#84cc16] rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? "SAVING..." : "UPDATE PROFILE"}
                  </button>
                </div>

                {/* System */}
                <div className="flex flex-col gap-2 mt-4">
                  <span className="text-[10px] text-red-500/70 tracking-widest flex items-center gap-1">
                    <LogOut size={12} /> SYSTEM
                  </span>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to log out?")) {
                        logout();
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-red-500/10 border border-red-500/30 text-red-500 py-3 rounded text-xs tracking-widest transition-all hover:bg-red-500/20"
                  >
                    <LogOut size={14} />
                    TERMINATE SESSION (LOGOUT)
                  </button>
                </div>
                
              </div>
            </>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-6 right-4 left-4 bg-[#0a0a0f] border border-[#84cc16]/50 text-[#84cc16] text-xs px-4 py-3 shadow-[0_0_20px_rgba(132,204,22,0.1)] z-50 rounded text-center">
            {toast}
          </div>
        )}
      </div>
    </ResponsiveDashboard>
  );
}
