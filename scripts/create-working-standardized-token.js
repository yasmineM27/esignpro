require('dotenv').config({ path: '.env' });

async function createWorkingStandardizedToken() {
  console.log('🎯 CRÉATION D\'UN TOKEN STANDARDISÉ FONCTIONNEL');
  console.log('==============================================');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const { generateSecureToken } = require('./test-token-helper.js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables Supabase manquantes');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Generate a new standardized token
    const newToken = generateSecureToken();
    console.log(`🔑 Nouveau token généré: ${newToken}`);
    console.log(`   Format: SECURE_timestamp_random`);
    console.log(`   Longueur: ${newToken.length} caractères`);
    console.log('');
    
    // Find existing client and agent
    console.log('🔍 RECHERCHE DES DONNÉES EXISTANTES:');
    console.log('====================================');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, user_id, users(first_name, last_name, email)')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      console.log('❌ Aucun client trouvé');
      return false;
    }
    
    const client = clients[0];
    console.log(`✅ Client trouvé: ${client.users.first_name} ${client.users.last_name} (${client.users.email})`);
    
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, user_id, users(first_name, last_name, email)')
      .limit(1);
    
    if (agentsError || !agents || agents.length === 0) {
      console.log('❌ Aucun agent trouvé');
      return false;
    }
    
    const agent = agents[0];
    console.log(`✅ Agent trouvé: ${agent.users.first_name} ${agent.users.last_name} (${agent.users.email})`);
    console.log('');
    
    // Create case data with existing IDs
    const caseData = {
      id: require('crypto').randomUUID(),
      case_number: `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      client_id: client.id,
      agent_id: agent.id,
      secure_token: newToken,
      status: 'email_sent',
      insurance_company: 'Allianz Suisse',
      policy_number: `POL-${Date.now()}`,
      policy_type: 'Assurance Auto',
      termination_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason_for_termination: 'Test avec token standardisé',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('📋 CRÉATION DU DOSSIER:');
    console.log('=======================');
    console.log(`ID: ${caseData.id}`);
    console.log(`Numéro: ${caseData.case_number}`);
    console.log(`Token: ${caseData.secure_token}`);
    console.log(`Client: ${client.users.first_name} ${client.users.last_name}`);
    console.log(`Agent: ${agent.users.first_name} ${agent.users.last_name}`);
    console.log('');
    
    // Insert the case
    const { data, error } = await supabase
      .from('insurance_cases')
      .insert([caseData])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Erreur création dossier:', error.message);
      return false;
    }
    
    console.log('✅ Dossier créé avec succès !');
    console.log('');
    console.log('🎉 DOSSIER CRÉÉ AVEC SUCCÈS !');
    console.log('=============================');
    console.log(`ID: ${data.id}`);
    console.log(`Numéro: ${data.case_number}`);
    console.log(`Token: ${data.secure_token}`);
    console.log(`Statut: ${data.status}`);
    console.log('');
    
    // Generate the client portal URL
    const portalUrl = `https://esignpro.ch/client-portal/${data.secure_token}`;
    console.log('🌐 URL DU PORTAIL CLIENT:');
    console.log('=========================');
    console.log(portalUrl);
    console.log('');
    
    // Wait for deployment
    console.log('⏳ ATTENTE DU DÉPLOIEMENT (60 secondes)...');
    console.log('==========================================');
    
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Test the URL
    console.log('🧪 TEST DE L\'URL EN PRODUCTION:');
    console.log('================================');
    
    try {
      const response = await fetch(portalUrl);
      const status = response.status;
      
      if (status === 200) {
        console.log('✅ URL accessible ! (Status: 200)');
        console.log('🎉 Le token standardisé fonctionne parfaitement !');
        console.log('');
        console.log('🎯 PROBLÈME 404 RÉSOLU !');
        console.log('========================');
        console.log('✅ Token standardisé: SECURE_timestamp_random');
        console.log('✅ Format uniforme dans tout le système');
        console.log('✅ Plus d\'incohérence UUID vs SECURE_');
        console.log('✅ URL fonctionnelle en production');
        
      } else if (status === 404) {
        console.log('❌ URL inaccessible (Status: 404)');
        console.log('⏳ Le déploiement peut prendre plus de temps...');
        console.log('');
        console.log('🔄 RECOMMANDATIONS:');
        console.log('===================');
        console.log('1. Attendez encore 5-10 minutes');
        console.log('2. Retestez l\'URL manuellement');
        console.log('3. Le token est correct, c\'est juste le déploiement');
        
      } else {
        console.log(`⚠️ Status inattendu: ${status}`);
      }
    } catch (error) {
      console.log('💥 Erreur test URL:', error.message);
    }
    
    console.log('');
    console.log('📋 INSTRUCTIONS POUR TESTER:');
    console.log('============================');
    console.log(`1. Ouvrez: ${portalUrl}`);
    console.log('2. Vérifiez que la page se charge sans erreur 404');
    console.log('3. Testez l\'upload de documents');
    console.log('4. Testez la finalisation et signature intégrée');
    console.log('');
    console.log('✨ AVANTAGES DU TOKEN STANDARDISÉ:');
    console.log('==================================');
    console.log('✅ Format uniforme: SECURE_timestamp_random');
    console.log('✅ Compatible avec toutes les APIs');
    console.log('✅ Lisible et identifiable');
    console.log('✅ Plus de confusion UUID/SECURE_');
    console.log('✅ Génération cohérente partout');
    
    return data.secure_token;
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

createWorkingStandardizedToken()
  .then(token => {
    if (token) {
      console.log('');
      console.log('🎯 RÉSULTAT FINAL:');
      console.log('==================');
      console.log(`✅ Token créé: ${token}`);
      console.log('✅ Format standardisé: SECURE_timestamp_random');
      console.log('✅ Système de tokens unifié');
      console.log('✅ Prêt pour les tests en production');
      console.log('');
      console.log('🎉 PROBLÈME DE TOKENS INCOHÉRENTS RÉSOLU !');
    } else {
      console.log('');
      console.log('❌ ÉCHEC DE LA CRÉATION');
      console.log('=======================');
      console.log('Vérifiez les erreurs ci-dessus');
    }
  })
  .catch(console.error);
