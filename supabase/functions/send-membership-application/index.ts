// Supabase Edge Function to generate PDF from membership application and send emails
// This function generates a filled PDF and sends it to both BAMAS and the applicant

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { sendMail as smtpSend } from "../_shared/mailer.ts";

// Only the association's own origins may call this relay (was "*": an open
// email relay that anyone could script against the Resend quota).
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

// Naive in-instance rate limit: max N submissions per IP per hour. Edge
// instances recycle, so this is best-effort — combined with the origin check
// and honeypot it stops casual abuse without adding a dependency.
const RATE_LIMIT = 5;
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

interface FormData {
  applicationType: string;
  fullName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  nationality: string;
  currentEmployment: string;
  experienceLevel: string;
  legalName: string;
  legalForm: string;
  registrationNumber: string;
  countryOfRegistration: string;
  registeredAddress: string;
  website: string;
  mainActivity: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  linkedIn: string;
  motivation: string;
  willingToContribute: string;
  contributeExplanation: string;
  valuesAlign: string;
  valuesExplanation: string;
  industryReputation: string;
  amCompanyRelationships: string;
  politicalAffiliations: string;
  readArticles: boolean;
  confirmAccuracy: boolean;
  understandApproval: boolean;
  agreeGDPR: boolean;
  signaturePlace: string;
  signatureDate: string;
  signatureName: string;
}

interface MembershipApplicationRequest {
  formData: FormData;
  language: string;
}

// Sanitize text for PDF - remove characters not supported by WinAnsi encoding
function sanitizeForPDF(text: string): string {
  if (!text) return "";
  // Replace Cyrillic and other non-WinAnsi characters with transliteration or remove them
  // WinAnsi supports: ASCII (0x20-0x7E) and Latin-1 Supplement (0xA0-0xFF)
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
}

