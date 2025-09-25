#!/usr/bin/env tsx

/**
 * Script pour tester le mode email (production vs développement)
 */

import { EmailService } from '../lib/email'

async function testEmailMode() {
  console.log('🧪 Test du Mode Email')
  console.log('=' .repeat(50))
  
  // Afficher les variables d'environnement
  console.log('📊 Variables d\'environnement:')
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`FORCE_PRODUCTION_EMAIL: ${process.env.FORCE_PRODUCTION_EMAIL}`)
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`)
  console.log(`TEST_CLIENT_EMAIL: ${process.env.TEST_CLIENT_EMAIL}`)
  console.log('')
  
  // Déterminer le mode
  const isProduction = process.env.NODE_ENV === 'production' || process.env.FORCE_PRODUCTION_EMAIL === 'true'
  console.log(`🎯 Mode détecté: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)
  console.log('')
  
  // Test avec un email client fictif
  const testClientEmail = 'client.test@example.com'
  console.log(`📧 Test d'envoi vers: ${testClientEmail}`)
  
  try {
    const emailService = EmailService.getInstance()
    
    const result = await emailService.sendTemplateEmail(
      'invitation',
      testClientEmail,
      'test-case-id',
      {
        client_name: 'Client Test',
        agent_name: 'Agent Test',
        case_number: 'RES-2024-TEST',
        secure_link: 'https://esignpro.ch/client/test-token',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CH')
      }
    )
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès!')
      console.log(`📨 Message ID: ${result.messageId}`)
    } else {
      console.log('❌ Échec de l\'envoi d\'email')
      console.log(`🚨 Erreur: ${result.error}`)
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error)
  }
  
  console.log('')
  console.log('🎯 Résultat attendu:')
  if (isProduction) {
    console.log('✅ En mode PRODUCTION: Email envoyé à client.test@example.com')
  } else {
    console.log('🔄 En mode DEVELOPMENT: Email redirigé vers yasminemassaoudi27@gmail.com')
  }
}

// Exécuter le test
testEmailMode().catch(console.error)
