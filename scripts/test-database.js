// Script de test pour vérifier la connexion à la base de données
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Test de connexion à la base de données...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Configurée' : 'Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    console.log('\n📊 Test 1: Vérification des tables...');
    
    // Test de connexion basique - test direct sur une table
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Erreur connexion:', tablesError);
      return;
    }

    console.log('✅ Connexion réussie !');
    console.log('Test de base réussi, table users accessible');

    console.log('\n👤 Test 2: Vérification des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(3);

    if (usersError) {
      console.error('❌ Erreur utilisateurs:', usersError);
    } else {
      console.log('✅ Utilisateurs trouvés:', users?.length || 0);
      users?.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
      });
    }

    console.log('\n📄 Test 3: Vérification des dossiers...');
    const { data: cases, error: casesError } = await supabase
      .from('insurance_cases')
      .select('id, case_number, secure_token, status')
      .limit(3);

    if (casesError) {
      console.error('❌ Erreur dossiers:', casesError);
    } else {
      console.log('✅ Dossiers trouvés:', cases?.length || 0);
      cases?.forEach(case_ => {
        console.log(`  - ${case_.case_number} (${case_.secure_token}) - ${case_.status}`);
      });
    }

    console.log('\n📁 Test 4: Vérification du token spécifique...');
    const testToken = 'SECURE_1758959883349_wj7t4a9xo6';
    const { data: specificCase, error: specificError } = await supabase
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        secure_token,
        status,
        insurance_company,
        clients!inner(
          users!inner(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('secure_token', testToken)
      .single();

    if (specificError) {
      console.error('❌ Erreur token spécifique:', specificError);
    } else {
      console.log('✅ Dossier trouvé pour le token:', testToken);
      console.log(`  - Numéro: ${specificCase.case_number}`);
      console.log(`  - Statut: ${specificCase.status}`);
      console.log(`  - Client: ${specificCase.clients.users.first_name} ${specificCase.clients.users.last_name}`);
      console.log(`  - Email: ${specificCase.clients.users.email}`);
    }

    console.log('\n📎 Test 5: Vérification des documents...');
    const { data: documents, error: docsError } = await supabase
      .from('client_documents')
      .select('id, clientid, documenttype, filename, status')
      .eq('token', testToken);

    if (docsError) {
      console.error('❌ Erreur documents:', docsError);
    } else {
      console.log('✅ Documents trouvés:', documents?.length || 0);
      documents?.forEach(doc => {
        console.log(`  - ${doc.filename} (${doc.documenttype}) - ${doc.status}`);
      });
    }

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n🌐 URLs à tester:');
    console.log(`  - Local: http://localhost:3001/client-portal/${testToken}`);
    console.log(`  - Production: https://esignpro.ch/client-portal/${testToken}`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testDatabase();