// Generate the PDF document
async function generatePDF(formData: FormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const tealColor = rgb(0.06, 0.46, 0.43); // #0f766e
  const grayColor = rgb(0.4, 0.4, 0.4);
  const blackColor = rgb(0, 0, 0);

  // Add first page
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  let yPosition = height - 50;

  // Header
  page.drawText("BULGARIAN ADDITIVE MANUFACTURING ASSOCIATION", {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: tealColor,
  });

  yPosition -= 15;
  page.drawText("BAMAS", {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: grayColor,
  });

  yPosition -= 30;
  page.drawText("MEMBERSHIP APPLICATION FORM", {
    x: 50,
    y: yPosition,
    size: 16,
    font: fontBold,
    color: blackColor,
  });

  // Helper function to add a section
  const addSection = (title: string, titleBg?: string) => {
    yPosition -= 25;
    if (yPosition < 80) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: tealColor,
    });
    if (titleBg) {
      yPosition -= 12;
      page.drawText(titleBg, {
        x: 50,
        y: yPosition,
        size: 9,
        font: font,
        color: grayColor,
      });
    }
  };

  // Helper function to add a field
  const addField = (label: string, value: string, labelBg?: string) => {
    yPosition -= 18;
    if (yPosition < 80) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }

    page.drawText(`${sanitizeForPDF(label)}:`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: font,
      color: grayColor,
    });

    page.drawText(sanitizeForPDF(value) || "N/A", {
      x: 220,
      y: yPosition,
      size: 9,
      font: font,
      color: blackColor,
    });

    if (labelBg) {
      yPosition -= 10;
      page.drawText(labelBg, {
        x: 50,
        y: yPosition,
        size: 7,
        font: font,
        color: grayColor,
      });
    }
  };

  // Helper to add checkbox field
  const addCheckbox = (label: string, checked: boolean) => {
    yPosition -= 16;
    if (yPosition < 80) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }

    const checkMark = checked ? "[X]" : "[ ]";
    page.drawText(checkMark, {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: checked ? tealColor : grayColor,
    });

    page.drawText(sanitizeForPDF(label), {
      x: 70,
      y: yPosition,
      size: 8,
      font: font,
      color: blackColor,
    });
  };

  // Application Type
  addSection("A. APPLICANT INFORMATION");

  const applicationTypeLabels: Record<string, string> = {
    individual: "Individual Membership",
    company: "Company / Legal Entity",
    academic: "Academic / Research Institution",
    public: "Public Organisation",
    private: "Private Organisation",
    foreign: "Foreign Partner / International Org.",
  };

  addField("Type of Application", applicationTypeLabels[formData.applicationType] || formData.applicationType);

  // Personal or Organization details based on type
  if (formData.applicationType === "individual") {
    addSection("B. PERSONAL DETAILS");
    addField("Full Name", formData.fullName);
    addField("Date of Birth", formData.dateOfBirth);
    addField("Age", formData.age);
    addField("Gender", formData.gender || "Not specified");
    addField("Nationality", formData.nationality);
    addField("Current Employment", formData.currentEmployment);

    const experienceLabels: Record<string, string> = {
      none: "None",
      "1-3": "1-3 years",
      "3-5": "3-5 years",
      "5-10": "5-10 years",
      "10+": "10+ years",
    };
    addField("Experience in AM", experienceLabels[formData.experienceLevel] || "Not specified");
  } else {
    addSection("C. ORGANISATION DETAILS");
    addField("Legal Name", formData.legalName);
    addField("Legal Form", formData.legalForm);
    addField("Registration Number", formData.registrationNumber);
    addField("Country of Registration", formData.countryOfRegistration);
    addField("Registered Address", formData.registeredAddress);
    addField("Website", formData.website);
    addField("Main Activity (AM)", formData.mainActivity?.substring(0, 80) || "N/A");
  }

  // Contact Information
  addSection("D. CONTACT INFORMATION");
  addField("Address", formData.address);
  addField("City", formData.city);
  addField("Country", formData.country);
  addField("Email", formData.email);
  addField("Phone", formData.phone);
  addField("LinkedIn", formData.linkedIn || "Not provided");

  // Motivation
  addSection("E. MOTIVATION AND ALIGNMENT");

  // Wrap motivation text
  const motivationLines = wrapText(formData.motivation || "Not provided", 70);
  yPosition -= 15;
  page.drawText("Motivation for membership:", {
    x: 50,
    y: yPosition,
    size: 9,
    font: font,
    color: grayColor,
  });

  for (const line of motivationLines.slice(0, 4)) {
    yPosition -= 12;
    if (yPosition < 80) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    page.drawText(sanitizeForPDF(line), {
      x: 50,
      y: yPosition,
      size: 9,
      font: font,
      color: blackColor,
    });
  }

  const contributionLabels: Record<string, string> = {
    yes: "Yes",
    no: "No",
    partially: `Partially: ${formData.contributeExplanation}`,
  };
  addField("Willing to contribute", contributionLabels[formData.willingToContribute] || "Not specified");

  const valuesLabels: Record<string, string> = {
    yes: "Yes",
    no: "No",
    partially: `Partially: ${formData.valuesExplanation}`,
  };
  addField("Values align with BAMAS", valuesLabels[formData.valuesAlign] || "Not specified");

  // Professional Background
  addSection("F. PROFESSIONAL BACKGROUND");

  const reputationLabels: Record<string, string> = {
    no_prior: "No prior experience",
    positive: "Positive",
    negative: "Negative",
    mixed: "Mixed/Neutral",
  };
  addField("Industry Reputation", reputationLabels[formData.industryReputation] || "Not specified");
  addField("AM Company Relationships", formData.amCompanyRelationships?.substring(0, 60) || "None specified");
  addField("Political Affiliations", formData.politicalAffiliations?.substring(0, 60) || "None");

  // Compliance
  addSection("G. COMPLIANCE AND DECLARATIONS");
  addCheckbox("I have read and understood the Articles of Association of BAMAS", formData.readArticles);
  addCheckbox("I confirm that the information provided is true, complete, and accurate", formData.confirmAccuracy);
  addCheckbox("I understand membership is subject to approval by the BAMAS Board", formData.understandApproval);
  addCheckbox("I agree to data processing in accordance with GDPR", formData.agreeGDPR);

  // Signature
  addSection("H. SIGNATURE");
  addField("Place", formData.signaturePlace);
  addField("Date", formData.signatureDate);
  addField("Full Name", formData.signatureName);

  yPosition -= 25;
  page.drawText("Digital Signature: Signed electronically", {
    x: 50,
    y: yPosition,
    size: 10,
    font: fontBold,
    color: tealColor,
  });

  // Footer on last page
  yPosition -= 40;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 0.5,
    color: grayColor,
  });

  yPosition -= 15;
  page.drawText(`Application submitted: ${new Date().toISOString()}`, {
    x: 50,
    y: yPosition,
    size: 8,
    font: font,
    color: grayColor,
  });

  yPosition -= 12;
  page.drawText("BULGARIAN ADDITIVE MANUFACTURING ASSOCIATION (BAMAS) - www.bamas.xyz", {
    x: 50,
    y: yPosition,
    size: 8,
    font: font,
    color: tealColor,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Helper function to wrap text
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

// Base64 encode the PDF for email attachment
function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Create email HTML template
function createEmailHTML(formData: FormData, isAdminCopy: boolean): string {
  const applicantName = formData.fullName || formData.legalName || "Applicant";

  if (isAdminCopy) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Membership Application</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0f766e;
    }
    h1 {
      color: #0f766e;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #fef3c7;
      color: #92400e;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .info-grid {
      display: grid;
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      padding: 12px;
      background-color: #f7f7f7;
      border-radius: 6px;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .info-value {
      font-weight: 600;
      color: #333;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="text-align:center;padding-bottom:18px;">
        <a href="https://www.bamas.xyz"><img src="https://www.bamas.xyz/email/bamas-logo.png" width="150" alt="BAMAS — Bulgarian Additive Manufacturing Association" style="display:inline-block;width:150px;height:auto;border:0;"></a>
      </div>
      <div style="height:4px;background:#0C9D6A;border-radius:2px;margin-bottom:22px;"></div>
      <h1>New Membership Application</h1>
      <span class="badge">Pending Review</span>
    </div>
    
    <p>A new membership application has been submitted and requires review by the Board of Directors.</p>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Applicant Name</div>
        <div class="info-value">${applicantName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Application Type</div>
        <div class="info-value">${formData.applicationType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${formData.email}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Phone</div>
        <div class="info-value">${formData.phone}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Location</div>
        <div class="info-value">${formData.city}, ${formData.country}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Submitted</div>
        <div class="info-value">${new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</div>
      </div>
    </div>
    
    <p><strong>The complete application form is attached as a PDF.</strong></p>
    
<div class="footer" style="background:#052e40;border-radius:10px;padding:18px;text-align:center;margin-top:26px;">
      <p style="margin:0 0 4px;color:#ffffff;font-weight:bold;font-size:13px;">БАЗАП | BAMAS</p>
      <p style="margin:0 0 8px;color:#9fc7bb;font-size:11px;">Българска асоциация за адитивно производство · София, България</p>
      <p style="margin:0;font-size:12px;"><a href="https://www.bamas.xyz" style="color:#5FE0AC;text-decoration:none;">bamas.xyz</a> · <a href="mailto:info@bamas.xyz" style="color:#5FE0AC;text-decoration:none;">info@bamas.xyz</a></p>
    </div>
  </div>
</body>
</html>
    `;
  } else {
    // Applicant confirmation email
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - BAMAS</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .success-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #0f766e, #14b8a6);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .success-icon svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    h1 {
      color: #0f766e;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      font-size: 16px;
    }
    .content {
      margin-bottom: 30px;
    }
    .steps {
      background-color: #f0fdfa;
      border-left: 4px solid #0f766e;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .steps h3 {
      margin: 0 0 15px 0;
      color: #0f766e;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
    }
    .steps li {
      margin-bottom: 10px;
    }
    .payment-box {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .payment-box h3 {
      margin: 0 0 10px 0;
      color: #92400e;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #0f766e;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .footer a {
      color: #0f766e;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="text-align:center;padding-bottom:18px;">
        <a href="https://www.bamas.xyz"><img src="https://www.bamas.xyz/email/bamas-logo.png" width="150" alt="BAMAS — Bulgarian Additive Manufacturing Association" style="display:inline-block;width:150px;height:auto;border:0;"></a>
      </div>
      <div style="height:4px;background:#0C9D6A;border-radius:2px;margin-bottom:22px;"></div>
      <div class="success-icon">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <h1>Application Received!</h1>
      <p class="subtitle">Заявлението Ви е получено успешно!</p>
    </div>
    
    <div class="content">
      <p>Dear ${applicantName},</p>
      
      <p>Thank you for submitting your membership application to the Bulgarian Additive Manufacturing Association (BAMAS). We have successfully received your application.</p>
      
      <div class="steps">
        <h3>Next Steps:</h3>
        <ol>
          <li><strong>Payment:</strong> Please complete the membership fee payment using the bank details provided on the confirmation page.</li>
          <li><strong>Review:</strong> Your application will be reviewed by the BAMAS Board of Directors.</li>
          <li><strong>Decision:</strong> You will be notified of the decision via email.</li>
        </ol>
      </div>
      
      <div class="payment-box">
        <h3>⚠️ Important: Membership Fee Payment</h3>
        <p>Please ensure you complete the membership fee payment to finalize your application. Refer to the confirmation page or the attached PDF for bank details.</p>
      </div>
      
      <p>A copy of your application is attached to this email for your records.</p>
      
      <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:info@bamas.xyz">info@bamas.xyz</a>.</p>
      
      <p>Best regards,<br>The BAMAS Team</p>
    </div>
    
<div class="footer" style="background:#052e40;border-radius:10px;padding:18px;text-align:center;margin-top:26px;">
      <p style="margin:0 0 4px;color:#ffffff;font-weight:bold;font-size:13px;">БАЗАП | BAMAS</p>
      <p style="margin:0 0 8px;color:#9fc7bb;font-size:11px;">Българска асоциация за адитивно производство · София, България</p>
      <p style="margin:0;font-size:12px;"><a href="https://www.bamas.xyz" style="color:#5FE0AC;text-decoration:none;">bamas.xyz</a> · <a href="mailto:info@bamas.xyz" style="color:#5FE0AC;text-decoration:none;">info@bamas.xyz</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// ────────────────────────────────────────────────────────────
// Email transport: Google Workspace SMTP first (GMAIL_USER +
// GMAIL_APP_PASSWORD secrets), Resend API as fallback (RESEND_API_KEY).
// Returns "gmail" | "resend" | null (not configured).
// ────────────────────────────────────────────────────────────
interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  attachment?: { filename: string; base64: string };
}

function emailTransport(): "gmail" | "resend" | null {
  if (Deno.env.get("GMAIL_USER") && Deno.env.get("GMAIL_APP_PASSWORD")) return "gmail";
  if (Deno.env.get("RESEND_API_KEY")) return "resend";
  return null;
}

async function sendViaGmail(mail: OutgoingEmail): Promise<void> {
  await smtpSend({
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    attachments: mail.attachment
      ? [{ filename: mail.attachment.filename, base64: mail.attachment.base64 }]
      : [],
  });
}

async function sendViaResend(mail: OutgoingEmail): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    },
    body: JSON.stringify({
      from: "BAMAS Membership <noreply@bamas.xyz>",
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      attachments: mail.attachment
        ? [{ filename: mail.attachment.filename, content: mail.attachment.base64 }]
        : [],
    }),
  });
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
}

async function sendEmail(mail: OutgoingEmail): Promise<void> {
  const transport = emailTransport();
  if (transport === "gmail") return sendViaGmail(mail);
  if (transport === "resend") return sendViaResend(mail);
  throw new Error("No email transport configured");
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req.headers.get("origin"));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Best-effort per-IP rate limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (rateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminEmail = "info@bamas.xyz";

    // Parse request body
    const { formData, language, website_hp }: MembershipApplicationRequest & { website_hp?: string } = await req.json();

    // Honeypot: real users never fill this hidden field. Bots do — pretend
    // success so they don't adapt, send nothing.
    if (website_hp) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!formData || !formData.email) {
      return new Response(
        JSON.stringify({ error: "Form data with email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store the application FIRST — it must survive any email failure.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    let applicationId: string | null = null;
    try {
      const { data: inserted } = await supabaseAdmin
        .from("membership_applications")
        .insert({
          application_type: formData.applicationType ?? "unknown",
          applicant_name: formData.fullName || formData.legalName || "unknown",
          applicant_email: formData.email,
          payload: formData,
        })
        .select("id")
        .single();
      applicationId = inserted?.id ?? null;
    } catch (dbError) {
      // Don't block the email path on a storage error, but make it visible.
      console.error("Failed to store membership application:", dbError);
    }

    console.log(`Processing membership application for: ${formData.email}`);

    // Generate the PDF
    const pdfBytes = await generatePDF(formData);
    const pdfBase64 = base64Encode(pdfBytes);

    console.log(`PDF generated successfully, size: ${pdfBytes.length} bytes`);

    // Create email content
    const adminEmailHtml = createEmailHTML(formData, true);
    const applicantEmailHtml = createEmailHTML(formData, false);

    const applicantName = formData.fullName || formData.legalName || "Applicant";
    const fileName = `BAMAS_Application_${applicantName.replace(/\s+/g, "_")}_${formData.signatureDate}.pdf`;

    // Send emails: Google Workspace SMTP preferred, Resend fallback.
    if (emailTransport()) {
      // Admin notification (info@bamas.xyz) — must succeed
      await sendEmail({
        to: adminEmail,
        subject: `New Membership Application: ${applicantName}`,
        html: adminEmailHtml,
        attachment: { filename: fileName, base64: pdfBase64 },
      });
      console.log("Admin email sent successfully");

      if (applicationId) {
        await supabaseAdmin
          .from("membership_applications")
          .update({ email_sent: true })
          .eq("id", applicationId);
      }

      // Applicant confirmation — best-effort
      try {
        await sendEmail({
          to: formData.email,
          subject: "Application Received - BAMAS Membership",
          html: applicantEmailHtml,
          attachment: { filename: fileName, base64: pdfBase64 },
        });
        console.log("Applicant confirmation email sent successfully");
      } catch (applicantError) {
        console.error("Failed to send applicant email:", applicantError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Application submitted and emails sent successfully",
          applicant: applicantName,
          email: formData.email,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.warn("No email transport configured (GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY). Emails not sent.");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Application processed (email service not configured)",
          warning: "Email sending is not configured. Please contact info@bamas.xyz directly.",
          applicant: applicantName,
          email: formData.email,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing membership application:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process membership application",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
