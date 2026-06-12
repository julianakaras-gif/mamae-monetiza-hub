import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // === AUTH: Verify the caller's JWT ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Check subscription status
    const { data: profile } = await userClient
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (profile?.subscription_status !== 'active') {
      return new Response(
        JSON.stringify({ error: "Assinatura inativa" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agent_id, session_id, project_id } = await req.json();

    if (typeof agent_id !== "string" || !/^[a-z0-9_-]{1,32}$/i.test(agent_id)) {
      return new Response(
        JSON.stringify({ error: "agent_id inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const safeAgentLabel = agent_id.toUpperCase();

    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DEEPSEEK_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to this user
    const sessionProjectFilter = project_id
      ? `&project_id=eq.${project_id}`
      : `&project_id=is.null`;

    const sessionCheck = await fetch(
      `${supabaseUrl}/rest/v1/agent_sessions?id=eq.${session_id}&user_id=eq.${userId}${sessionProjectFilter}&select=id`,
      { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
    );
    const sessionData = await sessionCheck.json();
    if (!Array.isArray(sessionData) || sessionData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Sessão não encontrada" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch last 8 assistant messages from session
    const msgRes = await fetch(
      `${supabaseUrl}/rest/v1/messages?session_id=eq.${session_id}&role=eq.assistant&order=created_at.desc&limit=8`,
      { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
    );
    const rawMessages = await msgRes.json();
    const messagesArr = Array.isArray(rawMessages) ? rawMessages : [];
    const assistantContent = messagesArr.reverse().map((m: any) => m.content).join("\n\n");

    // Generate structured summary via DeepSeek (OpenAI-compatible)
    const summaryRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Você é um assistente de síntese. Abaixo está a conversa que o agente "${safeAgentLabel}" teve com uma aluna. Crie um resumo estruturado em tópicos com os principais outputs e decisões tomadas. Este resumo será usado como contexto por outros agentes. Seja objetivo e preciso.\n\nCONVERSA:\n${assistantContent}\n\nRESUMO ESTRUTURADO:`,
          },
        ],
      }),
    });

    if (!summaryRes.ok) {
      const errText = await summaryRes.text();
      console.error("Summary AI error:", summaryRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar resumo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const summaryData = await summaryRes.json();
    const summaryText = summaryData.choices?.[0]?.message?.content || "";

    const projectOutputFilter = project_id
      ? `project_id=eq.${project_id}`
      : `project_id=is.null`;

    const existingOutputRes = await fetch(
      `${supabaseUrl}/rest/v1/agent_outputs?user_id=eq.${userId}&agent_id=eq.${agent_id}&${projectOutputFilter}&select=id&limit=1`,
      {
        headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
      }
    );
    const existingOutput = await existingOutputRes.json();

    if (Array.isArray(existingOutput) && existingOutput.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/agent_outputs?id=eq.${existingOutput[0].id}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summary: summaryText }),
      });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/agent_outputs`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, agent_id, project_id: project_id ?? null, summary: summaryText }),
      });
    }

    // Mark session as completed
    await fetch(`${supabaseUrl}/rest/v1/agent_sessions?id=eq.${session_id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() }),
    });

    const progressCompletedAt = new Date().toISOString();
    const projectProgressFilter = project_id
      ? `project_id=eq.${project_id}`
      : `project_id=is.null`;

    const existingProgressRes = await fetch(
      `${supabaseUrl}/rest/v1/user_progress?user_id=eq.${userId}&agent_id=eq.${agent_id}&${projectProgressFilter}&select=id&limit=1`,
      {
        headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
      }
    );
    const existingProgress = await existingProgressRes.json();

    if (Array.isArray(existingProgress) && existingProgress.length > 0) {
      const updateProgressRes = await fetch(
        `${supabaseUrl}/rest/v1/user_progress?id=eq.${existingProgress[0].id}`,
        {
          method: "PATCH",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: true,
            completed_at: progressCompletedAt,
          }),
        }
      );

      if (!updateProgressRes.ok) {
        const errText = await updateProgressRes.text();
        console.error("user_progress update error:", updateProgressRes.status, errText);
      }
    } else {
      const insertProgressRes = await fetch(`${supabaseUrl}/rest/v1/user_progress`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          agent_id,
          project_id: project_id ?? null,
          completed: true,
          completed_at: progressCompletedAt,
        }),
      });

      if (!insertProgressRes.ok) {
        const errText = await insertProgressRes.text();
        console.error("user_progress insert error:", insertProgressRes.status, errText);
      }
    }

    return new Response(
      JSON.stringify({ success: true, summary: summaryText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("complete-agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
