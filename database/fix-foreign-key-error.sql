-- Script pour corriger l'erreur de clé étrangère email_logs
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les données orphelines dans email_logs
SELECT 
    el.id,
    el.case_id,
    el.email_type,
    el.created_at,
    ic.id as insurance_case_exists
FROM email_logs el
LEFT JOIN insurance_cases ic ON el.case_id = ic.id
WHERE ic.id IS NULL
ORDER BY el.created_at DESC;

-- 2. Créer un dossier par défaut pour les emails orphelins
INSERT INTO insurance_cases (
    id,
    case_number,
    secure_token,
    status,
    insurance_company,
    policy_number,
    created_at,
    updated_at
) VALUES (
    '8a041d45-2e34-44e8-9204-0dbc505d6b05',
    'ORPHAN-EMAIL-001',
    'orphan_email_token_001',
    'email_sent',
    'Email Orphelin - À Corriger',
    'ORPHAN-001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Créer un client par défaut pour les dossiers orphelins
DO $$
DECLARE
    default_user_id UUID;
    default_client_id UUID;
BEGIN
    -- Créer un utilisateur par défaut s'il n'existe pas
    INSERT INTO users (
        email,
        first_name,
        last_name,
        role,
        is_active
    ) VALUES (
        'orphan@esignpro.ch',
        'Email',
        'Orphelin',
        'client',
        false
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO default_user_id;
    
    -- Si l'utilisateur existe déjà, récupérer son ID
    IF default_user_id IS NULL THEN
        SELECT id INTO default_user_id 
        FROM users 
        WHERE email = 'orphan@esignpro.ch';
    END IF;
    
    -- Créer un client par défaut
    INSERT INTO clients (
        user_id
    ) VALUES (
        default_user_id
    ) ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO default_client_id;
    
    -- Si le client existe déjà, récupérer son ID
    IF default_client_id IS NULL THEN
        SELECT id INTO default_client_id 
        FROM clients 
        WHERE user_id = default_user_id;
    END IF;
    
    -- Mettre à jour le dossier orphelin avec le client
    UPDATE insurance_cases 
    SET client_id = default_client_id
    WHERE id = '8a041d45-2e34-44e8-9204-0dbc505d6b05'
    AND client_id IS NULL;
    
    RAISE NOTICE 'Dossier orphelin créé avec client_id: %', default_client_id;
END $$;

-- 4. Modifier la contrainte pour permettre les valeurs NULL temporairement
ALTER TABLE email_logs 
ALTER COLUMN case_id DROP NOT NULL;

-- 5. Créer une fonction pour nettoyer les emails orphelins
CREATE OR REPLACE FUNCTION cleanup_orphan_emails()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER := 0;
BEGIN
    -- Supprimer les emails orphelins de plus de 7 jours
    DELETE FROM email_logs 
    WHERE case_id IS NULL 
    AND created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    -- Créer des dossiers pour les emails orphelins récents
    INSERT INTO insurance_cases (
        case_number,
        secure_token,
        status,
        insurance_company,
        policy_number,
        created_at,
        updated_at
    )
    SELECT 
        'ORPHAN-' || EXTRACT(EPOCH FROM el.created_at)::TEXT,
        'orphan_' || el.id::TEXT,
        'email_sent',
        'Email Orphelin - ' || el.email_type,
        'ORPHAN-' || el.id::TEXT,
        el.created_at,
        NOW()
    FROM email_logs el
    WHERE el.case_id IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM insurance_cases ic 
        WHERE ic.secure_token = 'orphan_' || el.id::TEXT
    );
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer une vue pour surveiller les emails orphelins
CREATE OR REPLACE VIEW orphan_emails_monitoring AS
SELECT 
    el.id as email_log_id,
    el.case_id,
    el.email_type,
    el.recipient_email,
    el.subject,
    el.status,
    el.created_at,
    CASE 
        WHEN ic.id IS NULL THEN 'ORPHAN'
        ELSE 'LINKED'
    END as link_status
FROM email_logs el
LEFT JOIN insurance_cases ic ON el.case_id = ic.id
ORDER BY el.created_at DESC;

-- 7. Créer un trigger pour éviter les futurs emails orphelins
CREATE OR REPLACE FUNCTION prevent_orphan_emails()
RETURNS TRIGGER AS $$
BEGIN
    -- Si case_id est fourni, vérifier qu'il existe
    IF NEW.case_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM insurance_cases WHERE id = NEW.case_id) THEN
            -- Créer un dossier temporaire
            INSERT INTO insurance_cases (
                id,
                case_number,
                secure_token,
                status,
                insurance_company,
                policy_number,
                created_at,
                updated_at
            ) VALUES (
                NEW.case_id,
                'AUTO-' || EXTRACT(EPOCH FROM NOW())::TEXT,
                'auto_' || NEW.case_id::TEXT,
                'email_sent',
                'Dossier Auto-Créé',
                'AUTO-' || EXTRACT(EPOCH FROM NOW())::TEXT,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Dossier auto-créé pour email: %', NEW.case_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer le trigger
DROP TRIGGER IF EXISTS trigger_prevent_orphan_emails ON email_logs;
CREATE TRIGGER trigger_prevent_orphan_emails
    BEFORE INSERT ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_orphan_emails();

-- 9. Corriger les données existantes
UPDATE email_logs 
SET case_id = '8a041d45-2e34-44e8-9204-0dbc505d6b05'
WHERE case_id IS NULL 
AND created_at > NOW() - INTERVAL '1 day';

-- 10. Remettre la contrainte NOT NULL après correction
-- (À exécuter après avoir vérifié que tout fonctionne)
-- ALTER TABLE email_logs 
-- ALTER COLUMN case_id SET NOT NULL;

-- 11. Vérification finale
SELECT 
    'email_logs' as table_name,
    COUNT(*) as total_rows,
    COUNT(case_id) as with_case_id,
    COUNT(*) - COUNT(case_id) as orphan_count
FROM email_logs
UNION ALL
SELECT 
    'insurance_cases' as table_name,
    COUNT(*) as total_rows,
    COUNT(id) as with_id,
    0 as orphan_count
FROM insurance_cases;

-- 12. Afficher les emails orphelins restants
SELECT * FROM orphan_emails_monitoring WHERE link_status = 'ORPHAN';

RAISE NOTICE 'Script de correction des emails orphelins terminé !';
RAISE NOTICE 'Vérifiez les résultats et exécutez le nettoyage si nécessaire.';
