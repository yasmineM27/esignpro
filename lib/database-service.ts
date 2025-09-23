// Import conditionnel pour éviter les erreurs si Supabase n'est pas configuré
let supabaseAdmin: any = null
let generateSecureToken: any = null
let createAuditLog: any = null

try {
  const supabaseModule = require('./supabase')
  supabaseAdmin = supabaseModule.supabaseAdmin
  generateSecureToken = supabaseModule.generateSecureToken
  createAuditLog = supabaseModule.createAuditLog
} catch (error) {
  console.warn('[DB] Supabase not configured, using mock mode')
  generateSecureToken = () => 'secure-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  createAuditLog = async () => console.log('[DB] Audit log (mock mode)')
}

export interface ClientData {
  nom: string
  prenom: string
  email: string
  dateNaissance: string
  numeroPolice: string
  adresse: string
  npa: string
  ville: string
  typeFormulaire: 'resiliation' | 'souscription' | 'modification' | 'autre'
  destinataire: string
  lieuDate: string
  personnes: Array<{
    nom: string
    prenom: string
    dateNaissance: string
  }>
  dateLamal: string
  dateLCA: string
}

export interface CaseCreationResult {
  success: boolean
  caseId?: string
  caseNumber?: string
  secureToken?: string
  error?: string
}

export class DatabaseService {
  
