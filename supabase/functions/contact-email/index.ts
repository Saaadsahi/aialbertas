// @ts-nocheck
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, FormDataEntryValue | string>;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const serviceType = String(body.serviceType ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !serviceType || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not set" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const payload = {
        from: "AIAlberta <onboarding@resend.dev>",

      to: ["saadullahsahi2@gmail.com"],
      reply_to: email,
      subject: `AIAlberta inquiry: ${serviceType}`,
      html: `
        <h2>New AIAlberta Inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Service:</strong> ${escapeHtml(serviceType)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: resendResponse.status, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
