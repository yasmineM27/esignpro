-- 🗃️ SCRIPT COMPLET DE RÉINITIALISATION BASE DE DONNÉES ESIGNPRO
-- ⚠️ ATTENTION: Ce script supprime TOUTES les données existantes
-- À exécuter dans Supabase SQL Editor
-- ============================================================================
-- 1. SUPPRESSION DE TOUTES LES TABLES EXISTANTES
-- ============================================================================
-- Désactiver les contraintes de clés étrangères temporairement
SET session_replication_role = replica;
-- Supprimer toutes les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.signatures CASCADE;
DROP TABLE IF EXISTS public.final_documents CASCADE;
DROP TABLE IF EXISTS public.signature_logs CASCADE;
DROP TABLE IF EXISTS public.client_documents CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.insurance_cases CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
-- Supprimer les vues
DROP VIEW IF EXISTS public.unified_portal_data CASCADE;
DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.orphan_emails CASCADE;
DROP VIEW IF EXISTS public.data_health_stats CASCADE;
-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.create_missing_case(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.fix_recent_orphan_emails() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.generate_secure_token() CASCADE;
DROP FUNCTION IF EXISTS public.create_audit_log(TEXT, TEXT, JSONB, UUID) CASCADE;
-- Supprimer les types personnalisés
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.case_status CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
-- Réactiver les contraintes
SET session_replication_role = DEFAULT;
-- ============================================================================
-- 2. CRÉATION DES EXTENSIONS NÉCESSAIRES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================================================
-- 3. CRÉATION DES TYPES PERSONNALISÉS
-- ============================================================================
CREATE TYPE public.user_role AS ENUM ('admin', 'agent', 'client');
CREATE TYPE public.case_status AS ENUM (
    'draft',
    'email_sent',
    'documents_uploaded',
    'document_reviewed',
    'pending_signature',
    'signed',
    'completed',
    'cancelled',
    'expired'
);
CREATE TYPE public.document_type AS ENUM (
    'identity_front',
    'identity_back',
    'insurance_contract',
    'proof_address',
    'bank_statement',
    'additional',
    'insurance_document',
    'signature',
    'final_document'
);
CREATE TYPE public.notification_type AS ENUM ('email', 'sms', 'system');
-- ============================================================================
-- 4. CRÉATION DES TABLES PRINCIPALES
-- ============================================================================
-- Table des utilisateurs
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    -- Lien avec Supabase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role public.user_role NOT NULL DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des agents
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    agent_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    supervisor_id UUID REFERENCES public.agents(id),
    is_supervisor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    client_code VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Suisse',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des dossiers d'assurance
CREATE TABLE public.insurance_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id),
    secure_token VARCHAR(255) UNIQUE NOT NULL,
    status public.case_status DEFAULT 'draft',
    insurance_company VARCHAR(255),
    policy_number VARCHAR(100),
    policy_type VARCHAR(100),
    termination_date DATE,
    reason_for_termination TEXT,
    signature_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    final_document_url TEXT,
    final_document_generated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des documents (ancienne structure)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id),
    document_type public.document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des documents clients (nouvelle structure simplifiée)
CREATE TABLE public.client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- Table des modèles d'email
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    template_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des logs d'emails
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE
    SET NULL,
        recipient_email VARCHAR(255) NOT NULL,
        sender_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body_html TEXT,
        body_text TEXT,
        email_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des signatures
CREATE TABLE public.signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES public.users(id),
    signature_data TEXT NOT NULL,
    -- Base64 encoded signature
    signature_metadata JSONB,
    -- Additional signature info
    ip_address INET,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des logs de signature
