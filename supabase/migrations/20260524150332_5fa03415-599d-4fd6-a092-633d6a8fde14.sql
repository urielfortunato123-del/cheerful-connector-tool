-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROJETOS
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    status TEXT DEFAULT 'Em Planejamento',
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    client TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID DEFAULT auth.uid()
);

-- 2. MEDIÇÕES
CREATE TABLE public.measurements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID DEFAULT auth.uid()
);

-- 3. DIÁRIO DE OBRA
CREATE TABLE public.daily_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    weather TEXT,
    labor_count INTEGER DEFAULT 0,
    activities TEXT,
    occurrences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID DEFAULT auth.uid()
);

-- 4. FINANCEIRO
CREATE TABLE public.financial_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Receita' ou 'Despesa'
    category TEXT,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID DEFAULT auth.uid()
);

-- 5. NORMAS TÉCNICAS (Repositório)
CREATE TABLE public.technical_standards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT,
    category TEXT,
    organ TEXT, -- DNIT, DER, ABNT
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_standards ENABLE ROW LEVEL SECURITY;

-- Policies for Projects
CREATE POLICY "Users can manage their own projects" ON public.projects
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Measurements
CREATE POLICY "Users can manage their own measurements" ON public.measurements
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Daily Logs
CREATE POLICY "Users can manage their own daily logs" ON public.daily_logs
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Financial
CREATE POLICY "Users can manage their own financial records" ON public.financial_records
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Standards (Public Read)
CREATE POLICY "Everyone can view standards" ON public.technical_standards
    FOR SELECT USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_measurements_updated_at BEFORE UPDATE ON public.measurements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON public.financial_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
