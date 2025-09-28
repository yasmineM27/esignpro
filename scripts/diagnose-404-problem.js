require('dotenv').config({ path: '.env' });

async function diagnose404Problem() {
  console.log('🔍 DIAGNOSTIC COMPLET DU PROBLÈME 404');
  console.log('====================================');
  
  const testTokens = [
    'SECURE_1758976792815_d0kq0bd', // Token qui fonctionnait avant
    'SECURE_1758986024_m6a76qfpfvo', // Token créé récemment
  ];
  
  console.log('📋 TOKENS À TESTER:');
  console.log('===================');
  testTokens.forEach((token, i) => {
    console.log(`${i + 1}. ${token}`);
  });
  console.log('');
  
  // Test 1: Vérifier si les tokens existent en base
  console.log('🗄️ TEST 1: VÉRIFICATION BASE DE DONNÉES');
  console.log('=======================================');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables Supabase manquantes');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    for (const token of testTokens) {
      console.log(`🔍 Vérification token: ${token}`);
      
      const { data, error } = await supabase
        .from('insurance_cases')
        .select('id, case_number, secure_token, status, client_id')
        .eq('secure_token', token)
        .single();
      
      if (error) {
        console.log(`   ❌ Token non trouvé en base: ${error.message}`);
      } else {
        console.log(`   ✅ Token trouvé en base:`);
        console.log(`      ID: ${data.id}`);
        console.log(`      Numéro: ${data.case_number}`);
        console.log(`      Statut: ${data.status}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.log('❌ Erreur accès base de données:', error.message);
  }
  
  // Test 2: Tester les URLs en production
  console.log('🌐 TEST 2: VÉRIFICATION URLs PRODUCTION');
  console.log('======================================');
  
  for (const token of testTokens) {
    const url = `https://esignpro.ch/client-portal/${token}`;
    console.log(`🔗 Test URL: ${url}`);
    
    try {
      const response = await fetch(url);
      const status = response.status;
      
      console.log(`   Status: ${status}`);
      
      if (status === 200) {
        console.log(`   ✅ URL accessible`);
      } else if (status === 404) {
        console.log(`   ❌ URL inaccessible (404)`);
      } else {
        console.log(`   ⚠️ Status inattendu: ${status}`);
      }
      
    } catch (error) {
      console.log(`   💥 Erreur réseau: ${error.message}`);
    }
    console.log('');
  }
  
  // Test 3: Vérifier la structure des fichiers
  console.log('📁 TEST 3: VÉRIFICATION STRUCTURE FICHIERS');
  console.log('==========================================');
  
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'app/client-portal/[clientId]/page.tsx',
    'components/client-portal-upload.tsx',
    'app/api/client/finalize-case/route.ts',
    'app/api/client/save-signature/route.ts'
  ];
  
  criticalFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file} - Existe`);
    } else {
      console.log(`❌ ${file} - MANQUANT`);
    }
  });
  console.log('');
  
  // Test 4: Créer un nouveau token et le tester immédiatement
  console.log('🆕 TEST 4: CRÉATION ET TEST NOUVEAU TOKEN');
  console.log('=========================================');
  
  try {
    const { generateSecureToken } = require('./test-token-helper.js');
    const newToken = generateSecureToken();
    console.log(`🔑 Nouveau token: ${newToken}`);
    
    // Créer le dossier en base
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Trouver un client existant
    const { data: clients } = await supabase
      .from('clients')
      .select('id, user_id')
      .limit(1);
    
    if (!clients || clients.length === 0) {
      console.log('❌ Aucun client trouvé pour le test');
      return false;
    }
    
    // Trouver un agent existant
    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .limit(1);
    
    if (!agents || agents.length === 0) {
      console.log('❌ Aucun agent trouvé pour le test');
      return false;
    }
    
    const testCase = {
      id: require('crypto').randomUUID(),
      case_number: `TEST-${Date.now()}`,
      client_id: clients[0].id,
      agent_id: agents[0].id,
      secure_token: newToken,
      status: 'email_sent',
      insurance_company: 'Test Insurance',
      policy_number: `POL-${Date.now()}`,
      policy_type: 'Test Policy',
      termination_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason_for_termination: 'Test diagnostic',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: newCase, error: caseError } = await supabase
      .from('insurance_cases')
      .insert([testCase])
      .select()
      .single();
    
    if (caseError) {
      console.log('❌ Erreur création dossier test:', caseError.message);
    } else {
      console.log('✅ Dossier test créé en base');
      
      // Attendre un peu pour le déploiement
      console.log('⏳ Attente 30 secondes pour déploiement...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Tester l'URL
      const testUrl = `https://esignpro.ch/client-portal/${newToken}`;
      console.log(`🔗 Test URL: ${testUrl}`);
      
      try {
        const response = await fetch(testUrl);
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          console.log('   ✅ NOUVEAU TOKEN FONCTIONNE !');
          console.log('');
          console.log('🎉 SOLUTION TROUVÉE !');
          console.log('=====================');
          console.log('✅ Le système de tokens fonctionne');
          console.log('✅ Le problème était temporaire');
          console.log(`✅ URL fonctionnelle: ${testUrl}`);
          
        } else if (response.status === 404) {
          console.log('   ❌ NOUVEAU TOKEN AUSSI EN 404');
          console.log('');
          console.log('🚨 PROBLÈME PERSISTANT IDENTIFIÉ !');
          console.log('==================================');
          console.log('❌ Le déploiement ne fonctionne pas correctement');
          console.log('❌ Les nouvelles pages ne sont pas déployées');
          console.log('');
          console.log('🔧 ACTIONS REQUISES:');
          console.log('====================');
          console.log('1. Vérifier les logs de déploiement');
          console.log('2. Forcer un redéploiement complet');
          console.log('3. Vérifier la configuration Vercel/Netlify');
          
        } else {
          console.log(`   ⚠️ Status inattendu: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`   💥 Erreur test: ${error.message}`);
      }
      
      // Nettoyer le dossier test
      await supabase
        .from('insurance_cases')
        .delete()
        .eq('id', newCase.id);
      
      console.log('🧹 Dossier test supprimé');
    }
    
  } catch (error) {
    console.log('❌ Erreur test nouveau token:', error.message);
  }
  
  console.log('');
  console.log('📊 RÉSUMÉ DU DIAGNOSTIC');
  console.log('=======================');
  console.log('Si tous les tokens sont en 404, le problème est le déploiement.');
  console.log('Si certains tokens fonctionnent, le problème est la génération.');
  console.log('Si la base de données est OK mais les URLs en 404, c\'est le serveur.');
}

diagnose404Problem().catch(console.error);
