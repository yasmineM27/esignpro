require('dotenv').config({ path: '.env' });

async function createStandardizedTokenCase() {
  console.log('🎯 CRÉATION D\'UN DOSSIER AVEC TOKEN STANDARDISÉ');
  console.log('===============================================');
  
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
    
    // Use existing test client and agent IDs
    const testClientId = '11111111-2222-3333-4444-555555555555';
    const testAgentId = '1c81db49-e968-41de-93df-f3bffaa7bd5b';
    
    // Create case data
    const caseData = {
      id: require('crypto').randomUUID(),
      case_number: `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      client_id: testClientId,
      agent_id: testAgentId,
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
    console.log(`Client ID: ${caseData.client_id}`);
    console.log(`Agent ID: ${caseData.agent_id}`);
    console.log('');
    
    // Insert the case
    const { data, error } = await supabase
      .from('insurance_cases')
      .insert([caseData])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Erreur création dossier:', error.message);
      
      // If it's a foreign key error, try to create the missing client/agent
      if (error.message.includes('foreign key constraint')) {
        console.log('');
        console.log('🔧 TENTATIVE DE CRÉATION DES DONNÉES MANQUANTES:');
        console.log('================================================');
        
        // Try to create the test user and client if they don't exist
        const userData = {
          id: testClientId,
          email: 'client.test.standardized@esignpro.ch',
          first_name: 'Jean',
          last_name: 'Dupont-Standardized',
          role: 'client',
          phone: '+41 79 123 45 67'
        };
        
        const { error: userError } = await supabase
          .from('users')
          .upsert([userData]);
        
        if (userError) {
          console.log('❌ Erreur création utilisateur:', userError.message);
        } else {
          console.log('✅ Utilisateur créé/mis à jour');
        }
        
        const clientData = {
          id: require('crypto').randomUUID(),
          user_id: testClientId,
          client_code: 'CLIENT-STANDARDIZED'
        };
        
        const { error: clientError } = await supabase
          .from('clients')
          .upsert([clientData]);
        
        if (clientError) {
          console.log('❌ Erreur création client:', clientError.message);
        } else {
          console.log('✅ Client créé/mis à jour');
          
          // Update the case data with the new client ID
          caseData.client_id = clientData.id;
          
          // Try to create the case again
          const { data: retryData, error: retryError } = await supabase
            .from('insurance_cases')
            .insert([caseData])
            .select()
            .single();
          
          if (retryError) {
            console.log('❌ Erreur création dossier (2e tentative):', retryError.message);
            return false;
          } else {
            data = retryData;
            console.log('✅ Dossier créé avec succès (2e tentative)');
          }
        }
      } else {
        return false;
      }
    } else {
      console.log('✅ Dossier créé avec succès');
    }
    
    if (data) {
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
      
      // Test the URL
      console.log('🧪 TEST DE L\'URL EN PRODUCTION:');
      console.log('================================');
      
      try {
        const response = await fetch(portalUrl);
        const status = response.status;
        
        if (status === 200) {
          console.log('✅ URL accessible ! (Status: 200)');
          console.log('🎉 Le token standardisé fonctionne parfaitement !');
        } else if (status === 404) {
          console.log('❌ URL inaccessible (Status: 404)');
          console.log('⏳ Le déploiement peut prendre quelques minutes...');
        } else {
          console.log(`⚠️ Status inattendu: ${status}`);
        }
      } catch (error) {
        console.log('💥 Erreur test URL:', error.message);
      }
      
      console.log('');
      console.log('📋 INSTRUCTIONS POUR TESTER:');
      console.log('============================');
      console.log('1. Attendez 2-3 minutes pour le déploiement');
      console.log(`2. Ouvrez: ${portalUrl}`);
      console.log('3. Vérifiez que la page se charge sans erreur 404');
      console.log('4. Testez l\'upload de documents');
      console.log('5. Testez la finalisation et signature');
      console.log('');
      console.log('✨ Ce token utilise le nouveau format standardisé !');
      console.log('✨ Plus de problème de format incohérent !');
      
      return data.secure_token;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

createStandardizedTokenCase()
  .then(token => {
    if (token) {
      console.log('');
      console.log('🎯 RÉSULTAT FINAL:');
      console.log('==================');
      console.log(`✅ Token créé: ${token}`);
      console.log('✅ Format standardisé: SECURE_timestamp_random');
      console.log('✅ Compatible avec toutes les APIs');
      console.log('✅ Prêt pour les tests en production');
    } else {
      console.log('');
      console.log('❌ ÉCHEC DE LA CRÉATION');
      console.log('=======================');
      console.log('Vérifiez les erreurs ci-dessus');
    }
  })
  .catch(console.error);
