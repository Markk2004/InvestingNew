"use client";
// ─────────────────────────────────────────────────────────────
//  LandingPage — Dark Hermes Gothic Landing Page
//  แปลงจาก index.html → React Component
//  มี AuthModal สำหรับ Sign In / Sign Up
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { isLoggedIn, getUser } from "@/lib/auth";
import "@/app/landing.css";

const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});

export default function LandingPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "register">("login");

  // If already logged in, redirect to proper dashboard based on role
  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser();
      if (user?.role === "member") {
        router.replace("/news");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-revealed");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".lp-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const openLogin = () => {
    setModalTab("login");
    setModalOpen(true);
  };
  const openRegister = () => {
    setModalTab("register");
    setModalOpen(true);
  };

  return (
    <>
      <div className="lp-root">
        {/* ── CRT Overlay ── */}
        <div className="lp-crt" />

        {/* ════════════════════════════
            HEADER
        ════════════════════════════ */}
        <header className="lp-header">
          <div className="lp-header-inner">
            <div className="lp-header-spacer" />

            {/* Centered Logo */}
            <div className="lp-header-logo">
              <span className="lp-logo-text">Kairos Tech</span>
            </div>

            {/* Auth Buttons */}
            <div className="lp-header-auth">
              <button onClick={openLogin} className="lp-btn-ghost">
                Sign In
              </button>
              <button onClick={openRegister} className="lp-btn-outline">
                Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* ════════════════════════════
            HERO
        ════════════════════════════ */}
        <main className="lp-main">
          <div className="lp-bg-grid" />

          <section className="lp-hero" id="hero">
            {/* Background image overlay */}
            <div className="lp-hero-bg">
              <div className="lp-hero-bg-img" />
            </div>

            {/* Astrolabe rings (independent layer behind angel and statue) */}
            <div className="lp-astrolabe-container">
              <div className="lp-hero-statue-wrapper">
                <div className="lp-astrolabe">
                  <div className="lp-astro-core">
                    <div className="lp-astro-dot" />
                  </div>
                  <div className="lp-astro-ring lp-astro-ring--1">
                    <div className="lp-astro-star lp-astro-star--top" />
                    <div className="lp-astro-star lp-astro-star--bottom" />
                  </div>
                  <div className="lp-astro-ring lp-astro-ring--2">
                    <div className="lp-astro-star lp-astro-star--left" />
                    <div className="lp-astro-star lp-astro-star--right" />
                  </div>
                  <div className="lp-astro-ring lp-astro-ring--3">
                    <div className="lp-astro-star lp-astro-star--tl" />
                    <div className="lp-astro-star lp-astro-star--br" />
                  </div>
                  <div className="lp-astro-ring lp-astro-ring--4">
                    <div className="lp-astro-star lp-astro-star--tr" />
                    <div className="lp-astro-star lp-astro-star--bl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Left angel */}
            <div className="lp-hero-angel">
              <div className="lp-hero-angel-img" />
            </div>

            {/* Right: Statue only */}
            <div className="lp-hero-right">
              <div className="lp-hero-statue-wrapper">
                {/* Statue silhouette (opaque mask) */}
                <div className="lp-statue-mask" />
                {/* Statue blended */}
                <div className="lp-statue-blend" />
              </div>
            </div>

            {/* Hero content */}
            <div className="lp-hero-content">
              <div className="lp-hero-text">
                <div className="lp-hero-blur-box">
                  <div className="lp-cta-corner lp-cta-corner--tl" />
                  <div className="lp-cta-corner lp-cta-corner--tr" />
                  <div className="lp-cta-corner lp-cta-corner--bl" />
                  <div className="lp-cta-corner lp-cta-corner--br" />
                  <h1 className="lp-hero-title-new lp-title-desktop">
                    It's never too late to learn.
                  </h1>
                  <h1 className="lp-hero-title-new lp-title-mobile">
                    Welcome KairosTech
                  </h1>

                  {/* Mobile Auth Buttons */}
                  <div className="lp-hero-auth-mobile">
                    <button onClick={openLogin} className="lp-btn-ghost lp-btn-ghost--mobile">
                      Sign In
                    </button>
                    <button onClick={openRegister} className="lp-btn-outline lp-btn-outline--mobile">
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Smoke bottom */}
            <div className="lp-smoke">
              <div className="lp-smoke-gradient" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero/smoke_dark.png" alt="" className="lp-smoke-img" />
            </div>
          </section>

          {/* ════════════════════════════
              FEATURES
          ════════════════════════════ */}
          <section className="lp-section" id="features">
            <div className="lp-container">
              <div className="lp-section-header">
                <div>
                  <h2 className="lp-section-eyebrow">// MODULE: AGENT_CAPABILITIES</h2>
                  <h3 className="lp-section-title">Core Capabilities</h3>
                </div>
                <div className="lp-section-meta">
                  <span>[ PROTOCOLS: 06_ACTIVE ]</span>
                  <span>[ INTEGRITY: NOMINAL ]</span>
                </div>
              </div>

              <div className="lp-grid-3">
                {[
                  {
                    num: "#01",
                    img: "/images/features/features_connect.png",
                    title: "Market Radar",
                    tag: "Live Feed & Alerts",
                    desc: "เชื่อมต่อทุกกระแสการลงทุน สตรีมราคาหุ้นและแจ้งเตือนข่าวสารด่วนแบบเรียลไทม์ผ่าน Telegram, Discord และ Email",
                  },
                  {
                    num: "#02",
                    img: "/images/features/features_remember.png",
                    title: "Data Vault",
                    tag: "Historical Analysis",
                    desc: "บันทึกทุกความเคลื่อนไหวใน Watchlist ของคุณ วิเคราะห์พฤติกรรมราคาในอดีตและเรียนรู้สไตล์การลงทุน",
                  },
                  {
                    num: "#03",
                    img: "/images/features/features_schedule.png",
                    title: "Briefing",
                    tag: "Focused Automation",
                    desc: "ตั้งเวลาสรุปข่าวสารรายวันก่อนตลาดเปิด ดึงข้อมูลปฏิทินเศรษฐกิจ แจ้งเตือนวันประกาศงบการเงินโดยอัตโนมัติ",
                  },
                  {
                    num: "#04",
                    img: "/images/features/features_delegate.png",
                    title: "Screener",
                    tag: "Deep Sector Scanning",
                    desc: "กระจายคำสั่งบอทย่อย (Subagents) เพื่อสแกนเจาะลึกในแต่ละเซกเตอร์ คัดกรองหุ้นตามเงื่อนไขทางเทคนิคและปัจจัยพื้นฐาน",
                  },
                  {
                    num: "#05",
                    img: "/images/features/features_search.png",
                    title: "Sentiment",
                    tag: "Global News Index",
                    desc: "กวาดข่าวสารการเงินจากหน้าเว็บและโซเชียลทั่วโลก วิเคราะห์อารมณ์ตลาด (Market Sentiment) แบบเรียลไทม์",
                  },
                  {
                    num: "#06",
                    img: "/images/features/features_experiment.png",
                    title: "Backtest",
                    tag: "Isolated Sandboxing",
                    desc: "สนามจำลองเทรดไร้ความเสี่ยง (Paper Trading) ทดสอบกลยุทธ์การลงทุนย้อนหลังด้วยข้อมูลจริง",
                  },
                ].map((card) => (
                  <div key={card.num} className="lp-reveal lp-feature-card">
                    <div className="lp-card-img-wrap">
                      <div className={`lp-card-img lp-card-img--feat${card.num.slice(1)}`} />
                      <div className="lp-card-img-grid" />
                      <div className="lp-card-crosshair">
                        <div className="lp-card-crosshair-dot" />
                      </div>
                    </div>
                    <div className="lp-card-body">
                      <div className="lp-card-head">
                        <span className="lp-card-num">{card.num}</span>
                        <h4 className="lp-card-title">{card.title}</h4>
                      </div>
                      <span className="lp-card-tag">{card.tag}</span>
                      <p className="lp-card-desc">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════
              DARK INVEST
          ════════════════════════════ */}
          <section className="lp-dark-invest" id="dark-invest">
            <div className="lp-di-bg-text" aria-hidden="true">
              <div>DARK</div>
              <div>INVEST</div>
            </div>
            <div className="lp-di-glow lp-di-glow--left" />
            <div className="lp-di-glow lp-di-glow--right" />

            <div className="lp-container lp-di-inner">
              <div className="lp-di-grid">
                <div className="lp-reveal lp-di-text">
                  <span className="lp-di-tier">MEMBER &bull; OWNER</span>
                  <h3 className="lp-di-title">DARK INVEST</h3>
                  <p className="lp-di-desc">
                    DECRYPT THE FUTURES. PROTOCOL ACCESS UNLOCKS HIGH-FREQUENCY SIGNAL ROUTING,
                    ZERO-CONTEXT QUANT PIPELINES, AND MULTI-CHAIN HUD METRICS.
                  </p>
                  <button onClick={openRegister} className="lp-di-btn">
                    เริ่มต้นฟรี →
                  </button>
                </div>
                <div className="lp-reveal lp-di-image">
                  <div className="lp-di-img-frame">
                    <div className="lp-di-img-corner lp-di-img-corner--tl" />
                    <div className="lp-di-img-corner lp-di-img-corner--br" />
                    <div className="lp-di-img" />
                    <div className="lp-di-img-overlay" />
                  </div>
                </div>
              </div>
              <div className="lp-di-footer">
                <span className="lp-di-ver">DARK INVEST V1</span>
              </div>
            </div>
          </section>

          {/* ════════════════════════════
              NEWS & BULLETINS
          ════════════════════════════ */}
          <section className="lp-section lp-section--border" id="bulletins">
            <div className="lp-bg-grid lp-bg-grid--sm" />
            <div className="lp-container">
              <div className="lp-section-header lp-section-header--news">
                <div>
                  <h2 className="lp-section-eyebrow">// MODULE: SYSTEM_BULLETINS</h2>
                  <h3 className="lp-section-title">News &amp; Daily Updates</h3>
                  <p className="lp-section-sub">ประกาศข่าวสารการลงทุนและการแจ้งเตือนอัปเดตระบบประจำวัน</p>
                </div>
                <div className="lp-news-nav">
                  <button className="lp-news-nav-btn">&lt; PREV</button>
                  <button className="lp-news-nav-btn">NEXT &gt;</button>
                </div>
              </div>

              <div className="lp-grid-3">
                {[
                  {
                    date: "2026-06-20 // BULLETIN_01",
                    title: "Core Grid Decryption",
                    tag: "SYSTEM UPGRADE",
                    patch: "PATCH: v2.4.2",
                    bulletinClass: "lp-card-img--bulletin01",
                    desc: "อัปเดตระบบโครงสร้างพื้นฐานเครือข่าย ซิงค์สัญญาณเสร็จสมบูรณ์ 100% เพิ่มเสถียรภาพความเร็วในการสตรีมสัญญาณดัชนีราคาจากตลาดหลักทั่วโลก",
                  },
                  {
                    date: "2026-06-20 // BULLETIN_02",
                    title: "Macro Sentiment Engine",
                    tag: "AI ANALYSIS",
                    patch: "MODEL: SENTIMENT_v2.5",
                    bulletinClass: "lp-card-img--bulletin02",
                    desc: "เปิดใช้งานโมดูลวิเคราะห์อารมณ์ตลาด เจาะลึกแหล่งข่าวสารการเงินระดับโลกและสื่อโซเชียลชั้นนำ ประมวลผลดัชนีความกังวลแบบเรียลไทม์",
                  },
                  {
                    date: "2026-06-20 // BULLETIN_03",
                    title: "Sandbox Security Opt",
                    tag: "SECURITY HARDENING",
                    patch: "SANDBOX: SECURED",
                    bulletinClass: "lp-card-img--bulletin03",
                    desc: "ยกระดับความปลอดภัยระบบจำลองการลงทุนขั้นสูง เสริมเกราะป้องกันสปายบอทและการดึงข้อมูลโดยไม่ได้รับอนุญาต",
                  },
                ].map((news) => (
                  <div key={news.date} className="lp-reveal lp-feature-card">
                    <div className="lp-card-img-wrap lp-card-img-wrap--cover">
                      <div className={`lp-card-img lp-card-img--cover ${news.bulletinClass}`} />
                      <div className="lp-card-img-grid" />
                      <div className="lp-card-crosshair">
                        <div className="lp-card-crosshair-dot" />
                      </div>
                    </div>
                    <div className="lp-card-body">
                      <span className="lp-card-num lp-card-num--sm">{news.date}</span>
                      <h4 className="lp-card-title">{news.title}</h4>
                      <span className="lp-card-tag">{news.tag}</span>
                      <p className="lp-card-desc">{news.desc}</p>
                      <div className="lp-card-footer">
                        <span>{news.patch}</span>
                        <span className="lp-card-ver">SYS_BULLETIN_v1.0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ════════════════════════════
            FOOTER
        ════════════════════════════ */}
        <footer className="lp-footer">
          <div className="lp-footer-stream" />
          <div className="lp-footer-inner">
            <div className="lp-footer-left">
              <span className="lp-footer-square" />
              <p>© 2026 KAIROS TECH. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="lp-footer-right">
              <div className="lp-footer-stat">
                <span className="lp-footer-stat-label">DATA STREAM</span>
                <span>|||||||||||||||||||| 100%</span>
              </div>
              <div className="lp-footer-stat">
                <span className="lp-footer-stat-label">VER. 2.4.1</span>
                <span>SYS_STABLE</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Auth Modal ── */}
      <AuthModal
        isOpen={modalOpen}
        defaultTab={modalTab}
        onClose={() => setModalOpen(false)}
      />


    </>
  );
}
