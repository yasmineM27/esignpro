require('dotenv').config({ path: '.env.local' });

async function diagnoseProductionIssues() {
  console.log('🔍 DIAGNOSTIC PRODUCTION - eSignPro');
  console.log('=====================================');

  // Check environment variables
  console.log('📋 VÉRIFICATION VARIABLES ENVIRONNEMENT');
  console.log('========================================');

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
    'RESEND_API_KEY'
  ];

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName} - MANQUANT`);
    } else {
      console.log(`✅ ${varName} - ${value.substring(0, 20)}...`);
    }
  });

  console.log('');

  // Test database connection
  console.log('🗄️ TEST CONNEXION BASE DE DONNÉES');
  console.log('==================================');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables Supabase manquantes');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('insurance_cases')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erreur connexion base:', testError.message);
    } else {
      console.log('✅ Connexion base de données OK');
    }

    // Check schema
    console.log('🔍 VÉRIFICATION SCHÉMA');
    console.log('======================');

    // Check if email_logs has required columns
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'email_logs' });

    if (schemaError) {
      console.log('⚠️ Impossible de vérifier le schéma automatiquement');
      console.log('Vérifiez manuellement dans Supabase Dashboard');
    } else {
      const requiredColumns = ['external_id', 'delivered_at', 'error_message'];
      const existingColumns = columns?.map(c => c.column_name) || [];

      requiredColumns.forEach(col => {
        if (existingColumns.includes(col)) {
          console.log(`✅ Colonne ${col} existe`);
        } else {
          console.log(`❌ Colonne ${col} MANQUANTE`);
        }
      });
    }

    // Test token operations
    console.log('🔑 TEST OPÉRATIONS TOKENS');
    console.log('=========================');

    // Generate a test token
    const { generateSecureToken } = require('../lib/supabase');
    const testToken = generateSecureToken();
    console.log(`🔑 Token de test généré: ${testToken}`);

    // Try to find it (should not exist)
    const { data: existingToken, error: tokenError } = await supabase
      .from('insurance_cases')
      .select('id')
      .eq('secure_token', testToken)
      .single();

    if (existingToken) {
      console.log('⚠️ Token existe déjà (collision rare)');
    } else {
      console.log('✅ Token unique (OK)');
    }

    // Test creating a test case
    console.log('🧪 CRÉATION CAS DE TEST');
    console.log('=======================');

    // Find existing client and agent
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .limit(1);

    if (!clients || clients.length === 0) {
      console.log('❌ Aucun client trouvé pour le test');
      return;
    }

    if (!agents || agents.length === 0) {
      console.log('❌ Aucun agent trouvé pour le test');
      return;
    }

    const testCase = {
      id: require('crypto').randomUUID(),
      case_number: `TEST-${Date.now()}`,
      client_id: clients[0].id,
      agent_id: agents[0].id,
      secure_token: testToken,
      status: 'pending_documents',
      insurance_company: 'Test Company',
      policy_number: `POL-${Date.now()}`,
      insurance_type: 'Test',
      title: 'Test Case for Production Diagnostics'
    };

    const { data: createdCase, error: createError } = await supabase
      .from('insurance_cases')
      .insert([testCase])
      .select()
      .single();

    if (createError) {
      console.log('❌ Erreur création cas de test:', createError.message);
    } else {
      console.log('✅ Cas de test créé avec succès');
      console.log(`   ID: ${createdCase.id}`);
      console.log(`   Token: ${createdCase.secure_token}`);

      // Test retrieving the case by token
      const { data: retrievedCase, error: retrieveError } = await supabase
        .from('insurance_cases')
        .select('id, case_number, secure_token')
        .eq('secure_token', testToken)
        .single();

      if (retrieveError) {
        console.log('❌ Erreur récupération par token:', retrieveError.message);
      } else {
        console.log('✅ Récupération par token réussie');
        console.log(`   Trouvé: ${retrievedCase.case_number}`);
      }

      // Clean up test case
      await supabase
        .from('insurance_cases')
        .delete()
        .eq('id', createdCase.id);

      console.log('🧹 Cas de test supprimé');
    }

  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }

  console.log('');
  console.log('📋 RÉSUMÉ DIAGNOSTIC');
  console.log('===================');
  console.log('1. Vérifiez que toutes les variables d\'environnement sont définies');
  console.log('2. Exécutez PRODUCTION_SCHEMA_FIX.sql dans Supabase si nécessaire');
  console.log('3. Vérifiez que la connexion à la base fonctionne');
  console.log('4. Testez le flux complet: création cas → envoi email → accès client');
}

diagnoseProductionIssues().catch(console.error);