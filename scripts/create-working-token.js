require('dotenv').config({ path: '.env' });

async function createWorkingToken() {
  console.log('🎯 CRÉATION D\'UN TOKEN FONCTIONNEL');
  console.log('==================================');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const crypto = require('crypto');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables Supabase manquantes');
      console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Générer un token standardisé
    const timestamp = Math.floor(Date.now() / 1000);
    const randomPart = Math.random().toString(36).substring(2, 17).toLowerCase();
    const newToken = `SECURE_${timestamp}_${randomPart}`;
    
    console.log(`🔑 Token généré: ${newToken}`);
    console.log('');
    
    // Créer ou trouver un utilisateur
    console.log('👤 CRÉATION/RECHERCHE UTILISATEUR:');
    console.log('==================================');
    
    const testEmail = 'client.test.working@esignpro.ch';
    const { data: existingUser, error: userQueryError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    let userId;
    if (userQueryError || !existingUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: crypto.randomUUID(),
          email: testEmail,
          first_name: 'Jean',
          last_name: 'Dupont-Working',
          role: 'client'
        })
        .select('id')
        .single();
      
      if (userError) {
        console.log('❌ Erreur création utilisateur:', userError.message);
        return false;
      }
      userId = newUser.id;
      console.log('✅ Utilisateur créé:', userId);
    } else {
      userId = existingUser.id;
      console.log('✅ Utilisateur trouvé:', userId);
    }
    
    // Créer ou trouver un client
    console.log('');
    console.log('🏢 CRÉATION/RECHERCHE CLIENT:');
    console.log('=============================');
    
    const { data: existingClient, error: clientQueryError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let clientId;
    if (clientQueryError || !existingClient) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          country: 'CH'
        })
        .select('id')
        .single();
      
      if (clientError) {
        console.log('❌ Erreur création client:', clientError.message);
        return false;
      }
      clientId = newClient.id;
      console.log('✅ Client créé:', clientId);
    } else {
      clientId = existingClient.id;
      console.log('✅ Client trouvé:', clientId);
    }
    
    // Trouver ou créer un agent
    console.log('');
    console.log('👨‍💼 RECHERCHE/CRÉATION AGENT:');
    console.log('==============================');
    
    const { data: agents, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .limit(1);
    
    let agentId;
    if (agentError || !agents || agents.length === 0) {
      // Créer un agent par défaut
      const { data: agentUser, error: agentUserError } = await supabase
        .from('users')
        .insert({
          id: crypto.randomUUID(),
          email: 'agent.default@esignpro.ch',
          first_name: 'Support',
          last_name: 'eSignPro',
          role: 'agent'
        })
        .select('id')
        .single();
      
      if (agentUserError) {
        console.log('❌ Erreur création utilisateur agent:', agentUserError.message);
        return false;
      }
      
      const { data: newAgent, error: newAgentError } = await supabase
        .from('agents')
        .insert({
          id: crypto.randomUUID(),
          user_id: agentUser.id,
          agent_code: 'DEFAULT'
        })
        .select('id')
        .single();
      
      if (newAgentError) {
        console.log('❌ Erreur création agent:', newAgentError.message);
        return false;
      }
      
      agentId = newAgent.id;
      console.log('✅ Agent créé:', agentId);
    } else {
      agentId = agents[0].id;
      console.log('✅ Agent trouvé:', agentId);
    }
    
    // Créer le dossier d'assurance
    console.log('');
    console.log('📋 CRÉATION DOSSIER D\'ASSURANCE:');
    console.log('=================================');
    
    const caseData = {
      id: crypto.randomUUID(),
      case_number: `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      client_id: clientId,
      agent_id: agentId,
      secure_token: newToken,
      status: 'email_sent',
      insurance_company: 'Allianz Suisse',
      policy_number: `POL-${Date.now()}`,
      policy_type: 'Assurance Auto',
      termination_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason_for_termination: 'Test workflow complet',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: insuranceCase, error: caseError } = await supabase
      .from('insurance_cases')
      .insert([caseData])
      .select()
      .single();
    
    if (caseError) {
      console.log('❌ Erreur création dossier:', caseError.message);
      return false;
    }
    
    console.log('✅ Dossier créé avec succès !');
    console.log(`   ID: ${insuranceCase.id}`);
    console.log(`   Numéro: ${insuranceCase.case_number}`);
    console.log(`   Token: ${insuranceCase.secure_token}`);
    console.log(`   Statut: ${insuranceCase.status}`);
    
    // Générer l'URL du portail
    const portalUrl = `https://esignpro.ch/client-portal/${newToken}`;
    
    console.log('');
    console.log('🌐 URL DU PORTAIL CLIENT:');
    console.log('=========================');
    console.log(portalUrl);
    
    console.log('');
    console.log('🎉 TOKEN FONCTIONNEL CRÉÉ !');
    console.log('===========================');
    console.log('✅ Utilisateur créé/trouvé');
    console.log('✅ Client créé/trouvé');
    console.log('✅ Agent créé/trouvé');
    console.log('✅ Dossier d\'assurance créé');
    console.log('✅ Token sécurisé généré');
    console.log('✅ URL portail générée');
    
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('================');
    console.log('1. Attendez 2-3 minutes pour le déploiement');
    console.log(`2. Testez l'URL: ${portalUrl}`);
    console.log('3. Vérifiez que la page se charge sans 404');
    console.log('4. Testez l\'upload de documents');
    console.log('5. Testez la signature intégrée');
    
    return newToken;
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

createWorkingToken()
  .then(token => {
    if (token) {
      console.log('');
      console.log('🎯 SUCCÈS !');
      console.log('===========');
      console.log(`Token créé: ${token}`);
      console.log('Le workflow complet est maintenant prêt !');
    } else {
      console.log('');
      console.log('❌ ÉCHEC');
      console.log('=========');
      console.log('Vérifiez les erreurs ci-dessus');
    }
  })
  .catch(console.error);
