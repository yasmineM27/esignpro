-- 📁 Table simple pour stocker les documents clients
-- Exécuter dans Supabase SQL Editor
-- Supprimer la table existante si elle existe
DROP TABLE IF EXISTS client_documents CASCADE;
-- Créer la table client_documents avec des noms simples
CREATE TABLE client_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clientid VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    documenttype VARCHAR(50) NOT NULL CHECK (
        documenttype IN (
            'identity_front',
            'identity_back',
            'insurance_contract',
            'proof_address',
            'bank_statement',
            'additional'
        )
    ),
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    filesize INTEGER NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    uploaddate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (
        status IN (
            'uploaded',
            'processing',
            'validated',
            'rejected'
        )
    ),
    validationnotes TEXT,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_documents_clientid ON client_documents(clientid);
CREATE INDEX IF NOT EXISTS idx_client_documents_token ON client_documents(token);
CREATE INDEX IF NOT EXISTS idx_client_documents_documenttype ON client_documents(documenttype);
CREATE INDEX IF NOT EXISTS idx_client_documents_status ON client_documents(status);
CREATE INDEX IF NOT EXISTS idx_client_documents_uploaddate ON client_documents(uploaddate);
-- Index composé pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_client_documents_client_token ON client_documents(clientid, token);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_type ON client_documents(clientid, documenttype);
-- Trigger pour mettre à jour updatedat automatiquement
CREATE OR REPLACE FUNCTION update_updatedat_column() RETURNS TRIGGER AS $$ BEGIN NEW.updatedat = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_client_documents_updatedat BEFORE
UPDATE ON client_documents FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();
-- Vue pour les statistiques des documents par client
CREATE OR REPLACE VIEW client_documents_stats AS
SELECT clientid,
    token,
    COUNT(*) as total_documents,
    COUNT(
        CASE
            WHEN documenttype = 'identity_front' THEN 1
        END
    ) as identity_front_count,
    COUNT(
        CASE
            WHEN documenttype = 'identity_back' THEN 1
        END
    ) as identity_back_count,
    COUNT(
        CASE
            WHEN documenttype = 'insurance_contract' THEN 1
        END
    ) as insurance_contract_count,
    COUNT(
        CASE
            WHEN documenttype = 'proof_address' THEN 1
        END
    ) as proof_address_count,
    COUNT(
        CASE
            WHEN documenttype = 'bank_statement' THEN 1
        END
    ) as bank_statement_count,
    COUNT(
        CASE
            WHEN documenttype = 'additional' THEN 1
        END
    ) as additional_count,
    -- Vérifier si tous les documents obligatoires sont présents
    CASE
        WHEN COUNT(
            CASE
                WHEN documenttype = 'identity_front' THEN 1
            END
        ) > 0
        AND COUNT(
            CASE
                WHEN documenttype = 'identity_back' THEN 1
            END
        ) > 0
        AND COUNT(
            CASE
                WHEN documenttype = 'insurance_contract' THEN 1
            END
        ) > 0 THEN true
        ELSE false
    END as has_required_documents,
    SUM(filesize) as total_size_bytes,
    MIN(uploaddate) as first_upload,
    MAX(uploaddate) as last_upload
FROM client_documents
GROUP BY clientid,
    token;
-- Fonction pour obtenir le résumé des documents d'un client
CREATE OR REPLACE FUNCTION get_client_documents_summary(p_clientid VARCHAR, p_token VARCHAR) RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
SELECT json_build_object(
        'clientid',
        p_clientid,
        'token',
        p_token,
        'total_documents',
        COUNT(*),
        'required_documents_complete',
        (
            COUNT(
                CASE
                    WHEN documenttype = 'identity_front' THEN 1
                END
            ) > 0
            AND COUNT(
                CASE
                    WHEN documenttype = 'identity_back' THEN 1
                END
            ) > 0
            AND COUNT(
                CASE
                    WHEN documenttype = 'insurance_contract' THEN 1
                END
            ) > 0
        ),
        'documents_by_type',
        json_object_agg(
            documenttype,
            json_build_object(
                'count',
                type_count,
                'total_size',
                type_size,
                'last_upload',
                type_last_upload
            )
        ),
        'total_size_mb',
        ROUND(SUM(filesize) / 1024.0 / 1024.0, 2),
        'first_upload',
        MIN(uploaddate),
        'last_upload',
        MAX(uploaddate)
    ) INTO result
