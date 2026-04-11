import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...init.headers,
    },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const email = "juju.karas@gmail.com";
    const password = "Juju2026!";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const publishableKey =
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
      throw new Error("Missing required environment variables");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: usersPage, error: usersError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) {
      throw usersError;
    }

    let user = usersPage.users.find(
      (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: "Juju" },
      });

      if (createError) {
        throw createError;
      }

      user = created.user;
    }

    if (!user) {
      throw new Error("Unable to create or locate admin user");
    }

    const { error: updateUserError } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        name: "Juju",
      },
    });

    if (updateUserError) {
      throw updateUserError;
    }

    const { error: profileUpsertError } = await adminClient.from("profiles").upsert(
      {
        id: user.id,
        email,
        name: "Juju",
        is_admin: true,
        subscription_status: "active",
      },
      { onConflict: "id" },
    );

    if (profileUpsertError) {
      throw profileUpsertError;
    }

    const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const tokenBody = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return json(
        {
          ok: false,
          stage: "password_login",
          details: tokenBody,
        },
        { status: 500 },
      );
    }

    const authedClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${tokenBody.access_token}`,
        },
      },
    });

    const [{ data: isAdmin, error: isAdminError }, { data: profile, error: profileError }] =
      await Promise.all([
        authedClient.rpc("is_admin"),
        authedClient
          .from("profiles")
          .select("id, email, is_admin, subscription_status")
          .eq("id", user.id)
          .single(),
      ]);

    if (isAdminError) {
      throw isAdminError;
    }

    if (profileError) {
      throw profileError;
    }

    return json({
      ok: true,
      email,
      password,
      user_id: user.id,
      is_admin: isAdmin,
      profile,
    });
  } catch (error) {
    return json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});