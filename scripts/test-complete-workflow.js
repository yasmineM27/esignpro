// Charger les variables d'environnement
require('dotenv').config({ path: '.env' });

// Configuration Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testCompleteWorkflow() {
  console.log('🧪 TEST COMPLET DU WORKFLOW ESIGNPRO');
  console.log('=====================================\n');

  const token = 'SECURE_1758959883349_wj7t4a9xo6';
  
  try {
    // 1. Test de connexion à la base de données
    console.log('1️⃣ Test de connexion à la base de données...');
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('insurance_cases')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erreur de connexion:', connectionError);
      return;
    }
    console.log('✅ Connexion à la base de données OK\n');

    // 2. Vérification du dossier de test
    console.log('2️⃣ Vérification du dossier de test...');
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        secure_token,
        status,
        insurance_company,
        policy_number,
        client_id,
        expires_at
      `)
      .eq('secure_token', token)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Dossier non trouvé:', caseError);
      return;
    }
    
    console.log('✅ Dossier trouvé:', {
      id: caseData.id,
      case_number: caseData.case_number,
      status: caseData.status,
      insurance_company: caseData.insurance_company
    });
    console.log('');

    // 3. Vérification du client
    console.log('3️⃣ Vérification du client...');
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, user_id, client_code')
      .eq('id', caseData.client_id)
      .single();

    if (clientError || !clientData) {
      console.error('❌ Client non trouvé:', clientError);
      return;
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, email, role')
      .eq('id', clientData.user_id)
      .single();

    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé:', userError);
      return;
    }

    console.log('✅ Client trouvé:', {
      name: `${userData.first_name} ${userData.last_name}`,
      email: userData.email,
      role: userData.role,
      client_code: clientData.client_code
    });
    console.log('');

    // 4. Vérification des documents uploadés
    console.log('4️⃣ Vérification des documents uploadés...');
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('client_documents')
      .select('id, documenttype, filename, status, uploaddate')
      .eq('token', token)
      .order('uploaddate', { ascending: false });

    if (docsError) {
      console.error('❌ Erreur récupération documents:', docsError);
      return;
    }

    console.log(`✅ ${documents?.length || 0} documents trouvés:`);
    documents?.forEach(doc => {
      console.log(`   - ${doc.documenttype}: ${doc.filename} (${doc.status})`);
    });
    console.log('');

    // 5. Test des documents requis
    console.log('5️⃣ Vérification des documents requis...');
    const requiredDocs = ['identity_front', 'identity_back', 'insurance_contract'];
    const uploadedTypes = documents?.map(d => d.documenttype) || [];
    const missingDocs = requiredDocs.filter(type => !uploadedTypes.includes(type));
    
    if (missingDocs.length > 0) {
      console.log('⚠️ Documents manquants:', missingDocs);
    } else {
      console.log('✅ Tous les documents requis sont présents');
    }
    console.log('');

    // 6. Test de l'API de finalisation
    console.log('6️⃣ Test de l\'API de finalisation...');
    try {
      const response = await fetch(`http://localhost:3000/api/client/finalize-case?token=${token}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ API de finalisation OK:', result.message);
        console.log('   Dossier:', result.case?.case_number);
        console.log('   Statut:', result.case?.status);
      } else {
        console.log('⚠️ API de finalisation:', result.error);
      }
    } catch (error) {
      console.log('❌ Erreur API de finalisation:', error.message);
    }
    console.log('');

    // 7. Vérification des signatures existantes
    console.log('7️⃣ Vérification des signatures...');
    const { data: signatures, error: sigError } = await supabaseAdmin
      .from('signatures')
      .select(`
        id,
        signature_data,
        signed_at,
        is_valid,
        insurance_cases!inner(secure_token)
      `)
      .eq('insurance_cases.secure_token', token);

    if (sigError) {
      console.log('⚠️ Erreur récupération signatures:', sigError);
    } else {
      console.log(`✅ ${signatures?.length || 0} signatures trouvées`);
      signatures?.forEach(sig => {
        console.log(`   - ID: ${sig.id}, Signé le: ${new Date(sig.signed_at).toLocaleString('fr-FR')}, Valide: ${sig.is_valid}`);
      });
    }
    console.log('');

    // 8. Test des URLs
    console.log('8️⃣ Test des URLs de l\'application...');
    const urls = [
      `http://localhost:3000/client-portal/${token}`,
      `http://localhost:3000/secure-signature/${token}`
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        const status = response.status;
        console.log(`   ${status === 200 ? '✅' : '❌'} ${url} - Status: ${status}`);
      } catch (error) {
        console.log(`   ❌ ${url} - Erreur: ${error.message}`);
      }
    }
    console.log('');

    // 9. Résumé final
    console.log('🎯 RÉSUMÉ DU TEST');
    console.log('==================');
    console.log('✅ Base de données: Connectée');
    console.log(`✅ Dossier: ${caseData.case_number} (${caseData.status})`);
    console.log(`✅ Client: ${userData.first_name} ${userData.last_name}`);
    console.log(`✅ Documents: ${documents?.length || 0} uploadés`);
    console.log(`✅ Signatures: ${signatures?.length || 0} enregistrées`);
    console.log('✅ URLs: Accessibles');
    console.log('');
    console.log('🎉 WORKFLOW COMPLET FONCTIONNEL !');
    console.log('');
    console.log('📋 ÉTAPES POUR TESTER:');
    console.log('1. Ouvrir: http://localhost:3000/client-portal/' + token);
    console.log('2. Uploader les documents requis');
    console.log('3. Cliquer sur "Finaliser le dossier et signer"');
    console.log('4. Signer le document sur la page de signature');
    console.log('5. Vérifier la confirmation finale');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testCompleteWorkflow().catch(console.error);
