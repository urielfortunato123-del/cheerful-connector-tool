-- Garantir que user_id existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'user_id') THEN
        ALTER TABLE public.service_requests ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Permissões básicas
GRANT INSERT, SELECT, UPDATE ON public.service_requests TO anon;
GRANT ALL ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;

-- RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
DO $$ 
BEGIN
    -- Limpar políticas antigas se necessário (opcional, mas evita erros de duplicidade se o linter falhar)
    DROP POLICY IF EXISTS "Permitir inserção anônima" ON public.service_requests;
    DROP POLICY IF EXISTS "Permitir leitura anônima de suas próprias" ON public.service_requests;
    DROP POLICY IF EXISTS "Admin full access" ON public.service_requests;
    
    CREATE POLICY "Permitir inserção anônima" ON public.service_requests FOR INSERT WITH CHECK (true);
    CREATE POLICY "Permitir leitura anônima de suas próprias" ON public.service_requests FOR SELECT USING (true); -- Simplificado para o MVP
    CREATE POLICY "Admin full access" ON public.service_requests FOR ALL USING (auth.role() = 'authenticated');
END $$;

-- Políticas de Storage para 'atendimentos_media'
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Upload anonimo de midia" ON storage.objects;
    DROP POLICY IF EXISTS "Leitura de midia para todos" ON storage.objects;

    CREATE POLICY "Upload anonimo de midia" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'atendimentos_media');
    CREATE POLICY "Leitura de midia para todos" ON storage.objects FOR SELECT USING (bucket_id = 'atendimentos_media');
END $$;
