-- Test data for eSignPro
-- Execute this after the main schema

-- Insert test users (Note: In production, these would be created through Supabase Auth)
-- For demo purposes, we'll create users without auth_user_id (you'll need to link them after auth signup)

-- Admin user
INSERT INTO public.users (id, email, first_name, last_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'yasminemassaoudi27@gmail.com', 'Yasmine', 'Massaoudi', '+41 79 123 45 67', 'admin');

-- Agent users
INSERT INTO public.users (id, email, first_name, last_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'wael.hamda@esignpro.ch', 'Wael', 'Hamda', '+41 79 234 56 78', 'agent'),
('550e8400-e29b-41d4-a716-446655440003', 'sophie.martin@esignpro.ch', 'Sophie', 'Martin', '+41 79 345 67 89', 'agent'),
('550e8400-e29b-41d4-a716-446655440004', 'marc.dubois@esignpro.ch', 'Marc', 'Dubois', '+41 79 456 78 90', 'agent');

-- Client users
INSERT INTO public.users (id, email, first_name, last_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'marie.dubois@email.com', 'Marie', 'Dubois', '+41 79 567 89 01', 'client'),
('550e8400-e29b-41d4-a716-446655440006', 'jean.martin@email.com', 'Jean', 'Martin', '+41 79 678 90 12', 'client'),
('550e8400-e29b-41d4-a716-446655440007', 'anna.mueller@email.com', 'Anna', 'Mueller', '+41 79 789 01 23', 'client'),
('550e8400-e29b-41d4-a716-446655440008', 'pierre.bernard@email.com', 'Pierre', 'Bernard', '+41 79 890 12 34', 'client'),
('550e8400-e29b-41d4-a716-446655440009', 'yasminemassoudi26@gmail.com', 'Test', 'Client', '+41 79 901 23 45', 'client');

-- Insert agents
INSERT INTO public.agents (id, user_id, agent_code, department, is_supervisor) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'AG001', 'Résiliations Auto', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'AG002', 'Résiliations Habitation', false),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'AG003', 'Résiliations Vie', false);

-- Insert clients
INSERT INTO public.clients (id, user_id, client_number, date_of_birth, address_line1, city, postal_code, country) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'CL001', '1985-03-15', 'Rue de la Paix 12', 'Genève', '1201', 'Switzerland'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'CL002', '1978-07-22', 'Avenue des Alpes 45', 'Lausanne', '1003', 'Switzerland'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'CL003', '1992-11-08', 'Bahnhofstrasse 123', 'Zurich', '8001', 'Switzerland'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 'CL004', '1980-05-30', 'Rue du Rhône 67', 'Genève', '1204', 'Switzerland'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440009', 'CL005', '1990-12-01', 'Test Address 1', 'Bern', '3000', 'Switzerland');

-- Insert insurance cases
INSERT INTO public.insurance_cases (
    id, case_number, client_id, agent_id, insurance_type, insurance_company, 
    policy_number, status, title, description, priority, secure_token, token_expires_at
) VALUES
-- Active cases
('880e8400-e29b-41d4-a716-446655440001', 'CASE-2024-001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 
 'auto', 'AXA Assurances', 'POL-AUTO-123456', 'pending_documents', 
 'Résiliation Assurance Auto - Marie Dubois', 'Résiliation suite à vente du véhicule', 2, 
 'secure-token-123', '2024-12-31 23:59:59'),

('880e8400-e29b-41d4-a716-446655440002', 'CASE-2024-002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 
 'home', 'Zurich Assurances', 'POL-HOME-789012', 'documents_uploaded', 
 'Résiliation Assurance Habitation - Jean Martin', 'Déménagement à l\'étranger', 3, 
 'secure-token-456', '2024-12-31 23:59:59'),

('880e8400-e29b-41d4-a716-446655440003', 'CASE-2024-003', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 
 'auto', 'Mobilière Suisse', 'POL-AUTO-345678', 'pending_signature', 
 'Résiliation Assurance Auto - Anna Mueller', 'Changement d\'assureur', 1, 
 'secure-token-789', '2024-12-31 23:59:59'),

('880e8400-e29b-41d4-a716-446655440004', 'CASE-2024-004', '770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 
 'life', 'Swiss Life', 'POL-LIFE-901234', 'signed', 
 'Résiliation Assurance Vie - Pierre Bernard', 'Réduction de couverture', 2, 
 'secure-token-012', '2024-12-31 23:59:59'),

-- Demo case for testing
('880e8400-e29b-41d4-a716-446655440005', 'CASE-2024-005', '770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 
 'home', 'Demo Insurance', 'POL-DEMO-555', 'pending_documents', 
 'Résiliation Assurance Habitation - Demo', 'Cas de démonstration', 1, 
 'demo-signature-token', '2024-12-31 23:59:59'),

-- Completed cases for statistics
('880e8400-e29b-41d4-a716-446655440006', 'CASE-2024-006', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 
 'auto', 'Generali', 'POL-AUTO-111', 'completed', 
 'Résiliation Assurance Auto - Terminé', 'Cas terminé avec succès', 1, 
 NULL, NULL),

