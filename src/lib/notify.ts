import { Resend } from "resend";

/**
 * Sends the uploaded resume to your inbox as an email attachment.
 *
 * Required env vars (add these to Vercel / Render dashboard):
 *   RESEND_API_KEY   — get free at resend.com (100 emails/day free)
 *   NOTIFY_EMAIL     — your Gmail / any email where you want to receive CVs
 */
export async function emailResume(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFY_EMAIL;

  // Skip silently if not configured
  if (!apiKey || !toEmail) return;

  try {
    const resend = new Resend(apiKey);
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    await resend.emails.send({
      from: "Portfolio App <onboarding@resend.dev>", // free Resend sender (no domain needed)
      to: toEmail,
      subject: `📄 New Resume Uploaded — ${fileName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px">
          <h2 style="color:#4f46e5">New Resume Uploaded</h2>
          <p>Someone just uploaded their resume to your portfolio app.</p>
          <table style="border-collapse:collapse;width:100%">
            <tr>
              <td style="padding:6px 12px;color:#6b7280;font-size:14px">File</td>
              <td style="padding:6px 12px;font-size:14px"><strong>${fileName}</strong></td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:6px 12px;color:#6b7280;font-size:14px">Time</td>
              <td style="padding:6px 12px;font-size:14px">${timestamp}</td>
            </tr>
          </table>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            The resume is attached to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: buffer,
        },
      ],
    });

    console.log(`[notify] Resume emailed to ${toEmail}`);
  } catch (err) {
    // Never crash the main flow — just log
    console.error("[notify] Failed to send email:", err);
  }
}
