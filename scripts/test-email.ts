#!/usr/bin/env tsx

/**
 * Script de test d'email simple
 * Usage: npx tsx scripts/test-email.ts
 */

import { Resend } from 'resend'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const resend = new Resend(process.env.RESEND_API_KEY)

async function testBasicEmail() {
  console.log('🧪 Test d\'envoi d\'email basique...')
  console.log('📧 Clé API Resend:', process.env.RESEND_API_KEY ? 'Configurée' : 'MANQUANTE')
  console.log('📬 Email destinataire:', process.env.TEST_CLIENT_EMAIL)

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY manquante dans .env.local')
    return false
  }

  if (!process.env.TEST_CLIENT_EMAIL) {
    console.error('❌ TEST_CLIENT_EMAIL manquante dans .env.local')
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'eSignPro <noreply@esignpro.ch>',
      to: [process.env.TEST_CLIENT_EMAIL],
      subject: '🧪 Test eSignPro - Configuration Email',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🎉 Test Réussi - eSignPro</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                <h2 style="color: #dc2626; margin-top: 0;">Configuration Email Fonctionnelle !</h2>
                <p>Félicitations ! Votre configuration email avec Resend fonctionne parfaitement.</p>
                
                <div style="background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="color: #166534; margin-top: 0;">✅ Tests réussis :</h3>
                  <ul style="color: #166534; margin: 0;">
                    <li>Connexion à l'API Resend</li>
                    <li>Envoi d'email HTML</li>
                    <li>Réception de l'email</li>
                  </ul>
                </div>

                <p><strong>Prochaines étapes :</strong></p>
                <ol>
                  <li>Exécuter le script de base de données dans Supabase</li>
                  <li>Lancer la démonstration complète avec <code>npm run demo</code></li>
                  <li>Tester le workflow complet via l'interface web</li>
                </ol>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280;">
                  📅 Envoyé le : ${new Date().toLocaleString('fr-CH')}<br>
                  🔧 Service : Resend API<br>
                  🏢 Application : eSignPro
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Test eSignPro - Configuration Email

Félicitations ! Votre configuration email avec Resend fonctionne parfaitement.

Tests réussis :
- Connexion à l'API Resend
- Envoi d'email HTML  
- Réception de l'email

Prochaines étapes :
1. Exécuter le script de base de données dans Supabase
2. Lancer la démonstration complète avec npm run demo
3. Tester le workflow complet via l'interface web

Envoyé le : ${new Date().toLocaleString('fr-CH')}
Service : Resend API
Application : eSignPro
      `
    })

    if (error) {
      console.error('❌ Erreur Resend:', error)
      return false
    }

    console.log('✅ Email envoyé avec succès!')
    console.log('📧 Message ID:', data?.id)
    console.log('📬 Destinataire:', process.env.TEST_CLIENT_EMAIL)
    console.log('🔍 Vérifiez votre boîte email (y compris les spams)')
    
    return true

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error)
    return false
  }
}

async function testEmailToAgent() {
  console.log('\n🧪 Test d\'envoi d\'email à l\'agent...')

  if (!process.env.TEST_AGENT_EMAIL) {
    console.error('❌ TEST_AGENT_EMAIL manquante dans .env.local')
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'eSignPro <noreply@esignpro.ch>',
      to: [process.env.TEST_AGENT_EMAIL],
      subject: '🔔 Notification Agent - Nouveau dossier assigné',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">📋 Nouveau Dossier - eSignPro</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                <h2 style="color: #2563eb; margin-top: 0;">Dossier de Test Assigné</h2>
                <p>Un nouveau dossier de résiliation vous a été assigné :</p>
                
                <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p><strong>Client :</strong> Client Test</p>
                  <p><strong>Type :</strong> Résiliation Assurance Auto</p>
                  <p><strong>Priorité :</strong> Normale</p>
                  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-CH')}</p>
                </div>

                <p>Connectez-vous à votre espace agent pour traiter ce dossier.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:3000/agent" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Accéder à l'espace agent
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur Resend:', error)
      return false
    }

    console.log('✅ Email agent envoyé avec succès!')
    console.log('📧 Message ID:', data?.id)
    console.log('📬 Destinataire:', process.env.TEST_AGENT_EMAIL)
    
    return true

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error)
    return false
  }
}

async function runEmailTests() {
  console.log('🚀 Démarrage des tests d\'email eSignPro')
  console.log('=' .repeat(50))

  const test1 = await testBasicEmail()
  const test2 = await testEmailToAgent()

  console.log('\n' + '=' .repeat(50))
  console.log('📊 Résultats des tests :')
  console.log(`   • Test email client: ${test1 ? '✅ Réussi' : '❌ Échoué'}`)
  console.log(`   • Test email agent: ${test2 ? '✅ Réussi' : '❌ Échoué'}`)

  if (test1 && test2) {
    console.log('\n🎉 Tous les tests d\'email ont réussi!')
    console.log('📧 Vérifiez vos boîtes email pour confirmer la réception')
    console.log('\n🔄 Prochaines étapes :')
    console.log('   1. Exécuter database/supabase-schema.sql dans Supabase')
    console.log('   2. Exécuter database/test-data.sql dans Supabase')
    console.log('   3. Lancer npm run demo pour la démo complète')
  } else {
    console.log('\n❌ Certains tests ont échoué')
    console.log('🔧 Vérifiez votre configuration dans .env.local')
  }
}

// Exécuter les tests si ce script est appelé directement
if (require.main === module) {
  runEmailTests()
}
