// Shared SMTP mailer for all BAMAS edge functions.
//
// Uses nodemailer (via Supabase Edge's npm compatibility) instead of
// denomailer: denomailer's quoted-printable encoder emits lowercase hex
// (=3d instead of =3D) and mangles UTF-8 headers, which made Gmail display
// raw MIME source instead of the branded HTML template.
import nodemailer from "npm:nodemailer@6.9.16";

export interface MailAttachment {
  filename: string;
  base64: string;
  contentType?: string;
}

export interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}

export function smtpConfigured(): boolean {
  return !!(Deno.env.get("GMAIL_USER") && Deno.env.get("GMAIL_APP_PASSWORD"));
}

export async function sendMail(mail: OutgoingMail): Promise<void> {
  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) throw new Error("SMTP not configured");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    // ASCII display name; Gmail rewrites the address to the authenticated
    // account unless noreply@ is a registered send-as alias.
    from: `"BAMAS" <noreply@bamas.xyz>`,
    replyTo: "info@bamas.xyz",
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    attachments: (mail.attachments ?? []).map((a) => ({
      filename: a.filename,
      content: a.base64,
      encoding: "base64",
      contentType: a.contentType ?? "application/pdf",
    })),
  });
}
