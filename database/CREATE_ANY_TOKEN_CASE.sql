-- 🧪 CRÉATION D'UN DOSSIER POUR N'IMPORTE QUEL TOKEN
-- ⚠️ REMPLACEZ 'YOUR_TOKEN_HERE' par votre token réel avant d'exécuter
-- À exécuter APRÈS le script de réinitialisation de la base de données

-- ============================================================================
-- CONFIGURATION : REMPLACEZ CE TOKEN PAR LE VÔTRE
-- ============================================================================

-- 🔧 CHANGEZ CETTE LIGNE AVEC VOTRE TOKEN RÉEL :
-- Exemple : SECURE_1758959883349_wj7t4a9xo6
\set token_value 'SECURE_1758959883349_wj7t4a9xo6'

-- OU utilisez cette version avec remplacement manuel :
-- Remplacez toutes les occurrences de 'YOUR_TOKEN_HERE' par votre token

-- ============================================================================
-- CRÉATION DU DOSSIER UNIVERSEL
-- ============================================================================

-- 1. Créer un utilisateur client de test
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone
) VALUES (
    gen_random_uuid(),
    'client.test@esignpro.ch',
    'Jean',
    'Dupont',
    'client',
    '+41 79 123 45 67'
) ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW()
RETURNING id as user_id;

-- 2. Récupérer l'ID de l'utilisateur créé
DO $$
DECLARE
    test_user_id UUID;
    test_client_id UUID;
    test_agent_id UUID;
    test_case_id UUID;
    target_token TEXT := 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ ICI VOTRE TOKEN
