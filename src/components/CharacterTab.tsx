"use client";

// ─────────────────────────────────────────────────────────────
//  CharacterTab — Character Customization Room
//  Mannequin display with layered outfit overlays + inventory grid
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import CharacterSprite, {
  OutfitConfig,
  HatStyle,
  ShirtStyle,
  AccessoryStyle,
  EffectStyle,
} from "@/components/CharacterSprite";

// ── Item Definitions ───────────────────────────────────────────────────────────

interface Item<T extends string> {
  id: T;
  label: string;
  emoji: string;
  statBonus: Partial<Stats>;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Stats {
  style: number;
  confidence: number;
  luck: number;
}

const RARITY_COLORS: Record<string, string> = {
  common:    "#94a3b8",
  rare:      "#60a5fa",
  epic:      "#c084fc",
  legendary: "#fbbf24",
};

const HATS: Item<HatStyle>[] = [
  { id:"none",    label:"No Hat",    emoji:"○",  statBonus:{ style:0  }, rarity:"common"   },
  { id:"cap-blue",label:"Blue Cap",  emoji:"🧢", statBonus:{ style:5, confidence:2 }, rarity:"common"   },
  { id:"cap-red", label:"Red Cap",   emoji:"🔴", statBonus:{ style:6, luck:1       }, rarity:"rare"     },
  { id:"tophat",  label:"Top Hat",   emoji:"🎩", statBonus:{ style:12,confidence:8 }, rarity:"epic"     },
  { id:"wizard",  label:"Wizard Hat",emoji:"✨", statBonus:{ style:15,luck:20      }, rarity:"legendary"},
];

const SHIRTS: Item<ShirtStyle>[] = [
  { id:"none",         label:"Default Suit", emoji:"💼", statBonus:{ confidence:5 }, rarity:"common" },
  { id:"tee-gray",     label:"Casual Tee",   emoji:"👕", statBonus:{ style:3      }, rarity:"common" },
  { id:"hoodie-green", label:"Green Hoodie", emoji:"🟢", statBonus:{ style:8,luck:3}, rarity:"rare"  },
];

const ACCESSORIES: Item<AccessoryStyle>[] = [
  { id:"none",       label:"None",        emoji:"○",  statBonus:{}, rarity:"common" },
  { id:"glasses",    label:"Blue Glasses",emoji:"🥽", statBonus:{ confidence:6, style:4 }, rarity:"rare"     },
  { id:"sunglasses", label:"Gold Shades", emoji:"😎", statBonus:{ style:10, luck:5      }, rarity:"epic"     },
  { id:"bow",        label:"Bow Tie",     emoji:"🎀", statBonus:{ confidence:8, style:7  }, rarity:"rare"     },
];

const EFFECTS: Item<EffectStyle>[] = [
  { id:"none",    label:"None",    emoji:"○",  statBonus:{}, rarity:"common"   },
  { id:"sparkle", label:"Sparkle", emoji:"✨", statBonus:{ luck:8              }, rarity:"rare"     },
  { id:"aura",    label:"Aura",    emoji:"🌀", statBonus:{ style:12, luck:15   }, rarity:"legendary"},
];

const BASE_STATS: Stats = { style: 10, confidence: 10, luck: 10 };
const MAX_STAT = 60;

function calcStats(outfit: OutfitConfig): Stats {
  const all: Partial<Stats>[] = [
    HATS.find(h => h.id === (outfit.hat ?? "cap-blue"))?.statBonus ?? {},
    SHIRTS.find(s => s.id === (outfit.shirt ?? "none"))?.statBonus ?? {},
    ACCESSORIES.find(a => a.id === (outfit.accessory ?? "glasses"))?.statBonus ?? {},
    EFFECTS.find(e => e.id === (outfit.effect ?? "none"))?.statBonus ?? {},
  ];
  return all.reduce<Stats>(
    (acc, b) => ({
      style:      acc.style      + (b.style      ?? 0),
      confidence: acc.confidence + (b.confidence ?? 0),
      luck:       acc.luck       + (b.luck       ?? 0),
    }),
    { ...BASE_STATS }
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, (value / MAX_STAT) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ color:"#94a3b8", fontSize:8, fontFamily:"monospace", letterSpacing:1 }}>{label}</span>
        <span style={{ color, fontSize:9, fontFamily:"monospace", fontWeight:700 }}>{value}</span>
      </div>
      <div style={{ height:6, background:"#0d0d2b", border:"1px solid #3a3a6e", position:"relative" }}>
        <div
          style={{
            position:"absolute", left:0, top:0, height:"100%",
            width:`${pct}%`,
            background: color,
            boxShadow:`0 0 6px ${color}`,
            transition:"width 0.4s ease",
          }}
        />
        {/* Pixel notches */}
        {[25,50,75].map(p => (
          <div key={p} style={{ position:"absolute", left:`${p}%`, top:0, width:1, height:"100%", background:"rgba(0,0,0,0.4)" }} />
        ))}
      </div>
    </div>
  );
}

