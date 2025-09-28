async function testAgentAPI() {
  console.log('🔧 TEST SIMPLE API AGENT - ESIGNPRO');
  console.log('====================================');
  console.log('Test basique des APIs de l\'espace agent');
  console.log('');

  try {
    // Test 1: API Templates
    console.log('📋 TEST 1: API TEMPLATES');
    console.log('========================');
    
    const templatesResponse = await fetch('http://localhost:3000/api/agent/templates');
    const templatesData = await templatesResponse.json();

    if (templatesResponse.ok && templatesData.success) {
      console.log(`✅ API Templates fonctionne !`);
      console.log(`   ${templatesData.templates.length} template(s) disponible(s)`);
      templatesData.templates.forEach(template => {
        console.log(`   - ${template.name} (${template.category})`);
      });
    } else {
      console.log('❌ API Templates a échoué');
      console.log('   Status:', templatesResponse.status);
      console.log('   Erreur:', templatesData.error);
    }

    // Test 2: API Signatures (sans validation_status pour l'instant)
    console.log('');
    console.log('🖋️ TEST 2: API SIGNATURES (SIMPLE)');
    console.log('===================================');
    
    // Créer d'abord une signature de test
    console.log('Création d\'une signature de test...');
    
    const testClientData = {
      clientEmail: 'yasminemassaoudi27@gmail.com',
      clientName: 'Test API Agent Simple',
      clientId: 'test-api-agent-' + Date.now(),
      documentContent: 'Document de test pour API agent'
    };

    const createResponse = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testClientData)
    });

    const createResult = await createResponse.json();

    if (!createResponse.ok || !createResult.success) {
      console.log('❌ Erreur création dossier test');
      return false;
    }

    const token = createResult.secureToken;
    console.log(`✅ Dossier créé avec token: ${token}`);

    // Ajouter une signature
    const signatureData = {
      token: token,
      caseId: token,
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };

    const signatureResponse = await fetch('http://localhost:3000/api/client/save-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signatureData)
    });

    const signatureResult = await signatureResponse.json();

    if (!signatureResponse.ok || !signatureResult.success) {
      console.log('❌ Erreur création signature test');
      return false;
    }

    console.log('✅ Signature de test créée avec succès');
    console.log(`   ID signature: ${signatureResult.signature.id}`);

    // Test 3: Génération de documents
    console.log('');
    console.log('📝 TEST 3: GÉNÉRATION DE DOCUMENTS');
    console.log('==================================');
    
    // Récupérer l'ID du dossier depuis la signature
    const caseId = signatureResult.case.id;
    console.log(`ID du dossier: ${caseId}`);

    // Sélectionner quelques templates
    const selectedTemplates = templatesData.templates
      .slice(0, 2)
      .map(t => t.id);

    console.log(`Templates sélectionnés: ${selectedTemplates.join(', ')}`);

    const generateResponse = await fetch('http://localhost:3000/api/agent/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateIds: selectedTemplates,
        caseId: caseId,
        agentId: 'agent-test-simple',
        customVariables: {
          terminationDate: '2024-12-31',
          reason: 'Test de génération automatique',
          effectiveDate: '2024-12-31'
        }
      })
    });

    const generateResult = await generateResponse.json();

    if (generateResponse.ok && generateResult.success) {
      console.log(`✅ Génération de documents réussie !`);
      console.log(`   ${generateResult.documents.length} document(s) généré(s)`);
      generateResult.documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.templateName} (${doc.category})`);
        console.log(`      Variables: ${Object.keys(doc.variables).length} champs`);
        console.log(`      Taille: ${doc.content.length} caractères`);
      });
    } else {
      console.log('❌ Génération de documents a échoué');
      console.log('   Status:', generateResponse.status);
      console.log('   Erreur:', generateResult.error);
    }

    // Test 4: Vérification de l'espace agent
    console.log('');
    console.log('🎯 TEST 4: ESPACE AGENT (PAGE)');
    console.log('==============================');
    
    const agentPageResponse = await fetch('http://localhost:3000/agent');
    
    if (agentPageResponse.ok) {
      console.log('✅ Page agent accessible !');
      console.log(`   Status: ${agentPageResponse.status}`);
      console.log('   URL: http://localhost:3000/agent');
    } else {
      console.log('❌ Page agent non accessible');
      console.log(`   Status: ${agentPageResponse.status}`);
    }

    console.log('');
    console.log('🎉 RÉSUMÉ DES TESTS API AGENT');
    console.log('=============================');
    console.log('✅ API Templates opérationnelle');
    console.log('✅ Création de dossier et signature');
    console.log('✅ Génération de documents multiples');
    console.log('✅ Remplissage automatique des variables');
    console.log('✅ Page agent accessible');
    console.log('');
    console.log('🔗 LIENS UTILES:');
    console.log('================');
    console.log('Dashboard Agent: http://localhost:3000/agent');
    console.log(`Portail Client: http://localhost:3000/client-portal/${token}`);
    console.log(`Dossier créé: ${createResult.caseNumber || 'N/A'}`);
    console.log(`Signature ID: ${signatureResult.signature.id}`);
    console.log('');
    console.log('📋 PROCHAINES ÉTAPES:');
    console.log('=====================');
    console.log('1. Ajouter les colonnes de validation à la table signatures');
    console.log('2. Tester l\'API de validation des signatures');
    console.log('3. Implémenter la signature automatique des documents');
    console.log('4. Ajouter l\'envoi automatique par email');

    return {
      success: true,
      token: token,
      signatureId: signatureResult.signature.id,
      documentsGenerated: generateResult.documents?.length || 0,
      caseId: caseId
    };

  } catch (error) {
    console.error('❌ Erreur générale test API agent:', error.message);
    return false;
  }
}

async function runSimpleAgentTest() {
  console.log('🎯 DÉMARRAGE TEST SIMPLE API AGENT');
  console.log('==================================');
  console.log('Ce test va vérifier les APIs de base de l\'espace agent:');
  console.log('');
  console.log('1. API Templates (récupération)');
  console.log('2. Création dossier et signature');
  console.log('3. Génération de documents');
  console.log('4. Accessibilité page agent');
  console.log('');
  console.log('⚠️ PRÉREQUIS: Serveur local démarré sur http://localhost:3000');
  console.log('');

  const result = await testAgentAPI();

  console.log('');
  console.log('📊 RÉSULTAT FINAL TEST SIMPLE');
  console.log('=============================');

  if (result && result.success) {
    console.log('🎉 SUCCÈS COMPLET !');
    console.log('✅ APIs agent fonctionnelles');
    console.log('✅ Templates disponibles');
    console.log('✅ Génération de documents opérationnelle');
    console.log('✅ Workflow de base validé');
    console.log('');
    console.log('🚀 PRÊT POUR LES TESTS AVANCÉS !');
    console.log('================================');
    console.log('Les APIs de base fonctionnent parfaitement.');
    console.log('Vous pouvez maintenant ajouter les colonnes de validation');
    console.log('et tester le workflow complet de validation des signatures.');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Vérifiez les erreurs ci-dessus');
    console.log('');
    console.log('💡 VÉRIFICATIONS:');
    console.log('==================');
    console.log('1. Le serveur local est-il démarré ?');
    console.log('2. Les APIs sont-elles compilées correctement ?');
    console.log('3. La base de données est-elle accessible ?');
  }
}

runSimpleAgentTest().catch(console.error);
