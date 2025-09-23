-- eSignPro Database Update Script for Supabase
-- Execute this script in your Supabase SQL Editor to update the schema
-- This script adds new features implemented in the application

-- ============================================================================
-- 1. UPDATE EXISTING ENUMS AND TYPES
-- ============================================================================

-- Add new document types for identity documents (front/back separation)
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'identity_front';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'identity_back';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'final_document';

-- Add new case statuses for the enhanced workflow
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'sent_to_insurer';
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'confirmed_by_insurer';

-- ============================================================================
-- 2. ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add new fields to clients table for enhanced client data
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nom VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS prenom VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS npa VARCHAR(20);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lieu_date VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS date_lamal DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS date_lca DATE;

-- Add new fields to insurance_cases table
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS form_type VARCHAR(50) DEFAULT 'resiliation';
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS destinataire VARCHAR(255);
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS sent_to_insurer_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS confirmed_by_insurer_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS insurer_email VARCHAR(255);
ALTER TABLE public.insurance_cases ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(100);

-- Add metadata to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_identity_front BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_identity_back BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_final_document BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_metadata JSONB;

-- Add enhanced signature tracking
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signature_type VARCHAR(50) DEFAULT 'electronic';
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS device_info JSONB;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS geolocation JSONB;

-- ============================================================================
-- 3. CREATE NEW TABLES FOR ENHANCED FUNCTIONALITY
-- ============================================================================

-- Table for storing additional family members/persons
CREATE TABLE IF NOT EXISTS public.case_persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    relation VARCHAR(50), -- 'conjoint', 'enfant', 'autre'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for document archive management
CREATE TABLE IF NOT EXISTS public.document_archive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    original_document_id UUID REFERENCES public.documents(id),
    final_document_path VARCHAR(500),
    archive_status VARCHAR(50) DEFAULT 'archived', -- 'archived', 'sent_to_insurer', 'confirmed_by_insurer'
    archive_notes TEXT,
    archived_by UUID REFERENCES public.users(id),
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_to_insurer_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for insurance company contacts
CREATE TABLE IF NOT EXISTS public.insurance_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking document sends to insurers
CREATE TABLE IF NOT EXISTS public.insurer_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    insurance_company_id UUID REFERENCES public.insurance_companies(id),
    communication_type VARCHAR(50) DEFAULT 'document_send', -- 'document_send', 'reminder', 'confirmation'
    subject VARCHAR(500),
    message TEXT,
    attachments JSONB, -- Array of document paths/URLs
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_received_at TIMESTAMP WITH TIME ZONE,
    response_content TEXT,
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'responded', 'failed'
    tracking_id VARCHAR(100),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE INDEXES FOR NEW TABLES AND COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_nom_prenom ON public.clients(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_insurance_cases_form_type ON public.insurance_cases(form_type);
CREATE INDEX IF NOT EXISTS idx_insurance_cases_archived_at ON public.insurance_cases(archived_at);
CREATE INDEX IF NOT EXISTS idx_case_persons_case_id ON public.case_persons(case_id);
CREATE INDEX IF NOT EXISTS idx_document_archive_case_id ON public.document_archive(case_id);
CREATE INDEX IF NOT EXISTS idx_document_archive_status ON public.document_archive(archive_status);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_name ON public.insurance_companies(name);
CREATE INDEX IF NOT EXISTS idx_insurer_communications_case_id ON public.insurer_communications(case_id);
CREATE INDEX IF NOT EXISTS idx_insurer_communications_status ON public.insurer_communications(status);

-- ============================================================================
-- 5. ADD TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_case_persons_updated_at 
    BEFORE UPDATE ON public.case_persons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_document_archive_updated_at 
    BEFORE UPDATE ON public.document_archive 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_insurance_companies_updated_at 
    BEFORE UPDATE ON public.insurance_companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================================

ALTER TABLE public.case_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurer_communications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Case persons policies
CREATE POLICY "Agents can view case persons" ON public.case_persons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.insurance_cases ic
        JOIN public.agents a ON ic.agent_id = a.id
        JOIN public.users u ON a.user_id = u.id
        WHERE ic.id = case_id AND u.auth_user_id = auth.uid()
    )
);

-- Document archive policies
CREATE POLICY "Agents can view document archive" ON public.document_archive FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.insurance_cases ic
        JOIN public.agents a ON ic.agent_id = a.id
        JOIN public.users u ON a.user_id = u.id
        WHERE ic.id = case_id AND u.auth_user_id = auth.uid()
    )
);

-- Insurance companies policies (agents and admins can view)
CREATE POLICY "Agents can view insurance companies" ON public.insurance_companies FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.auth_user_id = auth.uid() AND u.role IN ('agent', 'admin')
    )
);

-- Insurer communications policies
CREATE POLICY "Agents can view insurer communications" ON public.insurer_communications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.insurance_cases ic
        JOIN public.agents a ON ic.agent_id = a.id
        JOIN public.users u ON a.user_id = u.id
        WHERE ic.id = case_id AND u.auth_user_id = auth.uid()
    )
);