BEGIN
    -- Récupérer l'utilisateur client
    SELECT id INTO test_user_id FROM public.users WHERE email = 'client.test@esignpro.ch';
    
    -- Créer le profil client
    INSERT INTO public.clients (
        id,
        user_id,
        client_code,
        date_of_birth,
        address,
        city,
        postal_code,
        country
    ) VALUES (
        gen_random_uuid(),
        test_user_id,
        'CLIENT001',
        '1985-06-15',
        'Rue de la Paix 123',
        'Genève',
        '1200',
        'Suisse'
    ) ON CONFLICT (user_id) DO UPDATE SET
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        updated_at = NOW()
    RETURNING id INTO test_client_id;
    
    -- Si le client existe déjà, récupérer son ID
    IF test_client_id IS NULL THEN
        SELECT id INTO test_client_id FROM public.clients WHERE user_id = test_user_id;
    END IF;
    
    -- Récupérer l'agent admin existant
    SELECT id INTO test_agent_id FROM public.agents WHERE agent_code = 'ADMIN001';
    
    -- Créer le dossier d'assurance avec le token fourni
    INSERT INTO public.insurance_cases (
        id,
        case_number,
        client_id,
        agent_id,
        secure_token,
        status,
        insurance_company,
        policy_number,
        policy_type,
        termination_date,
        reason_for_termination,
        expires_at
    ) VALUES (
        gen_random_uuid(),
        'RES-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0'),
        test_client_id,
        test_agent_id,
        target_token,
        'email_sent',
        'Allianz Suisse',
        'POL-2024-' || SUBSTRING(target_token FROM 8 FOR 6),
        'Assurance Auto',
        NOW() + INTERVAL '30 days',
        'Changement de compagnie d''assurance',
        NOW() + INTERVAL '30 days'
    ) ON CONFLICT (secure_token) DO UPDATE SET
        status = EXCLUDED.status,
        insurance_company = EXCLUDED.insurance_company,
        updated_at = NOW()
    RETURNING id INTO test_case_id;
    
    -- Créer quelques documents de test
    INSERT INTO public.client_documents (
        clientid,
        token,
        documenttype,
        filename,
        filepath,
        filesize,
        mimetype,
        status
    ) VALUES 
    (
        target_token,
        target_token,
        'identity_front',
        'cin_recto_test.jpg',
        '/uploads/clients/' || target_token || '/identity_front/cin_recto_test.jpg',
        1024000,
        'image/jpeg',
        'uploaded'
    ),
    (
        target_token,
        target_token,
        'identity_back',
        'cin_verso_test.jpg',
        '/uploads/clients/' || target_token || '/identity_back/cin_verso_test.jpg',
        1024000,
        'image/jpeg',
        'uploaded'
    ),
    (
        target_token,
        target_token,
        'insurance_contract',
        'contrat_assurance_test.pdf',
        '/uploads/clients/' || target_token || '/insurance_contract/contrat_assurance_test.pdf',
        2048000,
        'application/pdf',
        'uploaded'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Créer un log d'email pour ce dossier
    INSERT INTO public.email_logs (
        case_id,
        recipient_email,
        sender_email,
        subject,
        body_html,
        email_type,
        status,
        sent_at
    ) VALUES (
        test_case_id,
        'client.test@esignpro.ch',
        'noreply@esignpro.ch',
        'Finalisation de votre dossier - Action requise',
        '<html><body><h2>Bonjour Jean Dupont,</h2><p>Votre dossier de résiliation est prêt.</p><p><a href="https://esignpro.ch/client-portal/' || target_token || '">Finaliser mon dossier</a></p></body></html>',
        'client_invitation',
        'sent',
        NOW() - INTERVAL '1 hour'
    );
    
    RAISE NOTICE '✅ Dossier créé avec succès pour le token: %', target_token;
    RAISE NOTICE '🆔 Case ID: %', test_case_id;
    RAISE NOTICE '👤 Client ID: %', test_client_id;
    RAISE NOTICE '🌐 URL: https://esignpro.ch/client-portal/%', target_token;
    
END $$;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES CRÉÉES
-- ============================================================================

-- Vérifier que le dossier a été créé correctement
SELECT 
    '🔍 VÉRIFICATION DU DOSSIER' as title,
    ic.case_number,
    ic.secure_token,
    ic.status,
    ic.insurance_company,
    u.first_name || ' ' || u.last_name as client_name,
    u.email as client_email
FROM public.insurance_cases ic
LEFT JOIN public.clients c ON ic.client_id = c.id
LEFT JOIN public.users u ON c.user_id = u.id
WHERE ic.secure_token = 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ ICI AUSSI

-- Vérifier les documents associés
SELECT 
    '📁 DOCUMENTS ASSOCIÉS' as title,
    cd.documenttype,
    cd.filename,
    cd.filesize,
    cd.mimetype,
    cd.status,
    cd.uploaddate
FROM public.client_documents cd
WHERE cd.token = 'SECURE_1758959883349_wj7t4a9xo6' -- 🔧 CHANGEZ ICI AUSSI
ORDER BY cd.uploaddate DESC;

-- Vérifier les emails envoyés
SELECT 
    '📧 EMAILS ENVOYÉS' as title,
    el.recipient_email,
    el.subject,
    el.email_type,
    el.status,
    el.sent_at
FROM public.email_logs el
JOIN public.insurance_cases ic ON el.case_id = ic.id
WHERE ic.secure_token = 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ ICI AUSSI

-- Message de confirmation
DO $$
DECLARE
    target_token TEXT := 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ ICI AUSSI
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 DOSSIER CRÉÉ AVEC SUCCÈS POUR LE TOKEN: %', target_token;
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 DÉTAILS DU DOSSIER :';
    RAISE NOTICE '   🆔 Token: %', target_token;
    RAISE NOTICE '   👤 Client: Jean Dupont (client.test@esignpro.ch)';
    RAISE NOTICE '   🏢 Assurance: Allianz Suisse';
    RAISE NOTICE '   📁 Documents: 3 documents de test créés';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 PAGES À TESTER :';
    RAISE NOTICE '   • https://esignpro.ch/client-portal/%', target_token;
    RAISE NOTICE '   • http://localhost:3000/client-portal/%', target_token;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Le dossier est maintenant prêt pour les tests !';
    RAISE NOTICE '';
END $$;
