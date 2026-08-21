import React from 'react';
import { UserRole, Project } from '../types';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Building2, 
  PlusCircle, 
  CalendarCheck,
  UserPlus,
  Server,
  ShieldCheck,
  Building
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  onOpenSettings: () => void;
  onOpenRegistry: () => void;
  hasApiKey: boolean;
  onPrintClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  projects,
  selectedProjectId,
  onProjectChange,
  onOpenSettings,
  onOpenRegistry,
  hasApiKey,
  onPrintClick
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 shadow-2xl print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-outfit whitespace-nowrap">
                  PulseReport
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 whitespace-nowrap">
                  VTC System
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap">
                Multi-Role Accomplishment Reporting
              </span>
            </div>
          </div>

          {/* Project Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 focus-within:border-indigo-500 transition shadow-inner">
            <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <select
              value={selectedProjectId}
              onChange={(e) => onProjectChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-2 max-w-[160px] sm:max-w-[240px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100 py-1">
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Role Switcher (5 Roles) */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 shadow-inner overflow-x-auto">
            
            {/* 1. Developer */}
            <button
              type="button"
              onClick={() => onRoleChange('developer')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                currentRole === 'developer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Frontend & General Developer Tasks"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Developer</span>
            </button>

            {/* 2. Backend */}
            <button
              type="button"
              onClick={() => onRoleChange('backend')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                currentRole === 'backend'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Backend Deployments & Section 5 Server Updates"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Backend</span>
            </button>

            {/* 3. QA Manager */}
            <button
              type="button"
              onClick={() => onRoleChange('qa_manager')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                currentRole === 'qa_manager'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="QA Review & Manager Approvals"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>QA Manager</span>
            </button>

            {/* 4. Project Manager */}
            <button
              type="button"
              onClick={() => onRoleChange('project_manager')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                currentRole === 'project_manager'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="PM Report Generation & PDF Export"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Project Manager</span>
            </button>

            {/* 5. General Manager */}
            <button
              type="button"
              onClick={() => onRoleChange('general_manager')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                currentRole === 'general_manager'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="General Manager Executive Dashboard"
            >
              <Building className="w-3.5 h-3.5" />
              <span>General Manager</span>
            </button>

          </div>

          {/* Right Actions: Registry & Settings */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenRegistry}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold transition whitespace-nowrap"
              title="Register Team Members & Projects"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Registry</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition whitespace-nowrap ${
                hasApiKey 
                  ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60' 
                  : 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
              }`}
              title="Configure Gemini API"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Gemini AI</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
