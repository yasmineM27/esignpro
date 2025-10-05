#!/usr/bin/env node

/**
 * Test simple pour vérifier l'envoi d'email après création de dossier
 */

const API_BASE = 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function testEnvoiEmailSimple() {
  log('blue', '📧 TEST ENVOI EMAIL SIMPLE');
  log('blue', '==========================\n');

  // Données de test simples
  const testClientData = {
    nom: 'TestEmail',
    prenom: 'Client',
    email: `test.email.${Date.now()}@example.com`,
    telephone: '+41 79 999 88 77',
    dateNaissance: '1990-05-15',
    numeroPolice: 'POL-EMAIL-001',
    adresse: '123 Rue du Test',
    npa: '1000',
    ville: 'Lausanne',
    typeFormulaire: 'resiliation',
    destinataire: 'Assurance Test SA',
    lieuDate: 'Lausanne, le ' + new Date().toLocaleDateString('fr-CH'),
    personnes: [
      {
        nom: 'TestEmail',
        prenom: 'Client',
        dateNaissance: '1990-05-15'
      }
    ],
    dateLamal: '2024-12-31',
    dateLCA: '2024-12-31',
    nomPrenom: 'Client TestEmail',
    npaVille: '1000 Lausanne'
  };

  // Étape 1: Créer le dossier
  log('yellow', '📝 Étape 1: Création du dossier...');
  try {
    const generateResult = await testAPI('/api/generate-document', 'POST', testClientData);
    
    if (generateResult.ok && generateResult.data && generateResult.data.success) {
      log('green', '✅ Dossier créé avec succès');
      log('blue', `   Case ID: ${generateResult.data.caseId}`);
      log('blue', `   Case Number: ${generateResult.data.caseNumber}`);
      log('blue', `   Secure Token: ${generateResult.data.secureToken}`);
      
      // Étape 2: Envoyer l'email
      log('yellow', '\n📧 Étape 2: Envoi de l\'email...');
      
      const emailData = {
        clientEmail: testClientData.email,
        clientName: `${testClientData.prenom} ${testClientData.nom}`,
        clientId: generateResult.data.secureToken,
        documentContent: generateResult.data.documentContent,
        caseId: generateResult.data.caseId,
        caseNumber: generateResult.data.caseNumber,
        secureToken: generateResult.data.secureToken
      };
      
      const emailResult = await testAPI('/api/send-email', 'POST', emailData);
      
      if (emailResult.ok && emailResult.data && emailResult.data.success) {
        log('green', '✅ Email envoyé avec succès');
        log('blue', `   Portal Link: ${emailResult.data.portalLink}`);
        log('blue', `   Case Number: ${emailResult.data.caseNumber}`);
        log('blue', `   Email Sent: ${emailResult.data.emailSent}`);
        
        log('green', '\n🎉 TEST RÉUSSI - WORKFLOW COMPLET FONCTIONNEL !');
        log('green', '   ✅ Dossier créé et sauvegardé en BDD');
        log('green', '   ✅ Email envoyé au client');
        log('green', '   ✅ Lien portail généré');
        
        return true;
      } else {
        log('red', '❌ Erreur envoi email');
        log('red', `   Status: ${emailResult.status}`);
        log('red', `   Erreur: ${emailResult.data?.error || emailResult.data?.message || emailResult.error || 'Erreur inconnue'}`);
        if (emailResult.data) {
          log('red', `   Réponse: ${JSON.stringify(emailResult.data, null, 2)}`);
        }
        return false;
      }
    } else {
      log('red', '❌ Erreur création dossier');
      log('red', `   Status: ${generateResult.status}`);
      log('red', `   Erreur: ${generateResult.data?.error || generateResult.data?.message || generateResult.error || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ Erreur test: ${error.message}`);
    return false;
  }
}

// Exécuter le test
if (require.main === module) {
  testEnvoiEmailSimple()
    .then(success => {
      if (success) {
        log('green', '\n🎯 RÉSULTAT: SUCCÈS COMPLET');
        process.exit(0);
      } else {
        log('red', '\n❌ RÉSULTAT: ÉCHEC');
        process.exit(1);
      }
    })
    .catch(error => {
      log('red', `❌ Erreur fatale: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testEnvoiEmailSimple };
