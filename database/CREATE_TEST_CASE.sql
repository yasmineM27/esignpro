-- 🧪 CRÉATION D'UN DOSSIER DE TEST POUR LE TOKEN PROBLÉMATIQUE
-- À exécuter APRÈS le script COMPLETE_DATABASE_RESET.sql

-- ============================================================================
-- CRÉATION DU DOSSIER DE TEST POUR LE TOKEN: SECURE_1758909118460_202mix6qtsh
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

-- 2. Créer le profil client associé
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

-- 3. Créer un agent de test
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone
) VALUES (
    '33333333-4444-5555-6666-777777777777',
    'agent.test@esignpro.ch',
    'Marie',
    'Martin',
    'agent',
    '+41 22 123 45 67'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- 4. Créer le profil agent associé
INSERT INTO public.agents (
    id,
    user_id,
    agent_code,
    department,
    is_supervisor
) VALUES (
    '44444444-5555-6666-7777-888888888888',
    '33333333-4444-5555-6666-777777777777',
    'AGENT001',
    'Résiliation',
    false
) ON CONFLICT (id) DO UPDATE SET
    department = EXCLUDED.department,
    updated_at = NOW();

-- 5. Créer le dossier d'assurance avec le token problématique
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
    'RES-2024-001',
    '22222222-3333-4444-5555-666666666666',
    '44444444-5555-6666-7777-888888888888',
    'SECURE_1758909118460_202mix6qtsh',
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

-- 6. Créer quelques documents de test pour ce dossier
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
    'SECURE_1758909118460_202mix6qtsh',
    'SECURE_1758909118460_202mix6qtsh',
    'identity_front',
    'cin_recto_test.jpg',
    '/uploads/clients/SECURE_1758909118460_202mix6qtsh/identity_front/cin_recto_test.jpg',
    1024000,
    'image/jpeg',
    'uploaded'
),
(
    'SECURE_1758909118460_202mix6qtsh',
    'SECURE_1758909118460_202mix6qtsh',
    'identity_back',
    'cin_verso_test.jpg',
    '/uploads/clients/SECURE_1758909118460_202mix6qtsh/identity_back/cin_verso_test.jpg',
    1024000,
    'image/jpeg',
    'uploaded'
),
(
    'SECURE_1758909118460_202mix6qtsh',
    'SECURE_1758909118460_202mix6qtsh',
    'insurance_contract',
    'contrat_assurance_test.pdf',
    '/uploads/clients/SECURE_1758909118460_202mix6qtsh/insurance_contract/contrat_assurance_test.pdf',
    2048000,
    'application/pdf',
    'uploaded'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Créer un log d'email pour ce dossier
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
    'Finalisation de votre dossier RES-2024-001 - Action requise',
    '<html><body><h2>Bonjour Jean Dupont,</h2><p>Votre dossier de résiliation est prêt.</p><p><a href="https://esignpro.ch/client-portal/SECURE_1758909118460_202mix6qtsh">Finaliser mon dossier</a></p></body></html>',
    'client_invitation',
    'sent',
    NOW() - INTERVAL '1 hour'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES CRÉÉES
-- ============================================================================

-- Vérifier que le dossier a été créé correctement
SELECT 
    '🔍 VÉRIFICATION DU DOSSIER DE TEST' as title,
    ic.case_number,
    ic.secure_token,
    ic.status,
    ic.insurance_company,
    u.first_name || ' ' || u.last_name as client_name,
    u.email as client_email,
    au.first_name || ' ' || au.last_name as agent_name,
    au.email as agent_email
FROM public.insurance_cases ic
LEFT JOIN public.clients c ON ic.client_id = c.id
LEFT JOIN public.users u ON c.user_id = u.id
LEFT JOIN public.agents a ON ic.agent_id = a.id
LEFT JOIN public.users au ON a.user_id = au.id
WHERE ic.secure_token = 'SECURE_1758909118460_202mix6qtsh';

-- Vérifier les documents associés
SELECT 
    '📁 DOCUMENTS ASSOCIÉS' as title,
    documenttype,
    filename,
    filesize,
    mimetype,
    status,
    uploaddate
FROM public.client_documents
WHERE token = 'SECURE_1758909118460_202mix6qtsh'
ORDER BY uploaddate DESC;

-- Vérifier les emails envoyés
SELECT 
    '📧 EMAILS ENVOYÉS' as title,
    recipient_email,
    subject,
    email_type,
    status,
    sent_at
FROM public.email_logs el
JOIN public.insurance_cases ic ON el.case_id = ic.id
WHERE ic.secure_token = 'SECURE_1758909118460_202mix6qtsh';

-- Afficher les statistiques via la vue unifiée
SELECT 
    '📊 VUE UNIFIÉE' as title,
    case_number,
    secure_token,
    status,
    client_first_name,
    client_last_name,
    client_email,
    agent_first_name,
    agent_last_name,
    total_documents,
    required_documents,
    last_activity
FROM public.unified_portal_data
WHERE secure_token = 'SECURE_1758909118460_202mix6qtsh';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 DOSSIER DE TEST CRÉÉ AVEC SUCCÈS !';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 DÉTAILS DU DOSSIER :';
    RAISE NOTICE '   🆔 Token: SECURE_1758909118460_202mix6qtsh';
    RAISE NOTICE '   📄 Numéro: RES-2024-001';
    RAISE NOTICE '   👤 Client: Jean Dupont (client.test@esignpro.ch)';
    RAISE NOTICE '   👨‍💼 Agent: Marie Martin (agent.test@esignpro.ch)';
    RAISE NOTICE '   🏢 Assurance: Allianz Suisse';
    RAISE NOTICE '   📁 Documents: 3 documents de test créés';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 PAGES À TESTER :';
    RAISE NOTICE '   • https://esignpro.ch/client-portal/SECURE_1758909118460_202mix6qtsh';
    RAISE NOTICE '   • http://localhost:3000/client-portal/SECURE_1758909118460_202mix6qtsh';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Le dossier est maintenant prêt pour les tests !';
    RAISE NOTICE '';
END $$;
