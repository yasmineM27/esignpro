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
  generateSecureToken = () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const randomPart = Math.random().toString(36).substring(2, 17).toLowerCase()
    return `SECURE_${timestamp}_${randomPart}`
  }
  createAuditLog = async () => console.log('[DB] Audit log (mock mode)')
}

export interface ClientData {
  nom: string
  prenom: string
  email: string
  telephone?: string
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

      // Vérifier si Supabase est configuré
      if (!supabaseAdmin) {
        console.log('[DB] Using mock mode - Supabase not configured')
        return this.createMockInsuranceCase(clientData, agentId)
      }

      try {
        // 1. Créer ou récupérer l'utilisateur client avec TOUTES les données
        let user = await this.findOrCreateUser({
          email: clientData.email,
          first_name: clientData.prenom,
          last_name: clientData.nom,
          phone: clientData.telephone || null, // Ajouter le téléphone si disponible
          role: 'client'
        })

        if (!user) {
          throw new Error('Failed to create or find user')
        }

        console.log('[DB] User created/found:', user.id)

        // 2. Créer ou récupérer le client avec TOUTES les données
        let client = await this.findOrCreateClient(user.id, {
          client_code: `CLIENT-${Date.now()}`,
          date_of_birth: clientData.dateNaissance ? new Date(clientData.dateNaissance).toISOString().split('T')[0] : null,
          address: clientData.adresse || null,
          city: clientData.ville || null,
          postal_code: clientData.npa || null,
          country: 'Suisse'
        })

        if (!client) {
          throw new Error('Failed to create or find client')
        }

        console.log('[DB] Client created/found:', client.id)

        // 3. Utiliser l'agent par défaut (simplification)
        let agent = null
        if (agentId) {
          const { data: agentData } = await supabaseAdmin
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .single()
          agent = agentData
        }
        console.log('[DB] Agent:', agent?.id || 'default')

        // 4. Créer le dossier d'assurance
        const caseNumber = await this.generateCaseNumber()
        const secureToken = generateSecureToken()

        const { data: insuranceCase, error: caseError } = await supabaseAdmin
          .from('insurance_cases')
          .insert([{
            case_number: caseNumber,
            client_id: client.id,
            agent_id: agent?.id,
            insurance_company: clientData.destinataire,
            policy_number: clientData.numeroPolice,
            policy_type: clientData.typeFormulaire,
            termination_date: clientData.dateLamal || clientData.dateLCA,
            reason_for_termination: 'Client request',
            status: 'draft',
            secure_token: secureToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }])
          .select()
          .single()

        if (caseError || !insuranceCase) {
          console.error('[DB] Error creating insurance case:', caseError)
          throw new Error('Failed to create insurance case')
        }

        console.log('[DB] Insurance case created:', insuranceCase.id)

        // 5. Sauvegarder les personnes du dossier dans case_persons
        if (clientData.personnes && clientData.personnes.length > 0) {
          console.log(`[DB] Saving ${clientData.personnes.length} person(s) to case_persons`)

          const personsData = clientData.personnes.map(personne => ({
            case_id: insuranceCase.id,
            nom: personne.nom,
            prenom: personne.prenom,
            date_naissance: personne.dateNaissance ? new Date(personne.dateNaissance).toISOString().split('T')[0] : null,
            relation: 'beneficiaire' // Relation par défaut
          }))

          const { data: savedPersons, error: personsError } = await supabaseAdmin
            .from('case_persons')
            .insert(personsData)
            .select()

          if (personsError) {
            console.error('[DB] Error saving persons:', personsError)
          } else {
            console.log(`[DB] ${savedPersons?.length || 0} person(s) saved successfully`)
          }
        }

        return {
          success: true,
          clientId: secureToken,
          caseId: insuranceCase.id,
          caseNumber: caseNumber,
          secureToken: secureToken
        }

      } catch (error) {
        console.error('[DB] Database error, trying simplified save:', error)
        return this.createSimplifiedInsuranceCase(clientData, agentId)
      }

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

      // Vérifier si le case_id existe avant de logger
      let validCaseId = data.caseId
      if (data.caseId) {
        const { data: caseExists, error: caseCheckError } = await supabaseAdmin
          .from('insurance_cases')
          .select('id')
          .eq('id', data.caseId)
          .single()

        if (caseCheckError || !caseExists) {
          console.warn(`[DB] ⚠️ Case ID ${data.caseId} not found, logging email without case_id`)
          console.warn(`[DB] 🔍 Error details:`, caseCheckError)

          // Optionnel : Créer automatiquement le dossier manquant
          if (data.caseId && data.caseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            console.log(`[DB] 🔧 Tentative de création automatique du dossier ${data.caseId}`)

            const { error: createError } = await supabaseAdmin
              .from('insurance_cases')
              .insert([{
                id: data.caseId,
                case_number: `AUTO-${Date.now()}`,
                secure_token: data.caseId,
                status: 'email_sent',
                title: 'Dossier créé automatiquement',
                insurance_type: 'auto',
                insurance_company: 'Création Automatique',
                policy_number: `AUTO-${data.caseId.substring(0, 8)}`,
                description: 'Dossier créé automatiquement pour corriger une référence manquante dans email_logs',
                priority: 1
              }])

            if (createError) {
              console.error(`[DB] ❌ Impossible de créer le dossier automatiquement:`, createError)
              validCaseId = undefined
            } else {
              console.log(`[DB] ✅ Dossier ${data.caseId} créé automatiquement`)
              // Garder le case_id original puisque le dossier existe maintenant
            }
          } else {
            validCaseId = undefined
          }
        }
      }

