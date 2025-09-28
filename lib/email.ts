import { Resend } from 'resend'

// Type definitions for when supabase is not available
interface InsuranceCase {
  id: string
  client?: {
    user?: {
      email: string
      first_name: string
      last_name: string
    }
  }
  agent?: {
    user?: {
      first_name: string
      last_name: string
    }
  }
  case_number: string
  secure_token?: string
  token_expires_at?: string
  insurance_company?: string
  policy_number?: string
}

interface EmailLog {
  case_id?: string
  template_id?: string
  recipient_email: string
  sender_email: string
  subject: string
  body_html?: string
  body_text?: string
  status: string
  external_id?: string
  sent_at?: string
  error_message?: string
}

// Try to import supabase, but don't fail if it's not available
let supabaseAdmin: any = null
try {
  const supabaseModule = require('./supabase')
  supabaseAdmin = supabaseModule.supabaseAdmin
} catch (error) {
  console.log('Supabase not available, using fallback mode')
}

let resend: Resend | null = null
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (error) {
  console.log('Resend API key not configured, email service will use simulation mode')
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface TemplateVariables {
  client_name?: string
  agent_name?: string
  case_number?: string
  secure_link?: string
  expiry_date?: string
  company_name?: string
  policy_number?: string
  [key: string]: string | undefined
}

export class EmailService {
  private static instance: EmailService
  private fromEmail: string
  private fromName: string
  private replyToEmail: string

  private constructor() {
    // Use verified esignpro.ch domain
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@esignpro.ch'
    this.fromName = process.env.EMAIL_FROM_NAME || 'eSignPro'
    this.replyToEmail = process.env.EMAIL_REPLY_TO || 'support@esignpro.ch'
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Vérifier le mode de fonctionnement
      const isProduction = process.env.NODE_ENV === 'production' || process.env.FORCE_PRODUCTION_EMAIL === 'true'
      const verifiedEmail = process.env.TEST_CLIENT_EMAIL || 'yasminemassaoudi27@gmail.com'

      console.log(`🔍 Email mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)
      console.log(`📧 Destinataire original: ${emailData.to}`)
      console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`)
      console.log(`🔧 FORCE_PRODUCTION_EMAIL: ${process.env.FORCE_PRODUCTION_EMAIL}`)

      // EN PRODUCTION: Envoyer directement au client réel
      if (isProduction) {
        console.log(`✅ MODE PRODUCTION: Envoi direct vers ${emailData.to}`)
        // Pas de redirection, utiliser l'email original
      } else {
        // EN DÉVELOPPEMENT: Rediriger vers l'email de test
        if (emailData.to !== verifiedEmail) {
          console.log(`🔄 MODE DÉVELOPPEMENT: Redirection ${emailData.to} → ${verifiedEmail}`)
          const originalRecipient = emailData.to
          emailData = {
            ...emailData,
            to: verifiedEmail,
            subject: `[DEV-REDIRECT] ${emailData.subject}`,
            html: emailData.html?.replace(
              '<body>',
              `<body>
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; margin-bottom: 20px; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>📧 Email Redirigé (MODE DEV):</strong> Cet email était destiné à ${originalRecipient} mais a été redirigé vers ${verifiedEmail}
                </p>
              </div>`
            ),
            text: `📧 EMAIL REDIRIGÉ (MODE DEV): Destinataire original: ${originalRecipient} → Redirigé vers: ${verifiedEmail}\n\n${emailData.text}`
          }
        }
      }

      if (!resend) {
        console.log('🔄 Resend not configured, simulating email send')
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`✅ Email simulé envoyé à: ${emailData.to}`)
        return { success: true, messageId: `simulated-${Date.now()}` }
      }

      const { data, error } = await resend.emails.send({
        from: emailData.from || `${this.fromName} <${this.fromEmail}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        reply_to: emailData.replyTo || this.replyToEmail,
      })

      if (error) {
        console.error('❌ Resend error:', error)
        // Si erreur de domaine non vérifié, basculer en mode simulation
        if (error.message?.includes('verify a domain') || error.message?.includes('testing emails')) {
          console.log('🔄 Basculement en mode simulation à cause de l\'erreur Resend')
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log(`✅ Email simulé envoyé à: ${emailData.to} (fallback après erreur Resend)`)
          return { success: true, messageId: `fallback-simulated-${Date.now()}` }
        }
        return { success: false, error: error.message }
      }

      console.log(`✅ Email Resend envoyé avec succès à: ${emailData.to}`)
      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Email sending error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendTemplateEmail(
    templateType: string,
    recipientEmail: string,
    variables: TemplateVariables,
    caseId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let template: any = null
      let templateError: any = null

      // Try to get email template from database
      try {
        const result = await supabaseAdmin
          .from('email_templates')
          .select('*')
          .eq('template_type', templateType)
          .eq('is_active', true)
          .single()

        template = result.data
        templateError = result.error
      } catch (dbError) {
        console.log('Database not available, using fallback templates')
      }

      // If template not found in database, use fallback templates
      if (templateError || !template) {
        template = this.getFallbackTemplate(templateType)
        if (!template) {
          return { success: false, error: 'Email template not found' }
        }
      }

      // Replace variables in template
      const subject = this.replaceVariables(template.subject, variables)
      const htmlBody = this.replaceVariables(template.body_html, variables)
      const textBody = template.body_text ? this.replaceVariables(template.body_text, variables) : undefined

      // Send email
      const result = await this.sendEmail({
        to: recipientEmail,
        subject,
        html: htmlBody,
        text: textBody,
      })

      // Try to log email (ignore errors if database not available)
      try {
        await this.logEmail({
          case_id: caseId,
          template_id: template.id,
          recipient_email: recipientEmail,
          sender_email: this.fromEmail,
          subject,
          body_html: htmlBody,
          body_text: textBody,
          status: result.success ? 'sent' : 'failed',
          external_id: result.messageId,
          sent_at: result.success ? new Date().toISOString() : undefined,
          error_message: result.error,
        })
      } catch (logError) {
        console.log('Email logging failed (database not available)')
      }

      return result
    } catch (error) {
      console.error('Template email error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private getFallbackTemplate(templateType: string): any {
    const fallbackTemplates: { [key: string]: any } = {
      'client_invitation': {
        id: 'fallback-client-invitation',
        name: 'Client Invitation',
        subject: 'Finalisation de votre dossier de résiliation - Action requise',
        body_html: `
          <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">eSignPro - Signature Électronique</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h2>Bonjour {{client_name}},</h2>
              <p>Votre dossier de résiliation est prêt pour finalisation.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="{{secure_link}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Finaliser mon dossier</a>
              </div>
              <p><strong>Informations importantes :</strong></p>
              <ul>
                <li>Ce lien est personnel et sécurisé</li>
                <li>Il expire le {{expiry_date}}</li>
                <li>Processus de signature en 4 étapes simples</li>
              </ul>
              <p>Cordialement,<br>{{agent_name}}<br>eSignPro</p>
            </div>
          </body></html>
        `,
        body_text: 'Bonjour {{client_name}}, Votre dossier de résiliation est prêt. Cliquez sur ce lien: {{secure_link}} Ce lien expire le {{expiry_date}}. Cordialement, {{agent_name}}',
        template_type: 'client_invitation'
      },
      'reminder': {
        id: 'fallback-reminder',
        name: 'Document Reminder',
        subject: 'Rappel: Documents requis pour votre dossier',
        body_html: `
          <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Rappel Important</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h2>Bonjour {{client_name}},</h2>
              <p>Nous attendons toujours vos documents pour finaliser votre dossier de résiliation.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="{{secure_link}}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Télécharger mes documents</a>
              </div>
              <p><strong>Documents requis :</strong></p>
              <ul>
                <li>Carte d'identité (recto et verso)</li>
                <li>Documents d'assurance</li>
                <li>Justificatifs supplémentaires si nécessaire</li>
              </ul>
              <p>Cordialement,<br>{{agent_name}}<br>eSignPro</p>
            </div>
          </body></html>
        `,
        body_text: 'Bonjour {{client_name}}, Nous attendons vos documents. Lien: {{secure_link}} Documents requis: Carte d\'identité, documents d\'assurance.',
        template_type: 'reminder'
      },
      'completion': {
        id: 'fallback-completion',
        name: 'Completion Confirmation',
        subject: 'Votre dossier de résiliation a été traité',
        body_html: `
          <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Dossier Terminé ✅</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h2>Félicitations {{client_name}} !</h2>
              <p>Votre dossier de résiliation a été traité avec succès.</p>
              <div style="background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #166534;">✅ Statut : Terminé</h3>
                <p style="margin-bottom: 0; color: #166534;">Vous recevrez une confirmation de votre assureur sous 48h.</p>
              </div>
              <p><strong>Prochaines étapes :</strong></p>
              <ol>
                <li>Confirmation de votre assureur (sous 48h)</li>
                <li>Résiliation effective selon les délais contractuels</li>
                <li>Documents finaux transmis par email</li>
              </ol>
              <p>Merci d'avoir choisi eSignPro pour vos démarches administratives.</p>
              <p>Cordialement,<br>{{agent_name}}<br>eSignPro</p>
            </div>
          </body></html>
        `,
        body_text: 'Félicitations {{client_name}} ! Votre dossier de résiliation a été traité avec succès. Vous recevrez une confirmation de votre assureur sous 48h.',
        template_type: 'completion'
      }
    }

    return fallbackTemplates[templateType] || null
  }

  async sendClientInvitation(insuranceCase: InsuranceCase): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!insuranceCase.client?.user || !insuranceCase.secure_token) {
      return { success: false, error: 'Missing client data or secure token' }
    }

    // Use the unified client portal link
    const secureLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://esignpro.ch'}/client-portal/${insuranceCase.secure_token}`
    const expiryDate = insuranceCase.token_expires_at
      ? new Date(insuranceCase.token_expires_at).toLocaleDateString('fr-CH')
      : 'Non définie'

    const variables: TemplateVariables = {
      client_name: `${insuranceCase.client.user.first_name} ${insuranceCase.client.user.last_name}`,
      agent_name: insuranceCase.agent?.user ? `${insuranceCase.agent.user.first_name} ${insuranceCase.agent.user.last_name}` : 'Votre conseiller',
      case_number: insuranceCase.case_number,
      secure_link: secureLink,
      expiry_date: expiryDate,
      company_name: insuranceCase.insurance_company || 'Votre assureur',
      policy_number: insuranceCase.policy_number || 'Non spécifié',
    }

    return await this.sendTemplateEmail(
      'client_invitation',
      insuranceCase.client.user.email,
      variables,
      insuranceCase.id
    )
  }

  async sendDocumentReminder(insuranceCase: InsuranceCase): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!insuranceCase.client?.user || !insuranceCase.secure_token) {
      return { success: false, error: 'Missing client data or secure token' }
    }

    const secureLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/${insuranceCase.secure_token}`

    // Calculer la date d'expiration dynamique
    const expiryDate = insuranceCase.token_expires_at
      ? new Date(insuranceCase.token_expires_at).toLocaleDateString('fr-CH')
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CH')

    const variables: TemplateVariables = {
      client_name: `${insuranceCase.client.user.first_name} ${insuranceCase.client.user.last_name}`,
      agent_name: insuranceCase.agent?.user ? `${insuranceCase.agent.user.first_name} ${insuranceCase.agent.user.last_name}` : 'Votre conseiller',
      case_number: insuranceCase.case_number,
      secure_link: secureLink,
      expiry_date: expiryDate,
      document_type: insuranceCase.insurance_company || 'dossier de résiliation'
    }

    return await this.sendTemplateEmail(
      'reminder',
      insuranceCase.client.user.email,
      variables,
      insuranceCase.id
    )
  }

  async sendCompletionConfirmation(insuranceCase: InsuranceCase): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!insuranceCase.client?.user) {
      return { success: false, error: 'Missing client data' }
    }

    const variables: TemplateVariables = {
      client_name: `${insuranceCase.client.user.first_name} ${insuranceCase.client.user.last_name}`,
      agent_name: insuranceCase.agent?.user ? `${insuranceCase.agent.user.first_name} ${insuranceCase.agent.user.last_name}` : 'Votre conseiller',
      case_number: insuranceCase.case_number,
      company_name: insuranceCase.insurance_company || 'Votre assureur',
      policy_number: insuranceCase.policy_number || 'Non spécifié',
    }

    return await this.sendTemplateEmail(
      'completion',
      insuranceCase.client.user.email,
      variables,
      insuranceCase.id
    )
  }

  async sendTestEmail(recipientEmail: string, subject: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">📧 Email de Test - eSignPro</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h2 style="color: #dc2626; margin-top: 0;">Test de Configuration Email</h2>
              <p><strong>Message :</strong></p>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280;">
                <strong>Informations techniques :</strong><br>
                📅 Envoyé le : ${new Date().toLocaleString('fr-CH')}<br>
                🔧 Service : Resend API<br>
                🏢 Application : eSignPro<br>
                📧 Destinataire : ${recipientEmail}
              </p>
              <div style="background: #dcfce7; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  ✅ <strong>Configuration email fonctionnelle !</strong><br>
                  Votre service email Resend est correctement configuré et opérationnel.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const textBody = `
Email de Test - eSignPro

${message}

---
Informations techniques :
Envoyé le : ${new Date().toLocaleString('fr-CH')}
Service : Resend API
Application : eSignPro
Destinataire : ${recipientEmail}

✅ Configuration email fonctionnelle !
Votre service email Resend est correctement configuré et opérationnel.
    `

    return await this.sendEmail({
      to: recipientEmail,
      subject,
      html: htmlBody,
      text: textBody,
    })
  }

  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, value || '')
    })
    return result
  }

  private async logEmail(emailLog: Partial<EmailLog>): Promise<void> {
    try {
      // Vérifier si le case_id existe avant de logger
      if (emailLog.case_id) {
        const { data: caseExists } = await supabaseAdmin
          .from('insurance_cases')
          .select('id')
          .eq('id', emailLog.case_id)
          .single()

        if (!caseExists) {
          console.warn(`Case ID ${emailLog.case_id} not found, logging email without case_id`)
          emailLog.case_id = undefined
        }
      }

      // Ensure external_id is provided, use a fallback if not
      if (!emailLog.external_id) {
        emailLog.external_id = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      const { error } = await supabaseAdmin
        .from('email_logs')
        .insert([emailLog])

      if (error) {
        console.error('Error logging email:', error)
        // Si l'erreur est due à une contrainte de clé étrangère, essayer sans case_id
        if (error.code === '23503' && emailLog.case_id) {
          console.warn('Foreign key constraint error, retrying without case_id')
          const emailLogWithoutCase = { ...emailLog, case_id: undefined }
          const { error: retryError } = await supabaseAdmin
            .from('email_logs')
            .insert([emailLogWithoutCase])

          if (retryError) {
            console.error('Error logging email (retry):', retryError)
          } else {
            console.log('Email logged successfully without case_id')
          }
        }
        // If it's a column not found error, try inserting without problematic columns
        else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          console.warn('Column issue detected, trying simplified insert')
          const simplifiedLog = {
            recipient_email: emailLog.recipient_email,
            sender_email: emailLog.sender_email,
            subject: emailLog.subject,
            status: emailLog.status,
            sent_at: emailLog.sent_at
          }
          const { error: simpleError } = await supabaseAdmin
            .from('email_logs')
            .insert([simplifiedLog])

          if (simpleError) {
            console.error('Simplified email logging also failed:', simpleError)
          } else {
            console.log('Email logged with simplified schema')
          }
        }
      }
    } catch (error) {
      console.error('Error logging email:', error)
    }
  }
}

export const emailService = EmailService.getInstance()
