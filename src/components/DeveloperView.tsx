import React, { useState, useEffect } from 'react';
import { DailyLog, Project, Developer, TaskItem, TaskStatus, GeminiConfig } from '../types';
import { improveDeveloperInput } from '../services/geminiService';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Link, 
  Server, 
  Calendar, 
  User, 
  Send,
  ShieldCheck,
  FileCheck2,
  Check,
  UserCheck,
  Upload,
  Paperclip,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface DeveloperViewProps {
  projects: Project[];
  selectedProjectId: string;
  developers: Developer[];
  dailyLogs: DailyLog[];
  onSaveLog: (log: DailyLog) => void;
  geminiConfig: GeminiConfig;
}

export const DeveloperView: React.FC<DeveloperViewProps> = ({
  projects,
  selectedProjectId,
  developers,
  dailyLogs,
  onSaveLog,
  geminiConfig
}) => {
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0] || {
    id: 'proj-vtc-1',
    name: 'Inventory & Dispatch System',
    code: 'IDS',
    description: 'Enterprise Purchase Order receiving, serial validation, and dispatch management system',
    qaManagerName: 'Sarah Jenkins (QA Manager)',
    backendLeadName: 'Marc Quitalig (Lead Backend Dev)'
  };

  // Filter developers assigned to current project or all developers
  const projectDevelopers = developers.length > 0
    ? developers
    : [
        { id: 'dev-1', name: 'Christian Parayno', roleSpecialty: 'Senior Systems Dev', projectId: currentProject.id },
        { id: 'dev-2', name: 'Marc Quitalig', roleSpecialty: 'Lead Backend Dev', projectId: currentProject.id }
      ];

  const [developerName, setDeveloperName] = useState(projectDevelopers[0]?.name || 'Christian Parayno');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    if (projectDevelopers.length > 0 && !projectDevelopers.some(d => d.name === developerName)) {
      setDeveloperName(projectDevelopers[0].name);
    }
  }, [selectedProjectId, developers]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: `task-${Date.now()}-1`,
      projectId: currentProject.id,
      title: '',
      description: '',
      status: 'done',
      isForQA: true,
      isOutofScope: false,
      evidenceUrl: '',
      qaAcknowledged: false,
      unfinishedReason: ''
    }
  ]);

  const [plansForTomorrow, setPlansForTomorrow] = useState('');
  const [blockers, setBlockers] = useState('');
  const [serverUpdates, setServerUpdates] = useState('');
  
  const [isImproving, setIsImproving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        id: `task-${Date.now()}-${tasks.length + 1}`,
        projectId: currentProject.id,
        title: '',
        description: '',
        status: 'done',
        isForQA: false,
        isOutofScope: false,
        evidenceUrl: '',
        qaAcknowledged: false,
        unfinishedReason: ''
      }
    ]);
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length === 1) return;
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleTaskChange = (id: string, field: keyof TaskItem, value: any) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        if (field === 'status' && value === 'for_qa') {
          updated.isForQA = true;
        }
        return updated;
      }
      return t;
    }));
  };

  const handleAIImprove = async () => {
    if (tasks.every(t => !t.title.trim())) {
      alert('Please fill in at least one task title before running AI improvement.');
      return;
    }
    setIsImproving(true);
    try {
      const result = await improveDeveloperInput(
        {
          tasks: tasks.map(t => ({
            title: t.title,
            description: t.description,
            status: t.status,
            unfinishedReason: t.unfinishedReason
          })),
          plansForTomorrow,
          blockers,
          serverUpdates
        },
        geminiConfig
      );

      setTasks(tasks.map((t, idx) => {
        const improved = result.tasks[idx];
        if (!improved) return t;
        return {
          ...t,
          title: improved.title || t.title,
          description: improved.description || t.description,
          unfinishedReason: improved.unfinishedReason || t.unfinishedReason
        };
      }));

      if (result.plansForTomorrow) setPlansForTomorrow(result.plansForTomorrow);
      if (result.blockers) setBlockers(result.blockers);
      if (result.serverUpdates) setServerUpdates(result.serverUpdates);
    } catch (e) {
      console.error(e);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerName.trim()) {
      alert('Please select your registered developer name');
      return;
    }
    const validTasks = tasks.filter(t => t.title.trim().length > 0);
    if (validTasks.length === 0) {
      alert('Please enter at least one task');
      return;
    }

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      projectId: currentProject.id,
      developerName: developerName.trim(),
      date: logDate,
      tasks: validTasks.map(t => {
        const taskProjId = t.projectId || currentProject.id;
        const taskProj = projects.find(p => p.id === taskProjId) || currentProject;
        return {
          ...t,
          projectId: taskProjId,
          qaManagerName: taskProj.qaManagerName || currentProject.qaManagerName
        };
      }),
      plansForTomorrow: plansForTomorrow.trim(),
      blockers: blockers.trim(),
      serverUpdates: serverUpdates.trim(),
      backendDevName: currentProject.backendLeadName,
      backendDevAcknowledged: serverUpdates.trim().length > 0,
      createdAt: new Date().toISOString()
    };

    onSaveLog(newLog);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);

    setTasks([
      {
        id: `task-${Date.now()}-1`,
        projectId: currentProject.id,
        title: '',
        description: '',
        status: 'done',
        isForQA: false,
        isOutofScope: false,
        evidenceUrl: '',
        qaAcknowledged: false,
        unfinishedReason: ''
      }
    ]);
    setPlansForTomorrow('');
    setBlockers('');
    setServerUpdates('');
  };

  // Recent logs for this project
  const projectLogs = dailyLogs
    .filter(l => l.projectId === currentProject.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Developer Daily Accomplishment Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold font-outfit text-white">
              Log Progress for <span className="text-indigo-400">{currentProject.name}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Select your registered developer profile, log tasks, tag QA candidates, and let Gemini AI polish your report.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAIImprove}
            disabled={isImproving}
            className="flex items-center space-x-2 bg-indigo-600/90 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${isImproving ? 'animate-spin' : ''}`} />
            <span>{isImproving ? 'Polishing with Gemini...' : '✨ Polish Report with Gemini AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Form & Previous Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Log Input Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Dev Metadata Row with Developer Dropdown Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Registered Developer Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Select Registered Developer</span>
                </label>
                <select
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                  required
                >
                  {projectDevelopers.map((dev) => (
                    <option key={dev.id} value={dev.name}>
                      {dev.name} ({dev.roleSpecialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Log Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Log Date</span>
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                  required
                />
              </div>

            </div>

            {/* Task Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-400" />
                  <span>Today's Tasks & Accomplishments</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 relative group"
                >
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(task.id)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Task Header Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Project Dropdown */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                        Target Project
                      </label>
                      <select
                        value={task.projectId || currentProject.id}
                        onChange={(e) => handleTaskChange(task.id, 'projectId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.code}] {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Task Title */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                        placeholder={`Task #${index + 1} Title (e.g. Purchase Order Validation)`}
                        className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    {/* Task Status */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Status
                      </label>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskChange(task.id, 'status', e.target.value as TaskStatus)}
                        className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="done">✅ Done / Finished</option>
                        <option value="for_qa">🔍 Ready for QA</option>
                        <option value="in_progress">⏳ In Progress</option>
                        <option value="blocked">🚨 Blocked</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <textarea
                      value={task.description}
                      onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                      placeholder="Brief description of work done..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Options Toggles */}
                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-800/80">
                    
                    {/* Ready for QA Toggle */}
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={task.isForQA}
                        onChange={(e) => handleTaskChange(task.id, 'isForQA', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`font-medium ${task.isForQA ? 'text-cyan-400' : 'text-slate-400'}`}>
                        For QA Review (Requires QA Signature)
                      </span>
                    </label>

                    {/* Out of Scope Toggle */}
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={task.isOutofScope}
                        onChange={(e) => handleTaskChange(task.id, 'isOutofScope', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                      <span className={`font-medium ${task.isOutofScope ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                        Out of Scope Task
                      </span>
                    </label>
                  </div>

                  {/* Evidence Input (If For QA) */}
                  {task.isForQA && (
                    <div className="pt-2 space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                        <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                        <span>QA Evidence Proof (Image Screenshot Attachment or PR / URL Link)</span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Attach Image File */}
                        <label className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/40 cursor-pointer transition flex-shrink-0 shadow-sm">
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Attach Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleTaskChange(task.id, 'evidenceUrl', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {/* URL Link Input */}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={task.evidenceUrl || ''}
                            onChange={(e) => handleTaskChange(task.id, 'evidenceUrl', e.target.value)}
                            placeholder="Or paste PR / Staging link / Image URL (https://...)"
                            className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-3 py-2 text-xs text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Evidence Preview / Attachment Badge */}
                      {task.evidenceUrl && (
                        <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                          {task.evidenceUrl.startsWith('data:image') || task.evidenceUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ? (
                            <img
                              src={task.evidenceUrl}
                              alt="Evidence Screenshot"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-slate-900"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 flex-shrink-0">
                              <Link className="w-4 h-4" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 text-xs">
                            <div className="font-semibold text-slate-200 truncate">
                              {task.evidenceUrl.startsWith('data:image') ? 'Attached Image Screenshot' : task.evidenceUrl}
                            </div>
                            <div className="text-[10px] text-cyan-400 font-mono">
                              {task.evidenceUrl.startsWith('data:image') ? 'Uploaded Image File (Base64)' : 'External Evidence Link'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTaskChange(task.id, 'evidenceUrl', '')}
                            className="text-slate-500 hover:text-rose-400 p-1.5 transition rounded-lg hover:bg-slate-900"
                            title="Remove attached evidence"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unfinished Reason (If In Progress or Blocked) */}
                  {(task.status === 'in_progress' || task.status === 'blocked') && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-amber-400 mb-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Valid Reason for Unfinished Status</span>
                      </label>
                      <input
                        type="text"
                        value={task.unfinishedReason || ''}
                        onChange={(e) => handleTaskChange(task.id, 'unfinishedReason', e.target.value)}
                        placeholder="e.g. Waiting for scheduled maintenance window to avoid database locking..."
                        className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Plans for Tomorrow */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Plans for Tomorrow</span>
              </label>
              <textarea
                value={plansForTomorrow}
                onChange={(e) => setPlansForTomorrow(e.target.value)}
                placeholder="What will you work on tomorrow?"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Blockers */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Blockers / Impidiments</span>
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Any technical or dependency blockers preventing progress? Write 'None' if clear."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* System Update to Server */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>System Update to Server (Backend Deployment)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Did you push changes to production or staging server today? (Backend Lead: <span className="text-emerald-400 font-semibold">{currentProject.backendLeadName}</span>)
              </p>
              <input
                type="text"
                value={serverUpdates}
                onChange={(e) => setServerUpdates(e.target.value)}
                placeholder="e.g. Implemented a dedicated health-check API for monitoring Directus connectivity"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Submit Row */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleAIImprove}
                disabled={isImproving}
                className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Refine text with Gemini before saving</span>
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
              >
                {submitSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Log Submitted!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Daily Log</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Sidebar: Log History & Instructions */}
        <div className="space-y-6">
          
          {/* Quick Info Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Project Guidelines</span>
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Select your registered name from the <span className="text-indigo-400 font-semibold">Developer Selector</span>.</li>
              <li>Tag tasks as <span className="text-cyan-400 font-semibold">For QA</span> if ready for testing.</li>
              <li>Flag any <span className="text-amber-400 font-semibold">Out of Scope</span> tasks executed outside the planned sprint.</li>
              <li>Use <span className="text-indigo-400 font-semibold">✨ Gemini AI</span> to refine grammar and clarity.</li>
            </ul>
          </div>

          {/* Past Submissions Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Submitted Logs ({projectLogs.length})</span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">{currentProject.code}</span>
            </h3>

            {projectLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No daily logs recorded yet for this project.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {projectLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{log.developerName}</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {log.date}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {log.tasks.map((t) => (
                        <div key={t.id} className="flex items-start justify-between text-slate-300">
                          <span className="truncate max-w-[180px]">• {t.title}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            t.status === 'done' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            t.status === 'for_qa' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                            t.status === 'blocked' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {log.serverUpdates && (
                      <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 pt-1 border-t border-slate-900">
                        <Server className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{log.serverUpdates}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
