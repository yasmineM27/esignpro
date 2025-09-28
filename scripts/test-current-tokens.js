async function testCurrentTokens() {
  console.log('🧪 TEST DES TOKENS ACTUELS');
  console.log('==========================');
  
  const tokens = [
    'SECURE_1759057397_ltj3g0m50ed',
    'e92911e5-ab9a-4d4d-a17b-aba2900d179a', 
    'SECURE_1759057344_b4ha18w8p3b'
  ];
  
  console.log('📋 TOKENS À TESTER:');
  tokens.forEach((token, i) => {
    console.log(`${i + 1}. ${token}`);
  });
  console.log('');
  
  for (const token of tokens) {
    const url = `https://esignpro.ch/client-portal/${token}`;
    console.log(`🔗 Test: ${url}`);
    
    try {
      const response = await fetch(url);
      const status = response.status;
      
      if (status === 200) {
        console.log(`   ✅ FONCTIONNE (${status})`);
      } else if (status === 404) {
        console.log(`   ❌ 404 - Page non trouvée`);
      } else {
        console.log(`   ⚠️ Status: ${status}`);
      }
    } catch (error) {
      console.log(`   💥 Erreur: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🎯 RÉSUMÉ:');
  console.log('==========');
  console.log('Si tous sont en 404, le problème est le déploiement.');
  console.log('Si certains fonctionnent, le problème est la génération de tokens.');
}

testCurrentTokens().catch(console.error);
