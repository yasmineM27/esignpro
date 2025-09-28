async function testProduction() {
  console.log('🌐 TEST DE PRODUCTION');
  console.log('====================');
  
  const token = 'SECURE_1758976792815_d0kq0bd';
  const baseUrl = 'https://esignpro.ch';
  
  const urls = [
    `${baseUrl}/client-portal/${token}`,
    `${baseUrl}/secure-signature/${token}`,
    `${baseUrl}/api/client/finalize-case?token=${token}`
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n🔍 Test: ${url}`);
      const response = await fetch(url);
      const status = response.status;
      
      if (status === 200) {
        console.log(`✅ Status: ${status} - OK`);
      } else if (status === 404) {
        console.log(`❌ Status: ${status} - PAGE NON TROUVÉE`);
        console.log('   → Le déploiement n\'est pas encore fait');
      } else {
        console.log(`⚠️ Status: ${status} - Autre erreur`);
      }
      
      // Pour l'API, essayons de lire la réponse
      if (url.includes('/api/')) {
        try {
          const data = await response.json();
          console.log('   Réponse API:', data.success ? '✅ Success' : '❌ Error');
        } catch (e) {
          console.log('   Réponse API: Non-JSON');
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}`);
    }
  }
  
  console.log('\n📋 RÉSUMÉ:');
  console.log('- Si toutes les URLs retournent 404: Le déploiement n\'est pas fait');
  console.log('- Si les URLs retournent 200: La production fonctionne !');
  console.log('- Si mélange: Déploiement partiel ou en cours');
  console.log('\n🚀 SOLUTION: Déployez votre code vers la production !');
}

testProduction().catch(console.error);