('880e8400-e29b-41d4-a716-446655440007', 'CASE-2024-007', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 
 'home', 'Helvetia', 'POL-HOME-222', 'completed', 
 'Résiliation Assurance Habitation - Terminé', 'Cas terminé avec succès', 1, 
 NULL, NULL);

-- Insert some test documents
INSERT INTO public.documents (case_id, uploaded_by, document_type, file_name, file_path, file_size, mime_type, is_verified) VALUES
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'identity_front', 'id_front.jpg', 'documents/case-002/id_front.jpg', 245760, 'image/jpeg', true),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'identity_back', 'id_back.jpg', 'documents/case-002/id_back.jpg', 198432, 'image/jpeg', true),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'identity_front', 'passport.pdf', 'documents/case-003/passport.pdf', 512000, 'application/pdf', true);

-- Insert test signatures
INSERT INTO public.signatures (case_id, signer_id, signature_data, ip_address, signed_at) VALUES
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '192.168.1.100', NOW() - INTERVAL '2 days');

-- Insert test email logs
INSERT INTO public.email_logs (case_id, recipient_email, sender_email, subject, status, sent_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'marie.dubois@email.com', 'noreply@esignpro.ch', 'Finalisation de votre dossier de résiliation', 'sent', NOW() - INTERVAL '1 day'),
('880e8400-e29b-41d4-a716-446655440002', 'jean.martin@email.com', 'noreply@esignpro.ch', 'Finalisation de votre dossier de résiliation', 'delivered', NOW() - INTERVAL '3 days'),
('880e8400-e29b-41d4-a716-446655440003', 'anna.mueller@email.com', 'noreply@esignpro.ch', 'Rappel: Documents requis', 'sent', NOW() - INTERVAL '1 hour');

-- Insert test notifications
INSERT INTO public.notifications (user_id, case_id, type, title, message) VALUES
('550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'system', 'Nouveau dossier assigné', 'Un nouveau dossier de résiliation vous a été assigné.'),
('550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'email', 'Email de finalisation envoyé', 'Votre lien de finalisation a été envoyé par email.'),
('550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 'system', 'Documents reçus', 'Les documents d\'identité ont été reçus et vérifiés.');

-- Insert audit logs
INSERT INTO public.audit_logs (user_id, case_id, action, entity_type, entity_id, new_values, ip_address) VALUES
('550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'CREATE', 'insurance_case', '880e8400-e29b-41d4-a716-446655440001', '{"status": "draft", "title": "Résiliation Assurance Auto - Marie Dubois"}', '192.168.1.50'),
('550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'insurance_case', '880e8400-e29b-41d4-a716-446655440001', '{"status": "pending_documents"}', '192.168.1.100'),
('550e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', 'UPLOAD', 'document', NULL, '{"document_type": "identity_front", "file_name": "id_front.jpg"}', '192.168.1.101');

-- Create some additional completed cases for better statistics (past 6 months)
DO $$
DECLARE
    i INTEGER;
    random_client_id UUID;
    random_agent_id UUID;
    random_date TIMESTAMP;
    case_types TEXT[] := ARRAY['auto', 'home', 'life'];
    companies TEXT[] := ARRAY['AXA', 'Zurich', 'Mobilière', 'Swiss Life', 'Generali', 'Helvetia'];
BEGIN
    FOR i IN 1..150 LOOP
        -- Random client
        SELECT id INTO random_client_id FROM public.clients ORDER BY RANDOM() LIMIT 1;
        -- Random agent
        SELECT id INTO random_agent_id FROM public.agents ORDER BY RANDOM() LIMIT 1;
        -- Random date in past 6 months
        random_date := NOW() - (RANDOM() * INTERVAL '180 days');
        
        INSERT INTO public.insurance_cases (
            case_number, client_id, agent_id, insurance_type, insurance_company,
            policy_number, status, title, description, priority,
            created_at, updated_at, actual_completion_date
        ) VALUES (
            'CASE-HIST-' || LPAD(i::TEXT, 3, '0'),
            random_client_id,
            random_agent_id,
            case_types[1 + (RANDOM() * 2)::INTEGER],
            companies[1 + (RANDOM() * 5)::INTEGER],
            'POL-HIST-' || LPAD(i::TEXT, 6, '0'),
            'completed',
            'Résiliation Historique ' || i,
            'Cas historique pour statistiques',
            1 + (RANDOM() * 3)::INTEGER,
            random_date,
            random_date + INTERVAL '7 days',
            random_date + INTERVAL '7 days'
        );
    END LOOP;
END $$;

-- Update case counts for better demo
UPDATE public.insurance_cases SET status = 'completed' WHERE case_number LIKE 'CASE-HIST-%';

-- Create a view for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.insurance_cases WHERE status IN ('pending_documents', 'documents_uploaded', 'pending_signature', 'signed')) as active_cases,
    (SELECT COUNT(*) FROM public.insurance_cases WHERE status = 'pending_documents') as pending_documents,
    (SELECT COUNT(*) FROM public.insurance_cases WHERE status = 'completed') as completed_cases,
    (SELECT COUNT(*) FROM public.users WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM public.users WHERE role = 'agent') as total_agents,
    (SELECT COUNT(*) FROM public.email_logs WHERE status = 'sent' AND sent_at > NOW() - INTERVAL '30 days') as emails_sent_month;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.dashboard_stats TO authenticated;
