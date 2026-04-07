const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const payload = await req.json();

    const event = payload?.event;
    const email = payload?.data?.buyer?.email || payload?.data?.subscriber?.email;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email não encontrado no payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let newStatus: string | null = null;

    if (['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'SUBSCRIPTION_ACTIVATED'].includes(event)) {
      newStatus = 'active';
    } else if (['PURCHASE_REFUNDED', 'PURCHASE_CANCELLED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_EXPIRED'].includes(event)) {
      newStatus = 'inactive';
    }

    if (newStatus) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_status: newStatus,
          hotmart_purchase_id: payload?.data?.purchase?.transaction || null,
        }),
      });
    }

    return new Response(JSON.stringify({ received: true, event, email, newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
