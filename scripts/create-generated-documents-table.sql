-- Table pour stocker les documents générés par l'agent
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES insurance_cases(id) ON DELETE CASCADE,
    template_id VARCHAR(255) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- resiliation, avenant, sinistre
    content TEXT NOT NULL,
    variables JSONB NOT NULL, -- Variables utilisées pour le remplissage
    generated_by VARCHAR(255) NOT NULL, -- ID de l'agent
    status VARCHAR(50) DEFAULT 'generated', -- generated, signed, sent
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data TEXT, -- Signature de l'agent
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_to VARCHAR(255), -- Email de destination
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_generated_documents_case_id ON generated_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_generated_by ON generated_documents(generated_by);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON generated_documents(created_at);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_generated_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_generated_documents_updated_at
    BEFORE UPDATE ON generated_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_documents_updated_at();

-- Ajouter une colonne validation_status à la table signatures si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signatures' 
        AND column_name = 'validation_status'
    ) THEN
        ALTER TABLE signatures 
        ADD COLUMN validation_status VARCHAR(50) DEFAULT 'signed';
        
        ALTER TABLE signatures 
        ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE;
        
        ALTER TABLE signatures 
        ADD COLUMN validated_by VARCHAR(255);
        
        ALTER TABLE signatures 
        ADD COLUMN validation_notes TEXT;
        
        -- Index pour les requêtes de validation
        CREATE INDEX idx_signatures_validation_status ON signatures(validation_status);
    END IF;
END $$;

-- Commentaires pour la documentation
COMMENT ON TABLE generated_documents IS 'Documents générés automatiquement par les agents à partir de templates';
COMMENT ON COLUMN generated_documents.case_id IS 'Référence vers le dossier d''assurance';
COMMENT ON COLUMN generated_documents.template_id IS 'Identifiant du template utilisé';
COMMENT ON COLUMN generated_documents.variables IS 'Variables JSON utilisées pour remplir le template';
COMMENT ON COLUMN generated_documents.generated_by IS 'ID de l''agent qui a généré le document';
COMMENT ON COLUMN generated_documents.status IS 'Statut du document: generated, signed, sent';
COMMENT ON COLUMN generated_documents.signature_data IS 'Signature électronique de l''agent (base64)';

-- Données de test pour les templates (optionnel)
INSERT INTO generated_documents (
    case_id, 
    template_id, 
    template_name, 
    category, 
    content, 
    variables, 
    generated_by,
    status
) 
SELECT 
    ic.id,
    'template_resiliation_auto',
    'Résiliation Assurance Auto',
    'resiliation',
    'Document de test généré automatiquement...',
    jsonb_build_object(
        'clientName', u.first_name || ' ' || u.last_name,
        'clientEmail', u.email,
        'policyNumber', ic.policy_number,
        'insuranceCompany', ic.insurance_company
    ),
    'agent-001',
    'generated'
FROM insurance_cases ic
JOIN clients c ON ic.client_id = c.id
JOIN users u ON c.user_id = u.id
WHERE ic.status = 'signed'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Afficher un résumé
SELECT 
    'generated_documents' as table_name,
    COUNT(*) as row_count
FROM generated_documents
UNION ALL
SELECT 
    'signatures with validation_status' as table_name,
    COUNT(*) as row_count
FROM signatures 
WHERE validation_status IS NOT NULL;
