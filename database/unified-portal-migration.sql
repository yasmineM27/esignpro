-- Migration pour l'unification du portail client et la signature automatique
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes pour les signatures et documents finaux
ALTER TABLE insurance_cases 
ADD COLUMN IF NOT EXISTS signature_data JSONB,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS final_document_url TEXT,
ADD COLUMN IF NOT EXISTS final_document_generated_at TIMESTAMP WITH TIME ZONE;

-- 2. Créer la table pour les documents uploadés par les clients
CREATE TABLE IF NOT EXISTS client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES insurance_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'identity_front', 'identity_back', 'additional'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table pour les logs de signatures
CREATE TABLE IF NOT EXISTS signature_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES insurance_cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    signature_data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT TRUE,
    validation_method VARCHAR(50) DEFAULT 'electronic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table pour les documents finaux générés
CREATE TABLE IF NOT EXISTS final_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES insurance_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL DEFAULT 'signed_termination',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES users(id),
    signature_included BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_client_documents_case_id ON client_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_type ON client_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_signature_logs_case_id ON signature_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_signature_logs_timestamp ON signature_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_final_documents_case_id ON final_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_insurance_cases_signature ON insurance_cases(signature_data) WHERE signature_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_cases_token ON insurance_cases(secure_token);

-- 6. Créer une fonction pour générer automatiquement le document final
CREATE OR REPLACE FUNCTION generate_final_document()
RETURNS TRIGGER AS $$
BEGIN
    -- Quand une signature est ajoutée, créer une entrée pour le document final
    IF NEW.signature_data IS NOT NULL AND OLD.signature_data IS NULL THEN
        INSERT INTO final_documents (
            case_id,
            document_type,
            file_path,
            generated_by,
            signature_included
        ) VALUES (
            NEW.id,
            'signed_termination',
            '/documents/final/' || NEW.id || '_signed.pdf',
            NEW.updated_by,
            TRUE
        );
        
        -- Mettre à jour le timestamp de finalisation
        NEW.completed_at = NOW();
        NEW.final_document_generated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger pour la génération automatique
DROP TRIGGER IF EXISTS trigger_generate_final_document ON insurance_cases;
CREATE TRIGGER trigger_generate_final_document
    BEFORE UPDATE ON insurance_cases
    FOR EACH ROW
    EXECUTE FUNCTION generate_final_document();

-- 8. Créer une fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Ajouter les triggers pour les timestamps
CREATE TRIGGER update_client_documents_updated_at
    BEFORE UPDATE ON client_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Créer une vue pour les statistiques de signatures
CREATE OR REPLACE VIEW signature_statistics AS
SELECT 
    DATE_TRUNC('day', sl.timestamp) as signature_date,
    COUNT(*) as signatures_count,
    COUNT(DISTINCT sl.case_id) as unique_cases,
    COUNT(DISTINCT sl.client_id) as unique_clients,
    AVG(EXTRACT(EPOCH FROM (sl.timestamp - ic.created_at))/3600) as avg_completion_hours
FROM signature_logs sl
JOIN insurance_cases ic ON sl.case_id = ic.id
GROUP BY DATE_TRUNC('day', sl.timestamp)
ORDER BY signature_date DESC;

-- 11. Créer une vue pour le portail unifié
CREATE OR REPLACE VIEW unified_portal_data AS
SELECT 
    ic.id,
    ic.secure_token,
    ic.case_number,
    ic.status,
    ic.insurance_company,
    ic.policy_number,
    ic.created_at,
    ic.token_expires_at,
    ic.signature_data,
    ic.completed_at,
    -- Données client
    u_client.first_name as client_first_name,
    u_client.last_name as client_last_name,
    u_client.email as client_email,
    -- Données agent
    u_agent.first_name as agent_first_name,
    u_agent.last_name as agent_last_name,
    u_agent.email as agent_email,
    -- Statistiques
    (SELECT COUNT(*) FROM client_documents cd WHERE cd.case_id = ic.id) as uploaded_documents_count,
    (SELECT COUNT(*) FROM signature_logs sl WHERE sl.case_id = ic.id) as signature_count,
    (SELECT COUNT(*) FROM final_documents fd WHERE fd.case_id = ic.id) as final_documents_count
