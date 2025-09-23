#!/usr/bin/env tsx

/**
 * Demo Workflow Script
 * 
 * Ce script démontre le workflow complet d'eSignPro :
 * 1. Création d'un dossier de résiliation
 * 2. Envoi d'email d'invitation au client
 * 3. Simulation de l'upload de documents
 * 4. Envoi d'email de rappel
 * 5. Signature électronique
 * 6. Envoi d'email de confirmation
 * 
 * Usage: npx tsx scripts/demo-workflow.ts
 */

import { supabaseAdmin, generateSecureToken, createAuditLog } from '../lib/supabase'
import { emailService } from '../lib/email'

interface DemoConfig {
  clientEmail: string
  agentEmail: string
  clientName: string
  agentName: string
  insuranceType: string
  insuranceCompany: string
  policyNumber: string
}

const DEMO_CONFIG: DemoConfig = {
  clientEmail: process.env.TEST_CLIENT_EMAIL || 'yasminemassoudi26@gmail.com',
  agentEmail: process.env.TEST_AGENT_EMAIL || 'yasminemassaoudi27@gmail.com',
  clientName: 'Marie Dubois',
  agentName: 'Wael Hamda',
  insuranceType: 'auto',
  insuranceCompany: 'AXA Assurances',
  policyNumber: 'POL-DEMO-2024-001'
}

async function createDemoUsers() {
  console.log('🔧 Création des utilisateurs de démonstration...')

  // Create client user
  const { data: clientUser, error: clientError } = await supabaseAdmin
    .from('users')
    .upsert([{
      email: DEMO_CONFIG.clientEmail,
      first_name: DEMO_CONFIG.clientName.split(' ')[0],
      last_name: DEMO_CONFIG.clientName.split(' ')[1],
      role: 'client',
      phone: '+41 79 123 45 67'
    }], { onConflict: 'email' })
    .select()
    .single()

  if (clientError) {
    console.error('❌ Erreur création client:', clientError)
    throw clientError
  }

  // Create agent user
  const { data: agentUser, error: agentError } = await supabaseAdmin
    .from('users')
    .upsert([{
      email: DEMO_CONFIG.agentEmail,
      first_name: DEMO_CONFIG.agentName.split(' ')[0],
      last_name: DEMO_CONFIG.agentName.split(' ')[1],
      role: 'agent',
      phone: '+41 79 234 56 78'
    }], { onConflict: 'email' })
    .select()
    .single()

  if (agentError) {
    console.error('❌ Erreur création agent:', agentError)
    throw agentError
  }

  // Create client record
  const { data: client, error: clientRecordError } = await supabaseAdmin
    .from('clients')
    .upsert([{
      user_id: clientUser.id,
      client_number: 'DEMO-CLIENT-001',
      date_of_birth: '1985-03-15',
      address_line1: 'Rue de la Paix 12',
      city: 'Genève',
      postal_code: '1201',
      country: 'Switzerland'
    }], { onConflict: 'user_id' })
    .select()
    .single()

  if (clientRecordError) {
    console.error('❌ Erreur création enregistrement client:', clientRecordError)
    throw clientRecordError
  }

  // Create agent record
  const { data: agent, error: agentRecordError } = await supabaseAdmin
    .from('agents')
    .upsert([{
      user_id: agentUser.id,
      agent_code: 'DEMO-AGENT-001',
      department: 'Résiliations Auto',
      is_supervisor: true
    }], { onConflict: 'user_id' })
    .select()
    .single()

  if (agentRecordError) {
    console.error('❌ Erreur création enregistrement agent:', agentRecordError)
    throw agentRecordError
  }

  console.log('✅ Utilisateurs créés avec succès')
  return { client, agent }
}

