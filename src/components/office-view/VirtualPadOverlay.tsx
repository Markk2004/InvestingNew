"use client";

interface VirtualPadOverlayProps {
  setMove: (code: string, pressed: boolean) => void;
}

export default function VirtualPadOverlay({ setMove }: VirtualPadOverlayProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 grid grid-cols-3 gap-2 p-4 bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-outline-variant/30 shadow-xl md:hidden">
      <div />
      <button
        type="button"
        className="w-12 h-12 bg-surface flex items-center justify-center rounded-xl shadow-sm border border-outline-variant/50 text-on-surface-variant active:bg-primary-container active:text-on-primary-container active:scale-95 transition-all text-xl"
        onPointerDown={() => setMove("ArrowUp", true)}
        onPointerUp={() => setMove("ArrowUp", false)}
        onPointerLeave={() => setMove("ArrowUp", false)}
      >
        ▲
      </button>
      <div />
      <button
        type="button"
        className="w-12 h-12 bg-surface flex items-center justify-center rounded-xl shadow-sm border border-outline-variant/50 text-on-surface-variant active:bg-primary-container active:text-on-primary-container active:scale-95 transition-all text-xl"
        onPointerDown={() => setMove("ArrowLeft", true)}
        onPointerUp={() => setMove("ArrowLeft", false)}
        onPointerLeave={() => setMove("ArrowLeft", false)}
      >
        ◀
      </button>
      <button
        type="button"
        className="w-12 h-12 bg-surface flex items-center justify-center rounded-xl shadow-sm border border-outline-variant/50 text-on-surface-variant active:bg-primary-container active:text-on-primary-container active:scale-95 transition-all text-xl"
        onPointerDown={() => setMove("ArrowDown", true)}
        onPointerUp={() => setMove("ArrowDown", false)}
        onPointerLeave={() => setMove("ArrowDown", false)}
      >
        ▼
      </button>
      <button
        type="button"
        className="w-12 h-12 bg-surface flex items-center justify-center rounded-xl shadow-sm border border-outline-variant/50 text-on-surface-variant active:bg-primary-container active:text-on-primary-container active:scale-95 transition-all text-xl"
        onPointerDown={() => setMove("ArrowRight", true)}
        onPointerUp={() => setMove("ArrowRight", false)}
        onPointerLeave={() => setMove("ArrowRight", false)}
      >
        ▶
      </button>
    </div>
  );
}