FROM insurance_cases ic
LEFT JOIN clients c ON ic.client_id = c.id
LEFT JOIN users u_client ON c.user_id = u_client.id
LEFT JOIN agents a ON ic.agent_id = a.id
LEFT JOIN users u_agent ON a.user_id = u_agent.id;

-- 12. Créer une fonction pour nettoyer les anciens tokens expirés
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Marquer comme expirés les tokens de plus de 30 jours
    UPDATE insurance_cases 
    SET status = 'expired'
    WHERE token_expires_at < NOW() 
    AND status NOT IN ('completed', 'expired', 'cancelled');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Ajouter des contraintes de sécurité
ALTER TABLE signature_logs 
ADD CONSTRAINT check_signature_data_not_empty 
CHECK (signature_data IS NOT NULL AND signature_data != '{}');

ALTER TABLE client_documents 
ADD CONSTRAINT check_file_path_not_empty 
CHECK (file_path IS NOT NULL AND LENGTH(file_path) > 0);

ALTER TABLE insurance_cases
ADD CONSTRAINT check_secure_token_format
CHECK (secure_token IS NOT NULL AND LENGTH(secure_token) >= 20);

-- 14. Insérer des données de test pour le portail unifié
INSERT INTO insurance_cases (
    id,
    case_number,
    secure_token,
    status,
    insurance_company,
    policy_number,
    created_at,
    token_expires_at
) VALUES (
    gen_random_uuid(),
    'UNIFIED-PORTAL-001',
    '5b770abb55184a2d96d4afe00591e994',
    'email_sent',
    'Test Insurance Co',
    'POL-UNIFIED-001',
    NOW(),
    NOW() + INTERVAL '7 days'
) ON CONFLICT (secure_token) DO NOTHING;

-- 15. Créer une fonction pour valider les tokens
CREATE OR REPLACE FUNCTION validate_client_token(token_input TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    case_data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN upd.secure_token IS NOT NULL 
            AND upd.token_expires_at > NOW() 
            AND upd.status NOT IN ('expired', 'cancelled')
            THEN TRUE 
            ELSE FALSE 
        END as is_valid,
        CASE 
            WHEN upd.secure_token IS NOT NULL THEN
                jsonb_build_object(
                    'clientName', upd.client_first_name || ' ' || upd.client_last_name,
                    'clientEmail', upd.client_email,
                    'agentName', upd.agent_first_name || ' ' || upd.agent_last_name,
                    'agentEmail', upd.agent_email,
                    'documentType', upd.insurance_company,
                    'caseNumber', upd.case_number,
                    'status', upd.status,
                    'createdAt', upd.created_at,
                    'expiresAt', upd.token_expires_at
                )
            ELSE NULL
        END as case_data,
        upd.token_expires_at as expires_at
    FROM unified_portal_data upd
    WHERE upd.secure_token = token_input;
END;
$$ LANGUAGE plpgsql;

-- 16. Vérification de l'intégrité
DO $$
BEGIN
    -- Vérifier que toutes les tables existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_documents') THEN
        RAISE EXCEPTION 'Table client_documents not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'signature_logs') THEN
        RAISE EXCEPTION 'Table signature_logs not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'final_documents') THEN
        RAISE EXCEPTION 'Table final_documents not created';
    END IF;
    
    -- Vérifier que la vue existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'unified_portal_data') THEN
        RAISE EXCEPTION 'View unified_portal_data not created';
    END IF;
    
    RAISE NOTICE 'Migration du portail unifié terminée avec succès !';
    RAISE NOTICE 'Toutes les tables, vues, fonctions et triggers ont été créés.';
    RAISE NOTICE 'Le portail client est maintenant unifié sur /client-portal/[token]';
END $$;

-- 17. Afficher un résumé des données
SELECT 
    'insurance_cases' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE signature_data IS NOT NULL) as signed_cases,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_cases
FROM insurance_cases
UNION ALL
SELECT 
    'client_documents' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE is_verified = TRUE) as verified_docs,
    0 as completed_cases
FROM client_documents
UNION ALL
SELECT 
    'signature_logs' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE is_valid = TRUE) as valid_signatures,
    0 as completed_cases
FROM signature_logs
UNION ALL
SELECT 
    'final_documents' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE signature_included = TRUE) as with_signature,
    SUM(download_count) as total_downloads
FROM final_documents;
