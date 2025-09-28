-- Ajouter les colonnes de validation à la table signatures
DO $$ 
BEGIN
    -- Ajouter validation_status si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signatures' 
        AND column_name = 'validation_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.signatures 
        ADD COLUMN validation_status VARCHAR(50) DEFAULT 'signed';
        
        COMMENT ON COLUMN public.signatures.validation_status IS 'Statut de validation: signed, validated, rejected';
    END IF;
    
    -- Ajouter validated_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signatures' 
        AND column_name = 'validated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.signatures 
        ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE;
        
        COMMENT ON COLUMN public.signatures.validated_at IS 'Date et heure de validation par l''agent';
    END IF;
    
    -- Ajouter validated_by si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signatures' 
        AND column_name = 'validated_by'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.signatures 
        ADD COLUMN validated_by VARCHAR(255);
        
        COMMENT ON COLUMN public.signatures.validated_by IS 'ID de l''agent qui a validé la signature';
    END IF;
    
    -- Ajouter validation_notes si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signatures' 
        AND column_name = 'validation_notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.signatures 
        ADD COLUMN validation_notes TEXT;
        
        COMMENT ON COLUMN public.signatures.validation_notes IS 'Notes de l''agent lors de la validation';
    END IF;
    
    RAISE NOTICE 'Colonnes de validation ajoutées avec succès à la table signatures';
END $$;

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_signatures_validation_status 
ON public.signatures(validation_status);

CREATE INDEX IF NOT EXISTS idx_signatures_validated_by 
ON public.signatures(validated_by);

CREATE INDEX IF NOT EXISTS idx_signatures_validated_at 
ON public.signatures(validated_at);

-- Mettre à jour les signatures existantes pour avoir le statut 'signed' par défaut
UPDATE public.signatures 
SET validation_status = 'signed' 
WHERE validation_status IS NULL;

-- Afficher un résumé des colonnes ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'signatures' 
    AND table_schema = 'public'
    AND column_name IN ('validation_status', 'validated_at', 'validated_by', 'validation_notes')
ORDER BY column_name;

-- Afficher le nombre de signatures par statut
SELECT 
    validation_status,
    COUNT(*) as count
FROM public.signatures
GROUP BY validation_status
ORDER BY validation_status;

-- Vérifier que tout fonctionne
SELECT 
    'Colonnes de validation ajoutées' as status,
    COUNT(*) as signatures_total
FROM public.signatures;
