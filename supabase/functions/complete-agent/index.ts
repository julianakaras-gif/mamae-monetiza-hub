const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { agent_id, agent_name, agent_role, session_id, user_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch last 8 assistant messages from session
    const msgRes = await fetch(
      `${supabaseUrl}/rest/v1/messages?session_id=eq.${session_id}&role=eq.assistant&order=created_at.desc&limit=8`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const rawMessages = await msgRes.json();
    const messagesArr = Array.isArray(rawMessages) ? rawMessages : [];
    const assistantContent = messagesArr.reverse().map((m: any) => m.content).join("\n\n");

    // Generate structured summary via Anthropic (Haiku for cost efficiency)
    const summaryRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Você é um assistente de síntese. Abaixo está a conversa que o agente "${agent_name} - ${agent_role}" teve com uma aluna. Crie um resumo estruturado em tópicos com os principais outputs e decisões tomadas. Este resumo será usado como contexto por outros agentes. Seja objetivo e preciso.\n\nCONVERSA:\n${assistantContent}\n\nRESUMO ESTRUTURADO:`,
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
    const summaryText = summaryData.content?.[0]?.text || "";

    // Upsert agent_outputs
    await fetch(`${supabaseUrl}/rest/v1/agent_outputs`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ user_id, agent_id, summary: summaryText }),
    });

    // Mark session as completed
    await fetch(`${supabaseUrl}/rest/v1/agent_sessions?id=eq.${session_id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() }),
    });

    // Upsert user_progress
    await fetch(`${supabaseUrl}/rest/v1/user_progress`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ user_id, agent_id, completed: true, completed_at: new Date().toISOString() }),
    });

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