function ItemGrid<T extends string>({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: Item<T>[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ color:"#475569", fontSize:7, letterSpacing:2, fontFamily:"monospace", marginBottom:5 }}>
        {title}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
        {items.map(item => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={isSelected ? "equip-selected" : ""}
              style={{
                width:44, height:44,
                background: isSelected ? "rgba(255,215,64,0.08)" : "#0a0a1a",
                border: `2px solid ${isSelected ? RARITY_COLORS[item.rarity] : "#1e2a3a"}`,
                cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:2,
                transition:"all 0.15s ease",
                position:"relative",
              }}
            >
              <span style={{ fontSize:16, lineHeight:1 }}>{item.emoji}</span>
              <span style={{
                fontSize:5,
                color: isSelected ? RARITY_COLORS[item.rarity] : "#475569",
                fontFamily:"monospace",
                lineHeight:1,
                textAlign:"center",
              }}>
                {item.label.split(" ").map(w => w.slice(0,4)).join(" ")}
              </span>
              {/* Rarity dot */}
              <div style={{
                position:"absolute", top:2, right:2,
                width:4, height:4, borderRadius:"50%",
                background: RARITY_COLORS[item.rarity],
                boxShadow:`0 0 4px ${RARITY_COLORS[item.rarity]}`,
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main CharacterTab ──────────────────────────────────────────────────────────

interface CharacterInfo {
  name: string;
  role: string;
  color: string;
}

const CHARACTERS: CharacterInfo[] = [
  { name: "Mark",        role: "trader",  color: "#a8d8ea" },
  { name: "Gemini",      role: "quant",   color: "#f9c784" },
  { name: "NewInvester", role: "analyst", color: "#b0e0a8" },
];

export default function CharacterTab({
  outfits,
  setOutfits,
}: {
  outfits: Record<string, OutfitConfig>;
  setOutfits: React.Dispatch<React.SetStateAction<Record<string, OutfitConfig>>>;
}) {
  const [selectedChar, setSelectedChar] = useState<string>("Mark");
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number>(0);
  const [tempOutfit, setTempOutfit] = useState<OutfitConfig>({
    hat:       "none",
    shirt:     "none",
    accessory: "none",
    effect:    "none",
  });
  const [isSaved, setIsSaved] = useState(false);

  // Sync tempOutfit when selectedChar changes
  useEffect(() => {
    if (outfits[selectedChar]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempOutfit(outfits[selectedChar]);
    }
  }, [selectedChar, outfits]);

  // Advance animation frame
  useEffect(() => {
    let last = 0;
    const tick = (ts: number) => {
      if (ts - last > 120) { // ~8fps pixel-art feel
        setFrame(f => f + 1);
        last = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const stats = calcStats(tempOutfit);

  const setHat    = (id: HatStyle)       => setTempOutfit(o => ({ ...o, hat:       id }));
  const setShirt  = (id: ShirtStyle)     => setTempOutfit(o => ({ ...o, shirt:     id }));
  const setAcc    = (id: AccessoryStyle) => setTempOutfit(o => ({ ...o, accessory: id }));
  const setEffect = (id: EffectStyle)    => setTempOutfit(o => ({ ...o, effect:    id }));

  const handleSave = () => {
    setOutfits(prev => ({
      ...prev,
      [selectedChar]: tempOutfit
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Selected item labels for display
  const hatItem  = HATS.find(h => h.id === (tempOutfit.hat ?? "none")) || HATS[0];
  const accItem  = ACCESSORIES.find(a => a.id === (tempOutfit.accessory ?? "none")) || ACCESSORIES[0];

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0a1a 0%, #040c18 50%, #050510 100%)",
      }}
    >
      {/* ── Left: Mannequin Stage ── */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRight: "1px solid #1e2a3a",
          overflow: "hidden",
        }}
      >
        {/* Stage grid background */}
        <div
          style={{
            position:"absolute", inset:0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
            backgroundSize:"24px 24px",
          }}
        />
        {/* Ambient glow */}
        <div
          style={{
            position:"absolute",
            width:200, height:200,
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(79,195,247,0.08) 0%, transparent 70%)",
            bottom:"20%", left:"50%", transform:"translateX(-50%)",
          }}
        />

        {/* Stage label */}
        <div
          style={{
            position:"absolute", top:16, left:"50%", transform:"translateX(-50%)",
            color:"#1e3a5f", fontSize:8, fontFamily:"monospace", letterSpacing:3, whiteSpace:"nowrap",
          }}
        >
          ◈ DRESSING ROOM ◈
        </div>

        {/* Character */}
        <div className="animate-character-float" style={{ position:"relative", zIndex:2 }}>
          <CharacterSprite
            character="newinvester"
            state="idle"
            isWalking={false}
            frame={frame}
            outfit={tempOutfit}
            style={{ height: 240 }}
          />
        </div>

        {/* Shadow under character */}
        <div
          style={{
            width:80, height:8, borderRadius:"50%",
            background:"rgba(0,0,0,0.5)",
            filter:"blur(4px)",
            marginTop:-16,
            position:"relative", zIndex:1,
          }}
        />

        {/* Equipped label / Save Button */}
        <div
          style={{
            position:"absolute", bottom:20,
            display:"flex", flexDirection: "column", gap:8, alignItems:"center",
            width: "80%",
          }}
        >
          {isSaved ? (
            <div
              style={{
                background: "#15803d",
                border: "1px solid #22c55e",
                color: "#22c55e",
                fontSize: 8,
                fontWeight: "bold",
                fontFamily: "monospace",
                padding: "6px 16px",
                boxShadow: "0 0 10px #22c55e",
                animation: "equipPulse 0.4s infinite alternate",
                letterSpacing: 2,
                textAlign: "center",
                width: "100%",
              }}
            >
              ✓ OUTFIT SAVED!
            </div>
          ) : (
            <button
              onClick={handleSave}
              style={{
                background: "#7c3aed",
                border: "2px solid #a78bfa",
                color: "#ffffff",
                fontSize: 8,
                fontWeight: "bold",
                fontFamily: "monospace",
                padding: "8px 24px",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(167,139,250,0.3)",
                transition: "all 0.15s ease",
                letterSpacing: 2,
                width: "100%",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#6d28d9";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(167,139,250,0.5)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#7c3aed";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(167,139,250,0.3)";
              }}
            >
              CONFIRM & SAVE
            </button>
          )}

          <div style={{ display: "flex", gap: 6, width: "100%" }}>
            <div style={{ flex: 1, textAlign:"center", background:"#040c18", border:"1px solid #1e3a5f", padding:"3px 4px" }}>
              <div style={{ color:"#475569", fontSize:6, fontFamily:"monospace" }}>HAT</div>
              <div style={{ color: RARITY_COLORS[hatItem.rarity], fontSize:7, fontFamily:"monospace" }}>
                {hatItem.emoji} {hatItem.label}
              </div>
            </div>
            <div style={{ flex: 1, textAlign:"center", background:"#040c18", border:"1px solid #1e3a5f", padding:"3px 4px" }}>
              <div style={{ color:"#475569", fontSize:6, fontFamily:"monospace" }}>ACC</div>
              <div style={{ color: RARITY_COLORS[accItem.rarity], fontSize:7, fontFamily:"monospace" }}>
                {accItem.emoji} {accItem.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Inventory + Stats ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Character Slots Grid */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #1e2a3a",
            background: "#060d1a",
            flexShrink: 0,
          }}
        >
          <div style={{ color:"#3b82f6", fontSize:9, fontFamily:"monospace", letterSpacing:2, marginBottom:10 }}>
            ◈ SELECT CHARACTER TO CUSTOMIZE
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
            {CHARACTERS.map(char => {
              const isSelected = char.name === selectedChar;
              const charOutfit = outfits[char.name] || {};
              return (
                <button
                  key={char.name}
                  onClick={() => setSelectedChar(char.name)}
                  style={{
                    background: isSelected ? "rgba(192,132,252,0.08)" : "#040c18",
                    border: `2px solid ${isSelected ? "#c084fc" : "#1e2a3a"}`,
                    borderRadius: 4,
                    padding: "6px 4px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 0 10px rgba(192,132,252,0.25)" : "none",
                  }}
                >
                  <div style={{ color: isSelected ? "#c084fc" : "#94a3b8", fontSize: 8, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1 }}>
                    {char.name.toUpperCase()}
                  </div>
                  {/* Miniature live character preview */}
                  <div style={{ height: 44, display: "flex", alignItems: "flex-end", overflow: "hidden", margin: "4px 0" }}>
                    <CharacterSprite
                      character="newinvester"
                      state="idle"
                      isWalking={false}
                      frame={frame}
                      outfit={charOutfit}
                      style={{ height: 60, transform: "scale(0.65)", transformOrigin: "bottom center" }}
                    />
                  </div>
                  <div style={{ color: "#475569", fontSize: 6, fontFamily: "monospace", textTransform: "uppercase" }}>
                    {char.role}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Panel */}
        <div
          style={{
            background:"#060d1a",
            borderBottom:"1px solid #1e2a3a",
            padding:"12px 16px",
            flexShrink:0,
          }}
        >
          <div style={{ color:"#3b82f6", fontSize:9, fontFamily:"monospace", letterSpacing:2, marginBottom:10 }}>
            ◈ {selectedChar.toUpperCase()}&apos;S STATS
          </div>
          <StatBar label="STYLE"      value={stats.style}      color="#c084fc" />
          <StatBar label="CONFIDENCE" value={stats.confidence} color="#60a5fa" />
          <StatBar label="LUCK"       value={stats.luck}       color="#fbbf24" />
        </div>

        {/* Inventory Grid */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
          <div style={{ color:"#3b82f6", fontSize:9, fontFamily:"monospace", letterSpacing:2, marginBottom:10 }}>
            ◈ WARDROBE
          </div>

          <ItemGrid title="● HATS"        items={HATS}        selected={tempOutfit.hat        ?? "none"} onSelect={setHat}    />
          <ItemGrid title="● SHIRTS"      items={SHIRTS}      selected={tempOutfit.shirt       ?? "none"} onSelect={setShirt}  />
          <ItemGrid title="● ACCESSORIES" items={ACCESSORIES} selected={tempOutfit.accessory   ?? "none"} onSelect={setAcc}    />
          <ItemGrid title="● EFFECTS"     items={EFFECTS}     selected={tempOutfit.effect      ?? "none"} onSelect={setEffect} />

          {/* Rarity Legend */}
          <div style={{ marginTop:16, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ color:"#475569", fontSize:7, fontFamily:"monospace" }}>RARITY:</span>
            {Object.entries(RARITY_COLORS).map(([k,c]) => (
              <span key={k} style={{ display:"flex", alignItems:"center", gap:3 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:c, boxShadow:`0 0 4px ${c}`, display:"inline-block" }} />
                <span style={{ color:c, fontSize:7, fontFamily:"monospace" }}>{k}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
