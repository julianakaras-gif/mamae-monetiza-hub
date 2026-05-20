import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { SERENA } from "@/data/agents";

const STORAGE_KEY = "serena_fab_pos_v1";
const FAB_SIZE = 72;
const MARGIN = 12;

function loadPos(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === "number" && typeof p?.y === "number") return p;
  } catch {}
  return null;
}

function clamp(x: number, y: number) {
  const maxX = window.innerWidth - FAB_SIZE - MARGIN;
  const maxY = window.innerHeight - FAB_SIZE - MARGIN;
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  };
}

const SerenaFAB = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize position (saved or default: right-center)
  useEffect(() => {
    const saved = loadPos();
    if (saved) {
      setPos(clamp(saved.x, saved.y));
    } else {
      setPos(clamp(window.innerWidth - FAB_SIZE - 16, window.innerHeight / 2 - FAB_SIZE / 2));
    }
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (location.pathname === "/chat/serena" || !pos) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) d.moved = true;
    if (d.moved) setPos(clamp(d.origX + dx, d.origY + dy));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    setDragging(false);
    dragRef.current = null;
    if (d?.moved) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch {}
    } else {
      setShowTooltip((v) => !v);
    }
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  // Tooltip opens to the left if FAB is on the right half
  const tooltipOnLeft = pos.x > window.innerWidth / 2;

  return (
    <div
      className="fixed z-50"
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
    >
      {showTooltip && (
        <div
          className="absolute bg-card border shadow-lg rounded-xl p-3 w-[220px] animate-fade-in"
          style={{
            top: FAB_SIZE + 8,
            ...(tooltipOnLeft ? { right: 0 } : { left: 0 }),
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-sm text-foreground">Serena</span>
            <button onClick={() => setShowTooltip(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{SERENA.role}</p>
          <button
            onClick={() => { navigate(`/chat/${SERENA.id}`); setShowTooltip(false); }}
            className="w-full text-xs font-semibold py-1.5 rounded-lg text-white bg-sage-mid"
          >
            Conversar com Serena
          </button>
        </div>
      )}

      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="rounded-full flex items-center justify-center select-none ring-4 ring-white/70"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          fontSize: 34,
          background: "linear-gradient(135deg, #3A5C46, #1C3C2C)",
          boxShadow: "0 8px 28px rgba(28, 60, 44, 0.55), 0 0 0 4px rgba(235, 199, 128, 0.35)",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          transition: dragging ? "none" : "transform 0.15s",
          transform: dragging ? "scale(1.05)" : "scale(1)",
        }}
        title="Serena (arraste para mover)"
      >
        🧘‍♀️
      </button>
      <div
        className="pointer-events-none mt-1.5 text-center mx-auto px-2 py-0.5 rounded-full"
        style={{
          width: "max-content",
          maxWidth: 110,
          fontFamily: "'Instrument Sans', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: "#1C3C2C",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(4px)",
          lineHeight: 1.15,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Apoio emocional
      </div>
    </div>
  );
};

export default SerenaFAB;
