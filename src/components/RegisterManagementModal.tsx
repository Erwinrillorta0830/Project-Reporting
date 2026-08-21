import React, { useState } from 'react';
import { Project, Developer } from '../types';
import { Users, Building2, Plus, X, Trash2, CheckCircle2, ShieldCheck, UserPlus, FolderPlus } from 'lucide-react';

interface RegisterManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  developers: Developer[];
  onAddProject: (project: Project) => void;
  onAddDeveloper: (developer: Developer) => void;
  onDeleteDeveloper: (id: string) => void;
}

export const RegisterManagementModal: React.FC<RegisterManagementModalProps> = ({
  isOpen,
  onClose,
  projects,
  developers,
  onAddProject,
  onAddDeveloper,
  onDeleteDeveloper
}) => {
  const [activeTab, setActiveTab] = useState<'developers' | 'projects'>('developers');

  // New Developer Form State
  const [devName, setDevName] = useState('');
  const [devRole, setDevRole] = useState('');
  const [devProjectId, setDevProjectId] = useState(projects[0]?.id || '');

  // New Project Form State
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [qaManager, setQaManager] = useState('');
  const [backendLead, setBackendLead] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName.trim()) return;

    const newDev: Developer = {
      id: `dev-${Date.now()}`,
      name: devName.trim(),
      roleSpecialty: devRole.trim() || 'Software Engineer',
      projectId: devProjectId || projects[0]?.id || ''
    };

    onAddDeveloper(newDev);
    setDevName('');
    setDevRole('');
    setSuccessMsg('Developer registered successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projCode.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projName.trim(),
      code: projCode.trim().toUpperCase(),
      description: projDesc.trim(),
      qaManagerName: qaManager.trim() || 'Sarah Jenkins (QA Manager)',
      backendLeadName: backendLead.trim() || 'Lead Backend Dev'
    };

    onAddProject(newProj);
    setProjName('');
    setProjCode('');
    setProjDesc('');
    setQaManager('');
    setBackendLead('');
    setSuccessMsg('Project registered successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">Team & Project Registry</h2>
            <p className="text-xs text-slate-400">Register developers and projects to populate dropdown selectors throughout the reporting tool</p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('developers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'developers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Developer Registration ({developers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'projects'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Project Registration ({projects.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DEVELOPER REGISTRATION */}
        {/* ========================================================================= */}
        {activeTab === 'developers' && (
          <div className="space-y-6">
            
            {/* New Developer Form */}
            <form onSubmit={handleCreateDeveloper} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Register New Developer</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Developer Full Name</label>
                  <input
                    type="text"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="e.g. Christian Parayno"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Role / Specialty</label>
                  <input
                    type="text"
                    value={devRole}
                    onChange={(e) => setDevRole(e.target.value)}
                    placeholder="e.g. Senior Systems Dev"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Assigned Project</label>
                <select
                  value={devProjectId}
                  onChange={(e) => setDevProjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Register Developer</span>
              </button>
            </form>

            {/* List of Registered Developers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Developers List ({developers.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {developers.map((dev) => {
                  const assignedProj = projects.find(p => p.id === dev.projectId);
                  return (
                    <div key={dev.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{dev.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {dev.roleSpecialty} • Assigned to: <span className="text-indigo-400 font-semibold">{assignedProj?.name || 'All Projects'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteDeveloper(dev.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Remove developer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROJECT REGISTRATION */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            
            {/* New Project Form */}
            <form onSubmit={handleCreateProject} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <FolderPlus className="w-4 h-4" />
                <span>Register New Project</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Inventory & Dispatch System"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Project Code</label>
                  <input
                    type="text"
                    value={projCode}
                    onChange={(e) => setProjCode(e.target.value)}
                    placeholder="e.g. IDS"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Project Description</label>
                <input
                  type="text"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Brief summary of project scope..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Assigned QA Manager Name</label>
                  <input
                    type="text"
                    value={qaManager}
                    onChange={(e) => setQaManager(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (QA Manager)"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Assigned Backend Lead Name</label>
                  <input
                    type="text"
                    value={backendLead}
                    onChange={(e) => setBackendLead(e.target.value)}
                    placeholder="e.g. Marc Quitalig (Backend Lead)"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/25 flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Register Project</span>
              </button>
            </form>

            {/* Registered Projects List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Projects List ({projects.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {projects.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{p.name} ({p.code})</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-3 pt-1">
                      <span>QA: <strong>{p.qaManagerName}</strong></span>
                      <span>•</span>
                      <span>Backend: <strong>{p.backendLeadName}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
