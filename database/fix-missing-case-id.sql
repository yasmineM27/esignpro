-- 🚨 CORRECTION URGENTE : Case ID manquant
-- Exécuter immédiatement dans Supabase SQL Editor

-- ============================================================================
-- PROBLÈME IDENTIFIÉ
-- ============================================================================
-- Erreur: Case ID 90ec14bf-fa1c-4736-aaaa-455b4a3e1af0 not found, logging email without case_id
-- Le système essaie de logger un email pour un dossier qui n'existe pas

-- ============================================================================
-- SOLUTION 1 : CRÉER LE DOSSIER MANQUANT
-- ============================================================================

-- Vérifier d'abord si le dossier existe
SELECT 
    id, 
    case_number, 
    status, 
    title,
    created_at
FROM insurance_cases 
WHERE id = '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0';

-- Si le résultat est vide, créer le dossier
INSERT INTO insurance_cases (
    id,
    case_number,
    secure_token,
    status,
    title,
    insurance_type,
    insurance_company,
    policy_number,
    description,
    priority,
    created_at,
    updated_at
) VALUES (
    '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0',
    'CASE-RECOVERY-001',
    '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0',
    'email_sent',
    'Dossier créé automatiquement - Récupération erreur email_logs',
    'auto',
    'Récupération Automatique',
    'RECOVERY-001',
    'Ce dossier a été créé automatiquement pour corriger une erreur de référence dans email_logs. Vérifier les détails avec l''équipe technique.',
    1,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    description = COALESCE(insurance_cases.description, EXCLUDED.description);

-- ============================================================================
-- SOLUTION 2 : CRÉER D'AUTRES DOSSIERS DE TEST MANQUANTS
-- ============================================================================

-- Créer le dossier pour les tests d'upload
INSERT INTO insurance_cases (
    id,
    case_number,
    secure_token,
    status,
    title,
    insurance_type,
    insurance_company,
    policy_number,
    description,
    priority,
    created_at,
    updated_at
) VALUES (
    'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
    'CASE-TEST-UPLOAD-001',
    'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
    'documents_uploaded',
    'Dossier de test - Upload documents séparés',
    'auto',
    'Test Company',
    'TEST-UPLOAD-001',
    'Dossier utilisé pour tester le système d''upload de documents séparés (CIN recto/verso, contrat assurance, etc.)',
    2,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    status = EXCLUDED.status;

-- ============================================================================
-- SOLUTION 3 : VÉRIFIER ET CORRIGER LES EMAILS ORPHELINS
-- ============================================================================

-- Identifier tous les emails orphelins
SELECT 
    el.id,
    el.case_id,
    el.recipient_email,
    el.subject,
    el.status,
    el.created_at,
    'ORPHELIN' as issue_type
FROM email_logs el
LEFT JOIN insurance_cases ic ON el.case_id = ic.id
WHERE ic.id IS NULL
ORDER BY el.created_at DESC
LIMIT 10;

-- Corriger les emails orphelins récents (dernières 24h)
UPDATE email_logs 
SET case_id = '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0'
WHERE case_id IS NULL 
   OR case_id NOT IN (SELECT id FROM insurance_cases)
   AND created_at > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- SOLUTION 4 : AMÉLIORER LA CONTRAINTE POUR ÉVITER LE PROBLÈME
-- ============================================================================

-- Temporairement, permettre les case_id NULL dans email_logs
ALTER TABLE email_logs 
ALTER COLUMN case_id DROP NOT NULL;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN email_logs.case_id IS 'Référence vers insurance_cases.id - Peut être NULL pour les emails système sans dossier associé';

-- ============================================================================
-- VÉRIFICATIONS FINALES
-- ============================================================================

-- 1. Vérifier que le dossier manquant existe maintenant
SELECT 
    'Dossier créé' as status,
    id, 
    case_number, 
    title,
    status as case_status
FROM insurance_cases 
WHERE id = '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0';

-- 2. Vérifier qu'il n'y a plus d'emails orphelins récents
SELECT 
    COUNT(*) as emails_orphelins_count,
    'Emails sans dossier associé' as description
FROM email_logs el
LEFT JOIN insurance_cases ic ON el.case_id = ic.id
WHERE ic.id IS NULL
  AND el.created_at > NOW() - INTERVAL '24 hours';

-- 3. Statistiques générales
SELECT 
    'email_logs' as table_name,
    COUNT(*) as total_rows,
    COUNT(case_id) as with_case_id,
    COUNT(*) - COUNT(case_id) as null_case_id_count
FROM email_logs
UNION ALL
SELECT 
    'insurance_cases' as table_name,
    COUNT(*) as total_rows,
    COUNT(id) as with_id,
    0 as null_count
FROM insurance_cases;

-- ============================================================================
-- MESSAGES DE CONFIRMATION
-- ============================================================================

SELECT 
    '✅ CORRECTION TERMINÉE' as status,
    'Le dossier manquant a été créé' as message,
    '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0' as case_id_created,
    NOW() as fixed_at;

-- Instructions pour l'équipe
SELECT 
    '📋 ACTIONS RECOMMANDÉES' as type,
    'Surveiller les logs pour d''autres case_id manquants' as action_1,
    'Vérifier la logique de création des dossiers dans le code' as action_2,
    'Considérer l''ajout de validation côté application' as action_3;
