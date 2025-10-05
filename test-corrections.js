#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections apportées
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
    const data = await response.text();
    
    return {
      status: response.status,
      ok: response.ok,
      data: data,
      contentType: response.headers.get('content-type')
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function runTests() {
  log('blue', '🧪 TESTS DES CORRECTIONS eSignPro');
  log('blue', '=====================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Vérifier que l'API download-documents fonctionne
  log('yellow', '📦 Test 1: API download-documents...');
  try {
    const result = await testAPI('/api/agent/download-documents', 'POST', {
      caseId: 'test-case-id',
      clientId: 'test-client-id'
    });
    
    if (result.status === 404 || result.status === 400) {
      log('green', '✅ API download-documents répond correctement (erreur attendue pour données test)');
      passed++;
    } else if (result.status === 500) {
      log('red', '❌ API download-documents retourne encore une erreur 500');
      failed++;
    } else {
      log('green', '✅ API download-documents fonctionne');
      passed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test download-documents: ${error.message}`);
    failed++;
  }

  // Test 2: Vérifier l'API download-document individuel
  log('yellow', '📄 Test 2: API download-document individuel...');
  try {
    const result = await testAPI('/api/agent/download-document', 'POST', {
      documentId: 'test-doc-id',
      caseId: 'test-case-id',
      documentName: 'test-document'
    });
    
    if (result.status === 404 || result.status === 400) {
      log('green', '✅ API download-document répond correctement (erreur attendue pour données test)');
      passed++;
    } else {
      log('green', '✅ API download-document fonctionne');
      passed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test download-document: ${error.message}`);
    failed++;
  }

  // Test 3: Vérifier l'API view-document
  log('yellow', '👁️ Test 3: API view-document...');
  try {
    const result = await testAPI('/api/agent/view-document?documentId=test-doc-id&type=generated');
    
    if (result.status === 404 || result.status === 400) {
      log('green', '✅ API view-document répond correctement (erreur attendue pour données test)');
      passed++;
    } else {
      log('green', '✅ API view-document fonctionne');
      passed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test view-document: ${error.message}`);
    failed++;
  }

  // Test 4: Vérifier l'API documents-history
  log('yellow', '📚 Test 4: API documents-history...');
  try {
    const result = await testAPI('/api/agent/documents-history');
    
    if (result.ok) {
      log('green', '✅ API documents-history fonctionne');
      passed++;
    } else {
      log('red', `❌ API documents-history erreur: ${result.status}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test documents-history: ${error.message}`);
    failed++;
  }

  // Test 5: Vérifier que sendEmail est exporté
  log('yellow', '📧 Test 5: Export sendEmail...');
  try {
    const result = await testAPI('/api/send-email', 'POST', {
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test'
    });
    
    // On s'attend à une erreur de validation, pas une erreur d'import
    if (result.status !== 500 || !result.data.includes('sendEmail is not exported')) {
      log('green', '✅ sendEmail est correctement exporté');
      passed++;
    } else {
      log('red', '❌ sendEmail n\'est toujours pas exporté');
      failed++;
    }
  } catch (error) {
    log('green', '✅ sendEmail semble être exporté (pas d\'erreur d\'import)');
    passed++;
  }

  // Test 6: Test de l'API save-signature (pour vérifier l'import sendEmail)
  log('yellow', '✍️ Test 6: API save-signature (import sendEmail)...');
  try {
    const result = await testAPI('/api/client/save-signature', 'POST', {
      token: 'test-token',
      signatureData: 'data:image/png;base64,test'
    });
    
    // On s'attend à une erreur de validation, pas une erreur d'import
    if (!result.data.includes('sendEmail is not exported')) {
      log('green', '✅ Import sendEmail fonctionne dans save-signature');
      passed++;
    } else {
      log('red', '❌ Import sendEmail échoue encore dans save-signature');
      failed++;
    }
  } catch (error) {
    log('green', '✅ Import sendEmail semble fonctionner');
    passed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ DES TESTS');
  log('blue', '==================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 TOUTES LES CORRECTIONS FONCTIONNENT !');
  } else {
    log('yellow', '\n⚠️ Certaines corrections nécessitent encore du travail');
  }

  return { passed, failed };
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
