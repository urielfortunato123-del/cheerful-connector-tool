-- Create purifier models table
CREATE TABLE public.purifier_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial models
INSERT INTO public.purifier_models (name) VALUES 
('Soft Baby'),
('Soft Fit'),
('Soft Slim'),
('Soft Everest'),
('Soft Star');

-- Create service requests table
CREATE TABLE public.service_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    google_maps_link TEXT,
    property_type TEXT CHECK (property_type IN ('casa', 'apartamento', 'comercial')),
    floor TEXT,
    has_elevator BOOLEAN,
    has_high_pressure_tank BOOLEAN,
    request_type TEXT NOT NULL CHECK (request_type IN ('orcamento', 'troca_refil', 'suporte_tecnico', 'manutencao_preventiva')),
    purifier_model TEXT,
    other_model TEXT,
    problem_type TEXT,
    problem_description TEXT,
    last_maintenance TEXT,
    bought_before BOOLEAN,
    observations TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' NOT NULL,
    is_client BOOLEAN DEFAULT false
);

-- Grant permissions
GRANT SELECT, INSERT ON public.purifier_models TO anon, authenticated;
GRANT ALL ON public.purifier_models TO service_role;

GRANT INSERT ON public.service_requests TO anon, authenticated;
GRANT SELECT ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;

-- Enable RLS
ALTER TABLE public.purifier_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policies for purifier_models
CREATE POLICY "Public can read purifier models" ON public.purifier_models FOR SELECT USING (true);

-- Policies for service_requests
CREATE POLICY "Anyone can submit a service request" ON public.service_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view service requests" ON public.service_requests FOR SELECT USING (auth.role() = 'authenticated');

-- Create trigger for updated_at if we had it, but keeping it simple for now as requested.
