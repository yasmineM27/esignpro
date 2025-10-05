import { generateClientEmailTemplate, generateAgentNotificationTemplate } from "./email-templates"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

// Email service configuration
const EMAIL_CONFIG = {
  // Use verified esignpro.ch domain
  from: process.env.EMAIL_FROM || "noreply@esignpro.ch",
  replyTo: process.env.EMAIL_REPLY_TO || "support@esignpro.ch",
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

  async sendClientInvitation(insuranceCase: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[v0] sendClientInvitation called with:', {
        id: insuranceCase.id,
        client_id: insuranceCase.client_id,
        secure_token: insuranceCase.secure_token,
        case_number: insuranceCase.case_number
      })

      // Récupérer les données du client depuis la base de données
      const { createClient } = require('@supabase/supabase-js')
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Récupérer les informations du client
      console.log('[v0] Fetching client data for client_id:', insuranceCase.client_id)
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .select(`
          id,
          user_id,
          users!inner (
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', insuranceCase.client_id)
        .single()

      console.log('[v0] Client query result:', { clientData, clientError })

      if (clientError || !clientData) {
        console.log('[v0] Client not found or error:', clientError)
        return { success: false, error: `Client non trouvé: ${clientError?.message || 'Données manquantes'}` }
      }

      const clientName = `${clientData.users.first_name} ${clientData.users.last_name}`
      const clientEmail = clientData.users.email
      const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://esignpro.ch"}/client-portal/${insuranceCase.secure_token}`

      const template = generateClientEmailTemplate({
        clientName,
        portalLink,
        documentContent: `Dossier d'assurance ${insuranceCase.case_number} - ${insuranceCase.insurance_company}`
      })

      const emailSent = await this.sendEmail({
        to: clientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (emailSent) {
        return { success: true }
      } else {
        return { success: false, error: 'Échec de l\'envoi de l\'email' }
      }

    } catch (error) {
      console.error('Error in sendClientInvitation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }
}

export const emailService = new EmailService()

// Export the sendEmail function for direct use
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  return emailService['sendEmail'](options)
}
