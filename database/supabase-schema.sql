-- eSignPro Database Schema for Supabase
-- Execute this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'client');
CREATE TYPE case_status AS ENUM ('draft', 'pending_documents', 'documents_uploaded', 'pending_signature', 'signed', 'completed', 'cancelled');
CREATE TYPE document_type AS ENUM ('identity_front', 'identity_back', 'insurance_document', 'signature', 'additional');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'system');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table (for additional agent-specific data)
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    agent_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    supervisor_id UUID REFERENCES public.agents(id),
    is_supervisor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_number VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Switzerland',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance cases table
CREATE TABLE public.insurance_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id),
    insurance_type VARCHAR(100) NOT NULL, -- 'auto', 'home', 'life', etc.
    insurance_company VARCHAR(255),
    policy_number VARCHAR(100),
    status case_status DEFAULT 'draft',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
    estimated_completion_date DATE,
    actual_completion_date DATE,
    secure_token VARCHAR(255) UNIQUE, -- for secure client access
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id),
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- Supabase Storage path
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'client_invitation', 'reminder', 'completion', etc.
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id),
    template_id UUID REFERENCES public.email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT,
    body_text TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    external_id VARCHAR(255), -- Resend message ID
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures table
CREATE TABLE public.signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.insurance_cases(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES public.users(id),
    signature_data TEXT NOT NULL, -- Base64 encoded signature image
    ip_address INET,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.insurance_cases(id),
    type notification_type DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    case_id UUID REFERENCES public.insurance_cases(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_insurance_cases_client_id ON public.insurance_cases(client_id);
CREATE INDEX idx_insurance_cases_agent_id ON public.insurance_cases(agent_id);
CREATE INDEX idx_insurance_cases_status ON public.insurance_cases(status);
CREATE INDEX idx_insurance_cases_secure_token ON public.insurance_cases(secure_token);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_email_logs_case_id ON public.email_logs(case_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_signatures_case_id ON public.signatures(case_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_case_id ON public.audit_logs(case_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_cases_updated_at BEFORE UPDATE ON public.insurance_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your needs)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_user_id);

-- Agents can view their assigned cases
CREATE POLICY "Agents can view assigned cases" ON public.insurance_cases FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.agents a 
        JOIN public.users u ON a.user_id = u.id 
        WHERE u.auth_user_id = auth.uid() AND a.id = agent_id
    )
);

-- Clients can view their own cases
CREATE POLICY "Clients can view own cases" ON public.insurance_cases FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.clients c 
        JOIN public.users u ON c.user_id = u.id 
        WHERE u.auth_user_id = auth.uid() AND c.id = client_id
    )
);

-- Admins can view everything (you'll need to create admin policies)
CREATE POLICY "Admins can view all" ON public.users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('site_name', 'eSignPro', 'Application name'),
('max_file_size_mb', '10', 'Maximum file size in MB'),
('session_timeout_minutes', '480', 'Session timeout in minutes'),
('allowed_file_types', 'image/jpeg,image/png,application/pdf', 'Allowed file MIME types'),
('email_from_address', 'noreply@esignpro.ch', 'Default from email address'),
('email_from_name', 'eSignPro', 'Default from name for emails');

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body_html, body_text, template_type) VALUES
(
    'Client Invitation',
    'Finalisation de votre dossier de résiliation - Action requise',
    '<html><body><h2>Bonjour {{client_name}},</h2><p>Votre dossier de résiliation est prêt pour finalisation.</p><p><a href="{{secure_link}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Finaliser mon dossier</a></p><p>Ce lien expire le {{expiry_date}}.</p><p>Cordialement,<br>{{agent_name}}<br>eSignPro</p></body></html>',
    'Bonjour {{client_name}}, Votre dossier de résiliation est prêt. Cliquez sur ce lien: {{secure_link}} Ce lien expire le {{expiry_date}}. Cordialement, {{agent_name}}',
    'client_invitation'
),
(
    'Document Reminder',
    'Rappel: Documents requis pour votre dossier',
    '<html><body><h2>Rappel important</h2><p>Bonjour {{client_name}},</p><p>Nous attendons toujours vos documents pour finaliser votre dossier.</p><p><a href="{{secure_link}}">Télécharger mes documents</a></p></body></html>',
    'Rappel: Nous attendons vos documents. Lien: {{secure_link}}',
    'reminder'
),
(
    'Completion Confirmation',
    'Votre dossier de résiliation a été traité',
    '<html><body><h2>Dossier terminé</h2><p>Bonjour {{client_name}},</p><p>Votre dossier de résiliation a été traité avec succès.</p><p>Vous recevrez une confirmation de votre assureur sous 48h.</p></body></html>',
    'Votre dossier de résiliation a été traité avec succès.',
    'completion'
);