CREATE TABLE public.signature_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    signature_data JSONB NOT NULL,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    agent_name VARCHAR(255),
    agent_email VARCHAR(255),
    document_type VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT TRUE,
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des documents finaux
CREATE TABLE public.final_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    signature_included BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des logs d'audit
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table des paramètres système
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================================
-- 5. CRÉATION DES INDEX POUR OPTIMISER LES PERFORMANCES
-- ============================================================================
-- Index sur les tables principales
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_agent_code ON public.agents(agent_code);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_client_code ON public.clients(client_code);
CREATE INDEX idx_insurance_cases_client_id ON public.insurance_cases(client_id);
CREATE INDEX idx_insurance_cases_agent_id ON public.insurance_cases(agent_id);
CREATE INDEX idx_insurance_cases_secure_token ON public.insurance_cases(secure_token);
CREATE INDEX idx_insurance_cases_status ON public.insurance_cases(status);
CREATE INDEX idx_insurance_cases_case_number ON public.insurance_cases(case_number);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_document_type ON public.documents(document_type);
CREATE INDEX idx_client_documents_clientid ON public.client_documents(clientid);
CREATE INDEX idx_client_documents_token ON public.client_documents(token);
CREATE INDEX idx_client_documents_documenttype ON public.client_documents(documenttype);
CREATE INDEX idx_client_documents_uploaddate ON public.client_documents(uploaddate);
CREATE INDEX idx_email_logs_case_id ON public.email_logs(case_id);
CREATE INDEX idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_signatures_case_id ON public.signatures(case_id);
CREATE INDEX idx_signature_logs_case_id ON public.signature_logs(case_id);
CREATE INDEX idx_final_documents_case_id ON public.final_documents(case_id);
-- ============================================================================
-- 6. CRÉATION DES FONCTIONS UTILITAIRES
-- ============================================================================
-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Fonction pour générer un token sécurisé
CREATE OR REPLACE FUNCTION public.generate_secure_token() RETURNS TEXT AS $$ BEGIN RETURN 'SECURE_' || EXTRACT(
        EPOCH
        FROM NOW()
    )::BIGINT || '_' || LOWER(
        SUBSTRING(
            MD5(RANDOM()::TEXT)
            FROM 1 FOR 15
        )
    );
