"use client";

import { useTheme } from "./ThemeProvider";

export default function CrimsonBackground() {
  const { theme } = useTheme();

  // Only render the immersive background if Crimson theme is active
  if (theme !== "crimson") return null;

  return (
    <>
      {/* LAYER 1: 100% Native SVG Circuit Board Elements with Running Lights and Pulse Nodes */}
      <svg className="circuit-bg-overlay" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          {/* Base Paths/Traces (Orthogonal 90-degree lines) */}
          <g stroke="#3a1414" strokeWidth="1.2" fill="none">
              {/* Grid lines left area */}
              <path d="M -50,150 H 150 V 350 H 300 V 200 H 450" />
              <path d="M 100,-50 V 100 H 250 V 250 H 120 V 500" />
              {/* Grid lines right area */}
              <path d="M 900,80 H 1100 V 280 H 1250 V 450 H 1500" />
              <path d="M 1050,200 V 350 H 920 V 600" />
              {/* Mid-page distributed traces */}
              <path d="M 200,600 H 400 V 750 H 550 V 900" />
              <path d="M 850,500 V 680 H 700 V 850 H 600" />
          </g>

          {/* Loading / Running Lights Traces Layer */}
          <g stroke="#ef4444" strokeWidth="1.2" fill="none" opacity="0.8">
              <path className="load-line" d="M -50,150 H 150 V 350 H 300 V 200 H 450" />
              <path className="load-line-fast" d="M 900,80 H 1100 V 280 H 1250 V 450 H 1500" />
              <path className="load-line" d="M 850,500 V 680 H 700 V 850 H 600" />
          </g>

          {/* PCB Chips / Component Squares (Stroke only) */}
          <g stroke="#3a1414" strokeWidth="1" fill="none">
              <rect x="140" y="340" width="20" height="20" />
              <rect x="240" y="90" width="20" height="20" />
              <rect x="1090" y="270" width="20" height="20" />
              <rect x="910" y="340" width="20" height="20" />
              <rect x="690" y="670" width="20" height="20" />
          </g>

          {/* Solder Joints / Nodes */}
          {/* Default Dark Solder Nodes (#5a2222) */}
          <g fill="#5a2222">
              <circle cx="150" cy="150" r="3" />
              <circle cx="300" cy="200" r="3" />
              <circle cx="100" cy="100" r="3" />
              <circle cx="120" cy="250" r="3" />
              <circle cx="1100" cy="280" r="3" />
              <circle cx="920" cy="350" r="3" />
              <circle cx="400" cy="750" r="3" />
          </g>
          
          {/* Active Solder Nodes (#ef4444) with CSS Pulse Animation (approx 25%) */}
          <g fill="#ef4444">
              <circle className="active-node" cx="300" cy="350" r="3" />
              <circle className="active-node node-delayed" cx="450" cy="200" r="3" />
              <circle className="active-node" cx="250" cy="250" r="3" />
              <circle className="active-node node-delayed" cx="900" cy="80" r="3" />
              <circle className="active-node" cx="1250" cy="450" r="3" />
              <circle className="active-node node-delayed" cx="700" cy="680" r="3" />
              <circle className="active-node" cx="600" cy="850" r="3" />
          </g>
      </svg>

      {/* LAYER 2: Ambient Background Glow */}
      <div className="ambient-glow"></div>
    </>
  );
}
