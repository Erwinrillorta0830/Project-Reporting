-- ============================================================================
-- VERTEX TECHNOLOGIES CORPORATION (VTC) - PROJECT REPORTING SYSTEM
-- Supabase PostgreSQL DDL Schema Script
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: PROJECTS
-- Stores registered corporate projects, codes, and assigned leads.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    qa_manager_name TEXT DEFAULT 'Regine Lachica',
    qa_manager_email TEXT DEFAULT 'reginevertex1201@gmail.com',
    backend_lead_name TEXT DEFAULT 'James Ed Patrick Desear',
    general_manager_name TEXT DEFAULT 'Erwin Rillorta',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 2: DEVELOPERS
-- Stores registered developers, roles, and project assignments.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role_specialty TEXT NOT NULL DEFAULT 'Developer', -- 'Developer', 'Backend Dev', 'QA Lead'
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: DAILY_LOGS
-- Parent header table for daily & weekly developer accomplishment logs.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    developer_name TEXT NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    plans_for_tomorrow TEXT,
    blockers TEXT,
    server_updates TEXT, -- Section 5: System Update to Server
    backend_dev_name TEXT DEFAULT 'James Ed Patrick Desear',
    backend_dev_acknowledged BOOLEAN DEFAULT FALSE,
    ai_enhanced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast query filtering by project and log date range
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date ON public.daily_logs(project_id, log_date);

-- ============================================================================
-- TABLE 4: TASKS
-- Individual task line-items associated with a daily accomplishment log.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'done', 'for_qa', 'blocked')),
    is_for_qa BOOLEAN NOT NULL DEFAULT FALSE,
    is_out_of_scope BOOLEAN NOT NULL DEFAULT FALSE,
    evidence_url TEXT,
    qa_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    qa_manager_name TEXT DEFAULT 'Regine Lachica',
    unfinished_reason TEXT,
    task_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_daily_log ON public.tasks(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ============================================================================
-- TABLE 5: DOCUMENT_TEMPLATE_CONFIGS
-- Stores Times New Roman template configuration, logos, address & footers.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_template_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT DEFAULT 'VERTEX TECHNOLOGIES CORPORATION',
    tagline TEXT DEFAULT 'Where lines meet',
    header_logo_url TEXT DEFAULT '/Header Document Vertex.png',
    watermark_logo_url TEXT DEFAULT '/Logo.png',
    address TEXT DEFAULT 'Gonzales Street, Bonuan Boquig, Dagupan City',
    website TEXT DEFAULT 'www.vertextechcorp.com',
    email TEXT DEFAULT 'support@vertextechcorp.com',
    phone TEXT DEFAULT '0993-492-7508',
    font_family TEXT DEFAULT 'Times New Roman',
    paper_size TEXT DEFAULT 'a4',
    show_watermark BOOLEAN DEFAULT TRUE,
    show_letterhead BOOLEAN DEFAULT TRUE,
    qa_signature_label TEXT DEFAULT 'Signature of QA Manager',
    backend_signature_label TEXT DEFAULT 'Acknowledgement of Backend Dev',
    qa_manager_email TEXT DEFAULT 'reginevertex1201@gmail.com',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INITIAL SEED DATA
-- Pre-populates VTC initial projects, team leads, and developers.
-- ============================================================================
INSERT INTO public.projects (id, name, code, description, qa_manager_name, backend_lead_name, general_manager_name)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Inventory & Dispatch System', 'IDS', 'Enterprise Purchase Order receiving, serial validation, and dispatch management system', 'Regine Lachica', 'James Ed Patrick Desear', 'Erwin Rillorta'),
    ('22222222-2222-2222-2222-222222222222', 'VOS Synchronization Engine', 'VOS Sync', 'Real-time job search UX, encrypted messaging, and ATS candidate pipeline', 'Regine Lachica', 'James Ed Patrick Desear', 'Erwin Rillorta')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.developers (name, role_specialty, project_id)
VALUES 
    ('Christian Parayno', 'Developer', '11111111-1111-1111-1111-111111111111'),
    ('Marc Quitalig', 'Developer', '11111111-1111-1111-1111-111111111111'),
    ('James Ed Patrick Desear', 'Backend Dev', '11111111-1111-1111-1111-111111111111'),
    ('Regine Lachica', 'QA Lead', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

INSERT INTO public.document_template_configs (id, company_name, tagline, font_family)
VALUES ('00000000-0000-0000-0000-000000000001', 'VERTEX TECHNOLOGIES CORPORATION', 'Where lines meet', 'Times New Roman')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on projects" ON public.projects FOR ALL USING (true);

CREATE POLICY "Allow public read access on developers" ON public.developers FOR SELECT USING (true);
CREATE POLICY "Allow public insert/delete on developers" ON public.developers FOR ALL USING (true);

CREATE POLICY "Allow public read access on daily_logs" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on daily_logs" ON public.daily_logs FOR ALL USING (true);

CREATE POLICY "Allow public read access on tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on tasks" ON public.tasks FOR ALL USING (true);

CREATE POLICY "Allow public read access on document_template_configs" ON public.document_template_configs FOR SELECT USING (true);
CREATE POLICY "Allow public update on document_template_configs" ON public.document_template_configs FOR ALL USING (true);

-- ============================================================================
-- AUTOMATED 5:00 AM MONDAY TO FRIDAY CRON JOB SCHEDULER
-- Option for Supabase pg_cron + pg_net extension
-- ============================================================================
-- SELECT cron.schedule(
--   'send-daily-qa-email-5am',
--   '0 5 * * 1-5', -- Every Monday to Friday at 5:00 AM
--   $$
--   SELECT net.http_post(
--       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-qa-daily-email',
--       headers:='{"Content-Type": "application/json"}'::jsonb,
--       body:='{"qa_manager_email": "reginevertex1201@gmail.com"}'::jsonb
--   );
--   $$
-- );

