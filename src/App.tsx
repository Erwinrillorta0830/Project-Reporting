import React, { useState, useEffect } from 'react';
import { UserRole, Project, Developer, DailyLog, GeminiConfig, DocumentTemplateConfig } from './types';
import { 
  fetchProjectsFromSupabase,
  saveProjectToSupabase,
  fetchDevelopersFromSupabase,
  saveDeveloperToSupabase,
  deleteDeveloperFromSupabase,
  fetchDailyLogsFromSupabase,
  saveDailyLogToSupabase,
  fetchTemplateConfigFromSupabase,
  saveTemplateConfigToSupabase,
  getStoredGeminiConfig, 
  saveGeminiConfig,
  INITIAL_TEMPLATE_CONFIG
} from './services/storageService';

import { Navbar } from './components/Navbar';
import { DeveloperView } from './components/DeveloperView';
import { BackendView } from './components/BackendView';
import { QAManagerView } from './components/QAManagerView';
import { PMReportView } from './components/PMReportView';
import { GeneralManagerView } from './components/GeneralManagerView';
import { AIReportAnalystView } from './components/AIReportAnalystView';
import { GeminiSettingsModal } from './components/GeminiSettingsModal';
import { TemplateConfigModal } from './components/TemplateConfigModal';
import { RegisterManagementModal } from './components/RegisterManagementModal';
import { FileText, Sparkles, Database } from 'lucide-react';

export function App() {
  const [role, setRole] = useState<UserRole>('project_manager');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig>({ apiKey: '', model: 'gemini-1.5-flash' });
  const [templateConfig, setTemplateConfig] = useState<DocumentTemplateConfig>(INITIAL_TEMPLATE_CONFIG);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplateConfigOpen, setIsTemplateConfigOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  // Fetch initial live data from Supabase DB
  useEffect(() => {
    const loadSupabaseData = async () => {
      setIsLoadingSupabase(true);
      
      const loadedProjects = await fetchProjectsFromSupabase();
      setProjects(loadedProjects);
      if (loadedProjects.length > 0) {
        setSelectedProjectId(loadedProjects[0].id);
      }

      const loadedDevs = await fetchDevelopersFromSupabase();
      setDevelopers(loadedDevs);

      const loadedLogs = await fetchDailyLogsFromSupabase();
      setDailyLogs(loadedLogs);

      const loadedTemplate = await fetchTemplateConfigFromSupabase();
      setTemplateConfig(loadedTemplate);

      const loadedGemini = getStoredGeminiConfig();
      setGeminiConfig(loadedGemini);

      setIsLoadingSupabase(false);
    };

    loadSupabaseData();
  }, []);

  const handleSaveLog = async (newLog: DailyLog) => {
    const updatedLogs = await saveDailyLogToSupabase(newLog);
    setDailyLogs(updatedLogs);
  };

  const handleAddDeveloper = async (newDev: Developer) => {
    const updatedDevs = await saveDeveloperToSupabase(newDev);
    setDevelopers(updatedDevs);
  };

  const handleDeleteDeveloper = async (id: string) => {
    const updatedDevs = await deleteDeveloperFromSupabase(id);
    setDevelopers(updatedDevs);
  };

  const handleAddProject = async (newProj: Project) => {
    const updatedProjects = await saveProjectToSupabase(newProj);
    setProjects(updatedProjects);
    setSelectedProjectId(newProj.id);
  };

  const handleSaveGeminiConfig = (newConfig: GeminiConfig) => {
    setGeminiConfig(newConfig);
    saveGeminiConfig(newConfig);
  };

  const handleSaveTemplateConfig = async (newConfig: DocumentTemplateConfig) => {
    const saved = await saveTemplateConfigToSupabase(newConfig);
    setTemplateConfig(saved);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        hasApiKey={Boolean(geminiConfig.apiKey && geminiConfig.apiKey.trim().length > 0)}
        onPrintClick={() => window.print()}
      />

      {/* Main Content Area rendering Active Role View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoadingSupabase && (
          <div className="flex items-center justify-center py-4 space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-xl mb-6 animate-pulse">
            <Database className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Connecting & Syncing Live Data with Supabase PostgreSQL...</span>
          </div>
        )}

        {role === 'developer' && (
          <DeveloperView
            projects={projects}
            selectedProjectId={selectedProjectId}
            developers={developers}
            dailyLogs={dailyLogs}
            onSaveLog={handleSaveLog}
            geminiConfig={geminiConfig}
          />
        )}

        {role === 'backend' && (
          <BackendView
            projects={projects}
            selectedProjectId={selectedProjectId}
            developers={developers}
            dailyLogs={dailyLogs}
            onSaveLog={handleSaveLog}
          />
        )}

        {role === 'qa_manager' && (
          <QAManagerView
            projects={projects}
            selectedProjectId={selectedProjectId}
            dailyLogs={dailyLogs}
            onSaveLog={handleSaveLog}
          />
        )}

        {role === 'project_manager' && (
          <PMReportView
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={setSelectedProjectId}
            dailyLogs={dailyLogs}
            geminiConfig={geminiConfig}
            templateConfig={templateConfig}
            onOpenTemplateConfig={() => setIsTemplateConfigOpen(true)}
          />
        )}

        {role === 'general_manager' && (
          <GeneralManagerView
            projects={projects}
            dailyLogs={dailyLogs}
          />
        )}

        {role === 'ai_analyst' && (
          <AIReportAnalystView
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={setSelectedProjectId}
            dailyLogs={dailyLogs}
            geminiConfig={geminiConfig}
            templateConfig={templateConfig}
          />
        )}

      </main>

      {/* Modals */}
      <GeminiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={geminiConfig}
        onSave={handleSaveGeminiConfig}
      />

      <TemplateConfigModal
        isOpen={isTemplateConfigOpen}
        onClose={() => setIsTemplateConfigOpen(false)}
        config={templateConfig}
        onSave={handleSaveTemplateConfig}
      />

      <RegisterManagementModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        projects={projects}
        developers={developers}
        onAddProject={handleAddProject}
        onAddDeveloper={handleAddDeveloper}
        onDeleteDeveloper={handleDeleteDeveloper}
      />

      {/* App Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300 font-outfit">PulseReport System</span>
            <span>• Supabase PostgreSQL Database Connected</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by Gemini AI</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Live Supabase Database Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
