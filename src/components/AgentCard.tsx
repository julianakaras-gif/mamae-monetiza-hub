import { memo } from "react";
import { Lock, ChevronRight, CheckCircle2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Agent } from "@/data/agents";
import type { AgentStatus } from "@/hooks/useAgentProgress";
import { toast } from "sonner";

interface AgentCardProps {
  agent: Agent;
  phaseColor: string;
  status: AgentStatus;
  isFavorite: boolean;
  onToggleFavorite: (agentId: string) => void;
}

const AgentCard = memo(({ agent, phaseColor, status, isFavorite, onToggleFavorite }: AgentCardProps) => {
  const navigate = useNavigate();
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  const borderColor = isLocked ? "#e4ddd5" : phaseColor;
  const avatarBg = isLocked ? "rgba(228, 221, 213, 0.15)" : `${phaseColor}15`;
  const avatarColor = isLocked ? "#b0a89f" : phaseColor;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(agent.id);
    if (isFavorite) {
      toast("Removido dos favoritos");
    } else {
      toast.success("Adicionado aos favoritos");
    }
  };

  return (
    <div
      onClick={() => !isLocked && navigate(`/chat/${agent.id}`)}
      className={`relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-card transition-all duration-200 ${
        isLocked
          ? "opacity-55 cursor-not-allowed"
          : "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      }`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      role="button"
      aria-label={`${isLocked ? "Bloqueado: " : ""}${agent.name} - ${agent.role}`}
      aria-disabled={isLocked}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0"
        style={{ backgroundColor: avatarBg, color: avatarColor }}
      >
        {agent.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-georgia text-sm font-bold text-foreground">{agent.name}</p>
        <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden sm:block">{agent.desc}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!isLocked && (
          <button
            onClick={handleToggleFavorite}
            className="p-1 transition-colors"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star
              size={16}
              className={isFavorite ? "fill-secondary text-secondary" : "text-muted-foreground/40 hover:text-secondary"}
            />
          </button>
        )}

        {isLocked && <Lock size={16} className="text-muted-foreground/50" />}
        {isCompleted && <CheckCircle2 size={16} className="text-primary fill-primary/20" />}
        {status === "unlocked" && <ChevronRight size={16} className="text-muted-foreground" />}
      </div>
    </div>
  );
});

AgentCard.displayName = "AgentCard";

export default AgentCard;
