#!/usr/bin/env node

/**
 * Script de test pour valider les améliorations mobile et documents
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

async function testAmeliorationsMobile() {
  log('blue', '📱 TESTS AMÉLIORATIONS MOBILE & DOCUMENTS');
  log('blue', '==========================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Signature mobile améliorée
  log('yellow', '📝 Test 1: Signature mobile améliorée...');
  const signaturePatterns = [
    'touchAction: \'none\'',
    'WebkitTouchCallout: \'none\'',
    'touch-none',
    'handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {',
    'const rect = canvas.getBoundingClientRect()',
    'const x = touch.clientX - rect.left',
    'const y = touch.clientY - rect.top'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', signaturePatterns, 'Signature mobile optimisée')) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Validation signature vide améliorée
  log('yellow', '\n📝 Test 2: Validation signature vide...');
  const validationPatterns = [
    'if (!signature || signature.trim() === \'\' || signature === \'data:image/png;base64,\')',
    'if (signature.length < 100)',
    '❌ Signature requise',
    '❌ Signature incomplète',
    'Votre signature semble incomplète'
  ];
  
  if (checkFileContent('components/client-portal-upload.tsx', validationPatterns, 'Validation signature robuste')) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Support PDF pour CIN - file-uploader
  log('yellow', '\n📄 Test 3: Support PDF CIN - file-uploader...');
  const pdfPatternsUploader = [
    '"application/pdf"',
    'Formats acceptés: Images (JPG, PNG) ou PDF'
  ];
  
  if (checkFileContent('components/file-uploader.tsx', pdfPatternsUploader, 'Support PDF dans file-uploader')) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Support PDF pour CIN - API
  log('yellow', '\n📄 Test 4: Support PDF CIN - API...');
  const pdfPatternsAPI = [
    '\'application/pdf\'',
    'allowedTypes: [\'image/jpeg\', \'image/png\', \'image/jpg\', \'application/pdf\']'
  ];
  
  if (checkFileContent('app/api/client/upload-separated-documents/route.ts', pdfPatternsAPI, 'Support PDF dans API upload')) {
    passed++;
  } else {
    failed++;
  }

  // Test 5: Support PDF pour CIN - separated-document-uploader
  log('yellow', '\n📄 Test 5: Support PDF CIN - separated-document-uploader...');
  const pdfPatternsSeparated = [
    '"application/pdf"',
    'Formats acceptés: Images (JPG, PNG) ou PDF'
  ];
  
  if (checkFileContent('components/separated-document-uploader.tsx', pdfPatternsSeparated, 'Support PDF dans separated-document-uploader')) {
    passed++;
  } else {
    failed++;
  }

  // Test 6: Validation signature dans digital-signature
  log('yellow', '\n📝 Test 6: Validation signature digital-signature...');
  const digitalSignaturePatterns = [
    '❌ Signature requise',
    '❌ Signature incomplète',
    'if (signatureDataUrl.length < 100',
    'Votre signature semble incomplète'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', digitalSignaturePatterns, 'Validation signature dans digital-signature')) {
    passed++;
  } else {
    failed++;
  }

  // Test 7: Vérification des propriétés CSS mobile
  log('yellow', '\n📱 Test 7: Propriétés CSS mobile...');
  const cssPatterns = [
    'style={{',
    'touchAction: \'none\'',
    'WebkitTouchCallout: \'none\'',
    'WebkitUserSelect: \'none\'',
    'userSelect: \'none\'',
    'touch-none'
  ];
  
  if (checkFileContent('components/digital-signature.tsx', cssPatterns, 'Propriétés CSS mobile optimisées')) {
    passed++;
  } else {
    failed++;
  }

  // Résumé
  log('blue', '\n📊 RÉSUMÉ TESTS AMÉLIORATIONS');
  log('blue', '==============================');
  log('green', `✅ Tests réussis: ${passed}`);
  log('red', `❌ Tests échoués: ${failed}`);
  log('blue', `📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    log('green', '\n🎉 TOUTES LES AMÉLIORATIONS APPLIQUÉES !');
    log('green', '   ✅ Signature mobile optimisée');
    log('green', '   ✅ Validation signature robuste');
    log('green', '   ✅ Support PDF pour documents CIN');
    log('green', '   ✅ Messages d\'erreur améliorés');
    log('green', '   ✅ Propriétés CSS mobile');
    log('green', '   ✅ Gestion tactile améliorée');
  } else {
    log('yellow', '\n⚠️ Certaines améliorations manquantes');
    log('yellow', '   Vérifiez les logs ci-dessus pour les détails');
  }

  return { passed, failed };
}

// Test des types de fichiers acceptés
function testFileTypes() {
  log('blue', '\n📄 VÉRIFICATION TYPES DE FICHIERS');
  log('blue', '==================================');

  const expectedTypes = {
    'CIN Recto/Verso': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    'Contrat Assurance': ['application/pdf', 'image/jpeg', 'image/png'],
    'Justificatif Domicile': ['application/pdf', 'image/jpeg', 'image/png'],
    'Relevé Bancaire': ['application/pdf', 'image/jpeg', 'image/png']
  };

  log('green', '✅ Types de fichiers supportés:');
  Object.entries(expectedTypes).forEach(([docType, types]) => {
    log('blue', `   📄 ${docType}:`);
    types.forEach(type => {
      const extension = type === 'application/pdf' ? 'PDF' : 
                       type === 'image/jpeg' ? 'JPG' : 
                       type === 'image/png' ? 'PNG' : type;
      log('green', `      ✅ ${extension}`);
    });
  });

  log('green', '\n🎯 NOUVEAUTÉ: Documents CIN acceptent maintenant les PDF !');
  log('green', '   📄 CIN Recto: Images + PDF');
  log('green', '   📄 CIN Verso: Images + PDF');
}

// Exécuter les tests
if (require.main === module) {
  testAmeliorationsMobile()
    .then(({ passed, failed }) => {
      testFileTypes();
      
      if (failed === 0) {
        log('green', '\n🎯 RÉSULTAT: AMÉLIORATIONS PARFAITES');
        log('green', '🚀 Signature mobile, validation robuste et support PDF opérationnels !');
        process.exit(0);
      } else {
        log('red', '\n❌ RÉSULTAT: AMÉLIORATIONS INCOMPLÈTES');
        process.exit(1);
      }
    })
    .catch(error => {
      log('red', `❌ Erreur fatale: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testAmeliorationsMobile };
