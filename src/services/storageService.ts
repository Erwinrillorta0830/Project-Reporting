import { DailyLog, Project, Developer, GeminiConfig, DocumentTemplateConfig, TaskItem, PaperSize } from '../types';
import { supabase } from './supabaseClient';

const GEMINI_CONFIG_KEY = 'pulse_gemini_config_v9';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Inventory & Dispatch System',
    code: 'IDS',
    description: 'Enterprise Purchase Order receiving, serial validation, and dispatch management system',
    qaManagerName: 'Regine Lachica',
    backendLeadName: 'James Ed Patrick Desear'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'VOS Synchronization Engine',
    code: 'VOS Sync',
    description: 'Real-time job search UX, encrypted messaging, and ATS candidate pipeline',
    qaManagerName: 'Regine Lachica',
    backendLeadName: 'James Ed Patrick Desear'
  }
];

export const INITIAL_DEVELOPERS: Developer[] = [
  {
    id: 'dev-1',
    name: 'Christian Parayno',
    roleSpecialty: 'Developer',
    projectId: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: 'dev-2',
    name: 'Marc Quitalig',
    roleSpecialty: 'Developer',
    projectId: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: 'dev-3',
    name: 'James Ed Patrick Desear',
    roleSpecialty: 'Backend Dev',
    projectId: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: 'dev-4',
    name: 'Regine Lachica',
    roleSpecialty: 'QA Lead',
    projectId: '11111111-1111-1111-1111-111111111111'
  }
];

export const INITIAL_TEMPLATE_CONFIG: DocumentTemplateConfig = {
  companyName: 'VERTEX TECHNOLOGIES CORPORATION',
  tagline: 'Where lines meet',
  headerLogoUrl: '/Header Document Vertex.png',
  watermarkLogoUrl: '/Logo.png',
  address: 'Gonzales Street, Bonuan Boquig, Dagupan City',
  website: 'www.vertextechcorp.com',
  email: 'support@vertextechcorp.com',
  phone: '0993-492-7508',
  fontFamily: 'Times New Roman',
  paperSize: 'a4',
  showWatermark: true,
  showLetterhead: true,
  qaSignatureLabel: 'Signature of QA Manager',
  backendSignatureLabel: 'Acknowledgement of Backend Dev'
};

const TODAY = new Date().toISOString().split('T')[0];

export const INITIAL_DAILY_LOGS: DailyLog[] = [

];

// ============================================================================
// SUPABASE DIRECT DATA FETCHING & PERSISTENCE APIs
// ============================================================================

/**
 * Fetch all registered projects directly from Supabase DB
 */
export const fetchProjectsFromSupabase = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description || '',
        qaManagerName: p.qa_manager_name || 'Regine Lachica',
        backendLeadName: p.backend_lead_name || 'James Ed Patrick Desear'
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch projects error:', err);
  }
  return INITIAL_PROJECTS;
};

/**
 * Save / Upsert a project into Supabase DB
 */
export const saveProjectToSupabase = async (project: Project): Promise<Project[]> => {
  try {
    await supabase.from('projects').upsert({
      id: project.id.includes('-') && project.id.length > 30 ? project.id : undefined,
      name: project.name,
      code: project.code,
      description: project.description,
      qa_manager_name: project.qaManagerName,
      backend_lead_name: project.backendLeadName
    });
  } catch (err) {
    console.warn('Supabase save project error:', err);
  }
  return await fetchProjectsFromSupabase();
};

/**
 * Fetch all registered developers directly from Supabase DB
 */
export const fetchDevelopersFromSupabase = async (): Promise<Developer[]> => {
  try {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        roleSpecialty: d.role_specialty,
        projectId: d.project_id || '11111111-1111-1111-1111-111111111111'
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch developers error:', err);
  }
  return INITIAL_DEVELOPERS;
};

/**
 * Save a new developer into Supabase DB
 */
export const saveDeveloperToSupabase = async (developer: Developer): Promise<Developer[]> => {
  try {
    await supabase.from('developers').insert({
      name: developer.name,
      role_specialty: developer.roleSpecialty,
      project_id: developer.projectId.includes('-') && developer.projectId.length > 30 ? developer.projectId : undefined
    });
  } catch (err) {
    console.warn('Supabase save developer error:', err);
  }
  return await fetchDevelopersFromSupabase();
};

/**
 * Delete a developer from Supabase DB
 */
export const deleteDeveloperFromSupabase = async (id: string): Promise<Developer[]> => {
  try {
    await supabase.from('developers').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete developer error:', err);
  }
  return await fetchDevelopersFromSupabase();
};

/**
 * Fetch all daily accomplishment logs & nested tasks directly from Supabase DB
 */
