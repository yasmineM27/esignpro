-- 🗃️ SCRIPT CORRIGÉ DE RÉINITIALISATION BASE DE DONNÉES ESIGNPRO
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
    auth_user_id UUID UNIQUE, -- Lien avec Supabase Auth
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
        status IN ('uploaded', 'processing', 'validated', 'rejected')
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
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE SET NULL,
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
    signature_data TEXT NOT NULL, -- Base64 encoded signature
    signature_metadata JSONB, -- Additional signature info
    ip_address INET,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true,
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
CREATE INDEX idx_insurance_cases_secure_token ON public.insurance_cases(secure_token);
CREATE INDEX idx_insurance_cases_status ON public.insurance_cases(status);
CREATE INDEX idx_client_documents_clientid ON public.client_documents(clientid);
CREATE INDEX idx_client_documents_token ON public.client_documents(token);
CREATE INDEX idx_client_documents_documenttype ON public.client_documents(documenttype);

-- ============================================================================
-- 6. CRÉATION DES FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour générer un token sécurisé
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SECURE_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 15));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. CRÉATION DES TRIGGERS
-- ============================================================================

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_cases_updated_at BEFORE UPDATE ON public.insurance_cases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON public.client_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 8. INSERTION DES DONNÉES DE BASE
-- ============================================================================

-- Paramètres système par défaut
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('app_name', 'eSignPro', 'Nom de l''application', true),
('app_version', '2.0.0', 'Version de l''application', true),
('max_file_size', '10485760', 'Taille maximale des fichiers en bytes (10MB)', false),
('allowed_file_types', 'pdf,jpg,jpeg,png', 'Types de fichiers autorisés', false),
('support_email', 'support@esignpro.ch', 'Email de support', true);

-- Utilisateur admin par défaut
INSERT INTO public.users (id, email, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@esignpro.ch', 'Admin', 'eSignPro', 'admin');

-- Agent par défaut
INSERT INTO public.agents (user_id, agent_code, department, is_supervisor) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ADMIN001', 'Administration', true);

-- ============================================================================
-- 9. CONFIGURATION DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur les tables sensibles
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour les documents clients (accès libre pour l'upload)
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow document upload" ON public.client_documents FOR ALL USING (true);

-- Politiques pour les paramètres système (lecture seule pour les paramètres publics)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings are readable" ON public.system_settings FOR SELECT USING (is_public = true);

-- ============================================================================
-- 10. VÉRIFICATION SIMPLE
-- ============================================================================

-- Compter les tables créées
SELECT 
    'Tables créées' as category,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Paramètres système' as category,
    COUNT(*) as count
FROM public.system_settings;

-- Message de fin
SELECT '🎉 BASE DE DONNÉES RÉINITIALISÉE AVEC SUCCÈS !' as message;
