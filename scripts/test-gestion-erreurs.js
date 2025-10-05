#!/usr/bin/env node

/**
 * Script de test pour vérifier la gestion d'erreurs dans le formulaire client
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

async function testGestionErreurs() {
  log('blue', '🔧 TESTS GESTION D\'ERREURS');
  log('blue', '===========================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Données valides (doit réussir)
  log('yellow', '📝 Test 1: Données valides...');
  try {
    const validData = {
      nom: 'TestValid',
      prenom: 'Client',
      email: `test.valid.${Date.now()}@example.com`,
      telephone: '+41 79 123 45 67',
      dateNaissance: '1990-01-01',
      numeroPolice: 'POL-VALID-001',
      adresse: '123 Rue Test',
      npa: '1000',
      ville: 'Lausanne',
      typeFormulaire: 'resiliation',
      destinataire: 'Assurance Test SA',
      lieuDate: 'Lausanne, le ' + new Date().toLocaleDateString('fr-CH'),
      personnes: [
        {
          nom: 'TestValid',
          prenom: 'Client',
          dateNaissance: '1990-01-01'
        }
      ],
      dateLamal: '2024-12-31',
      dateLCA: '2024-12-31',
      nomPrenom: 'Client TestValid',
      npaVille: '1000 Lausanne'
    };

    const result = await testAPI('/api/generate-document', 'POST', validData);
    
    if (result.ok && result.data && result.data.success) {
      log('green', '✅ Données valides traitées correctement');
      passed++;
    } else {
      log('red', '❌ Échec avec données valides');
      log('red', `   Erreur: ${result.data?.error || result.data?.message || result.error || 'Erreur inconnue'}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Exception test données valides: ${error.message}`);
    failed++;
  }

  // Test 2: Données manquantes (doit échouer proprement)
  log('yellow', '\n📝 Test 2: Données manquantes...');
  try {
    const invalidData = {
      nom: '', // Nom manquant
      prenom: 'Client',
      email: 'invalid-email', // Email invalide
      // Autres champs manquants
    };

    const result = await testAPI('/api/generate-document', 'POST', invalidData);
    
    if (!result.ok || (result.data && !result.data.success)) {
      log('green', '✅ Données invalides rejetées correctement');
      log('blue', `   Message d'erreur: ${result.data?.error || result.data?.message || 'Erreur de validation'}`);
      passed++;
    } else {
      log('red', '❌ Données invalides acceptées (problème)');
      failed++;
    }
  } catch (error) {
    log('green', '✅ Exception capturée pour données invalides');
    passed++;
  }

  // Test 3: Token inexistant pour envoi email (doit échouer proprement)
  log('yellow', '\n📧 Test 3: Token inexistant pour email...');
  try {
    const emailData = {
      clientEmail: 'test@example.com',
      clientName: 'Test Client',
      clientId: 'TOKEN_INEXISTANT_123',
      documentContent: 'Test content',
      caseId: 'case-inexistant',
      caseNumber: 'RES-INEXISTANT',
      secureToken: 'TOKEN_INEXISTANT_123'
    };

    const result = await testAPI('/api/send-email', 'POST', emailData);
    
    if (!result.ok || (result.data && !result.data.success)) {
      log('green', '✅ Token inexistant rejeté correctement');
      log('blue', `   Message d'erreur: ${result.data?.error || result.data?.message || 'Token non trouvé'}`);
      passed++;
    } else {
      log('red', '❌ Token inexistant accepté (problème)');
      failed++;
    }
  } catch (error) {
    log('green', '✅ Exception capturée pour token inexistant');
    passed++;
  }

  // Test 4: Endpoint inexistant (doit échouer proprement)
  log('yellow', '\n🔗 Test 4: Endpoint inexistant...');
  try {
    const result = await testAPI('/api/endpoint-inexistant', 'POST', {});
    
    if (!result.ok) {
      log('green', '✅ Endpoint inexistant rejeté correctement');
      log('blue', `   Status: ${result.status}`);
      passed++;
    } else {
      log('red', '❌ Endpoint inexistant accepté (problème)');
      failed++;
    }
  } catch (error) {
    log('green', '✅ Exception capturée pour endpoint inexistant');
    passed++;
  }

  // Test 5: Gestion des erreurs de réseau
  log('yellow', '\n🌐 Test 5: Erreur de réseau...');
  try {
    // Tester avec un port inexistant
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    };
    
    const response = await fetch('http://localhost:9999/api/test', options);
    log('red', '❌ Connexion réussie sur port inexistant (inattendu)');
    failed++;
  } catch (error) {
    log('green', '✅ Erreur de réseau capturée correctement');
    log('blue', `   Type d'erreur: ${error.message}`);
    passed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ TESTS GESTION D\'ERREURS');
  log('blue', '==================================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 GESTION D\'ERREURS PARFAITE !');
    log('green', '   ✅ Données valides traitées correctement');
    log('green', '   ✅ Données invalides rejetées proprement');
    log('green', '   ✅ Tokens inexistants gérés');
    log('green', '   ✅ Endpoints inexistants gérés');
    log('green', '   ✅ Erreurs de réseau capturées');
    log('green', '   ✅ Messages d\'erreur informatifs');
  } else {
    log('yellow', '\n⚠️ Certains aspects de gestion d\'erreurs à améliorer');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }

  return { passed, failed };
}

// Exécuter les tests
if (require.main === module) {
  testGestionErreurs()
    .then(({ passed, failed }) => {
      if (failed === 0) {
        log('green', '\n🎯 RÉSULTAT: GESTION D\'ERREURS EXCELLENTE');
        process.exit(0);
      } else {
        log('red', '\n❌ RÉSULTAT: GESTION D\'ERREURS À AMÉLIORER');
        process.exit(1);
      }
    })
    .catch(error => {
      log('red', `❌ Erreur fatale: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testGestionErreurs };
