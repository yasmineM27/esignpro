#!/usr/bin/env tsx

/**
 * Script de test complet de l'application eSignPro
 * Usage: npx tsx scripts/test-complete.ts
 */

import { supabaseAdmin, generateSecureToken } from '../lib/supabase'
import { emailService } from '../lib/email'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

interface TestResults {
  database: boolean
  email: boolean
  workflow: boolean
  errors: string[]
}

async function testDatabaseConnection(): Promise<boolean> {
  console.log('🔌 Test de connexion à la base de données...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Erreur base de données:', error.message)
      return false
    }

    console.log('✅ Connexion à la base de données réussie')
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
    return false
  }
}

async function testEmailService(): Promise<boolean> {
  console.log('📧 Test du service email...')
  
  try {
    const result = await emailService.sendTestEmail(
      process.env.TEST_AGENT_EMAIL || 'yasminemassaoudi27@gmail.com',
      'Test Complet eSignPro',
      'Test automatique du service email - Tous les systèmes fonctionnent correctement!'
    )

    if (!result.success) {
      console.error('❌ Erreur service email:', result.error)
      return false
    }

    console.log('✅ Service email fonctionnel')
    console.log('📧 Message ID:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ Erreur service email:', error)
    return false
  }
}

async function testCompleteWorkflow(): Promise<boolean> {
  console.log('🔄 Test du workflow complet...')
  
  try {
    // 1. Créer un utilisateur client de test
    const { data: clientUser, error: clientError } = await supabaseAdmin
      .from('users')
      .upsert([{
        email: 'test-workflow@example.com',
        first_name: 'Test',
        last_name: 'Workflow',
        role: 'client'
      }], { onConflict: 'email' })
      .select()
      .single()

    if (clientError) {
      console.error('❌ Erreur création client:', clientError)
      return false
    }

    // 2. Créer un utilisateur agent de test
    const { data: agentUser, error: agentError } = await supabaseAdmin
      .from('users')
      .upsert([{
        email: 'test-agent@example.com',
        first_name: 'Agent',
        last_name: 'Test',
        role: 'agent'
      }], { onConflict: 'email' })
      .select()
      .single()

    if (agentError) {
      console.error('❌ Erreur création agent:', agentError)
      return false
    }

    // 3. Créer les enregistrements client et agent
    const { data: client } = await supabaseAdmin
      .from('clients')
      .upsert([{
        user_id: clientUser.id,
        client_number: 'TEST-WORKFLOW-001'
      }], { onConflict: 'user_id' })
      .select()
      .single()

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .upsert([{
        user_id: agentUser.id,
        agent_code: 'TEST-AGENT-001'
      }], { onConflict: 'user_id' })
      .select()
      .single()

    // 4. Créer un dossier d'assurance
    const secureToken = generateSecureToken()
    const { data: insuranceCase, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .insert([{
        case_number: `TEST-${Date.now()}`,
        client_id: client.id,
        agent_id: agent.id,
        insurance_type: 'auto',
        insurance_company: 'Test Insurance',
        policy_number: 'TEST-POL-001',
        title: 'Test Workflow Case',
        description: 'Dossier de test automatique',
        status: 'draft',
        secure_token: secureToken,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (caseError) {
      console.error('❌ Erreur création dossier:', caseError)
      return false
    }

    // 5. Tester l'upload de documents
    const { data: documents, error: docError } = await supabaseAdmin
      .from('documents')
      .insert([
        {
          case_id: insuranceCase.id,
          document_type: 'identity_front',
          file_name: 'test_id_front.jpg',
          file_path: 'test/test_id_front.jpg',
          file_size: 100000,
          mime_type: 'image/jpeg'
        },
        {
          case_id: insuranceCase.id,
          document_type: 'identity_back',
          file_name: 'test_id_back.jpg',
          file_path: 'test/test_id_back.jpg',
          file_size: 95000,
          mime_type: 'image/jpeg'
        }
      ])
      .select()

    if (docError) {
      console.error('❌ Erreur upload documents:', docError)
      return false
    }

    // 6. Tester la signature
    const { data: signature, error: sigError } = await supabaseAdmin
      .from('signatures')
      .insert([{
        case_id: insuranceCase.id,
        signature_data: 'data:image/png;base64,test-signature-data',
        ip_address: '127.0.0.1',
        user_agent: 'Test Script'
      }])
      .select()
      .single()

    if (sigError) {
      console.error('❌ Erreur création signature:', sigError)
      return false
    }

    // 7. Finaliser le dossier
    const { error: updateError } = await supabaseAdmin
      .from('insurance_cases')
      .update({ 
        status: 'completed',
        actual_completion_date: new Date().toISOString()
      })
      .eq('id', insuranceCase.id)

    if (updateError) {
      console.error('❌ Erreur finalisation dossier:', updateError)
      return false
    }

    // 8. Nettoyer les données de test
    await supabaseAdmin.from('signatures').delete().eq('case_id', insuranceCase.id)
    await supabaseAdmin.from('documents').delete().eq('case_id', insuranceCase.id)
    await supabaseAdmin.from('insurance_cases').delete().eq('id', insuranceCase.id)
    await supabaseAdmin.from('clients').delete().eq('id', client.id)
    await supabaseAdmin.from('agents').delete().eq('id', agent.id)
    await supabaseAdmin.from('users').delete().eq('id', clientUser.id)
    await supabaseAdmin.from('users').delete().eq('id', agentUser.id)

    console.log('✅ Workflow complet testé avec succès')
    console.log('🔗 Token généré:', secureToken)
    console.log('📄 Documents uploadés:', documents.length)
    console.log('✍️ Signature créée:', signature.id)
    
    return true
  } catch (error) {
    console.error('❌ Erreur workflow:', error)
    return false
  }
}

async function testEnvironmentVariables(): Promise<boolean> {
  console.log('🔧 Vérification des variables d\'environnement...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'TEST_AGENT_EMAIL',
    'TEST_CLIENT_EMAIL'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Variables manquantes:', missing.join(', '))
    return false
  }

  console.log('✅ Toutes les variables d\'environnement sont configurées')
  return true
}

async function runCompleteTests(): Promise<TestResults> {
  console.log('🚀 Démarrage des tests complets eSignPro')
  console.log('=' .repeat(60))

  const results: TestResults = {
    database: false,
    email: false,
    workflow: false,
    errors: []
  }

  try {
    // Test des variables d'environnement
    const envTest = await testEnvironmentVariables()
    if (!envTest) {
      results.errors.push('Variables d\'environnement manquantes')
    }

    // Test de la base de données
    results.database = await testDatabaseConnection()
    if (!results.database) {
      results.errors.push('Connexion base de données échouée')
    }

    // Test du service email
    results.email = await testEmailService()
    if (!results.email) {
      results.errors.push('Service email non fonctionnel')
    }

    // Test du workflow complet (seulement si DB fonctionne)
    if (results.database) {
      results.workflow = await testCompleteWorkflow()
      if (!results.workflow) {
        results.errors.push('Workflow complet échoué')
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    results.errors.push(`Erreur générale: ${error}`)
  }

  console.log('\n' + '=' .repeat(60))
  console.log('📊 RÉSULTATS DES TESTS COMPLETS')
  console.log('=' .repeat(60))
  console.log(`🔌 Base de données    : ${results.database ? '✅ OK' : '❌ ERREUR'}`)
  console.log(`📧 Service email     : ${results.email ? '✅ OK' : '❌ ERREUR'}`)
  console.log(`🔄 Workflow complet  : ${results.workflow ? '✅ OK' : '❌ ERREUR'}`)
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERREURS DÉTECTÉES:')
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`)
    })
  }

  const allPassed = results.database && results.email && results.workflow
  
  if (allPassed) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS!')
    console.log('✨ L\'application eSignPro est prête pour la démonstration')
    console.log('\n🔄 Prochaines étapes:')
    console.log('   1. Ouvrir http://localhost:3001 dans votre navigateur')
    console.log('   2. Se connecter avec: yasminemassaoudi27@gmail.com / admin123')
    console.log('   3. Tester le workflow complet via l\'interface')
    console.log('   4. Lancer npm run demo pour la démonstration automatique')
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ')
    console.log('🔧 Vérifiez la configuration et corrigez les erreurs')
  }

  return results
}

// Exécuter les tests si ce script est appelé directement
if (require.main === module) {
  runCompleteTests()
}
