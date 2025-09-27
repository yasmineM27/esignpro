async function checkDeploymentStatus() {
  console.log('🔍 VÉRIFICATION ÉTAT DU DÉPLOIEMENT');
  console.log('===================================');
  
  const baseUrl = 'https://esignpro.ch';
  
  // Test des pages principales pour voir si le déploiement est actif
  const testPages = [
    '/',
    '/agent',
    '/api/health',
    '/client-portal/test',
    '/secure-signature/test'
  ];
  
  console.log('📋 Test des pages principales...\n');
  
  for (const page of testPages) {
    try {
      const url = `${baseUrl}${page}`;
      const response = await fetch(url);
      const status = response.status;
      
      let statusIcon = '❓';
      let statusText = 'Inconnu';
      
      if (status === 200) {
        statusIcon = '✅';
        statusText = 'OK';
      } else if (status === 404) {
        statusIcon = '❌';
        statusText = 'Non trouvé';
      } else if (status === 500) {
        statusIcon = '⚠️';
        statusText = 'Erreur serveur';
      } else {
        statusIcon = '🔄';
        statusText = `Status ${status}`;
      }
      
      console.log(`${statusIcon} ${page.padEnd(25)} - ${statusText}`);
      
    } catch (error) {
      console.log(`💥 ${page.padEnd(25)} - Erreur réseau`);
    }
  }
  
  console.log('\n🔍 Test spécifique de notre token...\n');
  
  const token = 'SECURE_1758976792815_d0kq0bd';
  const specificTests = [
    {
      name: 'Page Client Portal',
      url: `${baseUrl}/client-portal/${token}`,
      expected: 200
    },
    {
      name: 'Page Signature',
      url: `${baseUrl}/secure-signature/${token}`,
      expected: 200
    },
    {
      name: 'API Finalisation',
      url: `${baseUrl}/api/client/finalize-case?token=${token}`,
      expected: 200
    }
  ];
  
  for (const test of specificTests) {
    try {
      const response = await fetch(test.url);
      const status = response.status;
      
      if (status === test.expected) {
        console.log(`✅ ${test.name.padEnd(20)} - Fonctionne (${status})`);
      } else if (status === 404) {
        console.log(`❌ ${test.name.padEnd(20)} - Page manquante (404)`);
      } else {
        console.log(`⚠️ ${test.name.padEnd(20)} - Status inattendu (${status})`);
      }
      
    } catch (error) {
      console.log(`💥 ${test.name.padEnd(20)} - Erreur: ${error.message}`);
    }
  }
  
  console.log('\n📊 DIAGNOSTIC:');
  console.log('===============');
  
  // Vérifier si c'est un problème de déploiement partiel
  try {
    const homeResponse = await fetch(`${baseUrl}/`);
    const clientResponse = await fetch(`${baseUrl}/client-portal/${token}`);
    const signatureResponse = await fetch(`${baseUrl}/secure-signature/${token}`);
    
    if (homeResponse.status === 200 && clientResponse.status === 200 && signatureResponse.status === 404) {
      console.log('🎯 PROBLÈME IDENTIFIÉ: Déploiement partiel');
      console.log('   - Site principal: ✅ Fonctionne');
      console.log('   - Page client: ✅ Fonctionne');
      console.log('   - Page signature: ❌ Manquante');
      console.log('');
      console.log('🔧 SOLUTIONS POSSIBLES:');
      console.log('   1. Attendre encore (déploiement en cours)');
      console.log('   2. Forcer un nouveau déploiement');
      console.log('   3. Vérifier les logs de déploiement');
      console.log('   4. Déployer manuellement');
    } else if (homeResponse.status !== 200) {
      console.log('⚠️ PROBLÈME: Site principal inaccessible');
      console.log('   Le déploiement semble avoir échoué complètement');
    } else {
      console.log('✅ TOUT SEMBLE FONCTIONNER');
      console.log('   Toutes les pages sont accessibles');
    }
    
  } catch (error) {
    console.log('💥 ERREUR: Impossible de diagnostiquer');
    console.log(`   ${error.message}`);
  }
  
  console.log('\n⏰ Prochain test dans 2 minutes...');
}

checkDeploymentStatus().catch(console.error);
