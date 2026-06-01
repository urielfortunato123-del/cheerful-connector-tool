CREATE TABLE IF NOT EXISTS public.ssr_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  context JSONB,
  deployment_id TEXT -- Useful for "per deploy" trends
);

-- GRANT permissions
GRANT SELECT ON public.ssr_errors TO authenticated;
GRANT INSERT ON public.ssr_errors TO service_role;
GRANT ALL ON public.ssr_errors TO service_role;

-- Enable RLS
ALTER TABLE public.ssr_errors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view SSR errors"
  ON public.ssr_errors
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_ssr_errors_created_at ON public.ssr_errors (created_at);
CREATE INDEX IF NOT EXISTS idx_ssr_errors_path ON public.ssr_errors (path);
