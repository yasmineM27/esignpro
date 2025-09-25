-- 📁 Table pour stocker les documents clients uploadés séparément
-- Exécuter dans Supabase SQL Editor

-- Créer la table client_documents
CREATE TABLE IF NOT EXISTS client_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'identity_front',
        'identity_back', 
        'insurance_contract',
        'proof_address',
        'bank_statement',
        'additional'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'validated', 'rejected')),
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_token ON client_documents(token);
CREATE INDEX IF NOT EXISTS idx_client_documents_type ON client_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_client_documents_status ON client_documents(status);
CREATE INDEX IF NOT EXISTS idx_client_documents_upload_date ON client_documents(upload_date);

-- Index composé pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_client_documents_client_token ON client_documents(client_id, token);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_type ON client_documents(client_id, document_type);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_documents_updated_at 
    BEFORE UPDATE ON client_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vue pour les statistiques des documents par client
CREATE OR REPLACE VIEW client_documents_stats AS
SELECT 
    client_id,
    token,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN document_type = 'identity_front' THEN 1 END) as identity_front_count,
    COUNT(CASE WHEN document_type = 'identity_back' THEN 1 END) as identity_back_count,
    COUNT(CASE WHEN document_type = 'insurance_contract' THEN 1 END) as insurance_contract_count,
    COUNT(CASE WHEN document_type = 'proof_address' THEN 1 END) as proof_address_count,
    COUNT(CASE WHEN document_type = 'bank_statement' THEN 1 END) as bank_statement_count,
    COUNT(CASE WHEN document_type = 'additional' THEN 1 END) as additional_count,
    -- Vérifier si tous les documents obligatoires sont présents
    CASE 
        WHEN COUNT(CASE WHEN document_type = 'identity_front' THEN 1 END) > 0
         AND COUNT(CASE WHEN document_type = 'identity_back' THEN 1 END) > 0
         AND COUNT(CASE WHEN document_type = 'insurance_contract' THEN 1 END) > 0
        THEN true 
        ELSE false 
    END as has_required_documents,
    SUM(file_size) as total_size_bytes,
    MIN(upload_date) as first_upload,
    MAX(upload_date) as last_upload
FROM client_documents
GROUP BY client_id, token;

-- Vue pour les documents récents
CREATE OR REPLACE VIEW recent_client_documents AS
SELECT 
    cd.*,
    CASE 
        WHEN cd.document_type = 'identity_front' THEN 'Carte d''Identité - RECTO'
        WHEN cd.document_type = 'identity_back' THEN 'Carte d''Identité - VERSO'
        WHEN cd.document_type = 'insurance_contract' THEN 'Contrat d''Assurance'
        WHEN cd.document_type = 'proof_address' THEN 'Justificatif de Domicile'
        WHEN cd.document_type = 'bank_statement' THEN 'Relevé Bancaire'
        WHEN cd.document_type = 'additional' THEN 'Documents Supplémentaires'
        ELSE cd.document_type
    END as document_type_name,
    CASE 
        WHEN cd.document_type IN ('identity_front', 'identity_back', 'insurance_contract') THEN true
        ELSE false
    END as is_required,
    ROUND(cd.file_size / 1024.0 / 1024.0, 2) as file_size_mb
FROM client_documents cd
WHERE cd.upload_date >= NOW() - INTERVAL '30 days'
ORDER BY cd.upload_date DESC;

-- Fonction pour nettoyer les anciens documents (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_documents(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM client_documents 
    WHERE upload_date < NOW() - INTERVAL '1 day' * days_old
    AND status = 'uploaded';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le résumé des documents d'un client
CREATE OR REPLACE FUNCTION get_client_documents_summary(p_client_id VARCHAR, p_token VARCHAR)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'client_id', p_client_id,
        'token', p_token,
        'total_documents', COUNT(*),
        'required_documents_complete', (
            COUNT(CASE WHEN document_type = 'identity_front' THEN 1 END) > 0
            AND COUNT(CASE WHEN document_type = 'identity_back' THEN 1 END) > 0
            AND COUNT(CASE WHEN document_type = 'insurance_contract' THEN 1 END) > 0
        ),
        'documents_by_type', json_object_agg(
            document_type, 
            json_build_object(
                'count', type_count,
                'total_size', type_size,
                'last_upload', type_last_upload
            )
        ),
        'total_size_mb', ROUND(SUM(file_size) / 1024.0 / 1024.0, 2),
        'first_upload', MIN(upload_date),
        'last_upload', MAX(upload_date)
    ) INTO result
    FROM (
        SELECT 
            document_type,
            COUNT(*) as type_count,
            SUM(file_size) as type_size,
            MAX(upload_date) as type_last_upload,
            file_size,
            upload_date
        FROM client_documents 
        WHERE client_id = p_client_id AND token = p_token
        GROUP BY document_type, file_size, upload_date
    ) grouped;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Politique de sécurité RLS (Row Level Security) - optionnel
-- ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'accès seulement aux documents du client
-- CREATE POLICY "Users can access their own documents" ON client_documents
--     FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- Commentaires sur la table
COMMENT ON TABLE client_documents IS 'Table pour stocker les documents uploadés par les clients, organisés par type';
COMMENT ON COLUMN client_documents.client_id IS 'Identifiant unique du client (peut être le token)';
COMMENT ON COLUMN client_documents.token IS 'Token de session du client';
COMMENT ON COLUMN client_documents.document_type IS 'Type de document (identity_front, identity_back, etc.)';
COMMENT ON COLUMN client_documents.file_name IS 'Nom original du fichier uploadé';
COMMENT ON COLUMN client_documents.file_path IS 'Chemin relatif vers le fichier stocké';
COMMENT ON COLUMN client_documents.file_size IS 'Taille du fichier en bytes';
COMMENT ON COLUMN client_documents.mime_type IS 'Type MIME du fichier (image/jpeg, application/pdf, etc.)';
COMMENT ON COLUMN client_documents.status IS 'Statut du document (uploaded, processing, validated, rejected)';
COMMENT ON COLUMN client_documents.validation_notes IS 'Notes de validation ou commentaires';

-- Insérer quelques données de test (optionnel)
-- INSERT INTO client_documents (client_id, token, document_type, file_name, file_path, file_size, mime_type) VALUES
-- ('a71df0e4-e48a-4fec-bdd3-a2780daf7bcd', 'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd', 'identity_front', 'cin_recto.jpg', '/uploads/clients/a71df0e4-e48a-4fec-bdd3-a2780daf7bcd/identity_front/cin_recto.jpg', 1024000, 'image/jpeg'),
-- ('a71df0e4-e48a-4fec-bdd3-a2780daf7bcd', 'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd', 'identity_back', 'cin_verso.jpg', '/uploads/clients/a71df0e4-e48a-4fec-bdd3-a2780daf7bcd/identity_back/cin_verso.jpg', 1024000, 'image/jpeg');

-- Vérifier que tout fonctionne
SELECT 'Table client_documents créée avec succès!' as message;
SELECT 'Vues et fonctions créées avec succès!' as message;

-- Tester la vue des statistiques
-- SELECT * FROM client_documents_stats LIMIT 5;

-- Tester la fonction de résumé
-- SELECT get_client_documents_summary('a71df0e4-e48a-4fec-bdd3-a2780daf7bcd', 'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd');
