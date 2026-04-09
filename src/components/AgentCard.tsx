import { memo } from "react";
import { Lock, ChevronRight, CheckCircle2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Agent } from "@/data/agents";
import type { AgentStatus } from "@/hooks/useAgentProgress";
import { toast } from "sonner";
import { getAgentPhotoUrl } from "@/data/agentPhotos";

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

  const borderColor = isLocked ? "#E2D9C8" : phaseColor;
  const avatarBg = isLocked ? "rgba(226, 217, 200, 0.15)" : `${phaseColor}15`;
  const avatarColor = isLocked ? "#b0a89f" : phaseColor;
  const photoUrl = getAgentPhotoUrl(agent.id);

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
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={agent.name}
          className="w-[50px] h-[50px] rounded-full object-cover shrink-0"
          style={{ opacity: isLocked ? 0.5 : 1 }}
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
        />
      ) : null}
      <div
        className={`w-[50px] h-[50px] rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${photoUrl ? 'hidden' : ''}`}
        style={{ backgroundColor: avatarBg, color: avatarColor }}
      >
        {agent.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-foreground">{agent.name}</p>
        <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden sm:block">{agent.desc}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isLocked && (
          <button
            onClick={handleToggleFavorite}
            className="p-1 transition-colors"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star
              size={16}
              className={isFavorite ? "fill-gold text-gold" : "text-muted-foreground/40 hover:text-gold"}
            />
          </button>
        )}

        {isLocked && <Lock size={16} className="text-muted-foreground/50" />}
        {isCompleted && <CheckCircle2 size={16} className="text-sage-mid fill-sage-pale" />}
        {status === "unlocked" && <ChevronRight size={16} className="text-muted-foreground" />}
      </div>
    </div>
  );
});

AgentCard.displayName = "AgentCard";

export default AgentCard;
