async function testAlternativeSignature() {
  console.log('🧪 TEST DE LA PAGE SIGNATURE ALTERNATIVE');
  console.log('========================================');
  
  const token = 'SECURE_1758976792815_d0kq0bd';
  const baseUrl = 'https://esignpro.ch';
  
  const tests = [
    {
      name: 'Page Client Portal',
      url: `${baseUrl}/client-portal/${token}`,
      description: 'Page principale avec upload'
    },
    {
      name: 'Page Signature Alternative',
      url: `${baseUrl}/signature/${token}`,
      description: 'Nouvelle page de signature'
    },
    {
      name: 'Page Signature Originale',
      url: `${baseUrl}/secure-signature/${token}`,
      description: 'Ancienne page (peut être 404)'
    },
    {
      name: 'API Finalisation',
      url: `${baseUrl}/api/client/finalize-case?token=${token}`,
      description: 'API pour finaliser le dossier'
    },
    {
      name: 'API Signature',
      url: `${baseUrl}/api/client/save-signature`,
      description: 'API pour sauvegarder signature'
    }
  ];
  
  console.log(`🔍 Test du token: ${token}\n`);
  
  for (const test of tests) {
    try {
      console.log(`📋 ${test.name}:`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Description: ${test.description}`);
      
      const response = await fetch(test.url);
      const status = response.status;
      
      let result = '';
      let icon = '';
      
      if (status === 200) {
        icon = '✅';
        result = 'FONCTIONNE';
      } else if (status === 404) {
        icon = '❌';
        result = 'PAGE NON TROUVÉE';
      } else if (status === 405) {
        icon = '⚠️';
        result = 'MÉTHODE NON AUTORISÉE (normal pour API)';
      } else {
        icon = '⚠️';
        result = `STATUS ${status}`;
      }
      
      console.log(`   Résultat: ${icon} ${result}`);
      
      // Pour les APIs, testons aussi avec POST si GET échoue
      if (test.url.includes('/api/') && status !== 200) {
        try {
          const postResponse = await fetch(test.url, { method: 'POST' });
          if (postResponse.status !== 404) {
            console.log(`   POST: ✅ API accessible (${postResponse.status})`);
          }
        } catch (e) {
          // Ignore
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   Résultat: 💥 ERREUR RÉSEAU - ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎯 RÉSUMÉ:');
  console.log('==========');
  
  // Test rapide pour déterminer l'état
  try {
    const clientResponse = await fetch(`${baseUrl}/client-portal/${token}`);
    const signatureResponse = await fetch(`${baseUrl}/signature/${token}`);
    
    if (clientResponse.status === 200 && signatureResponse.status === 200) {
      console.log('🎉 SUCCÈS COMPLET !');
      console.log('   ✅ Page client: Fonctionne');
      console.log('   ✅ Page signature alternative: Fonctionne');
      console.log('   🚀 Le workflow complet est opérationnel !');
      console.log('');
      console.log('📋 ÉTAPES POUR TESTER:');
      console.log(`   1. Ouvrir: ${baseUrl}/client-portal/${token}`);
      console.log('   2. Uploader les documents requis');
      console.log('   3. Cliquer sur "Finaliser le dossier et signer"');
      console.log(`   4. Vous serez redirigé vers: ${baseUrl}/signature/${token}`);
      console.log('   5. Signer le document');
      console.log('   6. Confirmer la signature');
      console.log('');
      console.log('✨ PROBLÈME 404 RÉSOLU !');
      
    } else if (clientResponse.status === 200 && signatureResponse.status === 404) {
      console.log('⏳ DÉPLOIEMENT EN COURS...');
      console.log('   ✅ Page client: Fonctionne');
      console.log('   ❌ Page signature alternative: Pas encore déployée');
      console.log('   🔄 Attendez quelques minutes et retestez');
      
    } else {
      console.log('⚠️ PROBLÈME PERSISTANT');
      console.log('   Le déploiement semble avoir des difficultés');
      console.log('   Vérifiez les logs de déploiement');
    }
    
  } catch (error) {
    console.log('💥 ERREUR DE TEST');
    console.log(`   ${error.message}`);
  }
}

testAlternativeSignature().catch(console.error);
