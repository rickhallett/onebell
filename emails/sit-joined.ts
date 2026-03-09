import { format } from "date-fns"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html"

function buildHtml(partnerName: string, sitTime: Date, instruction: string, duration: number, meetingUrl: string) {
  const timeStr = format(sitTime, "EEE d MMM, h:mm a")
  const safeName = escapeHtml(partnerName)
  const safeInstruction = escapeHtml(instruction)
  const safeUrl = escapeHtml(meetingUrl)
  return `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
  <h2>Your sit has been confirmed</h2>
  <p>You'll be sitting with <strong>${safeName}</strong></p>
  <p><strong>Time:</strong> ${timeStr}</p>
  <p><strong>Duration:</strong> ${duration} minutes</p>
  <p><strong>Instruction:</strong> ${safeInstruction}</p>
  <a href="${safeUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">
    Open Meeting
  </a>
</div>`
}

export async function sendSitJoinedEmails(params: {
  hostEmail: string
  guestEmail: string
  hostName: string
  guestName: string
  sitTime: Date
  instruction: string
  duration: number
  meetingUrl: string
}) {
  const { hostEmail, guestEmail, hostName, guestName, sitTime, instruction, duration, meetingUrl } = params

  await Promise.all([
    sendEmail({
      to: hostEmail,
      subject: "Your sit has been confirmed",
      html: buildHtml(guestName, sitTime, instruction, duration, meetingUrl),
    }),
    sendEmail({
      to: guestEmail,
      subject: "Your sit has been confirmed",
      html: buildHtml(hostName, sitTime, instruction, duration, meetingUrl),
    }),
  ])
}
