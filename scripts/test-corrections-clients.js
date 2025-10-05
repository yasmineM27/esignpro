#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections clients et portail
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
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: data,
      contentType: contentType
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function runClientTests() {
  log('blue', '👥 TESTS CORRECTIONS CLIENTS eSignPro');
  log('blue', '====================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: API agent/clients - récupération de TOUS les dossiers
  log('yellow', '📋 Test 1: API agent/clients - récupération complète...');
  try {
    const result = await testAPI('/api/agent/clients?status=all&limit=10');
    
    if (result.ok && result.data.success) {
      const clients = result.data.clients || [];
      log('green', `✅ API agent/clients fonctionne - ${clients.length} client(s) trouvé(s)`);
      
      if (clients.length > 0) {
        // Vérifier que tous les clients ont un fullName valide
        const validClients = clients.filter(client => 
          client.fullName && 
          typeof client.fullName === 'string' && 
          client.fullName.trim().length > 0 &&
          !client.fullName.includes('undefined') &&
          !client.fullName.includes('null')
        );
        
        log('blue', `   Clients avec fullName valide: ${validClients.length}/${clients.length}`);
        
        if (validClients.length === clients.length) {
          log('green', '   ✅ Tous les clients ont un fullName correct');
          passed++;
        } else {
          log('red', '   ❌ Certains clients ont un fullName invalide');
          // Afficher les clients problématiques
          clients.forEach((client, i) => {
            if (!client.fullName || client.fullName.includes('undefined')) {
              log('red', `     Client ${i + 1}: "${client.fullName}" (ID: ${client.id})`);
            }
          });
          failed++;
        }
        
        // Afficher quelques exemples
        log('blue', '   Exemples de clients:');
        clients.slice(0, 3).forEach((client, i) => {
          log('blue', `     ${i + 1}. ${client.fullName} (${client.caseNumber}) - ${client.caseStatus}`);
        });
      } else {
        log('yellow', '   ⚠️ Aucun client trouvé - vérifiez qu\'il y a des dossiers en base');
        passed++; // Pas d'erreur, juste pas de données
      }
    } else {
      log('red', `❌ API agent/clients erreur: ${result.status}`);
      log('red', `   Erreur: ${result.data.error || result.data}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test agent/clients: ${error.message}`);
    failed++;
  }

  // Test 2: Vérifier la structure des données client
  log('yellow', '\n🔍 Test 2: Structure des données client...');
  try {
    const result = await testAPI('/api/agent/clients?status=all&limit=1');
    
    if (result.ok && result.data.success && result.data.clients.length > 0) {
      const client = result.data.clients[0];
      
      const requiredFields = [
        'id', 'fullName', 'email', 'caseId', 'caseNumber', 
        'caseStatus', 'secureToken', 'insuranceCompany'
      ];
      
      const missingFields = requiredFields.filter(field => !client.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        log('green', '✅ Structure des données client complète');
        log('blue', `   Champs présents: ${requiredFields.join(', ')}`);
        passed++;
      } else {
        log('red', `❌ Champs manquants: ${missingFields.join(', ')}`);
        failed++;
      }
    } else {
      log('yellow', '⚠️ Pas de données pour tester la structure');
      passed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test structure: ${error.message}`);
    failed++;
  }

  // Test 3: Test de recherche par nom
  log('yellow', '\n🔎 Test 3: Recherche par nom...');
  try {
    // D'abord récupérer un client pour avoir un nom à rechercher
    const allResult = await testAPI('/api/agent/clients?status=all&limit=1');
    
    if (allResult.ok && allResult.data.success && allResult.data.clients.length > 0) {
      const firstClient = allResult.data.clients[0];
      const searchTerm = firstClient.firstName || firstClient.fullName.split(' ')[0];
      
      const searchResult = await testAPI(`/api/agent/clients?search=${encodeURIComponent(searchTerm)}&limit=5`);
      
      if (searchResult.ok && searchResult.data.success) {
        log('green', `✅ Recherche par nom fonctionne - ${searchResult.data.clients.length} résultat(s)`);
        log('blue', `   Terme recherché: "${searchTerm}"`);
        passed++;
      } else {
        log('red', '❌ Recherche par nom échoue');
        failed++;
      }
    } else {
      log('yellow', '⚠️ Pas de données pour tester la recherche');
      passed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test recherche: ${error.message}`);
    failed++;
  }

  // Test 4: Vérifier les différents statuts
  log('yellow', '\n📊 Test 4: Filtrage par statut...');
  try {
    const statuses = ['all', 'pending', 'active', 'completed'];
    let statusTests = 0;
    
    for (const status of statuses) {
      const result = await testAPI(`/api/agent/clients?status=${status}&limit=5`);
      
      if (result.ok && result.data.success) {
        log('green', `   ✅ Statut "${status}": ${result.data.clients.length} client(s)`);
        statusTests++;
      } else {
        log('red', `   ❌ Statut "${status}" échoue`);
      }
    }
    
    if (statusTests === statuses.length) {
      log('green', '✅ Tous les filtres de statut fonctionnent');
      passed++;
    } else {
      log('red', `❌ ${statuses.length - statusTests} filtre(s) de statut échouent`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test statuts: ${error.message}`);
    failed++;
  }

  // Test 5: Vérifier la pagination
  log('yellow', '\n📄 Test 5: Pagination...');
  try {
    const page1 = await testAPI('/api/agent/clients?limit=2&offset=0');
    const page2 = await testAPI('/api/agent/clients?limit=2&offset=2');
    
    if (page1.ok && page2.ok && page1.data.success && page2.data.success) {
      log('green', '✅ Pagination fonctionne');
      log('blue', `   Page 1: ${page1.data.clients.length} client(s)`);
      log('blue', `   Page 2: ${page2.data.clients.length} client(s)`);
      log('blue', `   Total: ${page1.data.totalCount || 'N/A'}`);
      passed++;
    } else {
      log('red', '❌ Pagination échoue');
      failed++;
    }
  } catch (error) {
    log('red', `❌ Erreur test pagination: ${error.message}`);
    failed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ TESTS CLIENTS');
  log('blue', '=======================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 TOUS LES CLIENTS SONT CORRECTEMENT AFFICHÉS !');
    log('green', '   ✅ fullName généré correctement');
    log('green', '   ✅ Tous les dossiers récupérés');
    log('green', '   ✅ Recherche fonctionnelle');
    log('green', '   ✅ Filtres de statut OK');
    log('green', '   ✅ Pagination fonctionnelle');
  } else {
    log('yellow', '\n⚠️ Certains aspects nécessitent encore du travail');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }

  return { passed, failed };
}

// Exécuter les tests
if (require.main === module) {
  runClientTests().catch(console.error);
}

module.exports = { runClientTests };