FROM (
        SELECT documenttype,
            COUNT(*) as type_count,
            SUM(filesize) as type_size,
            MAX(uploaddate) as type_last_upload,
            filesize,
            uploaddate
        FROM client_documents
        WHERE clientid = p_clientid
            AND token = p_token
        GROUP BY documenttype,
            filesize,
            uploaddate
    ) grouped;
RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- CORRECTION ERREUR CASE_ID MANQUANT
-- ============================================================================
-- 1. Créer le dossier manquant pour corriger l'erreur email_logs
INSERT INTO insurance_cases (
        id,
        case_number,
        secure_token,
        status,
        title,
        insurance_type,
        insurance_company,
        policy_number,
        created_at,
        updated_at
    )
VALUES (
        '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0',
        'CASE-MISSING-001',
        '90ec14bf-fa1c-4736-aaaa-455b4a3e1af0',
        'email_sent',
        'Dossier créé automatiquement pour corriger erreur email_logs',
        'auto',
        'Compagnie Inconnue',
        'MISSING-001',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
-- 2. Créer d'autres dossiers de test si nécessaire
INSERT INTO insurance_cases (
        id,
        case_number,
        secure_token,
        status,
        title,
        insurance_type,
        insurance_company,
        policy_number,
        created_at,
        updated_at
    )
VALUES (
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'CASE-TEST-001',
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'documents_uploaded',
        'Dossier de test pour upload documents',
        'auto',
        'AXA Test',
        'TEST-001',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
-- 3. Insérer quelques données de test pour client_documents
INSERT INTO client_documents (
        clientid,
        token,
        documenttype,
        filename,
        filepath,
        filesize,
        mimetype
    )
VALUES (
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'identity_front',
        'cin_recto.jpg',
        '/uploads/clients/a71df0e4-e48a-4fec-bdd3-a2780daf7bcd/identity_front/cin_recto.jpg',
        1024000,
        'image/jpeg'
    ),
    (
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'identity_back',
        'cin_verso.jpg',
        '/uploads/clients/a71df0e4-e48a-4fec-bdd3-a2780daf7bcd/identity_back/cin_verso.jpg',
        1024000,
        'image/jpeg'
    ),
    (
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'insurance_contract',
        'contrat.pdf',
        '/uploads/clients/a71df0e4-e48a-4fec-bdd3-a2780daf7bcd/insurance_contract/contrat.pdf',
        2048000,
        'application/pdf'
    ) ON CONFLICT (id) DO NOTHING;
-- Vérifier que tout fonctionne
SELECT 'Table client_documents créée avec succès!' as message;
-- Tester la vue des statistiques
SELECT *
FROM client_documents_stats
WHERE clientid = 'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd';
-- Tester la fonction de résumé
SELECT get_client_documents_summary(
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd',
        'a71df0e4-e48a-4fec-bdd3-a2780daf7bcd'
    );
-- Commentaires sur la table
COMMENT ON TABLE client_documents IS 'Table pour stocker les documents uploadés par les clients, organisés par type';
COMMENT ON COLUMN client_documents.clientid IS 'Identifiant unique du client (peut être le token)';
COMMENT ON COLUMN client_documents.token IS 'Token de session du client';
COMMENT ON COLUMN client_documents.documenttype IS 'Type de document (identity_front, identity_back, etc.)';
COMMENT ON COLUMN client_documents.filename IS 'Nom original du fichier uploadé';
COMMENT ON COLUMN client_documents.filepath IS 'Chemin relatif vers le fichier stocké';
COMMENT ON COLUMN client_documents.filesize IS 'Taille du fichier en bytes';
COMMENT ON COLUMN client_documents.mimetype IS 'Type MIME du fichier (image/jpeg, application/pdf, etc.)';
COMMENT ON COLUMN client_documents.status IS 'Statut du document (uploaded, processing, validated, rejected)';
COMMENT ON COLUMN client_documents.validationnotes IS 'Notes de validation ou commentaires';