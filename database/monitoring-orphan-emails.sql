-- 📊 MONITORING : Détection des emails orphelins et case_id manquants
-- À exécuter régulièrement pour surveiller l'intégrité des données

-- ============================================================================
-- 1. DÉTECTION DES EMAILS ORPHELINS
-- ============================================================================

-- Emails avec case_id qui n'existent pas dans insurance_cases
CREATE OR REPLACE VIEW orphan_emails AS
SELECT 
    el.id as email_log_id,
    el.case_id as missing_case_id,
    el.recipient_email,
    el.subject,
    el.status as email_status,
    el.created_at as email_created_at,
    el.sent_at,
    'CASE_ID_NOT_FOUND' as issue_type,
    CASE 
        WHEN el.created_at > NOW() - INTERVAL '1 hour' THEN 'URGENT'
        WHEN el.created_at > NOW() - INTERVAL '24 hours' THEN 'HIGH'
        WHEN el.created_at > NOW() - INTERVAL '7 days' THEN 'MEDIUM'
        ELSE 'LOW'
    END as priority
FROM email_logs el
LEFT JOIN insurance_cases ic ON el.case_id = ic.id
WHERE el.case_id IS NOT NULL 
  AND ic.id IS NULL
ORDER BY el.created_at DESC;

-- ============================================================================
-- 2. STATISTIQUES GÉNÉRALES
-- ============================================================================

-- Vue pour les statistiques de santé des données
CREATE OR REPLACE VIEW data_health_stats AS
SELECT 
    'email_logs' as table_name,
    COUNT(*) as total_records,
    COUNT(case_id) as records_with_case_id,
    COUNT(*) - COUNT(case_id) as records_null_case_id,
    (
        SELECT COUNT(*) 
        FROM email_logs el 
        LEFT JOIN insurance_cases ic ON el.case_id = ic.id 
        WHERE el.case_id IS NOT NULL AND ic.id IS NULL
    ) as orphan_records,
    NOW() as checked_at
UNION ALL
SELECT 
    'insurance_cases' as table_name,
    COUNT(*) as total_records,
    COUNT(id) as records_with_id,
    0 as records_null_id,
    0 as orphan_records,
    NOW() as checked_at
FROM insurance_cases;

-- ============================================================================
-- 3. REQUÊTES DE MONITORING
-- ============================================================================

-- Requête 1: Emails orphelins récents (dernières 24h)
SELECT 
    '🚨 EMAILS ORPHELINS RÉCENTS' as alert_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun problème'
        WHEN COUNT(*) < 5 THEN '⚠️ Problème mineur'
        ELSE '🚨 Problème majeur'
    END as status
FROM orphan_emails 
WHERE email_created_at > NOW() - INTERVAL '24 hours';

-- Requête 2: Liste détaillée des emails orphelins récents
SELECT 
    '📋 DÉTAILS EMAILS ORPHELINS' as section,
    missing_case_id,
    recipient_email,
    subject,
    email_status,
    email_created_at,
    priority
FROM orphan_emails 
WHERE email_created_at > NOW() - INTERVAL '24 hours'
ORDER BY priority DESC, email_created_at DESC
LIMIT 10;

-- Requête 3: Case IDs les plus problématiques
SELECT 
    '📊 CASE IDS PROBLÉMATIQUES' as section,
    missing_case_id,
    COUNT(*) as email_count,
    MIN(email_created_at) as first_occurrence,
    MAX(email_created_at) as last_occurrence,
    ARRAY_AGG(DISTINCT recipient_email) as affected_emails
FROM orphan_emails
GROUP BY missing_case_id
ORDER BY email_count DESC, last_occurrence DESC
LIMIT 5;

-- ============================================================================
-- 4. FONCTIONS DE CORRECTION AUTOMATIQUE
-- ============================================================================

-- Fonction pour créer automatiquement un dossier manquant
CREATE OR REPLACE FUNCTION create_missing_case(p_case_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    case_exists BOOLEAN;
BEGIN
    -- Vérifier si le dossier existe déjà
    SELECT EXISTS(SELECT 1 FROM insurance_cases WHERE id = p_case_id) INTO case_exists;
    
    IF case_exists THEN
        RAISE NOTICE 'Case % already exists', p_case_id;
        RETURN TRUE;
    END IF;
    
    -- Créer le dossier manquant
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
        p_case_id,
        'AUTO-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        p_case_id::TEXT,
        'email_sent',
        'Dossier créé automatiquement',
        'auto',
        'Création Automatique',
        'AUTO-' || LEFT(p_case_id::TEXT, 8),
        'Dossier créé automatiquement pour corriger une référence manquante dans email_logs. Créé le ' || NOW()::TEXT,
        1
    );
    
    RAISE NOTICE 'Created missing case %', p_case_id;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create case %: %', p_case_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour corriger tous les emails orphelins récents
CREATE OR REPLACE FUNCTION fix_recent_orphan_emails()
RETURNS TABLE(case_id UUID, action TEXT, success BOOLEAN) AS $$
DECLARE
    orphan_record RECORD;
    fix_success BOOLEAN;
BEGIN
    FOR orphan_record IN 
        SELECT DISTINCT missing_case_id::UUID as case_uuid
        FROM orphan_emails 
        WHERE email_created_at > NOW() - INTERVAL '24 hours'
    LOOP
        SELECT create_missing_case(orphan_record.case_uuid) INTO fix_success;
        
        RETURN QUERY SELECT 
            orphan_record.case_uuid,
            'CREATE_MISSING_CASE'::TEXT,
            fix_success;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. REQUÊTES D'EXÉCUTION IMMÉDIATE
-- ============================================================================

-- Afficher le statut actuel
SELECT * FROM data_health_stats;

-- Afficher les emails orphelins récents
SELECT * FROM orphan_emails WHERE priority IN ('URGENT', 'HIGH') LIMIT 10;

-- Corriger automatiquement les problèmes récents (décommenter si nécessaire)
-- SELECT * FROM fix_recent_orphan_emails();

-- ============================================================================
-- 6. ALERTES ET RECOMMANDATIONS
-- ============================================================================

-- Alerte si des emails orphelins urgents existent
DO $$
DECLARE
    urgent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO urgent_count 
    FROM orphan_emails 
    WHERE priority = 'URGENT';
    
    IF urgent_count > 0 THEN
        RAISE NOTICE '🚨 ALERTE: % emails orphelins urgents détectés!', urgent_count;
        RAISE NOTICE '📋 Action recommandée: Exécuter fix_recent_orphan_emails() ou corriger manuellement';
    ELSE
        RAISE NOTICE '✅ Aucun email orphelin urgent détecté';
    END IF;
END $$;

-- Recommandations finales
SELECT 
    '📋 RECOMMANDATIONS' as type,
    'Exécuter ce script quotidiennement' as recommendation_1,
    'Surveiller les alertes URGENT et HIGH' as recommendation_2,
    'Corriger la logique applicative pour éviter les case_id manquants' as recommendation_3,
    'Considérer l''ajout de contraintes plus flexibles' as recommendation_4;
