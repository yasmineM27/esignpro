-- Migration pour l'intégration des signatures et documents finaux
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes pour les signatures
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

-- 11. Créer une fonction pour nettoyer les anciens logs
CREATE OR REPLACE FUNCTION cleanup_old_signature_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les logs de signature de plus de 2 ans
    DELETE FROM signature_logs 
    WHERE timestamp < NOW() - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Ajouter des contraintes de sécurité
ALTER TABLE signature_logs 
ADD CONSTRAINT check_signature_data_not_empty 
CHECK (signature_data IS NOT NULL AND signature_data != '{}');

ALTER TABLE client_documents 
ADD CONSTRAINT check_file_path_not_empty 
CHECK (file_path IS NOT NULL AND LENGTH(file_path) > 0);

-- 13. Créer des politiques RLS (Row Level Security) si nécessaire
-- ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE signature_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE final_documents ENABLE ROW LEVEL SECURITY;

-- 14. Insérer des données de test pour validation
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
    'TEST-SIGNATURE-001',
    '5b770abb55184a2d96d4afe00591e994',
    'email_sent',
    'Test Insurance Co',
    'POL-TEST-001',
    NOW(),
    NOW() + INTERVAL '7 days'
) ON CONFLICT (secure_token) DO NOTHING;

-- 15. Vérification de l'intégrité
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
    
    RAISE NOTICE 'Migration completed successfully! All tables and functions created.';
END $$;

-- 16. Afficher un résumé
SELECT 
    'insurance_cases' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE signature_data IS NOT NULL) as signed_cases
FROM insurance_cases
UNION ALL
SELECT 
    'client_documents' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE is_verified = TRUE) as verified_docs
FROM client_documents
UNION ALL
SELECT 
    'signature_logs' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE is_valid = TRUE) as valid_signatures
FROM signature_logs
UNION ALL
SELECT 
    'final_documents' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE signature_included = TRUE) as with_signature
FROM final_documents;
