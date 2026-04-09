import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Star, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { findAgent, SERENA } from "@/data/agents";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ChatMessageContent from "@/components/ChatMessage";
import ProjectSelector from "@/components/ProjectSelector";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, toggleFavorite, refetch } = useAgentProgress();

  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams.get("project")
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [projectResolved, setProjectResolved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSerena = agentId === "serena";
  const agentInfo = isSerena
    ? {
        agent: {
          id: "serena",
          name: "Serena",
          role: "Desbloqueadora de Potencial",
          desc: "",
          context: [] as string[],
          welcome: SERENA.welcome,
        },
        phase: {
          id: 0,
          name: "Apoio",
          emoji: "💛",
          color: SERENA.color,
          sub: "",
          agents: [],
        },
      }
    : agentId
    ? findAgent(agentId)
    : null;

  const agent = agentInfo?.agent;
  const phase = agentInfo?.phase;

  const isFav = agentId ? favorites.has(agentId) : false;
  const totalMessages = messages.length;
  const canComplete = totalMessages >= 4 && !isSerena;

  // Show project selector if no project selected and not Serena
  useEffect(() => {
    if (!isSerena && !selectedProjectId && !projectResolved) {
      setShowProjectSelector(true);
    } else {
      setProjectResolved(true);
    }
  }, [isSerena, selectedProjectId, projectResolved]);

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setShowProjectSelector(false);
    setProjectResolved(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (!user || !agentId || !agent || !projectResolved) return;

    const init = async () => {
      setInitializing(true);

      // Build query for existing sessions
      let query = supabase
        .from("agent_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1);

      if (selectedProjectId) {
        query = query.eq("project_id", selectedProjectId);
      }

      const { data: existingSessions } = await query;

      let sid: string;

      if (existingSessions && existingSessions.length > 0) {
        sid = existingSessions[0].id;
        const { data: historyMessages } = await supabase
          .from("messages")
          .select("id, role, content")
          .eq("session_id", sid)
          .order("created_at", { ascending: true });

        if (historyMessages && historyMessages.length > 0) {
          setMessages(
            historyMessages.map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        } else {
          setMessages([{ role: "assistant", content: agent.welcome }]);
        }
      } else {
        const insertData: any = { user_id: user.id, agent_id: agentId };
        if (selectedProjectId) insertData.project_id = selectedProjectId;

        const { data: newSession, error } = await supabase
          .from("agent_sessions")
          .insert(insertData)
          .select("id")
          .single();

        if (error || !newSession) {
          toast.error("Erro ao criar sessão");
          setInitializing(false);
          return;
        }

        sid = newSession.id;

        await supabase.from("messages").insert({
          session_id: sid,
          role: "assistant",
          content: agent.welcome,
        });

        setMessages([{ role: "assistant", content: agent.welcome }]);
      }

      setSessionId(sid);
      setInitializing(false);
    };

    init();
  }, [user, agentId, projectResolved, selectedProjectId]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !sessionId || isStreaming || !agent) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    let contextOutputs: any[] = [];
    if (agent.context.length > 0 && user) {
      const { data: outputs } = await supabase
        .from("agent_outputs")
        .select("agent_id, summary")
        .eq("user_id", user.id)
        .in("agent_id", agent.context);

      if (outputs) {
        contextOutputs = outputs.map((o) => {
          const info = findAgent(o.agent_id);
          return {
            agent_name: info?.agent.name || o.agent_id,
            agent_role: info?.agent.role || "",
            summary: o.summary,
          };
        });
      }
    }

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          session_id: sessionId,
          message: userMessage,
          context_outputs: contextOutputs,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao enviar mensagem");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantSoFar = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed.text;
            if (text) {
              assistantSoFar += text;
              const currentContent = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && !last.id) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: currentContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: currentContent }];
              });
            }
          } catch {
            /* wait for more data */
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar mensagem");
    } finally {
      setIsStreaming(false);
    }
  }, [input, sessionId, isStreaming, agentId, agent, user]);

  const handleComplete = async () => {
    if (!sessionId || !user || !agent || !phase) return;
    setIsCompleting(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-agent`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_name: agent.name,
          agent_role: agent.role,
          session_id: sessionId,
          user_id: user.id,
        }),
      });

      if (!resp.ok) throw new Error("Erro ao concluir etapa");

      toast.success("Etapa concluída! Continue sua trilha. 🎉");
      await refetch();
      navigate(`/trilha?phase=${phase.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao concluir etapa");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!agentInfo || !agent || !phase) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Agente não encontrado.</p>
      </div>
    );
  }

  if (initializing && projectResolved) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ProjectSelector
        open={showProjectSelector}
        onSelect={handleProjectSelect}
        onClose={() => handleProjectSelect(null)}
      />

      <div className="flex flex-col h-[100dvh] md:h-[calc(100vh)] bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-b bg-card shrink-0">
          <button
            onClick={() => navigate(`/trilha?phase=${phase.id}`)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Voltar para a trilha"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>

          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0"
            style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
          >
            {agent.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-georgia font-bold text-sm text-foreground">
                {agent.name}
              </span>
              <Badge
                className="text-[10px] px-2 py-0 border-0 hidden sm:inline-flex"
                style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
              >
                {phase.emoji} {phase.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
          </div>

          {canComplete && (
            <button
              onClick={handleComplete}
              disabled={isCompleting || isStreaming}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-primary text-primary text-xs font-semibold bg-card disabled:opacity-50"
              aria-label="Concluir esta etapa"
            >
              <CheckCircle2 size={14} />
              <span className="hidden xs:inline">Concluir</span>
            </button>
          )}

          {!isSerena && (
            <button
              onClick={() => agentId && toggleFavorite(agentId)}
              className="p-1.5"
              aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star
                size={18}
                className={
                  isFav
                    ? "fill-secondary text-secondary"
                    : "text-muted-foreground/40 hover:text-secondary"
                }
              />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0 mr-2 mt-1"
                  style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                >
                  {agent.name.charAt(0)}
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3.5 md:px-4 py-2.5 md:py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md text-accent-foreground"
                    : "rounded-bl-md bg-card border-l-[3px]"
                }`}
                style={
                  msg.role === "user"
                    ? { backgroundColor: phase.color }
                    : { borderLeftColor: phase.color }
                }
              >
                <ChatMessageContent content={msg.content} role={msg.role} />
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div
                className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0 mr-2 mt-1"
                style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
              >
                {agent.name.charAt(0)}
              </div>
              <div
                className="bg-card border-l-[3px] rounded-2xl rounded-bl-md px-4 py-3"
                style={{ borderLeftColor: phase.color }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div
          className="border-t bg-card px-3 md:px-4 py-2.5 md:py-3 shrink-0"
          style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
        >
          {canComplete && (
            <button
              onClick={handleComplete}
              disabled={isCompleting || isStreaming}
              className="hidden md:flex w-full mb-3 items-center justify-center gap-2 py-2 rounded-xl border-2 border-primary text-primary text-sm font-semibold bg-card hover:bg-primary/5 transition-colors disabled:opacity-50"
              aria-label="Concluir esta etapa"
            >
              <CheckCircle2 size={16} />
              {isCompleting ? "Concluindo..." : "Concluir esta etapa"}
            </button>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-background px-3 md:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl text-accent-foreground transition-colors disabled:opacity-30"
              style={{ backgroundColor: phase.color }}
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