END;
$$ LANGUAGE plpgsql;
-- Fonction pour créer un log d'audit
CREATE OR REPLACE FUNCTION public.create_audit_log(
        p_action TEXT,
        p_table_name TEXT,
        p_new_values JSONB DEFAULT NULL,
        p_user_id UUID DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE log_id UUID;
BEGIN
INSERT INTO public.audit_logs (user_id, action, table_name, new_values)
VALUES (p_user_id, p_action, p_table_name, p_new_values)
RETURNING id INTO log_id;
RETURN log_id;
END;
$$ LANGUAGE plpgsql;
-- Fonction pour créer automatiquement un dossier manquant
CREATE OR REPLACE FUNCTION public.create_missing_case(p_case_id UUID) RETURNS UUID AS $$
DECLARE new_case_id UUID;
default_user_id UUID;
default_client_id UUID;
BEGIN -- Créer un utilisateur par défaut si nécessaire
INSERT INTO public.users (email, first_name, last_name, role)
VALUES (
        'orphan@esignpro.ch',
        'Dossier',
        'Orphelin',
        'client'
    ) ON CONFLICT (email) DO NOTHING
RETURNING id INTO default_user_id;
-- Si l'utilisateur existe déjà, récupérer son ID
IF default_user_id IS NULL THEN
SELECT id INTO default_user_id
FROM public.users
WHERE email = 'orphan@esignpro.ch';
END IF;
-- Créer un client par défaut
INSERT INTO public.clients (user_id)
VALUES (default_user_id) ON CONFLICT (user_id) DO NOTHING
RETURNING id INTO default_client_id;
-- Si le client existe déjà, récupérer son ID
IF default_client_id IS NULL THEN
SELECT id INTO default_client_id
FROM public.clients
WHERE user_id = default_user_id;
END IF;
-- Créer le dossier manquant
INSERT INTO public.insurance_cases (
        id,
        case_number,
        client_id,
        secure_token,
        status,
        insurance_company,
        policy_number
    )
VALUES (
        p_case_id,
        'ORPHAN-' || EXTRACT(
            EPOCH
            FROM NOW()
        )::BIGINT,
        default_client_id,
        'orphan_token_' || p_case_id,
        'draft',
        'Dossier Orphelin - À Corriger',
        'ORPHAN-001'
    ) ON CONFLICT (id) DO NOTHING
RETURNING id INTO new_case_id;
RETURN COALESCE(new_case_id, p_case_id);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 7. CRÉATION DES TRIGGERS
-- ============================================================================
-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE
UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE
UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_cases_updated_at BEFORE
UPDATE ON public.insurance_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE
UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_documents_updated_at BEFORE
UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE
UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE
UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ============================================================================
-- 8. CRÉATION DES VUES UTILES
-- ============================================================================
-- Vue pour les données unifiées du portail
CREATE OR REPLACE VIEW public.unified_portal_data AS
SELECT ic.id as case_id,
    ic.case_number,
    ic.secure_token,
    ic.status,
    ic.insurance_company,
    ic.policy_number,
    ic.signature_data,
    ic.completed_at,
    ic.final_document_url,
    ic.expires_at,
    ic.created_at as case_created_at,
    -- Données client
    u.first_name as client_first_name,
    u.last_name as client_last_name,
    u.email as client_email,
    u.phone as client_phone,
    c.address as client_address,
    c.city as client_city,
    -- Données agent
    au.first_name as agent_first_name,
    au.last_name as agent_last_name,
    au.email as agent_email,
    a.agent_code,
    -- Statistiques documents
    (
        SELECT COUNT(*)
        FROM public.client_documents cd
        WHERE cd.token = ic.secure_token
    ) as total_documents,
    (
        SELECT COUNT(*)
        FROM public.client_documents cd
        WHERE cd.token = ic.secure_token
            AND cd.documenttype IN (
                'identity_front',
                'identity_back',
                'insurance_contract'
            )
    ) as required_documents,
    -- Dernière activité
    GREATEST(
        ic.updated_at,
        COALESCE(
            (
                SELECT MAX(cd.uploaddate)
                FROM public.client_documents cd
                WHERE cd.token = ic.secure_token
            ),
            ic.updated_at
        )
    ) as last_activity
FROM public.insurance_cases ic
    LEFT JOIN public.clients c ON ic.client_id = c.id
    LEFT JOIN public.users u ON c.user_id = u.id
    LEFT JOIN public.agents ag ON ic.agent_id = ag.id
    LEFT JOIN public.users au ON ag.user_id = au.id
    LEFT JOIN public.agents a ON ic.agent_id = a.id;
-- Vue pour les statistiques du dashboard
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT (
        SELECT COUNT(*)
        FROM public.insurance_cases
        WHERE status IN (
                'email_sent',
                'documents_uploaded',
                'document_reviewed',
                'pending_signature',
                'signed'
            )
    ) as active_cases,
    (
        SELECT COUNT(*)
        FROM public.insurance_cases
        WHERE status = 'email_sent'
    ) as pending_documents,
    (
        SELECT COUNT(*)
        FROM public.insurance_cases
        WHERE status = 'completed'
    ) as completed_cases,
    (
        SELECT COUNT(*)
        FROM public.users
        WHERE role = 'client'
    ) as total_clients,
    (
        SELECT COUNT(*)
        FROM public.users
        WHERE role = 'agent'
    ) as total_agents,
    (
        SELECT COUNT(*)
        FROM public.email_logs
        WHERE status = 'sent'
            AND sent_at > NOW() - INTERVAL '30 days'
    ) as emails_sent_month,
    (
        SELECT COUNT(*)
        FROM public.client_documents
        WHERE uploaddate > NOW() - INTERVAL '7 days'
    ) as documents_uploaded_week;
-- Vue pour détecter les emails orphelins
CREATE OR REPLACE VIEW public.orphan_emails AS
SELECT el.id as email_id,
    el.case_id,
    el.recipient_email,
    el.subject,
    el.email_type,
    el.status,
    el.created_at as email_created_at,
    CASE
        WHEN el.created_at > NOW() - INTERVAL '1 hour' THEN 'URGENT'
        WHEN el.created_at > NOW() - INTERVAL '24 hours' THEN 'HIGH'
        WHEN el.created_at > NOW() - INTERVAL '7 days' THEN 'MEDIUM'
        ELSE 'LOW'
    END as priority
FROM public.email_logs el
    LEFT JOIN public.insurance_cases ic ON el.case_id = ic.id
WHERE ic.id IS NULL
    AND el.case_id IS NOT NULL;
-- ============================================================================
-- 9. INSERTION DES DONNÉES DE BASE
-- ============================================================================
-- Paramètres système par défaut
INSERT INTO public.system_settings (key, value, description, is_public)
VALUES (
        'app_name',
        'eSignPro',
        'Nom de l''application',
        true
    ),
    (
        'app_version',
        '2.0.0',
        'Version de l''application',
        true
    ),
    (
        'max_file_size',
        '10485760',
        'Taille maximale des fichiers en bytes (10MB)',
        false
    ),
    (
        'allowed_file_types',
        'pdf,jpg,jpeg,png',
        'Types de fichiers autorisés',
        false
    ),
    (
        'token_expiry_days',
        '30',
        'Durée de validité des tokens en jours',
        false
    ),
    (
        'email_from',
        'noreply@esignpro.ch',
        'Adresse email d''envoi',
        false
    ),
    (
        'company_name',
        'eSignPro',
        'Nom de l''entreprise',
        true
    ),
    (
        'support_email',
        'support@esignpro.ch',
        'Email de support',
        true
    );
-- Modèles d'email par défaut
INSERT INTO public.email_templates (
        name,
        subject,
        body_html,
        body_text,
        template_type
    )
VALUES (
        'Client Invitation',
        'Finalisation de votre dossier - Action requise',
        '<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">eSignPro</h1>
            <p style="color: #666; margin: 5px 0;">Signature Électronique Sécurisée</p>
        </div>

        <h2 style="color: #1f2937;">Bonjour {{client_name}},</h2>

        <p>Votre dossier de résiliation d''assurance est prêt pour finalisation.</p>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Numéro de dossier :</strong> {{case_number}}</p>
            <p><strong>Compagnie d''assurance :</strong> {{insurance_company}}</p>
            <p><strong>Conseiller :</strong> {{agent_name}}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{secure_link}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Finaliser mon dossier
            </a>
        </div>

        <div style="background: #fef3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Important :</strong> Ce lien expire le {{expiry_date}}.</p>
        </div>

        <p>Si vous avez des questions, n''hésitez pas à contacter votre conseiller.</p>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
            <p>Cordialement,<br>{{agent_name}}<br>eSignPro</p>
            <p style="font-size: 12px;">Signature électronique conforme à la législation suisse (SCSE)</p>
        </div>
    </div>
    </body></html>',
        'Bonjour {{client_name}}, votre dossier de résiliation est prêt. Cliquez sur le lien pour finaliser : {{secure_link}}. Ce lien expire le {{expiry_date}}. Cordialement, {{agent_name}} - eSignPro',
        'client_invitation'
    ),
    (
        'Document Completion',
        'Votre dossier a été finalisé avec succès',
        '<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0;">✅ Dossier Finalisé</h1>
        </div>

        <h2>Bonjour {{client_name}},</h2>

        <p>Votre dossier de résiliation a été finalisé avec succès !</p>

        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Numéro de dossier :</strong> {{case_number}}</p>
            <p><strong>Date de finalisation :</strong> {{completion_date}}</p>
            <p><strong>Statut :</strong> Terminé</p>
        </div>

        <p>Votre dossier sera transmis à votre compagnie d''assurance dans les 24h.</p>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
            <p>Merci de votre confiance,<br>L''équipe eSignPro</p>
        </div>
    </div>
    </body></html>',
        'Bonjour {{client_name}}, votre dossier {{case_number}} a été finalisé avec succès le {{completion_date}}. Merci de votre confiance. - eSignPro',
        'completion_notification'
    );
-- Utilisateur admin par défaut
INSERT INTO public.users (id, email, first_name, last_name, role)
VALUES (
        '550e8400-e29b-41d4-a716-446655440001',
        'admin@esignpro.ch',
        'Admin',
        'eSignPro',
        'admin'
    );
-- Agent par défaut
INSERT INTO public.agents (user_id, agent_code, department, is_supervisor)
VALUES (
        '550e8400-e29b-41d4-a716-446655440001',
        'ADMIN001',
        'Administration',
        true
    );
-- ============================================================================
-- 10. CONFIGURATION DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================================================
-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
-- Politiques pour les utilisateurs (les admins voient tout)
CREATE POLICY "Users can view their own data" ON public.users FOR
SELECT USING (
        auth.uid() = auth_user_id
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE auth_user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- Politiques pour les dossiers d'assurance
CREATE POLICY "Users can view related cases" ON public.insurance_cases FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE auth_user_id = auth.uid()
                AND role = 'admin'
        )
        OR client_id IN (
            SELECT id
            FROM public.clients
            WHERE user_id IN (
                    SELECT id
                    FROM public.users
                    WHERE auth_user_id = auth.uid()
                )
        )
        OR agent_id IN (
            SELECT id
            FROM public.agents
            WHERE user_id IN (
                    SELECT id
                    FROM public.users
                    WHERE auth_user_id = auth.uid()
                )
        )
    );
