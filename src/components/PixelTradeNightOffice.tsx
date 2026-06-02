"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
type AgentAction = "idle" | "typing" | "walking" | "thinking";
interface Agent {
  name: string; role: string; x: number; y: number;
  tx: number; ty: number; action: AgentAction; color: string; t: number;
}
interface Zone { label: string; x: number; y: number; w: number; h: number; }

const W = 900, H = 560;

const INITIAL_AGENTS: Agent[] = [
  { name:"Pip",  role:"trader",  x:220, y:320, tx:220, ty:320, action:"idle",    color:"#a8d8ea", t:0 },
  { name:"Mara", role:"quant",   x:460, y:360, tx:460, ty:360, action:"typing",  color:"#f9c784", t:0 },
  { name:"Dex",  role:"analyst", x:490, y:450, tx:490, ty:450, action:"walking", color:"#b0e0a8", t:0 },
  { name:"Iris", role:"signal",  x:490, y:540, tx:490, ty:540, action:"idle",    color:"#dbb8ff", t:0 },
  { name:"Otis", role:"senior",  x:580, y:310, tx:580, ty:310, action:"thinking",color:"#f7a8b8", t:0 },
  { name:"Fern", role:"ops",     x:750, y:470, tx:750, ty:470, action:"walking", color:"#80cbc4", t:0 },
];

const ZONES: Zone[] = [
  { label:"R&D",      x:270, y:295, w:130, h:80 },
  { label:"TRADING",  x:195, y:490, w:90,  h:50 },
  { label:"ANALYTICS",x:295, y:475, w:100, h:50 },
  { label:"SIGNALS",  x:490, y:495, w:95,  h:50 },
  { label:"DEALS",    x:770, y:278, w:80,  h:55 },
  { label:"MACRO",    x:580, y:155, w:60,  h:40 },
  { label:"SEARCH",   x:800, y:445, w:65,  h:40 },
];

// ── Drawing helpers ────────────────────────────────────────────────────────
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, alpha = 1) {
  ctx.globalAlpha = alpha; ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
}

function drawFloor(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, W, H, "#04090f");
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 18; col++) {
      ctx.fillStyle = (row+col)%2===0 ? "#081422" : "#091626";
      ctx.fillRect(col*52, 178+row*22, 52, 22);
    }
  }
  ctx.strokeStyle = "#060f1e"; ctx.lineWidth = 0.5;
  for (let row = 0; row < 14; row++) { ctx.beginPath(); ctx.moveTo(0,178+row*22); ctx.lineTo(W,178+row*22); ctx.stroke(); }
  for (let col = 0; col < 18; col++) { ctx.beginPath(); ctx.moveTo(col*52,178); ctx.lineTo(col*52,H); ctx.stroke(); }
}

