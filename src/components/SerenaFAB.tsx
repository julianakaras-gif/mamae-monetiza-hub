import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { SERENA } from "@/data/agents";

const SerenaFAB = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/chat/serena") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && (
        <div className="bg-card border shadow-lg rounded-xl p-3 max-w-[220px] animate-fade-in">
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

      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setShowTooltip((v) => !v)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #3A5C46, #1C3C2C)",
            boxShadow: "0 4px 20px rgba(28, 60, 44, 0.4)",
          }}
          title="Serena"
        >
          🧘‍♀️
        </button>
        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 10, color: "#6E9876" }} className="text-center leading-tight max-w-[80px]">
          Apoio emocional & Mindset
        </span>
      </div>
    </div>
  );
};

export default SerenaFAB;