"use client";
// ─────────────────────────────────────────────────────────────
//  AuthModal — Dark Hermes Gothic style Login / Register Modal
//  ใช้ใน LandingPage เมื่อผู้ใช้คลิก Sign In / Sign Up
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  defaultTab?: "login" | "register";
  onClose: () => void;
}

type Tab = "login" | "register";

interface FormState {
  username: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormState = {
  username: "",
  password: "",
  confirmPassword: "",
};

export default function AuthModal({
  isOpen,
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Reset form on open/tab change
  useEffect(() => {
    setForm(INITIAL_FORM);
    setError("");
    setSuccessMsg("");
    setLoading(false);
  }, [isOpen, tab]);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login ไม่สำเร็จ");
        return;
      }
      saveAuth(data.token, data.user);
      setSuccessMsg("เข้าสู่ระบบสำเร็จ! กำลังพาเข้าสู่ระบบ...");
      // เซ็ต cookie โดยตรงผ่าน document.cookie ก่อน redirect
      // เพิ่ม max-age ให้ชัดเจนและ Secure ไม่จำเป็นสำหรับ localhost
      document.cookie = `dh_auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect");
        
        if (data.user.role === "member") {
          const allowedPages = ["/news", "/charts", "/watchlist", "/overview"];
          const isAllowed = allowedPages.some(page => redirectUrl?.startsWith(page));
          if (redirectUrl && isAllowed) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/news";
          }
        } else {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/dashboard";
          }
        }
      }, 1200);
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับ server ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password ทั้งสองช่องไม่ตรงกัน");
      return;
    }
    if (form.password.length < 6) {
      setError("Password ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }
      saveAuth(data.token, data.user);
      setSuccessMsg("สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ Kairos Tech...");
      // เซ็ต cookie โดยตรงก่อน redirect
      document.cookie = `dh_auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect");
        
        if (data.user.role === "member") {
          const allowedPages = ["/news", "/charts", "/watchlist", "/overview"];
          const isAllowed = allowedPages.some(page => redirectUrl?.startsWith(page));
          if (redirectUrl && isAllowed) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/news";
          }
        } else {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/dashboard";
          }
        }
      }, 1200);
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับ server ได้");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="auth-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
    >
      <div className="auth-modal-box">
        {/* ── HUD corners ── */}
        <div className="hud-corner hud-corner--tl" />
        <div className="hud-corner hud-corner--tr" />
        <div className="hud-corner hud-corner--bl" />
        <div className="hud-corner hud-corner--br" />

        {/* ── Scanline ── */}
        <div className="auth-scanline" />

        {/* ── Header ── */}
        <div className="auth-modal-header">
          <div className="auth-logo">
            <span className="auth-logo-text">Kairos Tech</span>
            <div className="auth-logo-line" />
          </div>
          <button
            className="auth-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Tab switcher ── */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "auth-tab--active" : ""}`}
            onClick={() => setTab("login")}
          >
            // SIGN_IN
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "auth-tab--active" : ""}`}
            onClick={() => setTab("register")}
          >
            // SIGN_UP
          </button>
        </div>

        {/* ── Status bar ── */}
        <div className="auth-status-bar">
          <span className="auth-status-dot" />
          <span className="auth-status-text">
            {tab === "login" ? "PROTOCOL: IDENTIFY" : "PROTOCOL: REGISTER_AGENT"}
          </span>
        </div>

        {/* ── Error / Success ── */}
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="auth-alert auth-alert--success" role="status">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* ── Forms ── */}
        {tab === "login" ? (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-username">
                AGENT_ID
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                className="auth-input"
                placeholder="kairos_trader"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">
                PASS_KEY
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-loading-dot" />
                  <span className="auth-loading-dot" />
                  <span className="auth-loading-dot" />
                </span>
              ) : (
                "AUTHENTICATE →"
              )}
            </button>
            <p className="auth-switch-text">
              ยังไม่มีบัญชี?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => setTab("register")}
              >
                สมัครสมาชิก
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-username">
                AGENT_ID
              </label>
              <input
                id="reg-username"
                name="username"
                type="text"
                className="auth-input"
                placeholder="kairos_trader"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="auth-fields-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-password">
                  PASS_KEY
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-confirm">
                  CONFIRM_KEY
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="auth-submit-btn auth-submit-btn--register"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-loading-dot" />
                  <span className="auth-loading-dot" />
                  <span className="auth-loading-dot" />
                </span>
              ) : (
                "REGISTER AGENT →"
              )}
            </button>
            <p className="auth-switch-text">
              มีบัญชีแล้ว?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => setTab("login")}
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </form>
        )}

        {/* ── Footer meta ── */}
        <div className="auth-footer">
          <span>Kairos Tech v2.4</span>
          <span>SECURE_CHANNEL: ENCRYPTED</span>
        </div>
      </div>

      <style jsx>{`
        /* ── Backdrop ── */
        .auth-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Box ── */
        .auth-modal-box {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: #020202;
          border: 1px solid rgba(132, 204, 22, 0.15);
          padding: 2rem;
          overflow: hidden;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }

        /* ── HUD Corners ── */
        .hud-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: rgba(132, 204, 22, 0.5);
          border-style: solid;
        }
        .hud-corner--tl { top: 0; left: 0; border-width: 1px 0 0 1px; }
        .hud-corner--tr { top: 0; right: 0; border-width: 1px 1px 0 0; }
        .hud-corner--bl { bottom: 0; left: 0; border-width: 0 0 1px 1px; }
        .hud-corner--br { bottom: 0; right: 0; border-width: 0 1px 1px 0; }

        /* ── Scanline ── */
        .auth-scanline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(132, 204, 22, 0.15);
          animation: scanMove 4s linear infinite;
          pointer-events: none;
        }
        @keyframes scanMove {
          0%   { top: 0; }
          100% { top: 100%; }
        }

        /* ── Header ── */
        .auth-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .auth-logo { display: flex; flex-direction: column; gap: 4px; }
        .auth-logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #fff;
          text-shadow: 0 0 12px rgba(212, 175, 55, 0.8);
        }
        .auth-logo-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, rgba(212,175,55,0.6), transparent);
        }
        .auth-close-btn {
          background: transparent;
          border: 1px solid rgba(132, 204, 22, 0.2);
          color: rgba(132, 204, 22, 0.6);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .auth-close-btn:hover {
          border-color: rgba(132, 204, 22, 0.6);
          color: #84cc16;
          background: rgba(132, 204, 22, 0.05);
        }

        /* ── Tabs ── */
        .auth-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(132, 204, 22, 0.1);
        }
        .auth-tab {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(132, 204, 22, 0.4);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.6rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: -1px;
        }
        .auth-tab:hover { color: rgba(132, 204, 22, 0.8); }
        .auth-tab--active {
          color: #84cc16;
          border-bottom-color: #84cc16;
        }

        /* ── Status bar ── */
        .auth-status-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1.25rem;
        }
        .auth-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #84cc16;
          box-shadow: 0 0 8px rgba(132, 204, 22, 0.8);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .auth-status-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          color: rgba(132, 204, 22, 0.6);
        }

        /* ── Alerts ── */
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.6rem 0.75rem;
          margin-bottom: 1rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }
        .auth-alert--error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }
        .auth-alert--success {
          background: rgba(132, 204, 22, 0.08);
          border: 1px solid rgba(132, 204, 22, 0.3);
          color: #84cc16;
        }

        /* ── Form ── */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .auth-fields-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 420px) {
          .auth-fields-row { grid-template-columns: 1fr; }
        }
        .auth-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .auth-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.15em;
          color: rgba(132, 204, 22, 0.6);
          text-transform: uppercase;
        }
        .auth-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(132, 204, 22, 0.15);
          color: #f4f1ea;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.8rem;
          padding: 0.55rem 0.75rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .auth-input::placeholder { color: rgba(132, 204, 22, 0.2); }
        .auth-input:focus {
          border-color: rgba(132, 204, 22, 0.5);
          box-shadow: 0 0 10px rgba(132, 204, 22, 0.08);
        }
        .auth-input:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Submit button ── */
        .auth-submit-btn {
          background: rgba(132, 204, 22, 0.1);
          border: 1px solid rgba(132, 204, 22, 0.4);
          color: #84cc16;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          transition: all 0.25s;
          margin-top: 0.25rem;
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: rgba(132, 204, 22, 0.85);
          color: #000;
          box-shadow: 0 0 20px rgba(132, 204, 22, 0.3);
        }
        .auth-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-submit-btn--register {
          background: rgba(212, 175, 55, 0.08);
          border-color: rgba(212, 175, 55, 0.35);
          color: #d4af37;
        }
        .auth-submit-btn--register:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.85);
          color: #000;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        /* ── Loading dots ── */
        .auth-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .auth-loading-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
          animation: dotBlink 1.2s ease-in-out infinite;
        }
        .auth-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .auth-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBlink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1); }
        }

        /* ── Switch text ── */
        .auth-switch-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          color: rgba(244, 241, 234, 0.35);
          text-align: center;
        }
        .auth-switch-link {
          background: transparent;
          border: none;
          color: rgba(132, 204, 22, 0.7);
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .auth-switch-link:hover { color: #84cc16; }

        /* ── Footer ── */
        .auth-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(132, 204, 22, 0.05);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          color: rgba(132, 204, 22, 0.25);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
