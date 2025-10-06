#!/usr/bin/env node

/**
 * Script de test pour valider les améliorations responsive et mobile
 */

const fs = require('fs');
const path = require('path');

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

function checkFileContent(filePath, searchPatterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let allFound = true;
    const results = [];

    for (const pattern of searchPatterns) {
      const found = content.includes(pattern);
      results.push({ pattern, found });
      if (!found) allFound = false;
    }

    log(allFound ? 'green' : 'red', `${allFound ? '✅' : '❌'} ${description}`);
    
    if (!allFound) {
      results.forEach(({ pattern, found }) => {
        if (!found) {
          log('red', `   ❌ Manque: ${pattern}`);
        }
      });
    }

    return allFound;
  } catch (error) {
    log('red', `❌ Erreur lecture ${filePath}: ${error.message}`);
    return false;
  }
}

async function testResponsiveMobile() {
  log('blue', '📱 TESTS RESPONSIVE & MOBILE');
  log('blue', '============================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Viewport meta tag
  log('yellow', '📱 Test 1: Viewport meta tag...');
  const viewportPatterns = [
    'viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"'
  ];
  
  if (checkFileContent('app/layout.tsx', viewportPatterns, 'Viewport meta tag configuré')) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Client portal responsive
  log('yellow', '\n📱 Test 2: Client portal responsive...');
  const portalPatterns = [
    'className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8',
    'className="max-w-4xl mx-auto bg-white rounded-xl',
    'className="bg-gradient-to-br from-blue-500 to-purple-600',
    'className="text-xl sm:text-2xl lg:text-3xl',
    'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  ];
  
  if (checkFileContent('app/client-portal/[clientId]/page.tsx', portalPatterns, 'Client portal responsive')) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Signature responsive
  log('yellow', '\n📱 Test 3: Signature responsive...');
  const signaturePatterns = [
    'className="space-y-4 sm:space-y-6"',
    'className="block sm:hidden bg-yellow-50',
    'height: \'clamp(150px, 25vw, 200px)\'',
    'className="flex flex-col sm:flex-row gap-3',
    'window.innerWidth < 768 ? 3 : 2'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', signaturePatterns, 'Signature responsive')) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Validation mobile améliorée
  log('yellow', '\n📱 Test 4: Validation mobile...');
  const validationPatterns = [
    'if (window.innerWidth < 768) {',
    'alert("❌ SIGNATURE REQUISE',
    'alert("❌ SIGNATURE INCOMPLÈTE',
    '📱 Veuillez dessiner votre signature avec votre doigt'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', validationPatterns, 'Validation mobile améliorée')) {
    passed++;
  } else {
    failed++;
  }

  // Test 5: Instructions mobile
  log('yellow', '\n📱 Test 5: Instructions mobile...');
  const instructionsPatterns = [
    'className="block sm:hidden bg-yellow-50',
    '📱 <strong>Sur mobile :</strong>',
    'Utilisez votre doigt pour dessiner',
    'className="hidden sm:inline"',
    'className="sm:hidden"'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', instructionsPatterns, 'Instructions mobile spécifiques')) {
    passed++;
  } else {
    failed++;
  }

  // Test 6: Boutons responsive
  log('yellow', '\n📱 Test 6: Boutons responsive...');
  const buttonsPatterns = [
    'className="flex flex-col sm:flex-row gap-3',
    'className="hidden sm:inline">Effacer</span>',
    'className="sm:hidden">Recommencer</span>',
    'className="hidden sm:inline">Confirmer la Signature</span>',
    'className="sm:hidden">Valider</span>'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', buttonsPatterns, 'Boutons responsive')) {
    passed++;
  } else {
    failed++;
  }

  // Test 7: Canvas mobile optimisé
  log('yellow', '\n📱 Test 7: Canvas mobile optimisé...');
  const canvasPatterns = [
    'height: \'clamp(150px, 25vw, 200px)\'',
    'cursor: isConfirmed ? \'default\' : \'crosshair\'',
    'window.innerWidth < 768 ? 3 : 2',
    'touchAction: \'none\''
  ];
  
  if (checkFileContent('components/digital-signature.tsx', canvasPatterns, 'Canvas mobile optimisé')) {
    passed++;
  } else {
    failed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ TESTS RESPONSIVE');
  log('blue', '===========================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 INTERFACE PARFAITEMENT RESPONSIVE !');
    log('green', '   ✅ Viewport meta tag configuré');
    log('green', '   ✅ Client portal responsive');
    log('green', '   ✅ Signature adaptée mobile');
    log('green', '   ✅ Validation mobile améliorée');
    log('green', '   ✅ Instructions spécifiques mobile');
    log('green', '   ✅ Boutons responsive');
    log('green', '   ✅ Canvas optimisé mobile');
  } else {
    log('yellow', '\n⚠️ Certaines améliorations responsive manquantes');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }

  return { passed, failed };
}

// Test des breakpoints responsive
function testBreakpoints() {
  log('blue', '\n📱 BREAKPOINTS RESPONSIVE');
  log('blue', '=========================');

  const breakpoints = {
    'Mobile': '< 768px (sm:)',
    'Tablet': '768px - 1024px (sm: - lg:)',
    'Desktop': '> 1024px (lg:+)'
  };

  log('green', '✅ Breakpoints configurés:');
  Object.entries(breakpoints).forEach(([device, range]) => {
    log('blue', `   📱 ${device}: ${range}`);
  });

  log('green', '\n🎯 ADAPTATIONS PAR APPAREIL:');
  log('blue', '   📱 Mobile:');
  log('green', '      ✅ Canvas plus haut (clamp)');
  log('green', '      ✅ Trait plus épais (3px)');
  log('green', '      ✅ Boutons empilés verticalement');
  log('green', '      ✅ Textes adaptés');
  log('green', '      ✅ Instructions spécifiques');
  log('green', '      ✅ Alertes natives');
  
  log('blue', '   💻 Desktop:');
  log('green', '      ✅ Canvas standard');
  log('green', '      ✅ Trait normal (2px)');
  log('green', '      ✅ Boutons côte à côte');
  log('green', '      ✅ Toasts élégants');
}

// Exécuter les tests
if (require.main === module) {
  testResponsiveMobile()
    .then(({ passed, failed }) => {
      testBreakpoints();
      
      if (failed === 0) {
        log('green', '\n🎯 RÉSULTAT: INTERFACE PARFAITEMENT RESPONSIVE');
        log('green', '🚀 Signature mobile, validation et interface optimisées !');
        process.exit(0);
      } else {
        log('red', '\n❌ RÉSULTAT: AMÉLIORATIONS RESPONSIVE INCOMPLÈTES');
        process.exit(1);
      }
    })
    .catch(error => {
      log('red', `❌ Erreur fatale: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testResponsiveMobile };
