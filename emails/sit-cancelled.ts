import { format } from "date-fns"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html"

export async function sendSitCancelledEmail(params: {
  guestEmail: string
  guestName: string
  hostName: string
  sitTime: Date
  instruction: string
}) {
  const { guestEmail, hostName, sitTime, instruction } = params
  const timeStr = format(sitTime, "EEE d MMM, h:mm a")
  const safeName = escapeHtml(hostName)
  const safeInstruction = escapeHtml(instruction)
  const boardUrl = escapeHtml(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app`)

  await sendEmail({
    to: guestEmail,
    subject: "A sit has been cancelled",
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
  <h2>A sit has been cancelled</h2>
  <p><strong>${safeName}</strong> has cancelled the sit.</p>
  <p><strong>Time:</strong> ${timeStr}</p>
  <p><strong>Instruction:</strong> ${safeInstruction}</p>
  <p>You can find another sit on the <a href="${boardUrl}">board</a>.</p>
</div>`,
  })
}