-- ============================================================================
-- 8. INSERT DEFAULT DATA FOR NEW FEATURES
-- ============================================================================

-- Insert Swiss insurance companies
INSERT INTO public.insurance_companies (name, email, contact_person) VALUES
('CSS Assurance', 'resiliation@css.ch', 'Service Résiliation'),
('Groupe Mutuel', 'resiliation@groupemutuel.ch', 'Service Client'),
('Allianz Suisse', 'resiliation@allianz.ch', 'Département Résiliation'),
('AXA Assurances', 'resiliation@axa.ch', 'Service Résiliation'),
('Zurich Assurances', 'resiliation@zurich.ch', 'Service Client'),
('Swica', 'resiliation@swica.ch', 'Service Résiliation'),
('Helsana', 'resiliation@helsana.ch', 'Service Client'),
('Sympany', 'resiliation@sympany.ch', 'Service Résiliation'),
('Sanitas', 'resiliation@sanitas.ch', 'Service Client'),
('KPT', 'resiliation@kpt.ch', 'Service Résiliation')
ON CONFLICT (name) DO NOTHING;

-- Update email templates for new eSignPro format
UPDATE public.email_templates 
SET 
    subject = 'eSignPro - Signature Électronique Sécurisée',
    body_html = '<html><body>
        <h2>Accéder à la signature sécurisée</h2>
        <p><strong>Lien personnel et sécurisé - Expire le 25.08.2025</strong></p>
        <p><strong>Sécurité garantie</strong></p>
        <p>Votre signature électronique a la même valeur juridique qu''une signature manuscrite selon la législation suisse (SCSE).</p>
        
        <p><strong>Processus de signature simplifié :</strong></p>
        <ul>
            <li>1. Cliquez sur le bouton de signature sécurisée</li>
            <li>2. Vérifiez et consultez vos documents</li>
            <li>3. Procédez à votre signature électronique</li>
            <li>4. Recevez la confirmation de signature</li>
        </ul>
        
        <p><a href="{{secure_link}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accéder à la signature sécurisée</a></p>
        
        <p>Cordialement,<br>
        wael hamda<br>
        Votre conseiller - eSignPro</p>
    </body></html>',
    body_text = 'Accéder à la signature sécurisée
    
Lien personnel et sécurisé - Expire le 25.08.2025
Sécurité garantie

Votre signature électronique a la même valeur juridique qu''une signature manuscrite selon la législation suisse (SCSE).

Processus de signature simplifié :
1. Cliquez sur le bouton de signature sécurisée
2. Vérifiez et consultez vos documents  
3. Procédez à votre signature électronique
4. Recevez la confirmation de signature

Lien: {{secure_link}}

Cordialement,
wael hamda
Votre conseiller - eSignPro'
WHERE template_type = 'client_invitation';

-- Add new system settings for enhanced features
INSERT INTO public.system_settings (key, value, description) VALUES
('document_retention_days', '2555', 'Number of days to retain documents (7 years)'),
('signature_expiry_hours', '168', 'Hours before signature link expires (7 days)'),
('max_identity_documents', '2', 'Maximum identity documents (front + back)'),
('max_insurance_documents', '5', 'Maximum insurance contract documents'),
('agent_default_name', 'wael hamda', 'Default agent name for communications'),
('company_name', 'eSignPro', 'Company name for branding'),
('support_email', 'support@esignpro.ch', 'Support email address'),
('support_phone', '+41 21 123 45 67', 'Support phone number')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_sequence INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 'RES-' || year_part || '-(.*)') AS INTEGER)), 0) + 1
    INTO next_sequence
    FROM public.insurance_cases
    WHERE case_number LIKE 'RES-' || year_part || '-%';
    
    sequence_part := LPAD(next_sequence::TEXT, 3, '0');
    
    RETURN 'RES-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to archive completed cases
CREATE OR REPLACE FUNCTION archive_completed_case(case_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    case_record RECORD;
BEGIN
    -- Get case information
    SELECT * INTO case_record FROM public.insurance_cases WHERE id = case_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update case status to archived
    UPDATE public.insurance_cases 
    SET 
        status = 'archived',
        archived_at = NOW(),
        updated_at = NOW()
    WHERE id = case_uuid;
    
    -- Create archive record
    INSERT INTO public.document_archive (case_id, archive_status, archived_at)
    VALUES (case_uuid, 'archived', NOW());
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'eSignPro database update completed successfully!';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '- Enhanced client data structure with separate nom/prenom fields';
    RAISE NOTICE '- Document archive system with insurer communication tracking';
    RAISE NOTICE '- Identity document separation (front/back)';
    RAISE NOTICE '- Insurance company contact management';
    RAISE NOTICE '- Updated email templates for eSignPro branding';
    RAISE NOTICE '- Helper functions for case management';
    RAISE NOTICE '';
    RAISE NOTICE 'Please verify all tables and data are correctly updated.';
END $$;