      const { error } = await supabaseAdmin
        .from('email_logs')
        .insert([{
          case_id: validCaseId,
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

        // Si l'erreur est due à une contrainte de clé étrangère, essayer sans case_id
        if (error.code === '23503' && validCaseId) {
          console.warn('[DB] Foreign key constraint error, retrying without case_id')
          const { error: retryError } = await supabaseAdmin
            .from('email_logs')
            .insert([{
              case_id: undefined,
              recipient_email: data.recipientEmail,
              sender_email: 'noreply@esignpro.ch',
              subject: data.subject,
              body_html: data.bodyHtml,
              body_text: data.bodyText,
              status: data.status || 'sent',
              sent_at: new Date().toISOString()
            }])

          if (retryError) {
            console.error('[DB] Error logging email (retry):', retryError)
            return false
          } else {
            console.log('[DB] Email logged successfully without case_id')
            return true
          }
        }

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
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        user_id: userId,
        ...clientData,
        created_at: new Date().toISOString()
      }
    }
  }

  private async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear()

    // Essayer jusqu'à 10 fois pour éviter les collisions
    for (let attempt = 0; attempt < 10; attempt++) {
      // Générer un numéro aléatoire pour éviter les collisions
      const randomNumber = Math.floor(Math.random() * 9000) + 1000 // Entre 1000 et 9999
      const caseNumber = `RES-${year}-${randomNumber}`

      // Vérifier si ce numéro existe déjà
      const { data, error } = await supabaseAdmin
        .from('insurance_cases')
        .select('case_number')
        .eq('case_number', caseNumber)
        .single()

      // Si pas trouvé (erreur PGRST116), le numéro est disponible
      if (error && error.code === 'PGRST116') {
        console.log(`[DB] Generated unique case number: ${caseNumber}`)
        return caseNumber
      }

      // Si trouvé, essayer un autre numéro
      console.log(`[DB] Case number ${caseNumber} already exists, trying another...`)
    }

    // Fallback si tous les essais échouent
    const timestamp = Date.now().toString().slice(-6)
    const fallbackNumber = `RES-${year}-${timestamp}`
    console.log(`[DB] Using timestamp-based fallback: ${fallbackNumber}`)
    return fallbackNumber
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
   * Version simplifiée pour sauvegarder même en cas d'erreur
   */
  private async createSimplifiedInsuranceCase(clientData: ClientData, agentId?: string): Promise<CaseCreationResult> {
    try {
      console.log('[DB] Attempting simplified save to database...')

      // Essayer de sauvegarder directement le dossier avec des données minimales
      const caseNumber = `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
      const secureToken = generateSecureToken()

      // Essayer d'insérer directement sans relations complexes
      const { data: insuranceCase, error: caseError } = await supabaseAdmin
        .from('insurance_cases')
        .insert([{
          case_number: caseNumber,
          client_id: null, // Pas de relation client pour éviter les erreurs
          agent_id: null,  // Pas de relation agent pour éviter les erreurs
          insurance_company: clientData.destinataire || 'Non spécifié',
          policy_number: clientData.numeroPolice || 'Non spécifié',
          policy_type: clientData.typeFormulaire || 'resiliation',
          termination_date: clientData.dateLamal || clientData.dateLCA || null,
          reason_for_termination: 'Client request',
          status: 'draft',
          secure_token: secureToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

      if (caseError || !insuranceCase) {
        console.error('[DB] Simplified save failed, using pure mock mode:', caseError)
        return this.createMockInsuranceCase(clientData, agentId)
      }

      console.log('[DB] Simplified case saved successfully:', insuranceCase.id)

      return {
        success: true,
        caseId: insuranceCase.id,
        caseNumber: insuranceCase.case_number,
        secureToken: insuranceCase.secure_token
      }

    } catch (error) {
      console.error('[DB] Simplified save failed, using pure mock mode:', error)
      return this.createMockInsuranceCase(clientData, agentId)
    }
  }

  /**
   * Version mock pour fonctionner sans Supabase
   */
  private async createMockInsuranceCase(clientData: ClientData, agentId?: string): Promise<CaseCreationResult> {
    try {
      const caseNumber = `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      const secureToken = generateSecureToken()
      const caseId = crypto.randomUUID()

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