export const fetchDailyLogsFromSupabase = async (): Promise<DailyLog[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select(`
        *,
        tasks (*)
      `)
      .order('log_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((l: any) => ({
        id: l.id,
        projectId: l.project_id,
        developerName: l.developer_name,
        date: l.log_date,
        plansForTomorrow: l.plans_for_tomorrow || '',
        blockers: l.blockers || '',
        serverUpdates: l.server_updates || '',
        backendDevName: l.backend_dev_name || 'James Ed Patrick Desear',
        backendDevAcknowledged: l.backend_dev_acknowledged || false,
        aiEnhanced: l.ai_enhanced || false,
        createdAt: l.created_at,
        tasks: (l.tasks || []).map((t: any) => ({
          id: t.id,
          projectId: t.project_id || l.project_id,
          title: t.title,
          description: t.description || '',
          status: t.status,
          isForQA: t.is_for_qa,
          isOutofScope: t.is_out_of_scope,
          evidenceUrl: t.evidence_url || '',
          qaAcknowledged: t.qa_acknowledged,
          qaManagerName: t.qa_manager_name || 'Regine Lachica',
          unfinishedReason: t.unfinished_reason || '',
          taskDate: t.task_date || l.log_date
        }))
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch daily_logs error:', err);
  }
  return INITIAL_DAILY_LOGS;
};

/**
 * Save or update a daily accomplishment log & tasks into Supabase DB
 */
export const saveDailyLogToSupabase = async (log: DailyLog): Promise<DailyLog[]> => {
  try {
    const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    const logPayload: any = {
      project_id: isUUID(log.projectId) ? log.projectId : '11111111-1111-1111-1111-111111111111',
      developer_name: log.developerName,
      log_date: log.date,
      plans_for_tomorrow: log.plansForTomorrow,
      blockers: log.blockers,
      server_updates: log.serverUpdates,
      backend_dev_name: log.backendDevName,
      backend_dev_acknowledged: log.backendDevAcknowledged,
      ai_enhanced: log.aiEnhanced
    };

    if (isUUID(log.id)) {
      logPayload.id = log.id;
    }

    const { data: insertedLog, error: logError } = await supabase
      .from('daily_logs')
      .upsert(logPayload)
      .select()
      .single();

    if (!logError && insertedLog && log.tasks) {
      for (const t of log.tasks) {
        const taskPayload: any = {
          daily_log_id: insertedLog.id,
          project_id: isUUID(t.projectId) ? t.projectId : insertedLog.project_id,
          title: t.title,
          description: t.description,
          status: t.status,
          is_for_qa: t.isForQA,
          is_out_of_scope: t.isOutofScope,
          evidence_url: t.evidenceUrl,
          qa_acknowledged: t.qaAcknowledged,
          qa_manager_name: t.qaManagerName,
          unfinished_reason: t.unfinishedReason,
          task_date: t.taskDate || insertedLog.log_date
        };

        if (isUUID(t.id)) {
          taskPayload.id = t.id;
        }

        await supabase.from('tasks').upsert(taskPayload);
      }
    }
  } catch (err) {
    console.warn('Supabase save daily_log error:', err);
  }
  return await fetchDailyLogsFromSupabase();
};

/**
 * Fetch Document Template Config directly from Supabase DB
 */
export const fetchTemplateConfigFromSupabase = async (): Promise<DocumentTemplateConfig> => {
  try {
    const { data, error } = await supabase
      .from('document_template_configs')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      return {
        companyName: data.company_name,
        tagline: data.tagline,
        headerLogoUrl: data.header_logo_url || '/Header Document Vertex.png',
        watermarkLogoUrl: data.watermark_logo_url || '/Logo.png',
        address: data.address,
        website: data.website,
        email: data.email,
        phone: data.phone,
        fontFamily: data.font_family || 'Times New Roman',
        paperSize: (data.paper_size as PaperSize) || 'a4',
        showWatermark: data.show_watermark,
        showLetterhead: data.show_letterhead,
        qaSignatureLabel: data.qa_signature_label,
        backendSignatureLabel: data.backend_signature_label
      };
    }
  } catch (err) {
    console.warn('Supabase fetch template config error:', err);
  }
  return INITIAL_TEMPLATE_CONFIG;
};

/**
 * Save Document Template Config to Supabase DB
 */
export const saveTemplateConfigToSupabase = async (config: DocumentTemplateConfig): Promise<DocumentTemplateConfig> => {
  try {
    await supabase.from('document_template_configs').upsert({
      id: '00000000-0000-0000-0000-000000000001',
      company_name: config.companyName,
      tagline: config.tagline,
      header_logo_url: config.headerLogoUrl,
      watermark_logo_url: config.watermarkLogoUrl,
      address: config.address,
      website: config.website,
      email: config.email,
      phone: config.phone,
      font_family: config.fontFamily,
      paper_size: config.paperSize || 'a4',
      show_watermark: config.showWatermark,
      show_letterhead: config.showLetterhead,
      qa_signature_label: config.qaSignatureLabel,
      backend_signature_label: config.backendSignatureLabel
    });
  } catch (err) {
    console.warn('Supabase save template config error:', err);
  }
  return config;
};

// ============================================================================
// LOCAL STORAGE GEMINI CONFIG PERSISTENCE
// ============================================================================
export const getStoredGeminiConfig = (): GeminiConfig => {
  try {
    const raw = localStorage.getItem(GEMINI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.apiKey.trim().length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load config', e);
  }

  const envKey = 
    (import.meta as any).env?.VITE_GEMINI_API_KEY || 
    (import.meta as any).env?.NEXT_PUBLIC_GEMINI_API_KEY || 
    '';

  return { apiKey: envKey, model: 'gemini-1.5-flash' };
};

export const saveGeminiConfig = (config: GeminiConfig) => {
  localStorage.setItem(GEMINI_CONFIG_KEY, JSON.stringify(config));
};
