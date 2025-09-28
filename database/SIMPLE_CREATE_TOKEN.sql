-- 🧪 CRÉATION SIMPLE D'UN DOSSIER POUR VOTRE TOKEN
-- ⚠️ REMPLACEZ 'SECURE_1758959883349_wj7t4a9xo6' par votre token réel dans TOUTES les requêtes
-- Exécutez ces requêtes UNE PAR UNE dans Supabase

-- ============================================================================
-- ÉTAPE 1 : CRÉER L'UTILISATEUR CLIENT
-- ============================================================================

INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone
) VALUES (
    '11111111-2222-3333-4444-555555555555',
    'client.test@esignpro.ch',
    'Jean',
    'Dupont',
    'client',
    '+41 79 123 45 67'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- ============================================================================
-- ÉTAPE 2 : CRÉER LE PROFIL CLIENT
-- ============================================================================

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
    '22222222-3333-4444-5555-666666666666',
    '11111111-2222-3333-4444-555555555555',
    'CLIENT001',
    '1985-06-15',
    'Rue de la Paix 123',
    'Genève',
    '1200',
    'Suisse'
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    postal_code = EXCLUDED.postal_code,
    updated_at = NOW();

-- ============================================================================
-- ÉTAPE 3 : CRÉER LE DOSSIER D'ASSURANCE
-- 🔧 CHANGEZ LE TOKEN ICI : 'SECURE_1758959883349_wj7t4a9xo6'
-- ============================================================================

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
    '55555555-6666-7777-8888-999999999999',
    'RES-2024-002',
    '22222222-3333-4444-5555-666666666666',
    (SELECT id FROM public.agents WHERE agent_code = 'ADMIN001'),
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'email_sent',
    'Allianz Suisse',
    'POL-2024-123456',
    'Assurance Auto',
    '2024-12-31',
    'Changement de compagnie d''assurance',
    NOW() + INTERVAL '30 days'
) ON CONFLICT (secure_token) DO UPDATE SET
    status = EXCLUDED.status,
    insurance_company = EXCLUDED.insurance_company,
    policy_number = EXCLUDED.policy_number,
    updated_at = NOW();

-- ============================================================================
-- ÉTAPE 4 : CRÉER LES DOCUMENTS DE TEST
-- 🔧 CHANGEZ LE TOKEN ICI AUSSI : 'SECURE_1758959883349_wj7t4a9xo6'
-- ============================================================================

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
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'identity_front',
    'cin_recto_test.jpg',
    '/uploads/clients/SECURE_1758959883349_wj7t4a9xo6/identity_front/cin_recto_test.jpg', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    1024000,
    'image/jpeg',
    'uploaded'
),
(
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'identity_back',
    'cin_verso_test.jpg',
    '/uploads/clients/SECURE_1758959883349_wj7t4a9xo6/identity_back/cin_verso_test.jpg', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    1024000,
    'image/jpeg',
    'uploaded'
),
(
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'SECURE_1758959883349_wj7t4a9xo6', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'insurance_contract',
    'contrat_assurance_test.pdf',
    '/uploads/clients/SECURE_1758959883349_wj7t4a9xo6/insurance_contract/contrat_assurance_test.pdf', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    2048000,
    'application/pdf',
    'uploaded'
);

-- ============================================================================
-- ÉTAPE 5 : CRÉER LE LOG D'EMAIL
-- 🔧 CHANGEZ LE TOKEN ICI AUSSI : 'SECURE_1758959883349_wj7t4a9xo6'
-- ============================================================================

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
    '55555555-6666-7777-8888-999999999999',
    'client.test@esignpro.ch',
    'noreply@esignpro.ch',
    'Finalisation de votre dossier - Action requise',
    '<html><body><h2>Bonjour Jean Dupont,</h2><p>Votre dossier de résiliation est prêt.</p><p><a href="https://esignpro.ch/client-portal/SECURE_1758959883349_wj7t4a9xo6">Finaliser mon dossier</a></p></body></html>', -- 🔧 CHANGEZ VOTRE TOKEN ICI
    'client_invitation',
    'sent',
    NOW() - INTERVAL '1 hour'
);

-- ============================================================================
-- ÉTAPE 6 : VÉRIFICATION
-- 🔧 CHANGEZ LE TOKEN ICI POUR VÉRIFIER : 'SECURE_1758959883349_wj7t4a9xo6'
-- ============================================================================

-- Vérifier que le dossier a été créé
SELECT 
    'DOSSIER CRÉÉ' as status,
    ic.case_number,
    ic.secure_token,
    ic.status as case_status,
    ic.insurance_company,
    u.first_name || ' ' || u.last_name as client_name,
    u.email as client_email
FROM public.insurance_cases ic
LEFT JOIN public.clients c ON ic.client_id = c.id
LEFT JOIN public.users u ON c.user_id = u.id
WHERE ic.secure_token = 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ VOTRE TOKEN ICI

-- Vérifier les documents
SELECT 
    'DOCUMENTS CRÉÉS' as status,
    COUNT(*) as total_documents,
    STRING_AGG(documenttype, ', ') as document_types
FROM public.client_documents
WHERE token = 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ VOTRE TOKEN ICI

-- Vérifier l'email
SELECT 
    'EMAIL CRÉÉ' as status,
    el.recipient_email,
    el.subject,
    el.status as email_status
FROM public.email_logs el
JOIN public.insurance_cases ic ON el.case_id = ic.id
WHERE ic.secure_token = 'SECURE_1758959883349_wj7t4a9xo6'; -- 🔧 CHANGEZ VOTRE TOKEN ICI

-- Message final
SELECT '🎉 DOSSIER CRÉÉ AVEC SUCCÈS ! Testez maintenant : https://esignpro.ch/client-portal/SECURE_1758959883349_wj7t4a9xo6' as message; -- 🔧 CHANGEZ VOTRE TOKEN ICI
