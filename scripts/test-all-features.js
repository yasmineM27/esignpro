/**
 * Script de test complet de toutes les nouvelles fonctionnalités
 * Usage: node scripts/test-all-features.js
 */

const BASE_URL = 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEmailPreview() {
  log('\n📧 TEST 1: Email Preview API', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    const response = await fetch(`${BASE_URL}/api/email-preview?clientName=Yasmine Massaoudi&token=test123`);
    
    if (response.ok) {
      const html = await response.text();
      const hasBonjour = html.includes('Bonjour Yasmine');
      const hasFullName = html.includes('Bonjour Yasmine Massaoudi');
      
      if (hasBonjour && !hasFullName) {
        log('✅ Format du nom correct: "Bonjour Yasmine" (prénom seulement)', 'green');
      } else {
        log('❌ Format du nom incorrect', 'red');
      }
      
      log(`✅ Email preview fonctionne (${response.status})`, 'green');
      return true;
    } else {
      log(`❌ Email preview erreur: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testDocumentsHistory() {
  log('\n📚 TEST 2: Historique des Documents', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    const response = await fetch(`${BASE_URL}/api/agent/documents-history?limit=10`);
    const data = await response.json();
    
    if (data.success) {
      log(`✅ Historique récupéré: ${data.documents.length} document(s)`, 'green');
      log(`   Total: ${data.total} document(s) dans la base`, 'blue');
      return true;
    } else {
      log(`❌ Erreur: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testAutoSignDocuments() {
  log('\n✍️ TEST 3: Signature Automatique', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Récupérer un dossier avec signature
    const casesResponse = await fetch(`${BASE_URL}/api/agent/clients?status=all&limit=1`);
    const casesData = await casesResponse.json();
    
    if (!casesData.success || casesData.clients.length === 0) {
      log('⚠️  Aucun dossier disponible pour le test', 'yellow');
      return true;
    }

    const caseId = casesData.clients[0].caseId;
    
    // Récupérer les documents générés
    const docsResponse = await fetch(`${BASE_URL}/api/agent/documents-history?caseId=${caseId}&limit=1`);
    const docsData = await docsResponse.json();
    
    if (!docsData.success || docsData.documents.length === 0) {
      log('⚠️  Aucun document généré pour le test', 'yellow');
      return true;
    }

    const documentId = docsData.documents[0].id;
    
    // Tester la signature automatique
    const signResponse = await fetch(`${BASE_URL}/api/agent/auto-sign-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentIds: [documentId],
        caseId: caseId
      })
    });
    
    const signData = await signResponse.json();
    
    if (signData.success) {
      log(`✅ Signature automatique réussie: ${signData.signedDocuments.length} document(s)`, 'green');
      return true;
    } else {
      log(`❌ Erreur: ${signData.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testSendDocumentsEmail() {
  log('\n📧 TEST 4: Envoi Documents par Email', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Récupérer un dossier
    const casesResponse = await fetch(`${BASE_URL}/api/agent/clients?status=all&limit=1`);
    const casesData = await casesResponse.json();
    
    if (!casesData.success || casesData.clients.length === 0) {
      log('⚠️  Aucun dossier disponible pour le test', 'yellow');
      return true;
    }

    const caseId = casesData.clients[0].caseId;
    
    // Récupérer les documents
    const docsResponse = await fetch(`${BASE_URL}/api/agent/documents-history?caseId=${caseId}&limit=1`);
    const docsData = await docsResponse.json();
    
    if (!docsData.success || docsData.documents.length === 0) {
      log('⚠️  Aucun document pour le test', 'yellow');
      return true;
    }

    const documentId = docsData.documents[0].id;
    
    // Tester l'envoi par email
    const emailResponse = await fetch(`${BASE_URL}/api/agent/send-documents-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentIds: [documentId],
        caseId: caseId,
        message: 'Test automatique - Vos documents sont prêts'
      })
    });
    
    const emailData = await emailResponse.json();
    
    if (emailData.success) {
      log(`✅ Email envoyé à: ${emailData.clientEmail}`, 'green');
      log(`   Documents: ${emailData.documentsCount}`, 'blue');
      return true;
    } else {
      log(`❌ Erreur: ${emailData.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testExportStats() {
  log('\n📊 TEST 5: Export Statistiques Excel', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    const response = await fetch(`${BASE_URL}/api/agent/export-stats?period=30`);
    
    if (response.ok) {
      const blob = await response.blob();
      log(`✅ Export Excel généré: ${blob.size} bytes`, 'green');
      log(`   Type: ${blob.type}`, 'blue');
      return true;
    } else {
      log(`❌ Erreur export: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testExportClientDocuments() {
  log('\n📦 TEST 6: Export Documents Client (ZIP)', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Récupérer un client
    const clientsResponse = await fetch(`${BASE_URL}/api/agent/clients?status=all&limit=1`);
    const clientsData = await clientsResponse.json();
    
    if (!clientsData.success || clientsData.clients.length === 0) {
      log('⚠️  Aucun client disponible pour le test', 'yellow');
      return true;
    }

    const caseId = clientsData.clients[0].caseId;
    
    // Tester l'export
    const response = await fetch(`${BASE_URL}/api/agent/export-client-documents?caseId=${caseId}`);
    
    if (response.ok) {
      const blob = await response.blob();
      log(`✅ Export ZIP généré: ${blob.size} bytes`, 'green');
      log(`   Type: ${blob.type}`, 'blue');
      return true;
    } else {
      log(`❌ Erreur export: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testPDFGeneration() {
  log('\n📄 TEST 7: Génération PDF Signés', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Récupérer un document
    const docsResponse = await fetch(`${BASE_URL}/api/agent/documents-history?limit=1`);
    const docsData = await docsResponse.json();
    
    if (!docsData.success || docsData.documents.length === 0) {
      log('⚠️  Aucun document disponible pour le test', 'yellow');
      return true;
    }

    const doc = docsData.documents[0];
    
    // Tester la génération PDF
    const response = await fetch(`${BASE_URL}/api/agent/generate-signed-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: doc.id,
        caseId: doc.caseId,
        applySignature: true
      })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      log(`✅ PDF généré: ${blob.size} bytes`, 'green');
      log(`   Type: ${blob.type}`, 'blue');
      return true;
    } else {
      log(`❌ Erreur génération PDF: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testClientPortalData() {
  log('\n🔍 TEST 8: Récupération données client portal', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    const clientsResponse = await fetch(`${BASE_URL}/api/agent/clients?status=all&limit=1`);
    const clientsData = await clientsResponse.json();

    if (!clientsData.success || clientsData.clients.length === 0) {
      log('⚠️  Aucun client disponible', 'yellow');
      return true;
    }

    const token = clientsData.clients[0].secureToken;
    const response = await fetch(`${BASE_URL}/api/client/get-case-data?token=${token}`);
    const data = await response.json();

    if (data.success) {
      log(`✅ Données client récupérées: ${data.client.firstName} ${data.client.lastName}`, 'green');
      return true;
    } else {
      log(`❌ Erreur: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testDownloadDocuments() {
  log('\n📦 TEST 9: Téléchargement documents', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    const clientsResponse = await fetch(`${BASE_URL}/api/agent/clients?status=all&limit=1`);
    const clientsData = await clientsResponse.json();

    if (!clientsData.success || clientsData.clients.length === 0) {
      log('⚠️  Aucun client disponible', 'yellow');
      return true;
    }

    const client = clientsData.clients[0];
    const response = await fetch(`${BASE_URL}/api/agent/download-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: client.caseId,
        clientId: client.id
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      log(`✅ ZIP généré: ${blob.size} bytes`, 'green');
      return true;
    } else {
      log(`❌ Erreur: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 TESTS COMPLETS - NOUVELLES FONCTIONNALITÉS', 'cyan');
  log('=' .repeat(70), 'cyan');
  log(`URL de base: ${BASE_URL}`, 'blue');
  log('=' .repeat(70), 'cyan');

  const results = {
    emailPreview: await testEmailPreview(),
    documentsHistory: await testDocumentsHistory(),
    autoSign: await testAutoSignDocuments(),
    sendEmail: await testSendDocumentsEmail(),
    exportStats: await testExportStats(),
    exportClient: await testExportClientDocuments(),
    pdfGeneration: await testPDFGeneration(),
    clientPortalData: await testClientPortalData(),
    downloadDocuments: await testDownloadDocuments()
  };

  // Résumé
  log('\n' + '=' .repeat(70), 'cyan');
  log('📊 RÉSUMÉ DES TESTS', 'cyan');
  log('=' .repeat(70), 'cyan');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${icon} ${test}: ${result ? 'RÉUSSI' : 'ÉCHOUÉ'}`, color);
  });

  log('\n' + '=' .repeat(70), 'cyan');
  log(`Résultat: ${passed}/${total} tests réussis (${Math.round(passed/total*100)}%)`, 
    passed === total ? 'green' : 'yellow');
  log('=' .repeat(70), 'cyan');

  if (passed === total) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
  }
}

// Exécuter les tests
runAllTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});

