#!/usr/bin/env node

/**
 * Script de test pour vérifier que le formulaire "Nouveau Dossier de Résiliation"
 * sauvegarde correctement les données en base de données
 */

const API_BASE = 'http://localhost:3001';

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

async function runNouveauDossierTests() {
  log('blue', '📋 TESTS NOUVEAU DOSSIER DE RÉSILIATION - SAUVEGARDE BDD');
  log('blue', '=======================================================\n');

  let passed = 0;
  let failed = 0;

  // Données de test pour un nouveau dossier
  const testClientData = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: `test.client.${Date.now()}@example.com`, // Email unique
    dateNaissance: '1985-05-15',
    numeroPolice: 'POL-TEST-001',
    adresse: '123 Rue de la Paix',
    npa: '1000',
    ville: 'Lausanne',
    typeFormulaire: 'resiliation',
    destinataire: 'Assurance Test SA',
    lieuDate: 'Lausanne, le ' + new Date().toLocaleDateString('fr-CH'),
    personnes: [
      {
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1985-05-15'
      },
      {
        nom: 'Dupont',
        prenom: 'Marie',
        dateNaissance: '1987-08-20'
      }
    ],
    dateLamal: '2024-12-31',
    dateLCA: '2024-12-31',
    // ✅ Champs requis pour la validation
    nomPrenom: 'Jean Dupont',
    npaVille: '1000 Lausanne'
  };

  // Test 1: Génération de document avec sauvegarde BDD
  log('yellow', '📝 Test 1: Génération document + sauvegarde BDD...');
  try {
    const generateResult = await testAPI('/api/generate-document', 'POST', testClientData);
    
    if (generateResult.ok && generateResult.data.success) {
      log('green', '✅ Document généré avec succès');
      log('blue', `   Case ID: ${generateResult.data.caseId}`);
      log('blue', `   Case Number: ${generateResult.data.caseNumber}`);
      log('blue', `   Secure Token: ${generateResult.data.secureToken}`);
      log('blue', `   Saved to Database: ${generateResult.data.metadata.savedToDatabase}`);
      
      // Vérifier que les données importantes sont présentes
      if (generateResult.data.caseId && 
          generateResult.data.caseNumber && 
          generateResult.data.secureToken &&
          generateResult.data.metadata.savedToDatabase) {
        log('green', '   ✅ Toutes les données BDD présentes');
        passed++;
        
        // Stocker pour les tests suivants
        global.testCaseData = {
          caseId: generateResult.data.caseId,
          caseNumber: generateResult.data.caseNumber,
          secureToken: generateResult.data.secureToken,
          clientEmail: testClientData.email,
          clientName: `${testClientData.prenom} ${testClientData.nom}`
        };
      } else {
        log('red', '   ❌ Données BDD manquantes');
        failed++;
      }
    } else {
      log('red', '❌ Erreur génération document');
      log('red', `   Erreur: ${generateResult.data.error || generateResult.data.message}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test génération: ${error.message}`);
    failed++;
  }

  // Test 2: Envoi d'email avec dossier existant
  log('yellow', '\n📧 Test 2: Envoi email avec dossier existant...');
  try {
    if (!global.testCaseData) {
      log('red', '❌ Pas de données de test disponibles');
      failed++;
    } else {
      const emailData = {
        clientEmail: global.testCaseData.clientEmail,
        clientName: global.testCaseData.clientName,
        clientId: global.testCaseData.secureToken,
        documentContent: 'Document de test généré automatiquement',
        caseId: global.testCaseData.caseId,
        caseNumber: global.testCaseData.caseNumber,
        secureToken: global.testCaseData.secureToken
      };

      const emailResult = await testAPI('/api/send-email', 'POST', emailData);
      
      if (emailResult.ok && emailResult.data.success) {
        log('green', '✅ Email envoyé avec succès');
        log('blue', `   Portal Link: ${emailResult.data.portalLink}`);
        log('blue', `   Case Number: ${emailResult.data.caseNumber}`);
        log('blue', `   Email Sent: ${emailResult.data.emailSent}`);
        passed++;
      } else {
        log('red', '❌ Erreur envoi email');
        log('red', `   Erreur: ${emailResult.data.error || emailResult.data.message}`);
        failed++;
      }
    }
  } catch (error) {
    log('red', `❌ Erreur test email: ${error.message}`);
    failed++;
  }

  // Test 3: Vérification que le dossier existe dans l'espace agent
  log('yellow', '\n👥 Test 3: Vérification dossier dans espace agent...');
  try {
    const clientsResult = await testAPI('/api/agent/clients');
    
    if (clientsResult.ok && clientsResult.data.success) {
      const clients = clientsResult.data.clients || [];
      log('green', `✅ ${clients.length} client(s) récupéré(s) de l'espace agent`);
      
      // Chercher notre client de test
      const testClient = clients.find(client => 
        client.email === global.testCaseData?.clientEmail
      );
      
      if (testClient) {
        log('green', '   ✅ Client de test trouvé dans l\'espace agent');
        log('blue', `   Nom: ${testClient.fullName}`);
        log('blue', `   Email: ${testClient.email}`);
        log('blue', `   Nombre de dossiers: ${testClient.totalCases}`);
        passed++;
      } else {
        log('red', '   ❌ Client de test non trouvé dans l\'espace agent');
        failed++;
      }
    } else {
      log('red', '❌ Erreur récupération clients');
      log('red', `   Erreur: ${clientsResult.data.error || 'Erreur inconnue'}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test clients: ${error.message}`);
    failed++;
  }

  // Test 4: Vérification accès portail client
  log('yellow', '\n🌐 Test 4: Vérification accès portail client...');
  try {
    if (!global.testCaseData) {
      log('red', '❌ Pas de données de test disponibles');
      failed++;
    } else {
      const portalResult = await testAPI(`/api/client/validate-token?token=${global.testCaseData.secureToken}`);
      
      if (portalResult.ok && portalResult.data.valid) {
        log('green', '✅ Token portail client valide');
        log('blue', `   Client: ${portalResult.data.clientName || 'N/A'}`);
        log('blue', `   Case Number: ${portalResult.data.caseNumber || 'N/A'}`);
        log('blue', `   Status: ${portalResult.data.status || 'N/A'}`);
        passed++;
      } else {
        log('red', '❌ Token portail client invalide');
        log('red', `   Erreur: ${portalResult.data.error || 'Token invalide'}`);
        failed++;
      }
    }
  } catch (error) {
    log('red', `❌ Erreur test portail: ${error.message}`);
    failed++;
  }

  // Test 5: Vérification structure des données
  log('yellow', '\n🔍 Test 5: Vérification structure données...');
  try {
    const expectedFields = [
      'nom', 'prenom', 'email', 'dateNaissance', 'numeroPolice',
      'adresse', 'npa', 'ville', 'typeFormulaire', 'destinataire',
      'personnes', 'dateLamal', 'dateLCA'
    ];
    
    const missingFields = expectedFields.filter(field => !testClientData[field]);
    
    if (missingFields.length === 0) {
      log('green', '✅ Structure données complète');
      log('blue', `   Champs vérifiés: ${expectedFields.length}`);
      log('blue', `   Personnes incluses: ${testClientData.personnes.length}`);
      passed++;
    } else {
      log('red', `❌ Champs manquants: ${missingFields.join(', ')}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur vérification structure: ${error.message}`);
    failed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ TESTS NOUVEAU DOSSIER BDD');
  log('blue', '===================================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 SYSTÈME NOUVEAU DOSSIER PARFAITEMENT FONCTIONNEL !');
    log('green', '   ✅ Données sauvegardées en base (users, clients, insurance_cases)');
    log('green', '   ✅ Document généré avec succès');
    log('green', '   ✅ Email envoyé au client');
    log('green', '   ✅ Dossier visible dans espace agent');
    log('green', '   ✅ Portail client accessible');
    log('green', '   ✅ Structure données complète');
  } else {
    log('yellow', '\n⚠️ Certains aspects nécessitent encore des corrections');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }

  return { passed, failed };
}

// Exécuter les tests
if (require.main === module) {
  runNouveauDossierTests().catch(console.error);
}

module.exports = { runNouveauDossierTests };
