import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Star, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { useProject } from "@/hooks/useProject";
import { findAgent, PHASES, SERENA } from "@/data/agents";
import { getAgentPhotoUrl } from "@/data/agentPhotos";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ChatMessageContent from "@/components/ChatMessage";

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
  const { activeProjectId, projects, loading: projectsLoading, loadProjects } = useProject();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSerena = agentId === "serena";
  const isSofia = agentId === "sofia";
  const agentInfo = isSofia
    ? {
        agent: {
          id: "sofia",
          name: "Sofia",
          role: "Guia de Entrada",
          desc: "",
          context: [] as string[],
          welcome:
            "Oi! Eu sou a Sofia 🌿\n\nAntes de você começar, vou te fazer 6 perguntas rápidas pra descobrir qual trilha combina com o seu momento agora.\n\nPode responder com a letra da opção. Vamos?\n\n**Me conta: você já tem algum assunto, habilidade ou experiência que as pessoas costumam te procurar pra saber?**\n\na) Sim, tenho um assunto claro\nb) Mais ou menos, tenho alguma bagagem\nc) Não, não tenho nada assim ainda",
        },
        phase: {
          id: 0,
          name: "Entrada",
          emoji: "🌿",
          color: "#3A5C46",
          sub: "",
          agents: [],
        },
      }
    : isSerena
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
          emoji: "🧘‍♀️",
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
  const photoUrl = agentId ? getAgentPhotoUrl(agentId) : null;

  const isFav = agentId ? favorites.has(agentId) : false;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const hasUserMessage = messages.some((m) => m.role === "user");
  const canComplete = !isSerena && !isSofia && hasUserMessage && !!lastAssistant && !isStreaming;

  const getNextAgentId = (completedAgentId: string) => {
    const orderedAgents = PHASES.flatMap((currentPhase) => currentPhase.agents);
    const currentIndex = orderedAgents.findIndex((currentAgent) => currentAgent.id === completedAgentId);
    return currentIndex >= 0 ? orderedAgents[currentIndex + 1]?.id ?? null : null;
  };

  // Guard: non-Serena chats require an active project
  useEffect(() => {
    if (isSerena || projectsLoading) return;
    if (!activeProjectId) {
      if (projects.length === 0) {
        navigate("/home?new=1", { replace: true });
      } else {
        toast("Selecione um projeto para continuar.");
        navigate("/home", { replace: true });
      }
    }
  }, [isSerena, projectsLoading, activeProjectId, projects.length, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // For non-Serena agents we require a project; Serena runs free.
  const sessionProjectId = isSerena ? null : activeProjectId;
  const ready = isSerena || !!activeProjectId;

  useEffect(() => {
    if (!user || !agentId || !agent || !ready) return;

    const init = async () => {
      setInitializing(true);

      let query = supabase
        .from("agent_sessions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .order("started_at", { ascending: false })
        .limit(10);

      if (sessionProjectId) {
        query = query.eq("project_id", sessionProjectId);
      } else {
        query = query.is("project_id", null);
      }

      const { data: existingSessions } = await query;

      let sid: string;

      if (existingSessions && existingSessions.length > 0) {
        const sessionsWithHistory = await Promise.all(
          existingSessions.map(async (session) => {
            const { data: historyMessages } = await supabase
              .from("messages")
              .select("id, role, content")
              .eq("session_id", session.id)
              .order("created_at", { ascending: true });

            return {
              session,
              historyMessages: historyMessages ?? [],
            };
          })
        );

        const selectedSession =
          sessionsWithHistory.find(({ historyMessages }) =>
            historyMessages.some((message) => message.role === "user")
          ) ?? sessionsWithHistory[0];

        sid = selectedSession.session.id;
        const historyMessages = selectedSession.historyMessages;

        if (historyMessages && historyMessages.length > 0) {
          setMessages(
            historyMessages.map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.role === "assistant" ? m.content.replace(/\[\[[^\]]*\]\]/g, "") : m.content,
            }))
          );
        } else {
          setMessages([{ role: "assistant", content: agent.welcome }]);
        }
      } else {
        const insertData: any = { user_id: user.id, agent_id: agentId };
        if (sessionProjectId) insertData.project_id = sessionProjectId;

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
  }, [user, agentId, ready, sessionProjectId]);


  const sendMessage = useCallback(async () => {
    if (!input.trim() || !sessionId || isStreaming || !agent) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    let contextOutputs: any[] = [];
    if (agent.context.length > 0 && user) {
      let outputsQuery = supabase
        .from("agent_outputs")
        .select("agent_id, summary")
        .eq("user_id", user.id)
        .in("agent_id", agent.context);

      // Scope context outputs to the active project so each project keeps its own history
      if (sessionProjectId) {
        outputsQuery = outputsQuery.eq("project_id", sessionProjectId);
      } else {
        outputsQuery = outputsQuery.is("project_id", null);
      }

      const { data: outputs } = await outputsQuery;

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
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const accessToken = authSession?.access_token;
      if (!accessToken) {
        toast.error("Sessão expirada. Faça login novamente.");
        setIsStreaming(false);
        return;
      }
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          session_id: sessionId,
          project_id: sessionProjectId,
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

    // Sofia: assim que a trilha for definida no projeto, segue para a trilha
    if (isSofia && sessionProjectId) {
      const { data: proj } = await supabase
        .from("projects")
        .select("trilha")
        .eq("id", sessionProjectId)
        .maybeSingle();
      if ((proj as any)?.trilha) {
        await loadProjects();
        toast.success("Sua trilha foi definida! 🎉");
        navigate("/trilha", { replace: true });
      }
    }
  }, [input, sessionId, isStreaming, agentId, agent, user, sessionProjectId, isSofia, loadProjects, navigate]);

  const handleComplete = async () => {
    if (!sessionId || !user || !agent || !phase) return;
    setIsCompleting(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-agent`;
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const accessToken = authSession?.access_token;
      if (!accessToken) {
        toast.error("Sessão expirada. Faça login novamente.");
        setIsCompleting(false);
        return;
      }
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_name: agent.name,
          agent_role: agent.role,
          session_id: sessionId,
          project_id: sessionProjectId,
        }),
      });

      if (!resp.ok) throw new Error("Erro ao concluir etapa");

      const nextAgentId = agentId ? getNextAgentId(agentId) : null;
      toast.success(nextAgentId ? "Etapa concluída! Indo para o próximo agente. 🎉" : "Etapa concluída! 🎉");
      await refetch();
      if (nextAgentId) {
        const projectQuery = sessionProjectId ? `?project=${sessionProjectId}` : "";
        navigate(`/chat/${nextAgentId}${projectQuery}`);
      } else {
        navigate(`/trilha?phase=${phase.id}`);
      }
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

  if (!ready || initializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
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

          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`Foto da agente ${agent.name}`}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0"
              style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
              aria-hidden="true"
            >
              {agent.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm text-foreground m-0">
                {agent.name}
              </h1>
              <Badge
                className="text-xs px-2 py-0 border-0 hidden sm:inline-flex"
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
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-sage-mid text-sage-mid text-xs font-semibold bg-card disabled:opacity-50"
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
                    ? "fill-gold text-gold"
                    : "text-muted-foreground/40 hover:text-gold"
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
                photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`Foto da agente ${agent.name}`}
                    className="w-[36px] h-[36px] rounded-full object-cover shrink-0 mr-2 mt-1"
                  />
                ) : (
                  <div
                    className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-1"
                    style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                    aria-hidden="true"
                  >
                    {agent.name.charAt(0)}
                  </div>
                )
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3.5 md:px-4 py-2.5 md:py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md text-white"
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
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Foto da agente ${agent.name}`}
                  className="w-[36px] h-[36px] rounded-full object-cover shrink-0 mr-2 mt-1"
                />
              ) : (
                <div
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-1"
                  style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                  aria-hidden="true"
                >
                  {agent.name.charAt(0)}
                </div>
              )}
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
              className="hidden md:flex w-full mb-3 items-center justify-center gap-2 py-2 rounded-xl border-2 border-sage-mid text-sage-mid text-sm font-semibold bg-card hover:bg-sage-pale/20 transition-colors disabled:opacity-50"
              aria-label="Concluir esta etapa"
            >
              <CheckCircle2 size={16} />
              {isCompleting ? "Concluindo..." : "Concluir esta etapa"}
            </button>
          )}

          <div className="flex items-end gap-2">
            <label htmlFor="chat-message-input" className="sr-only">Mensagem para o agente</label>
            <textarea
              id="chat-message-input"
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
              className="p-2.5 rounded-xl text-white transition-colors disabled:opacity-30"
              style={{ backgroundColor: phase.color }}
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </div>

          {!isSerena && (
            <p className="mt-2 text-[11px] text-muted-foreground/70 text-center">
              Para iniciar uma nova conversa com este agente, crie um novo projeto em Início.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
