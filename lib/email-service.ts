import { generateClientEmailTemplate, generateAgentNotificationTemplate } from "./email-templates"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

// Email service configuration
const EMAIL_CONFIG = {
  // For production, you would use environment variables
  from: process.env.EMAIL_FROM || "noreply@gmail.com",
  replyTo: process.env.EMAIL_REPLY_TO || "support@gmail.com",
  // Add your email service API key here
  apiKey: process.env.RESEND_API_KEY,
}

export class EmailService {
  private async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      console.log("[v0] Sending email:", {
        to: options.to,
        subject: options.subject,
        from: EMAIL_CONFIG.from,
      })

      // Use Resend API if API key is configured
      if (EMAIL_CONFIG.apiKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: EMAIL_CONFIG.from,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
            reply_to: EMAIL_CONFIG.replyTo,
          }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Email API error: ${response.status} ${response.statusText} - ${errorData}`)
        }

        const result = await response.json()
        console.log('[v0] Email sent successfully:', result.id)
        return true
      } else {
        // Fallback to simulation if no API key
        console.log("[v0] No API key configured, simulating email send")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("[v0] Email simulated successfully")
        return true
      }
    } catch (error) {
      console.error("[v0] Email sending failed:", error)
      return false
    }
  }

  async sendClientNotification(data: {
    clientEmail: string
    clientName: string
    clientId: string
    portalLink: string
    documentContent: string
  }): Promise<boolean> {
    const template = generateClientEmailTemplate({
      clientName: data.clientName,
      portalLink: data.portalLink,
      documentContent: data.documentContent,
    })

    return this.sendEmail({
      to: data.clientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  async sendAgentNotification(data: {
    agentEmail: string
    clientName: string
    clientEmail: string
    clientId: string
  }): Promise<boolean> {
    const template = generateAgentNotificationTemplate({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientId: data.clientId,
    })

    return this.sendEmail({
      to: data.agentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }
}

export const emailService = new EmailService()
