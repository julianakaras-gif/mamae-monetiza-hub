import { memo } from "react";
import { Lock, ChevronRight, CheckCircle2, SkipForward, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Agent } from "@/data/agents";
import type { AgentStatus } from "@/hooks/useAgentProgress";
import { toast } from "sonner";
import { getAgentPhotoUrl } from "@/data/agentPhotos";

interface AgentCardProps {
  agent: Agent;
  color: string;
  status: AgentStatus;
  isFavorite: boolean;
  onToggleFavorite: (agentId: string) => void;
  onSkip?: (agentId: string) => void;
}

const AgentCard = memo(({ agent, color, status, isFavorite, onToggleFavorite, onSkip }: AgentCardProps) => {
  const navigate = useNavigate();
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";
  const isUnlocked = status === "unlocked";

  const borderColor = isLocked ? "#E2D9C8" : color;
  const avatarBg = isLocked ? "rgba(226, 217, 200, 0.15)" : `${color}15`;
  const avatarColor = isLocked ? "#b0a89f" : color;
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

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSkip) return;
    onSkip(agent.id);
    toast("Etapa pulada");
  };

  return (
    

 !isLocked && navigate(`/chat/${agent.id}`)}
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
         { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
        />
      ) : null}
      


        {agent.name.charAt(0)}
      



      

        

{agent.name}


        {agent.id === "serena" && (
          


            Apoio emocional & Mindset
          


        )}
        

{agent.role}


        

{agent.desc}


        {isSkipped && (
          

Etapa pulada


        )}
      


      


        {!isLocked && (
          
            
          
        )}

        {isUnlocked && onSkip && (
          
            pular
          
        )}

        {isLocked && }
        {isCompleted && }
        {isSkipped && }
        {isUnlocked && (
          
        )}
      


    


  );
});

AgentCard.displayName = "AgentCard";

export default AgentCard;
