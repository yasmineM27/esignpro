-- Production Database Schema Fix for eSignPro
-- Run this script in your production Supabase SQL Editor

-- Add missing columns to email_logs table if they don't exist
DO $$
BEGIN
    -- Add external_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'email_logs' AND column_name = 'external_id') THEN
        ALTER TABLE public.email_logs ADD COLUMN external_id VARCHAR(255);
    END IF;

    -- Add delivered_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'email_logs' AND column_name = 'delivered_at') THEN
        ALTER TABLE public.email_logs ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add error_message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'email_logs' AND column_name = 'error_message') THEN
        ALTER TABLE public.email_logs ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_email_logs_external_id ON public.email_logs(external_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_delivered_at ON public.email_logs(delivered_at);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Email logs are manageable by authenticated users" ON public.email_logs;
CREATE POLICY "Email logs are manageable by authenticated users" ON public.email_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure the secure_token index exists and is unique
DROP INDEX IF EXISTS idx_insurance_cases_secure_token;
CREATE UNIQUE INDEX idx_insurance_cases_secure_token ON public.insurance_cases(secure_token);

-- Verify the schema is correct
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('email_logs', 'insurance_cases')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;