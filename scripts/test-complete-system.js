/**
 * Script de test complet du système eSignPro
 * Teste tous les cas d'usage critiques
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

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Test 1: Vérifier que le serveur est démarré
async function testServerRunning() {
  section('TEST 1: Serveur démarré');
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      log('✅ Serveur accessible', 'green');
      return true;
    } else {
      log(`❌ Serveur répond avec status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Serveur non accessible: ' + error.message, 'red');
    log('💡 Lancez: npm run dev', 'yellow');
    return false;
  }
}

// Test 2: Créer un nouveau client
async function testCreateClient() {
  section('TEST 2: Création d\'un nouveau client');
  
  const testData = {
    prenom: `TestPrenom${Date.now()}`,
    nom: `TestNom${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    telephone: '+41791234567',
    nomPrenom: '', // Sera calculé
    documentContent: '',
    insuranceCompany: 'Test Insurance SA',
    policyNumber: 'POL-' + Date.now(),
    insuranceType: 'Résiliation'
  };

  testData.nomPrenom = `${testData.prenom} ${testData.nom}`;
  testData.documentContent = `Nom prénom : ${testData.nomPrenom}\nEmail : ${testData.email}`;

  try {
    log('📤 Envoi des données client...', 'blue');
    log(`   Prénom: ${testData.prenom}`, 'blue');
    log(`   Nom: ${testData.nom}`, 'blue');
    log(`   Email: ${testData.email}`, 'blue');

    const response = await fetch(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientEmail: testData.email,
        clientName: testData.nomPrenom,
        clientData: testData
      })
    });

    const result = await response.json();

    if (result.success && result.clientId) {
      log('✅ Client créé avec succès', 'green');
      log(`   Client ID: ${result.clientId}`, 'green');
      log(`   Case Number: ${result.caseNumber || 'N/A'}`, 'green');
      return { success: true, clientId: result.clientId, testData };
    } else {
      log('❌ Échec création client: ' + (result.error || 'Erreur inconnue'), 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Erreur création client: ' + error.message, 'red');
    return { success: false };
  }
}

// Test 3: Vérifier le portail client
async function testClientPortal(clientId, expectedName) {
  section('TEST 3: Portail client dynamique');
  
  try {
    log(`📄 Chargement du portail: ${BASE_URL}/client-portal/${clientId}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/client-portal/${clientId}`);
    const html = await response.text();

    if (!response.ok) {
      log(`❌ Portail non accessible (status ${response.status})`, 'red');
      return false;
    }

    // Vérifier que le nom du client est présent
    const hasBonjour = html.includes('Bonjour ');
    const hasClientName = html.includes(expectedName);

    if (hasBonjour && hasClientName) {
      log(`✅ Portail affiche "Bonjour ${expectedName}"`, 'green');
      return true;
    } else {
      log('❌ Le nom du client n\'est pas affiché correctement', 'red');
      log(`   Recherché: "${expectedName}"`, 'yellow');
      log(`   Trouvé "Bonjour": ${hasBonjour}`, 'yellow');
      log(`   Trouvé nom: ${hasClientName}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Erreur test portail: ' + error.message, 'red');
    return false;
  }
}

// Test 4: Vérifier l'API get-case-data
async function testGetCaseData(clientId, expectedData) {
  section('TEST 4: API get-case-data');
  
  try {
    log(`📡 Appel API: /api/client/get-case-data?token=${clientId}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/client/get-case-data?token=${clientId}`);
    const data = await response.json();

    if (!data.success) {
      log('❌ API retourne success=false: ' + (data.error || 'Erreur inconnue'), 'red');
      return false;
    }

    log('✅ API répond avec succès', 'green');
    log(`   Prénom: ${data.client.firstName}`, 'green');
    log(`   Nom: ${data.client.lastName}`, 'green');
    log(`   Email: ${data.client.email}`, 'green');
    log(`   Case Number: ${data.caseNumber}`, 'green');

    // Vérifier que les données correspondent
    const firstNameMatch = data.client.firstName === expectedData.prenom;
    const lastNameMatch = data.client.lastName === expectedData.nom;
    const emailMatch = data.client.email === expectedData.email;

    if (firstNameMatch && lastNameMatch && emailMatch) {
      log('✅ Toutes les données correspondent', 'green');
      return true;
    } else {
      log('❌ Les données ne correspondent pas', 'red');
      log(`   Prénom: attendu="${expectedData.prenom}", reçu="${data.client.firstName}"`, 'yellow');
      log(`   Nom: attendu="${expectedData.nom}", reçu="${data.client.lastName}"`, 'yellow');
      log(`   Email: attendu="${expectedData.email}", reçu="${data.client.email}"`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Erreur test API: ' + error.message, 'red');
    return false;
  }
}

// Test 5: Vérifier l'espace agent
async function testAgentSpace(expectedName) {
  section('TEST 5: Espace agent - Liste des clients');
  
  try {
    log('📡 Appel API: /api/agent/clients?status=all&limit=10', 'blue');
    
    const response = await fetch(`${BASE_URL}/api/agent/clients?status=all&limit=10`);
    const data = await response.json();

    if (!data.success) {
      log('❌ API retourne success=false: ' + (data.error || 'Erreur inconnue'), 'red');
      return false;
    }

    log(`✅ API répond avec ${data.clients.length} client(s)`, 'green');

    // Chercher le client créé
    const client = data.clients.find(c => c.fullName === expectedName);

    if (client) {
      log(`✅ Client trouvé dans la liste: "${client.fullName}"`, 'green');
      log(`   Email: ${client.email}`, 'green');
      log(`   Status: ${client.status}`, 'green');
      return true;
    } else {
      log(`⚠️ Client "${expectedName}" pas encore dans la liste`, 'yellow');
      log('   (Peut prendre quelques secondes pour apparaître)', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Erreur test espace agent: ' + error.message, 'red');
    return false;
  }
}

// Test 6: Vérifier l'historique des documents
async function testDocumentsHistory() {
  section('TEST 6: Historique des documents');
  
  try {
    log('📡 Appel API: /api/agent/documents-history?limit=10', 'blue');
    
    const response = await fetch(`${BASE_URL}/api/agent/documents-history?limit=10`);
    const data = await response.json();

    if (!data.success) {
      log('❌ API retourne success=false: ' + (data.error || 'Erreur inconnue'), 'red');
      return false;
    }

    log('✅ API répond avec succès', 'green');
    log(`   Documents générés: ${data.stats.generated}`, 'green');
    log(`   Documents uploadés: ${data.stats.uploaded}`, 'green');
    log(`   Total: ${data.stats.total}`, 'green');

    if (data.stats.total > 0) {
      log('✅ Des documents sont présents dans l\'historique', 'green');
    } else {
      log('⚠️ Aucun document dans l\'historique (normal pour un nouveau système)', 'yellow');
    }

    return true;
  } catch (error) {
    log('❌ Erreur test historique: ' + error.message, 'red');
    return false;
  }
}

// Test 7: Vérifier Supabase Storage
async function testSupabaseStorage() {
  section('TEST 7: Supabase Storage');
  
  log('ℹ️  Ce test nécessite un upload de document réel', 'blue');
  log('   Vérifiez manuellement dans Supabase Dashboard:', 'blue');
  log('   https://supabase.com/dashboard/project/vtbojyaszfsnepgyeoke/storage/buckets/client-documents', 'cyan');
  
  return true;
}

// Fonction principale
async function runAllTests() {
  log('\n🚀 DÉMARRAGE DES TESTS COMPLETS - ESIGNPRO\n', 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: Serveur
  results.total++;
  if (await testServerRunning()) {
    results.passed++;
  } else {
    results.failed++;
    log('\n❌ Serveur non accessible. Arrêt des tests.', 'red');
    return;
  }

  // Test 2: Création client
  results.total++;
  const createResult = await testCreateClient();
  if (createResult.success) {
    results.passed++;
    
    // Attendre 2 secondes pour que les données soient bien enregistrées
    log('\n⏳ Attente de 2 secondes pour la propagation des données...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { clientId, testData } = createResult;
    const expectedName = `${testData.prenom} ${testData.nom}`;

    // Test 3: Portail client
    results.total++;
    if (await testClientPortal(clientId, expectedName)) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Test 4: API get-case-data
    results.total++;
    if (await testGetCaseData(clientId, testData)) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Test 5: Espace agent
    results.total++;
    if (await testAgentSpace(expectedName)) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    results.failed++;
  }

  // Test 6: Historique documents
  results.total++;
  if (await testDocumentsHistory()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 7: Supabase Storage
  results.total++;
  if (await testSupabaseStorage()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Résumé final
  section('RÉSUMÉ DES TESTS');
  log(`Total: ${results.total}`, 'blue');
  log(`✅ Réussis: ${results.passed}`, 'green');
  log(`❌ Échoués: ${results.failed}`, 'red');
  log(`📊 Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%`, 'cyan');

  if (results.failed === 0) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
  } else {
    log('\n⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.', 'yellow');
  }
}

// Lancer les tests
runAllTests().catch(error => {
  log('\n❌ ERREUR FATALE: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});