function drawWall(ctx: CanvasRenderingContext2D, frame: number) {
  px(ctx, 0, 0, W, 182, "#071120");
  px(ctx, 0, 0, W, 8, "#030810");
  [90,230,390,560,720,860].forEach(x => {
    px(ctx, x-28, 4, 56, 6, "#0d1f35");
    const sc = 0.8 + 0.2*Math.sin(frame*0.04+x*0.01);
    ctx.fillStyle = `rgba(200,225,255,${0.75*sc})`; ctx.fillRect(x-26,6,52,3);
  });
  // city window
  px(ctx, 547, 15, 206, 136, "#0a1f3a");
  px(ctx, 550, 18, 200, 130, "#060f1e");
  px(ctx, 547, 81, 206, 4, "#0d2040");
  px(ctx, 648, 15, 4, 136, "#0d2040");
  const silBlds = [[554,48,16,80],[572,30,18,98],[592,52,12,76],[606,34,14,94],[624,46,16,82],[642,22,20,106],[666,40,14,88],[682,62,12,66],[698,32,16,96],[716,50,14,78]];
  silBlds.forEach(([bx,by,bw,bh]) => px(ctx, bx, by, bw, bh, "#030810"));
  [[558,58,"#fbbf24"],[576,40,"#93c5fd"],[596,64,"#fff"],[612,45,"#fde68a"],[630,35,"#93c5fd"],
   [646,55,"#fbbf24"],[668,50,"#fff"],[684,72,"#fde68a"],[702,44,"#93c5fd"],[718,62,"#fbbf24"]].forEach(([lx,ly,lc],i) => {
    ctx.fillStyle = lc as string; ctx.globalAlpha = 0.4+0.5*Math.sin(frame*0.08+i*1.3);
    ctx.fillRect(lx as number, ly as number, 2, 2); ctx.globalAlpha = 1;
  });
  // moon
  ctx.fillStyle="#cce0ff"; ctx.globalAlpha=0.9; ctx.beginPath(); ctx.arc(707,32,8,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle="#060f1e"; ctx.beginPath(); ctx.arc(704,30,7,0,Math.PI*2); ctx.fill();
  // lamps
  [88,298,500,750,855].forEach(lx => {
    px(ctx, lx-1, 10, 3, 30, "#0d1f35");
    px(ctx, lx-6, 38, 13, 4, "#0d1f35");
    const lg = 0.7+0.3*Math.sin(frame*0.06+lx);
    ctx.fillStyle=`rgba(255,190,80,${lg*0.9})`; ctx.beginPath(); ctx.ellipse(lx+0.5,40,6,4,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=`rgba(255,190,80,${lg*0.05})`; ctx.beginPath(); ctx.ellipse(lx+0.5,55,24,28,0,0,Math.PI*2); ctx.fill();
  });
}

function drawMarketBoard(ctx: CanvasRenderingContext2D) {
  const bx=68,by=22,bw=190,bh=145;
  px(ctx,bx,by,bw,bh,"#030c1a"); px(ctx,bx,by,bw,2,"#1e3a5f");
  ctx.fillStyle="#0a1a35"; ctx.fillRect(bx,by+2,bw,bh-2);
  ctx.fillStyle="#5ba3f5"; ctx.font="bold 7px monospace"; ctx.fillText("LIVE MARKET",bx+8,by+14);
  [["AAPL","▲ +1.2%","#22c55e"],["MSFT","▲ +0.9%","#22c55e"],["GOOG","▼ -0.4%","#ef4444"],
   ["NVDA","▲ +2.1%","#22c55e"],["TSLA","▼ -1.8%","#ef4444"]].forEach(([sym,chg,col],i) => {
    ctx.fillStyle="#3b82f6"; ctx.font="6px monospace"; ctx.fillText(sym as string,bx+8,by+30+i*16);
    ctx.fillStyle=col as string; ctx.fillText(chg as string,bx+48,by+30+i*16);
  });
  const cx=bx+100,cy=by+20,cw=82,ch=110;
  px(ctx,cx,cy,cw,ch,"#040c18");
  ctx.strokeStyle="#22c55e"; ctx.lineWidth=1.5; ctx.beginPath();
  [80,72,78,65,70,58,62,50,55,48,52,44,50,42,46,38,44,36].forEach((v,i) => {
    const px2=cx+2+i*(cw-4)/17, py2=cy+ch-4-v;
    if (i > 0) {
      ctx.lineTo(px2, py2);
    } else {
      ctx.moveTo(px2, py2);
    }
  });
  ctx.stroke();
}

function drawFurniture(ctx: CanvasRenderingContext2D) {
  function desk(dx:number,dy:number,dw:number,dh:number,label:string){
    px(ctx,dx+3,dy+dh,dw-4,6,"#071120");
    px(ctx,dx,dy,dw,dh,"#0a1f3a"); px(ctx,dx,dy,dw,3,"#1e3a5f");
    ctx.fillStyle="#1e3a5f"; ctx.font="bold 7px monospace"; ctx.textAlign="center";
    ctx.fillText(label,dx+dw/2,dy+dh/2+2); ctx.textAlign="left";
  }
  px(ctx,168,285,160,100,"#071828"); px(ctx,168,285,160,3,"#1e3a5f");
  desk(185,300,126,55,"R&D");
  px(ctx,155,458,150,66,"#040e1c"); desk(165,468,60,40,"TRADING"); desk(238,468,80,40,"ANALYTICS");
  const cX=420,cY=350;
  px(ctx,cX,cY+80,200,6,"#070f1e"); px(ctx,cX,cY,200,80,"#0d2a0a");
  px(ctx,cX,cY,200,6,"#0f3d0c"); px(ctx,cX,cY,6,80,"#0f3d0c"); px(ctx,cX+194,cY,6,80,"#0f3d0c");
  px(ctx,700,265,120,80,"#030810"); px(ctx,700,265,120,3,"#1e3a5f");
  ctx.fillStyle="#1e3a5f"; ctx.font="bold 8px monospace"; ctx.textAlign="center";
  ctx.fillText("DEALS",760,300); ctx.textAlign="left";
  px(ctx,648,450,180,80,"#040c18"); px(ctx,648,450,180,3,"#1e3a5f");
  desk(460,492,110,38,"SIGNALS");
  px(ctx,450,482,130,60,"#030c12");
}

function drawMonitors(ctx: CanvasRenderingContext2D, frame: number) {
  function monitor(mx:number,my:number,mw:number,mh:number,label?:string){
    px(ctx,mx-4,my-4,mw+8,mh+8,"#030810");
    px(ctx,mx,my,mw,mh,"#040c18");
    const sc=0.8+0.2*Math.sin(frame*0.05+mx*0.01);
    ctx.fillStyle=`rgba(4,18,40,${sc})`; ctx.fillRect(mx+2,my+2,mw-4,mh-4);
    ctx.strokeStyle="#22c55e"; ctx.lineWidth=1; ctx.beginPath();
    for(let p=0;p<8;p++){
      const px2=mx+4+p*(mw-8)/7, py2=my+mh-8-Math.sin(frame*0.04+p*0.8+mx*0.005)*8-p;
      if (p > 0) {
        ctx.lineTo(px2, py2);
      } else {
        ctx.moveTo(px2, py2);
      }
    }
    ctx.stroke();
    if(label){ ctx.fillStyle="#5ba3f5"; ctx.font="bold 6px monospace"; ctx.fillText(label,mx+4,my+12); }
    px(ctx,mx+mw/2-3,my+mh,6,8,"#030810"); px(ctx,mx+mw/2-10,my+mh+7,20,3,"#030810");
  }
  monitor(175,455,60,40); monitor(248,465,72,35);
  monitor(496,135,80,55,"REVIEW"); monitor(598,135,70,50,"MACRO");
  monitor(760,148,58,42,"OPS"); monitor(862,135,60,48,"FOCUS");
}

function drawZones(ctx: CanvasRenderingContext2D) {
  ZONES.forEach(z => {
    ctx.strokeStyle="rgba(59,130,246,0.35)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.strokeRect(z.x,z.y,z.w,z.h); ctx.setLineDash([]);
    ctx.fillStyle="#040c18"; ctx.globalAlpha=0.7; ctx.fillRect(z.x+2,z.y+2,z.w-4,10); ctx.globalAlpha=1;
    ctx.fillStyle="#60a5fa"; ctx.font="bold 6px monospace"; ctx.fillText(z.label,z.x+4,z.y+10);
  });
}

function drawAgent(ctx: CanvasRenderingContext2D, a: Agent, frame: number) {
  const S=2.4, ox=a.x, oy=a.y;
  const bob=a.action==="typing"?(frame%2)*0.5:0;
  ctx.fillStyle="rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(ox+8*S,oy+28*S,10*S,3*S,0,0,Math.PI*2); ctx.fill();
  function r(x:number,y:number,w:number,h:number,c:string,al=1){
    ctx.globalAlpha=al; ctx.fillStyle=c; ctx.fillRect(ox+x*S,oy+y*S+bob,w*S,h*S); ctx.globalAlpha=1;
  }
  const lw=Math.sin(frame*0.15); const lleg=a.action==="walking"?lw*3:0, rleg=a.action==="walking"?-lw*3:0;
  r(4+lleg/3,18,5,7,"#0d1f35"); r(9+rleg/3,18,5,7,"#0d1f35");
  r(3,22,5,5,"#030810"); r(8,22,5,5,"#030810");
  r(4,11,9,8,a.color,0.9); r(4,10,9,2,"#1a3a6e");
  r(3,12,2,5,"#d4956a"); r(13,12,2,5,"#d4956a");
  r(6,4,6,6,"#d4956a"); r(6,2,6,3,"#1a0a00");
  // Hat / Cap (colored cap based on the agent's color theme)
  r(5, 1, 8, 1.5, "#0b2046"); // Hat brim (dark blue/black cap brim)
  r(6, -0.5, 6, 2.5, a.color); // Hat dome (colored cap top)

  r(7,6,2,2,"#1a0a00"); r(9,6,2,2,"#ffffff"); r(8,9,4,1,"#a0604a");
  // Glasses (cyan neon frames and lens tint for trader look)
  r(6.5, 5, 5, 0.8, "#3b82f6"); // Frame top bridge bar
  r(7, 5.5, 1.8, 1.8, "#00f0ff", 0.6); // Left lens cyan tint
  r(9.2, 5.5, 1.8, 1.8, "#00f0ff", 0.6); // Right lens cyan tint
  ctx.fillStyle="#93c5fd"; ctx.font=`bold ${Math.round(5*S)}px monospace`; ctx.textAlign="center";
  ctx.fillText(a.name,ox+8*S,oy-4); ctx.textAlign="left";
  if(a.action==="typing"){ ctx.fillStyle="rgba(147,197,253,0.8)"; ctx.font="5px monospace"; ctx.textAlign="center"; ctx.fillText("⌨",ox+8*S,oy-12); ctx.textAlign="left"; }
  if(a.action==="thinking"){
    ctx.fillStyle="rgba(147,197,253,0.5)"; ctx.beginPath(); ctx.arc(ox+22,oy-8,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ox+26,oy-14,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#93c5fd"; ctx.font="6px monospace"; ctx.textAlign="center"; ctx.fillText("...",ox+26,oy-11); ctx.textAlign="left";
  }
}

function moveAgent(a: Agent, speed: number) {
  if(a.action==="walking"){
    const dx=a.tx-a.x,dy=a.ty-a.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<2){ a.x=a.tx; a.y=a.ty; a.action=["idle","typing","thinking","idle"][Math.floor(Math.random()*4)] as AgentAction; }
    else { a.x+=dx/dist*1.2*speed; a.y+=dy/dist*1.2*speed; }
  }
  a.t++;
  if(a.t>300+Math.random()*300){
    a.t=0;
    if(Math.random()<0.3){
      a.action="walking";
      const zone=ZONES[Math.floor(Math.random()*ZONES.length)];
      a.tx=zone.x+zone.w/2+Math.random()*20-10;
      a.ty=Math.max(220,Math.min(520,zone.y+zone.h/2+Math.random()*20-10));
    } else {
      a.action=(["idle","typing","thinking"] as AgentAction[])[Math.floor(Math.random()*3)];
    }
  }
}

export default function PixelTradeNightOffice() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<Agent[]>(INITIAL_AGENTS.map(a=>({...a})));
  const frameRef = useRef(0);
  const speedRef = useRef(1);
  const [speed, setSpeedState] = useState(1);
  const [balance, setBalance] = useState(13355);
  const [pnl, setPnl] = useState(875);
  const [tasks, setTasks] = useState(18);
  const [clock, setClock] = useState("Night 1 · 23:44");

  const setSpeed = (s: number) => { speedRef.current = s; setSpeedState(s); };

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setClock(`Night 1 · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    let raf: number;
    const loop = () => {
      for (let s = 0; s < speedRef.current; s++) {
        frameRef.current++;
        agentsRef.current.forEach(a => moveAgent(a, speedRef.current));
      }
      const f = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      drawFloor(ctx);
      drawWall(ctx, f);
      drawMarketBoard(ctx);
      drawFurniture(ctx);
      drawMonitors(ctx, f);
      drawZones(ctx);
      agentsRef.current.forEach(a => drawAgent(ctx, a, f));
      if (f % 180 === 0) {
        const delta = Math.round((Math.random()-0.4)*50);
        setBalance(b => b+delta);
        setPnl(p => p+delta);
        if (delta > 0) setTasks(t => t+1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    if (my < 190) return;
    let closest: Agent | null = null, minD = 9999;
    agentsRef.current.forEach(a => { const d = Math.hypot(a.x-mx,a.y-my); if(d<minD){minD=d;closest=a;} });
    if (closest) { (closest as Agent).action = "walking"; (closest as Agent).tx = mx; (closest as Agent).ty = Math.max(220, Math.min(520, my)); }
  }, []);

  return (
    <div style={{ background:"#03080f", fontFamily:"monospace", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#060d1a", borderBottom:"1px solid #0d2040", display:"flex", alignItems:"center", gap:8, padding:"5px 10px", height:34 }}>
        <div style={{ flex:1, color:"#3b82f6", fontSize:9, lineHeight:1.4 }}>THE FLOOR · 6 AGENTS<br/>3 working · 2 walking</div>
        <div style={{ color:"#e2e8f0", fontSize:10, background:"#0a1628", border:"1px solid #1e3a5f", padding:"2px 8px" }}>{clock}</div>
        <div style={{ color:"#f59e0b", fontSize:9, background:"#1c1005", border:"1px solid #92400e", padding:"2px 6px" }}>⚠ NIGHT MODE</div>
        {[1,2,4].map(s => (
          <button key={s} onClick={() => setSpeed(s)} style={{ background:speed===s?"#1d4ed8":"#0a1628", border:"1px solid #1e3a5f", color:"#60a5fa", fontSize:9, padding:"2px 5px", cursor:"pointer" }}>{s}x</button>
        ))}
      </div>
      <div style={{ display:"flex" }}>
        <div style={{ flex:1, position:"relative" }}>
          <canvas ref={canvasRef} width={W} height={H} onClick={handleClick} style={{ display:"block", imageRendering:"pixelated", cursor:"crosshair", width:"100%" }} />
          <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)", pointerEvents:"none" }} />
        </div>
        <div style={{ width:200, background:"#06101e", borderLeft:"1px solid #0d2040", display:"flex", flexDirection:"column" }}>
          <div style={{ background:"#040c18", borderBottom:"1px solid #0d2040", padding:"8px 10px" }}>
            <div style={{ color:"#e2e8f0", fontSize:11, fontWeight:700, letterSpacing:1 }}>PIXELTRADE</div>
            <div style={{ color:"#3b82f6", fontSize:8 }}>6 agents on floor</div>
          </div>
          <div style={{ padding:6, display:"flex", flexDirection:"column", gap:2 }}>
            {(["⊞ Dashboard","▣ History","⚙ Settings"] as string[]).map((b,i) => (
              <button key={b} style={{ background:i===0?"#1d4ed8":"#0a1628", border:"1px solid #0d2040", color:"#60a5fa", fontSize:9, padding:"5px 8px", cursor:"pointer", textAlign:"left" }}>{b}</button>
            ))}
            <button
              onClick={() => router.push("/news")}
              style={{
                background: "#0a1e12",
                border: "1px solid #166534",
                color: "#22c55e",
                fontSize: 9,
                padding: "5px 8px",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 4px #22c55e", flexShrink:0 }} />
              ◎ วิเคราะห์ข่าว
            </button>
          </div>
          <div style={{ color:"#1e3a5f", fontSize:8, letterSpacing:2, padding:"6px 10px 2px" }}>LIVE STATS</div>
          <div style={{ padding:6, display:"flex", flexDirection:"column", gap:4 }}>
            {[["Balance", `$${balance.toLocaleString()}`, ""],["P&L Today", `${pnl>=0?"+$":"−$"}${Math.abs(pnl)}`, pnl>=0?"#22c55e":"#ef4444"],["Tasks Done", String(tasks), ""]].map(([l,v,c]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", background:"#0a1628", border:"1px solid #0d2040", padding:"3px 6px" }}>
                <span style={{ color:"#3b82f6", fontSize:8 }}>{l}</span>
                <span style={{ color:c||"#e2e8f0", fontSize:9, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ color:"#1e3a5f", fontSize:8, letterSpacing:2, padding:"6px 10px 2px" }}>ACTIVITY LOG</div>
          <div style={{ flex:1, overflowY:"auto", padding:"4px 6px", display:"flex", flexDirection:"column", gap:3 }}>
            {[{t:"buy",title:"New LONG signal on GOOG",sub:"Iris · 12:02 PM"},{t:"info",title:"Focus recharged",sub:"Otis · 11:56 AM"},{t:"sell",title:"SELL SPY @ $282.84 +$253",sub:"Mara · 11:58 AM"}].map((item,i) => (
              <div key={i} style={{ background:"#040c18", borderLeft:`2px solid ${item.t==="buy"?"#22c55e":item.t==="sell"?"#ef4444":"#3b82f6"}`, padding:"3px 5px" }}>
                <div style={{ color:"#e2e8f0", fontSize:8, lineHeight:1.3 }}>{item.title}</div>
                <div style={{ color:"#3b82f6", fontSize:7, marginTop:1 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background:"#040c18", borderTop:"1px solid #0d2040", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 10px" }}>
        <span style={{ color:"#1e3a5f", fontSize:8, letterSpacing:1 }}>+ Click any work zone to send nearest agent there</span>
        <button
          onClick={() => router.push("/news")}
          style={{ background:"#0a1e12", border:"1px solid #166534", color:"#22c55e", fontSize:8, padding:"2px 8px", cursor:"pointer", letterSpacing:1, display:"flex", alignItems:"center", gap:4 }}
        >
          <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 4px #22c55e" }} />
          วิเคราะห์ข่าว →
        </button>
      </div>
    </div>
  );
}
