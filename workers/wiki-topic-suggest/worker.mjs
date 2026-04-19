/**
 * Cloudflare Worker: verifies Turnstile, then optionally forwards to a webhook.
 * Secrets (Worker settings): TURNSTILE_SECRET — your Cloudflare Turnstile secret key.
 * Optional: WEBHOOK_URL — POST JSON payload after successful verification.
 *
 * Deploy: wrangler deploy (see wrangler.toml in this folder) or paste into the dashboard.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const secret = env.TURNSTILE_SECRET ?? env.CLOUDFLARE_SECRET_KEY;
    if (!secret) {
      return json({ error: "Worker is not configured with TURNSTILE_SECRET" }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const token = typeof body.token === "string" ? body.token : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 8000) : "";
    const contact = typeof body.contact === "string" ? body.contact.slice(0, 200) : "";

    if (!token) {
      return json({ error: "Missing Turnstile token" }, 400);
    }
    if (!topic) {
      return json({ error: "Topic is required" }, 400);
    }

    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const outcome = await verify.json();
    if (!outcome.success) {
      return json({ error: "Turnstile verification failed" }, 403);
    }

    const payload = {
      fields: {
        topic: { stringValue: topic },
        notes: { stringValue: notes },
        contact: { stringValue: contact },
        at: { timestampValue: new Date().toISOString() }
      }
    };

    if (env.WEBHOOK_URL) {
      const hook = await fetch(env.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!hook.ok) {
        return json({ error: "Stored verification ok but webhook delivery failed" }, 502);
      }
    }

    return json({ ok: true, received: payload }, 200);
  },
};
