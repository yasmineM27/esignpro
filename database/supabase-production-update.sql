-- eSignPro Production Database Update Script
-- Execute this script in your Supabase SQL Editor to fix UUID issues and update schema

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. UPDATE EXISTING DATA WITH INVALID UUIDs
-- ============================================================================

-- Check for invalid UUIDs in insurance_cases table
DO $$
BEGIN
    -- Update any non-UUID case IDs to proper UUIDs
    UPDATE public.insurance_cases 
    SET id = uuid_generate_v4()
    WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Update any non-UUID client IDs to proper UUIDs
    UPDATE public.clients 
    SET id = uuid_generate_v4()
    WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Update any non-UUID user IDs to proper UUIDs
    UPDATE public.users 
    SET id = uuid_generate_v4()
    WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    RAISE NOTICE 'Updated invalid UUIDs in database tables';
END $$;

-- ============================================================================
-- 3. ENSURE PROPER UUID CONSTRAINTS
-- ============================================================================

-- Add UUID validation constraints if they don't exist
DO $$
BEGIN
    -- Add constraint to insurance_cases.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'insurance_cases_id_uuid_check' 
        AND table_name = 'insurance_cases'
    ) THEN
        ALTER TABLE public.insurance_cases 
        ADD CONSTRAINT insurance_cases_id_uuid_check 
        CHECK (id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
    END IF;
    
    -- Add constraint to clients.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'clients_id_uuid_check' 
        AND table_name = 'clients'
    ) THEN
        ALTER TABLE public.clients 
        ADD CONSTRAINT clients_id_uuid_check 
        CHECK (id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
    END IF;
    
    RAISE NOTICE 'Added UUID validation constraints';
END $$;

-- ============================================================================
-- 4. UPDATE SECURE TOKEN GENERATION
-- ============================================================================

-- Create function to generate secure tokens using proper UUIDs
CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS TEXT AS $$
BEGIN
    -- Generate UUID and remove hyphens for secure token
    RETURN REPLACE(uuid_generate_v4()::TEXT, '-', '');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CLEAN UP INVALID CASE NUMBERS AND TOKENS
-- ============================================================================

-- Update any invalid secure tokens
UPDATE public.insurance_cases 
SET secure_token = generate_secure_token()
WHERE secure_token IS NULL 
   OR LENGTH(secure_token) < 32
   OR secure_token LIKE 'CLI_%'
   OR secure_token LIKE 'secure-%';

-- ============================================================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_cases_secure_token 
ON public.insurance_cases(secure_token);

CREATE INDEX IF NOT EXISTS idx_insurance_cases_client_id 
ON public.insurance_cases(client_id);

CREATE INDEX IF NOT EXISTS idx_clients_user_id 
ON public.clients(user_id);

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Verify all UUIDs are valid
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check insurance_cases
    SELECT COUNT(*) INTO invalid_count
    FROM public.insurance_cases 
    WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_count > 0 THEN
        RAISE WARNING 'Found % invalid UUIDs in insurance_cases table', invalid_count;
    ELSE
        RAISE NOTICE 'All insurance_cases UUIDs are valid ✓';
    END IF;
    
    -- Check clients
    SELECT COUNT(*) INTO invalid_count
    FROM public.clients 
    WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_count > 0 THEN
        RAISE WARNING 'Found % invalid UUIDs in clients table', invalid_count;
    ELSE
        RAISE NOTICE 'All clients UUIDs are valid ✓';
    END IF;
    
    -- Check secure tokens
    SELECT COUNT(*) INTO invalid_count
    FROM public.insurance_cases 
    WHERE secure_token IS NULL OR LENGTH(secure_token) < 32;
    
    IF invalid_count > 0 THEN
        RAISE WARNING 'Found % invalid secure tokens', invalid_count;
    ELSE
        RAISE NOTICE 'All secure tokens are valid ✓';
    END IF;
END $$;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Ensure proper permissions for the service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- SCRIPT COMPLETION
-- ============================================================================

SELECT 
    'eSignPro Production Database Update Completed Successfully! ✅' as status,
    NOW() as updated_at;
