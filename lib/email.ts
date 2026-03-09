import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "onebell <noreply@onebell.app>"

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[email] RESEND_API_KEY not set, skipping:", opts.subject)
      return
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
  } catch (error) {
    console.error("[email] Failed to send:", opts.subject, error)
  }
}