async function createInsuranceCase(clientId: string, agentId: string) {
  console.log('📋 Création du dossier de résiliation...')

  const secureToken = generateSecureToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 168) // 7 days

  const { data: insuranceCase, error } = await supabaseAdmin
    .from('insurance_cases')
    .insert([{
      case_number: `DEMO-${Date.now()}`,
      client_id: clientId,
      agent_id: agentId,
      insurance_type: DEMO_CONFIG.insuranceType,
      insurance_company: DEMO_CONFIG.insuranceCompany,
      policy_number: DEMO_CONFIG.policyNumber,
      title: `Résiliation ${DEMO_CONFIG.insuranceType} - ${DEMO_CONFIG.clientName}`,
      description: 'Dossier de démonstration du workflow eSignPro',
      status: 'draft',
      priority: 2,
      secure_token: secureToken,
      token_expires_at: expiresAt.toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('❌ Erreur création dossier:', error)
    throw error
  }

  await createAuditLog({
    case_id: insuranceCase.id,
    action: 'CREATE_CASE',
    entity_type: 'insurance_case',
    entity_id: insuranceCase.id,
    new_values: { status: 'draft', case_number: insuranceCase.case_number }
  })

  console.log('✅ Dossier créé:', insuranceCase.case_number)
  console.log('🔗 Token sécurisé:', secureToken)
  console.log('🌐 Lien client:', `${process.env.NEXT_PUBLIC_APP_URL}/client/${secureToken}`)

  return insuranceCase
}

async function sendInvitationEmail(caseId: string) {
  console.log('📧 Envoi de l\'email d\'invitation...')

  // Get case with relations
  const { data: insuranceCase, error } = await supabaseAdmin
    .from('insurance_cases')
    .select(`
      *,
      client:clients(*,
        user:users(*)
      ),
      agent:agents(*,
        user:users(*)
      )
    `)
    .eq('id', caseId)
    .single()

  if (error || !insuranceCase) {
    console.error('❌ Erreur récupération dossier:', error)
    throw error
  }

  // Update status to pending_documents
  await supabaseAdmin
    .from('insurance_cases')
    .update({ status: 'pending_documents' })
    .eq('id', caseId)

  const result = await emailService.sendClientInvitation(insuranceCase)

  if (!result.success) {
    console.error('❌ Erreur envoi email:', result.error)
    throw new Error(result.error)
  }

  await createAuditLog({
    case_id: caseId,
    action: 'SEND_INVITATION',
    entity_type: 'email',
    new_values: {
      recipient: insuranceCase.client?.user?.email,
      message_id: result.messageId
    }
  })

  console.log('✅ Email d\'invitation envoyé')
  console.log('📧 Message ID:', result.messageId)
  console.log('📬 Destinataire:', insuranceCase.client?.user?.email)

  return result
}

async function simulateDocumentUpload(caseId: string) {
  console.log('📄 Simulation de l\'upload de documents...')

  const documents = [
    {
      case_id: caseId,
      document_type: 'identity_front' as const,
      file_name: 'carte_identite_recto.jpg',
      file_path: `documents/case-${caseId}/carte_identite_recto.jpg`,
      file_size: 245760,
      mime_type: 'image/jpeg',
      is_verified: true,
      verified_at: new Date().toISOString()
    },
    {
      case_id: caseId,
      document_type: 'identity_back' as const,
      file_name: 'carte_identite_verso.jpg',
      file_path: `documents/case-${caseId}/carte_identite_verso.jpg`,
      file_size: 198432,
      mime_type: 'image/jpeg',
      is_verified: true,
      verified_at: new Date().toISOString()
    }
  ]

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert(documents)
    .select()

  if (error) {
    console.error('❌ Erreur upload documents:', error)
    throw error
  }

  // Update case status
  await supabaseAdmin
    .from('insurance_cases')
    .update({ status: 'documents_uploaded' })
    .eq('id', caseId)

  await createAuditLog({
    case_id: caseId,
    action: 'UPLOAD_DOCUMENTS',
    entity_type: 'document',
    new_values: { document_count: documents.length }
  })

  console.log('✅ Documents uploadés et vérifiés')
  console.log('📁 Nombre de documents:', data.length)

  return data
}

async function sendReminderEmail(caseId: string) {
  console.log('📧 Envoi de l\'email de rappel...')

  // Get case with relations
  const { data: insuranceCase, error } = await supabaseAdmin
    .from('insurance_cases')
    .select(`
      *,
      client:clients(*,
        user:users(*)
      ),
      agent:agents(*,
        user:users(*)
      )
    `)
    .eq('id', caseId)
    .single()

  if (error || !insuranceCase) {
    console.error('❌ Erreur récupération dossier:', error)
    throw error
  }

  const result = await emailService.sendDocumentReminder(insuranceCase)

  if (!result.success) {
    console.error('❌ Erreur envoi rappel:', result.error)
    throw new Error(result.error)
  }

  console.log('✅ Email de rappel envoyé')
  console.log('📧 Message ID:', result.messageId)

  return result
}

async function simulateSignature(caseId: string) {
  console.log('✍️ Simulation de la signature électronique...')

  // Update case status to pending_signature
  await supabaseAdmin
    .from('insurance_cases')
    .update({ status: 'pending_signature' })
    .eq('id', caseId)

  // Create signature
  const signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  const { data: signature, error } = await supabaseAdmin
    .from('signatures')
    .insert([{
      case_id: caseId,
      signature_data: signatureData,
      ip_address: '192.168.1.100',
      user_agent: 'Demo Script'
    }])
    .select()
    .single()

  if (error) {
    console.error('❌ Erreur création signature:', error)
    throw error
  }

  // Update case status to signed
  await supabaseAdmin
    .from('insurance_cases')
    .update({ status: 'signed' })
    .eq('id', caseId)

  await createAuditLog({
    case_id: caseId,
    action: 'SIGN_DOCUMENT',
    entity_type: 'signature',
    entity_id: signature.id,
    new_values: { signed: true }
  })

  console.log('✅ Signature électronique créée')
  console.log('🔏 Signature ID:', signature.id)

  return signature
}

async function sendCompletionEmail(caseId: string) {
  console.log('📧 Envoi de l\'email de confirmation...')

  // Get case with relations
  const { data: insuranceCase, error } = await supabaseAdmin
    .from('insurance_cases')
    .select(`
      *,
      client:clients(*,
        user:users(*)
      ),
      agent:agents(*,
        user:users(*)
      )
    `)
    .eq('id', caseId)
    .single()

  if (error || !insuranceCase) {
    console.error('❌ Erreur récupération dossier:', error)
    throw error
  }

  // Update case status to completed
  await supabaseAdmin
    .from('insurance_cases')
    .update({ 
      status: 'completed',
      actual_completion_date: new Date().toISOString()
    })
    .eq('id', caseId)

  const result = await emailService.sendCompletionConfirmation(insuranceCase)

  if (!result.success) {
    console.error('❌ Erreur envoi confirmation:', result.error)
    throw new Error(result.error)
  }

  await createAuditLog({
    case_id: caseId,
    action: 'COMPLETE_CASE',
    entity_type: 'insurance_case',
    entity_id: caseId,
    new_values: { status: 'completed' }
  })

  console.log('✅ Email de confirmation envoyé')
  console.log('📧 Message ID:', result.messageId)
  console.log('🎉 Dossier terminé avec succès!')

  return result
}

async function runDemo() {
  console.log('🚀 Démarrage de la démonstration complète eSignPro')
  console.log('=' .repeat(60))

  try {
    // Step 1: Create demo users
    const { client, agent } = await createDemoUsers()

    // Step 2: Create insurance case
    const insuranceCase = await createInsuranceCase(client.id, agent.id)

    // Step 3: Send invitation email
    await sendInvitationEmail(insuranceCase.id)

    // Wait a bit to simulate real workflow
    console.log('⏳ Attente de 3 secondes...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Step 4: Simulate document upload
    await simulateDocumentUpload(insuranceCase.id)

    // Step 5: Send reminder email
    await sendReminderEmail(insuranceCase.id)

    // Wait a bit more
    console.log('⏳ Attente de 2 secondes...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 6: Simulate signature
    await simulateSignature(insuranceCase.id)

    // Step 7: Send completion email
    await sendCompletionEmail(insuranceCase.id)

    console.log('=' .repeat(60))
    console.log('🎉 Démonstration terminée avec succès!')
    console.log('📊 Résumé:')
    console.log(`   • Dossier: ${insuranceCase.case_number}`)
    console.log(`   • Client: ${DEMO_CONFIG.clientEmail}`)
    console.log(`   • Agent: ${DEMO_CONFIG.agentEmail}`)
    console.log(`   • Token: ${insuranceCase.secure_token}`)
    console.log(`   • Lien: ${process.env.NEXT_PUBLIC_APP_URL}/client/${insuranceCase.secure_token}`)
    console.log('📧 Vérifiez vos emails pour voir les notifications envoyées!')

  } catch (error) {
    console.error('❌ Erreur durant la démonstration:', error)
    process.exit(1)
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  runDemo()
}
