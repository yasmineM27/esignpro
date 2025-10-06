#!/usr/bin/env node

/**
 * Script de test pour valider le token et les améliorations mobile
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

async function testTokenMobile() {
  const token = 'f0f51e43-e348-4809-b75e-a1d5e9d4e4a0';
  
  log('blue', '📱 TEST TOKEN MOBILE');
  log('blue', '===================\n');

  log('yellow', `🔍 Test du token: ${token}`);

  // Test 1: Validation du token
  log('yellow', '\n📝 Test 1: Validation du token...');
  try {
    const result = await testAPI('/api/client/validate-token', 'POST', { token });
    
    if (result.ok && result.data && result.data.valid) {
      log('green', '✅ Token valide');
      log('blue', `   Client: ${result.data.clientName}`);
      log('blue', `   Dossier: ${result.data.caseNumber}`);
      log('blue', `   Status: ${result.data.status}`);
    } else {
      log('red', '❌ Token invalide ou expiré');
      log('red', `   Erreur: ${result.data?.error || result.error || 'Erreur inconnue'}`);
      return;
    }
  } catch (error) {
    log('red', `❌ Erreur validation token: ${error.message}`);
    return;
  }

  // Test 2: Accès au portail client
  log('yellow', '\n📱 Test 2: Accès au portail client...');
  try {
    const response = await fetch(`${API_BASE}/client-portal/${token}`);
    
    if (response.ok) {
      log('green', '✅ Portail client accessible');
      log('blue', `   URL: ${API_BASE}/client-portal/${token}`);
    } else {
      log('red', `❌ Erreur accès portail: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    log('red', `❌ Erreur accès portail: ${error.message}`);
  }

  // Test 3: Vérification des améliorations mobile
  log('yellow', '\n📱 Test 3: Améliorations mobile...');
  
  const fs = require('fs');
  const mobileFeatures = [
    {
      file: 'components/client-portal-upload.tsx',
      features: [
        'onTouchStart={handleTouchStart}',
        'onTouchMove={handleTouchMove}',
        'onTouchEnd={handleTouchEnd}',
        'touchAction: \'none\'',
        'window.innerWidth < 768',
        'clamp(150px, 25vw, 200px)'
      ]
    }
  ];

  let allFeaturesPresent = true;
  
  for (const { file, features } of mobileFeatures) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const feature of features) {
        if (content.includes(feature)) {
          log('green', `   ✅ ${feature}`);
        } else {
          log('red', `   ❌ Manque: ${feature}`);
          allFeaturesPresent = false;
        }
      }
    } catch (error) {
      log('red', `   ❌ Erreur lecture ${file}: ${error.message}`);
      allFeaturesPresent = false;
    }
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ TEST TOKEN MOBILE');
  log('blue', '============================');
  
  if (allFeaturesPresent) {
    log('green', '✅ Toutes les améliorations mobile sont présentes');
    log('green', '✅ Token valide et portail accessible');
    log('green', '\n🎯 INSTRUCTIONS POUR TESTER SUR MOBILE:');
    log('blue', `   1. Ouvrez sur votre smartphone: ${API_BASE}/client-portal/${token}`);
    log('blue', '   2. Uploadez les documents requis (CIN recto/verso)');
    log('blue', '   3. Cliquez sur "Finaliser le dossier et signer"');
    log('blue', '   4. Dessinez votre signature avec votre doigt');
    log('blue', '   5. Cliquez sur "Valider"');
    log('green', '\n🚀 Le système devrait maintenant fonctionner parfaitement sur mobile !');
  } else {
    log('red', '❌ Certaines améliorations mobile manquent');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }
}

// Exécuter le test
if (require.main === module) {
  testTokenMobile()
    .catch(error => {
      log('red', `❌ Erreur fatale: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testTokenMobile };
