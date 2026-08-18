// Supabase Edge Function: notify-signup
// Handles newsletter subscriptions and contact-form messages:
//   1. stores the record (service role)
//   2. emails a confirmation to the visitor  (from noreply@bamas.xyz)
//   3. emails a notification to info@bamas.xyz
// Same protections as send-membership-application: origin allow-list,
// per-IP rate limit, honeypot.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const ADMIN_EMAIL = "info@bamas.xyz";
const FROM_ADDRESS = "noreply@bamas.xyz"; // requires alias on the Workspace account; Gmail falls back to the authenticated user otherwise

const ALLOWED_ORIGINS = new Set([
  "https://www.bamas.xyz",
  "https://bamas.xyz",
  "http://localhost:8080",
  "http://localhost:4173",
]);

const corsHeadersFor = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://www.bamas.xyz",
  "Vary": "Origin",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
});

const RATE_LIMIT = 10;
const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT;
}

interface Payload {
  type: "newsletter" | "contact";
  email: string;
  language?: string;
  website_hp?: string;
  // contact fields
  name?: string;
  topic?: string;
  message?: string;
  // newsletter fields
  source?: string;
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) throw new Error("SMTP not configured");
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: user, password: pass },
    },
  });
  try {
    await client.send({
      from: `BAMAS | БАЗАП <${FROM_ADDRESS}>`,
      to,
      replyTo: ADMIN_EMAIL,
      subject,
      html,
    });
  } finally {
    await client.close();
  }
}

const LOGO_URL = "https://www.bamas.xyz/email/bamas-logo.png";

/** Bulletproof branded shell: table layout + inline styles (email clients),
 *  BAMAS logo in every email, green accent bar, footer with links. */
const wrap = (body: string, preheader = "") => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#eef2f6;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Logo header -->
        <tr><td style="background-color:#ffffff;border-radius:14px 14px 0 0;padding:26px 32px 18px;text-align:center;">
          <a href="https://www.bamas.xyz" style="text-decoration:none;">
            <img src="${LOGO_URL}" width="150" alt="BAMAS — Bulgarian Additive Manufacturing Association" style="display:inline-block;width:150px;height:auto;border:0;">
          </a>
        </td></tr>
        <!-- Accent bar -->
        <tr><td style="height:5px;background:#0C9D6A;font-size:0;line-height:0;">&nbsp;</td></tr>
        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a2332;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background-color:#052e40;border-radius:0 0 14px 14px;padding:20px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 6px;color:#ffffff;font-size:13px;font-weight:bold;">БАЗАП | BAMAS</p>
          <p style="margin:0 0 10px;color:#9fc7bb;font-size:11px;">Българска асоциация за адитивно производство · София, България</p>
          <p style="margin:0;font-size:12px;">
            <a href="https://www.bamas.xyz" style="color:#5FE0AC;text-decoration:none;">bamas.xyz</a>
            &nbsp;·&nbsp;<a href="mailto:info@bamas.xyz" style="color:#5FE0AC;text-decoration:none;">info@bamas.xyz</a>
            &nbsp;·&nbsp;<a href="https://www.linkedin.com/company/bulgarian-additive-manufacturing-association/" style="color:#5FE0AC;text-decoration:none;">LinkedIn</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (rateLimited(ip)) return json({ error: "Too many requests" }, 429);

    const payload: Payload = await req.json();

    // Honeypot: pretend success, do nothing
    if (payload.website_hp) return json({ success: true });

    const email = (payload.email ?? "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "Valid email required" }, 400);
    }
    const bg = payload.language === "bg";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ── 1. Store first: the record must survive any email failure ──
    let alreadySubscribed = false;
    if (payload.type === "newsletter") {
      const { error } = await supabaseAdmin.from("newsletter_subscribers").insert({
        email,
        language: bg ? "bg" : "en",
        source: payload.source ?? "footer",
        confirmed: true,
      });
      if (error) {
        if (error.code === "23505") alreadySubscribed = true;
        else throw new Error(`store failed: ${error.message}`);
      }
    } else if (payload.type === "contact") {
      const name = (payload.name ?? "").trim().slice(0, 200);
      const message = (payload.message ?? "").trim().slice(0, 5000);
      if (!name || !message) return json({ error: "Name and message required" }, 400);
      const { error } = await supabaseAdmin.from("contact_messages").insert({
        name,
        email,
        topic: payload.topic ?? "general",
        message,
        language: bg ? "bg" : "en",
      });
      if (error) throw new Error(`store failed: ${error.message}`);
    } else {
      return json({ error: "Unknown type" }, 400);
    }

    // ── 2. Emails (best-effort — storage already succeeded) ──
    let emailsSent = false;
    try {
      if (payload.type === "newsletter" && !alreadySubscribed) {
        await sendMail(
          email,
          bg ? "Успешен абонамент за бюлетина на БАЗАП" : "You are subscribed to the BAMAS newsletter",
          wrap(bg
            ? `<h2 style="margin-top:0">Благодарим за абонамента!</h2>
               <p>Вие се абонирахте успешно за бюлетина на Българската асоциация за адитивно производство (БАЗАП).</p>
               <p>Ще получавате новини за партньорства, събития и възможности за финансиране в областта на адитивното производство.</p>`
            : `<h2 style="margin-top:0">Thank you for subscribing!</h2>
               <p>You have successfully subscribed to the newsletter of the Bulgarian Additive Manufacturing Association (BAMAS).</p>
               <p>You will receive news about partnerships, events and funding opportunities in additive manufacturing.</p>`),
        );
        await sendMail(
          ADMIN_EMAIL,
          `New newsletter subscriber: ${email}`,
          wrap(`<h2 style="margin-top:0">New newsletter subscriber</h2>
                <p><strong>Email:</strong> ${esc(email)}<br>
                <strong>Language:</strong> ${bg ? "BG" : "EN"}<br>
                <strong>Source:</strong> ${esc(payload.source ?? "footer")}</p>`),
        );
      } else if (payload.type === "contact") {
        await sendMail(
          email,
          bg ? "Получихме Вашето съобщение — БАЗАП" : "We received your message — BAMAS",
          wrap(bg
            ? `<h2 style="margin-top:0">Съобщението е получено</h2>
               <p>Благодарим, че се свързахте с БАЗАП. Ще Ви отговорим възможно най-скоро на този имейл адрес.</p>`
            : `<h2 style="margin-top:0">Your message has been received</h2>
               <p>Thank you for contacting BAMAS. We will get back to you at this email address as soon as possible.</p>`),
        );
        await sendMail(
          ADMIN_EMAIL,
          `New contact message from ${payload.name} (${payload.topic ?? "general"})`,
          wrap(`<h2 style="margin-top:0">New contact form message</h2>
                <p><strong>Name:</strong> ${esc(payload.name ?? "")}<br>
                <strong>Email:</strong> ${esc(email)}<br>
                <strong>Topic:</strong> ${esc(payload.topic ?? "general")}</p>
                <p style="white-space:pre-wrap;background:#f8fafc;border-left:3px solid #0C9D6A;padding:12px">${esc(payload.message ?? "")}</p>`),
        );
      }
      emailsSent = true;
    } catch (mailError) {
      console.error("Email sending failed (record already stored):", mailError);
    }

    return json({ success: true, alreadySubscribed, emailsSent });
  } catch (error) {
    console.error("notify-signup error:", error);
    return json({ error: (error as Error).message ?? "Internal error" }, 500);
  }
});