-- Politiques pour les documents clients (accès libre pour l'upload)
CREATE POLICY "Allow document upload" ON public.client_documents FOR ALL USING (true);
-- Politiques pour les paramètres système (lecture seule pour les paramètres publics)
CREATE POLICY "Public settings are readable" ON public.system_settings FOR
SELECT USING (
        is_public = true
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE auth_user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- ============================================================================
-- 11. VÉRIFICATION ET RÉSUMÉ
-- ============================================================================
-- Vérifier que toutes les tables ont été créées
DO $$
DECLARE table_count INTEGER;
expected_tables TEXT [] := ARRAY [
        'users', 'agents', 'clients', 'insurance_cases', 'documents',
        'client_documents', 'email_templates', 'email_logs', 'signatures',
        'signature_logs', 'final_documents', 'notifications', 'audit_logs', 'system_settings'
    ];
missing_table TEXT;
BEGIN
SELECT COUNT(*) INTO table_count
FROM information_schema.tables t
WHERE t.table_schema = 'public'
    AND t.table_name = ANY(expected_tables);
IF table_count = array_length(expected_tables, 1) THEN RAISE NOTICE '✅ Toutes les tables ont été créées avec succès (%/% tables)',
table_count,
array_length(expected_tables, 1);
ELSE RAISE NOTICE '⚠️ Attention: %/% tables créées',
table_count,
array_length(expected_tables, 1);
-- Lister les tables manquantes
FOR missing_table IN
SELECT unnest(expected_tables)
EXCEPT
SELECT t.table_name
FROM information_schema.tables t
WHERE t.table_schema = 'public' LOOP RAISE NOTICE '❌ Table manquante: %',
    missing_table;
END LOOP;
END IF;
END $$;
-- Afficher un résumé des données créées
SELECT 'Tables créées' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT 'Vues créées' as category,
    COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT 'Fonctions créées' as category,
    COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
UNION ALL
SELECT 'Triggers créés' as category,
    COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 'Paramètres système' as category,
    COUNT(*) as count
FROM public.system_settings
UNION ALL
SELECT 'Modèles d''email' as category,
    COUNT(*) as count
FROM public.email_templates;
-- Message de fin
DO $$ BEGIN RAISE NOTICE '';
RAISE NOTICE '🎉 ============================================================================';
RAISE NOTICE '🎉 BASE DE DONNÉES ESIGNPRO RÉINITIALISÉE AVEC SUCCÈS !';
RAISE NOTICE '🎉 ============================================================================';
RAISE NOTICE '';
RAISE NOTICE '📋 RÉSUMÉ DES FONCTIONNALITÉS :';
RAISE NOTICE '   ✅ 14 tables principales créées';
RAISE NOTICE '   ✅ 3 vues utilitaires (unified_portal_data, dashboard_stats, orphan_emails)';
RAISE NOTICE '   ✅ 4 fonctions utilitaires (tokens, audit, réparation)';
RAISE NOTICE '   ✅ 8 triggers automatiques (updated_at)';
RAISE NOTICE '   ✅ Index optimisés pour les performances';
RAISE NOTICE '   ✅ Politiques RLS configurées';
RAISE NOTICE '   ✅ Données de base insérées';
RAISE NOTICE '';
RAISE NOTICE '🔧 PROCHAINES ÉTAPES :';
RAISE NOTICE '   1. Vérifier que l''application se connecte correctement';
RAISE NOTICE '   2. Tester l''upload de documents sur la page client-portal';
RAISE NOTICE '   3. Créer des utilisateurs via l''interface admin';
RAISE NOTICE '';
RAISE NOTICE '🌐 PAGES À TESTER :';
RAISE NOTICE '   • https://esignpro.ch/client-portal/SECURE_1758909118460_202mix6qtsh';
RAISE NOTICE '   • http://localhost:3000/client-portal/SECURE_1758909118460_202mix6qtsh';
RAISE NOTICE '';
RAISE NOTICE '📧 CONTACT ADMIN : admin@esignpro.ch';
RAISE NOTICE '🔑 CODE AGENT : ADMIN001';
RAISE NOTICE '';
END $$;