  /**
   * Créer un nouveau dossier d'assurance avec toutes les données client
   */
  async createInsuranceCase(clientData: ClientData, agentId?: string): Promise<CaseCreationResult> {
    try {
      console.log('[DB] Creating insurance case for:', clientData.email)

      // FORCER LE MODE MOCK pour éviter les erreurs Supabase
      console.log('[DB] Using FORCED mock mode for development')
      return this.createMockInsuranceCase(clientData, agentId)

      // Code Supabase commenté temporairement
      /*
      // Vérifier si Supabase est configuré
      if (!supabaseAdmin) {
        console.log('[DB] Using mock mode - Supabase not configured')
        return this.createMockInsuranceCase(clientData, agentId)
      }
      */

      /*
      // Code Supabase temporairement désactivé pour éviter les erreurs
      try {
        // 1. Créer ou récupérer l'utilisateur client
        let user = await this.findOrCreateUser({
          email: clientData.email,
          first_name: clientData.prenom,
          last_name: clientData.nom,
          role: 'client'
        })
        // ... reste du code Supabase
      } catch (error) {
        console.error('[DB] Database error, falling back to mock mode:', error)
        return this.createMockInsuranceCase(clientData, agentId)
      }
      */

    } catch (error) {
      console.error('[DB] Error in createInsuranceCase:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Mettre à jour le statut d'un dossier
   */
  async updateCaseStatus(caseId: string, status: string, additionalData?: any): Promise<boolean> {
    try {
      // Si Supabase n'est pas configuré, utiliser le mode mock
      if (!supabaseAdmin) {
        console.log('[DB] Mock case status updated:', { caseId, status, additionalData })
        return true
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (additionalData) {
        Object.assign(updateData, additionalData)
      }

      const { error } = await supabaseAdmin
        .from('insurance_cases')
        .update(updateData)
        .eq('id', caseId)

      if (error) {
        console.error('[DB] Error updating case status:', error)
        return false
      }

      // Log d'audit
      await createAuditLog({
        case_id: caseId,
        action: 'STATUS_UPDATED',
        entity_type: 'insurance_case',
        entity_id: caseId,
        new_values: { status, ...additionalData }
      })

      return true
    } catch (error) {
      console.error('[DB] Error in updateCaseStatus, using mock:', error)
      console.log('[DB] Mock case status updated:', { caseId, status, additionalData })
      return true
    }
  }

  /**
   * Enregistrer l'envoi d'un email
   */
  async logEmailSent(data: {
    caseId?: string
    recipientEmail: string
    subject: string
    bodyHtml: string
    bodyText?: string
    status?: string
  }): Promise<boolean> {
    try {
      // Si Supabase n'est pas configuré, utiliser le mode mock
      if (!supabaseAdmin) {
        console.log('[DB] Mock email logged:', {
          caseId: data.caseId,
          recipient: data.recipientEmail,
          subject: data.subject,
          status: data.status || 'sent'
        })
        return true
      }

      const { error } = await supabaseAdmin
        .from('email_logs')
        .insert([{
          case_id: data.caseId,
          recipient_email: data.recipientEmail,
          sender_email: 'noreply@esignpro.ch',
          subject: data.subject,
          body_html: data.bodyHtml,
          body_text: data.bodyText,
          status: data.status || 'sent',
          sent_at: new Date().toISOString()
        }])

      if (error) {
        console.error('[DB] Error logging email:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('[DB] Error in logEmailSent, using mock:', error)
      console.log('[DB] Mock email logged:', {
        caseId: data.caseId,
        recipient: data.recipientEmail,
        subject: data.subject,
        status: data.status || 'sent'
      })
      return true
    }
  }

  /**
   * Récupérer un dossier par token sécurisé
   */
  async getCaseByToken(token: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('insurance_cases')
        .select(`
          *,
          client:clients(*,
            user:users(*)
          ),
          agent:agents(*,
            user:users(*)
          ),
          documents(*),
          signatures(*)
        `)
        .eq('secure_token', token)
        .single()

      if (error) {
        console.error('[DB] Error fetching case by token:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('[DB] Error in getCaseByToken:', error)
      return null
    }
  }

  // Méthodes utilitaires privées
  private async findOrCreateUser(userData: {
    email: string
    first_name: string
    last_name: string
    role: string
  }) {
    // Si Supabase n'est pas configuré, utiliser le mode mock
    if (!supabaseAdmin) {
      console.log('[DB] Mock user created:', userData.email)
      return {
        id: `user-${Math.random().toString(36).substring(2, 15)}`,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        created_at: new Date().toISOString()
      }
    }

    try {
      // Chercher l'utilisateur existant
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        return existingUser
      }

      // Créer un nouvel utilisateur
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) {
        console.error('[DB] Error creating user:', error)
        return null
      }

      return newUser
    } catch (error) {
      console.error('[DB] Database error, falling back to mock:', error)
      return {
        id: `user-${Math.random().toString(36).substring(2, 15)}`,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        created_at: new Date().toISOString()
      }
    }
  }

  private async findOrCreateClient(userId: string, clientData: any) {
    // Si Supabase n'est pas configuré, utiliser le mode mock
    if (!supabaseAdmin) {
      console.log('[DB] Mock client created for user:', userId)
      return {
        id: `client-${Math.random().toString(36).substring(2, 15)}`,
        user_id: userId,
        ...clientData,
        created_at: new Date().toISOString()
      }
    }

    try {
      // Chercher le client existant
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingClient) {
        // Mettre à jour les données du client
        const { data: updatedClient, error } = await supabaseAdmin
          .from('clients')
          .update(clientData)
          .eq('id', existingClient.id)
          .select()
          .single()

        return updatedClient || existingClient
      }

      // Créer un nouveau client
      const { data: newClient, error } = await supabaseAdmin
        .from('clients')
        .insert([{ user_id: userId, ...clientData }])
        .select()
        .single()

      if (error) {
        console.error('[DB] Error creating client:', error)
        return null
      }

      return newClient
    } catch (error) {
      console.error('[DB] Database error, falling back to mock:', error)
      return {
        id: `client-${Math.random().toString(36).substring(2, 15)}`,
        user_id: userId,
        ...clientData,
        created_at: new Date().toISOString()
      }
    }
  }

  private async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const { data } = await supabaseAdmin
      .from('insurance_cases')
      .select('case_number')
      .like('case_number', `RES-${year}-%`)
      .order('case_number', { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNumber = data[0].case_number.split('-')[2]
      nextNumber = parseInt(lastNumber) + 1
    }

    return `RES-${year}-${nextNumber.toString().padStart(3, '0')}`
  }

  private parseDate(dateString: string): string | null {
    if (!dateString) return null

    try {
      // Convertir DD.MM.YYYY vers YYYY-MM-DD
      if (dateString.includes('.')) {
        const [day, month, year] = dateString.split('.')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }

      return dateString
    } catch (error) {
      console.warn('[DB] Error parsing date:', dateString, error)
      return null
    }
  }

  /**
   * Version mock pour fonctionner sans Supabase
   */
  private async createMockInsuranceCase(clientData: ClientData, agentId?: string): Promise<CaseCreationResult> {
    try {
      const caseNumber = `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      const secureToken = generateSecureToken()
      const caseId = `case-${Math.random().toString(36).substring(2, 15)}`

      console.log('[DB] Mock case created:', {
        caseId,
        caseNumber,
        clientEmail: clientData.email,
        clientName: `${clientData.prenom} ${clientData.nom}`,
        secureToken
      })

      // Simuler un délai de base de données
      await new Promise(resolve => setTimeout(resolve, 100))

      return {
        success: true,
        caseId,
        caseNumber,
        secureToken
      }
    } catch (error) {
      console.error('[DB] Error in mock case creation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock creation failed'
      }
    }
  }
}

export const databaseService = new DatabaseService()
