-- Create PWA events table
CREATE TABLE public.pwa_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('displayed', 'accepted', 'dismissed', 'failed')),
    platform TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT INSERT ON public.pwa_events TO anon, authenticated;
GRANT SELECT ON public.pwa_events TO service_role;

-- Enable RLS
ALTER TABLE public.pwa_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (since PWA prompt happens before auth sometimes)
CREATE POLICY "Anyone can insert PWA events" 
ON public.pwa_events 
FOR INSERT 
WITH CHECK (true);
