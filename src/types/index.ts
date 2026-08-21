export type UserRole = 
  | 'developer' 
  | 'backend' 
  | 'qa_manager' 
  | 'project_manager' 
  | 'general_manager';

export type TaskStatus = 'in_progress' | 'done' | 'for_qa' | 'blocked';

export type PaperSize = 'a4' | 'letter' | 'legal';

export interface TaskItem {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  isForQA: boolean;
  isOutofScope: boolean;
  evidenceUrl?: string;
  qaAcknowledged: boolean;
  qaManagerName?: string;
  unfinishedReason?: string;
  taskDate?: string;
}

export interface DailyLog {
  id: string;
  projectId: string;
  developerName: string;
  date: string; // YYYY-MM-DD
  tasks: TaskItem[];
  plansForTomorrow: string;
  blockers: string;
  serverUpdates?: string;
  backendDevName?: string;
  backendDevAcknowledged?: boolean;
  aiEnhanced?: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  qaManagerName: string;
  backendLeadName: string;
  generalManagerName?: string;
}

export interface Developer {
  id: string;
  name: string;
  roleSpecialty: string;
  projectId: string;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export interface DocumentTemplateConfig {
  companyName: string;
  tagline: string;
  headerLogoUrl: string;
  watermarkLogoUrl: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  fontFamily: 'Times New Roman' | 'Arial' | 'Inter' | 'Georgia';
  paperSize: PaperSize;
  showWatermark: boolean;
  showLetterhead: boolean;
  qaSignatureLabel: string;
  backendSignatureLabel: string;
  generalManagerSignatureLabel?: string;
}

export type ReportType = 'daily' | 'weekly';

export interface ReportFilter {
  reportType: ReportType;
  projectId: string;
  date: string;
  startDate: string;
  endDate: string;
}
