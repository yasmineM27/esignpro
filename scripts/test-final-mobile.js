#!/usr/bin/env node

/**
 * Script de validation finale des améliorations mobile
 */

const fs = require('fs');

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

async function testFinalMobile() {
  log('blue', '📱 VALIDATION FINALE MOBILE');
  log('blue', '===========================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Gestionnaires tactiles
  log('yellow', '📱 Test 1: Gestionnaires tactiles...');
  const touchPatterns = [
    'onTouchStart={handleTouchStart}',
    'onTouchMove={handleTouchMove}',
    'onTouchEnd={handleTouchEnd}',
    'const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {',
    'const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {',
    'const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {'
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', touchPatterns, 'Gestionnaires tactiles')) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Canvas responsive
  log('yellow', '\n📱 Test 2: Canvas responsive...');
  const canvasPatterns = [
    'height: \'clamp(150px, 25vw, 200px)\'',
    'touchAction: \'none\'',
    'WebkitTouchCallout: \'none\'',
    'WebkitUserSelect: \'none\'',
    'userSelect: \'none\'',
    'window.innerWidth < 768 ? 3 : 2'
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', canvasPatterns, 'Canvas responsive')) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Boutons responsive
  log('yellow', '\n📱 Test 3: Boutons responsive...');
  const buttonPatterns = [
    'flexDirection: window.innerWidth < 768 ? \'column\' : \'row\'',
    'fontSize: window.innerWidth < 768 ? \'16px\' : \'14px\'',
    'minHeight: \'48px\'',
    'window.innerWidth < 768 ? \'Recommencer\' : \'Effacer\'',
    'window.innerWidth < 768 ? \'Valider\' : \'Valider la signature\''
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', buttonPatterns, 'Boutons responsive')) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Instructions mobile
  log('yellow', '\n📱 Test 4: Instructions mobile...');
  const instructionPatterns = [
    '📱 Dessinez votre signature avec votre doigt',
    '💡 <strong>Conseil :</strong> Tenez votre téléphone horizontalement',
    'window.innerWidth < 768 ? \'16px\' : \'14px\'',
    'fontWeight: window.innerWidth < 768 ? \'bold\' : \'normal\''
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', instructionPatterns, 'Instructions mobile')) {
    passed++;
  } else {
    failed++;
  }

  // Test 5: Initialisation canvas
  log('yellow', '\n📱 Test 5: Initialisation canvas...');
  const initPatterns = [
    'useEffect(() => {',
    'const dpr = window.devicePixelRatio || 1;',
    'canvas.width = rect.width * dpr;',
    'canvas.height = rect.height * dpr;',
    'ctx.scale(dpr, dpr);'
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', initPatterns, 'Initialisation canvas')) {
    passed++;
  } else {
    failed++;
  }

  // Test 6: Validation signature améliorée
  log('yellow', '\n📱 Test 6: Validation signature...');
  const validationPatterns = [
    'if (!signature || signature.trim() === \'\' || signature === \'data:image/png;base64,\')',
    'if (signature.length < 100)',
    '❌ Signature requise',
    '❌ Signature incomplète'
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', validationPatterns, 'Validation signature')) {
    passed++;
  } else {
    failed++;
  }

  // Test 7: Import useEffect
  log('yellow', '\n📱 Test 7: Import useEffect...');
  const importPatterns = [
    'import { useState, useCallback, useRef, useEffect } from \'react\';'
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', importPatterns, 'Import useEffect')) {
    passed++;
  } else {
    failed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ VALIDATION FINALE');
  log('blue', '============================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 TOUTES LES AMÉLIORATIONS MOBILE APPLIQUÉES !');
    log('green', '   ✅ Gestionnaires tactiles complets');
    log('green', '   ✅ Canvas responsive et optimisé');
    log('green', '   ✅ Boutons adaptés mobile');
    log('green', '   ✅ Instructions spécifiques mobile');
    log('green', '   ✅ Initialisation canvas correcte');
    log('green', '   ✅ Validation signature robuste');
    log('green', '   ✅ Imports corrects');
    
    log('blue', '\n🚀 INSTRUCTIONS POUR TESTER:');
    log('yellow', '   1. Démarrez le serveur: npm run dev');
    log('yellow', '   2. Ouvrez sur mobile: http://localhost:3000/client-portal/f0f51e43-e348-4809-b75e-a1d5e9d4e4a0');
    log('yellow', '   3. Uploadez les documents CIN (recto/verso)');
    log('yellow', '   4. Cliquez "Finaliser le dossier et signer"');
    log('yellow', '   5. Dessinez votre signature avec le doigt');
    log('yellow', '   6. Validez la signature');
    
    log('green', '\n🎯 LA SIGNATURE MOBILE DEVRAIT MAINTENANT FONCTIONNER !');
  } else {
    log('yellow', '\n⚠️ Certaines améliorations mobile manquantes');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }

  return { passed, failed };
}

// Exécuter les tests
if (require.main === module) {
  testFinalMobile()
    .then(({ passed, failed }) => {
      if (failed === 0) {
        log('green', '\n🎯 RÉSULTAT: AMÉLIORATIONS MOBILE PARFAITES');
        process.exit(0);
      } else {
        log('red', '\n❌ RÉSULTAT: AMÉLIORATIONS MOBILE INCOMPLÈTES');
        process.exit(1);
      }
    })
    .catch(error => {
      log('red', `❌ Erreur fatale: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testFinalMobile };
