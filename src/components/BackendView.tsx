import React, { useState } from 'react';
import { DailyLog, Project, Developer } from '../types';
import { Server, CheckCircle2, Send, Calendar, ShieldCheck, Database, HardDrive, Cpu } from 'lucide-react';

interface BackendViewProps {
  projects: Project[];
  selectedProjectId: string;
  developers: Developer[];
  dailyLogs: DailyLog[];
  onSaveLog: (log: DailyLog) => void;
}

export const BackendView: React.FC<BackendViewProps> = ({
  projects,
  selectedProjectId,
  developers,
  dailyLogs,
  onSaveLog
}) => {
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  
  const backendDevs = developers.filter(d => d.roleSpecialty.toLowerCase().includes('backend') || d.roleSpecialty.toLowerCase().includes('systems') || d.roleSpecialty.toLowerCase().includes('lead')) 
    .length > 0 ? developers : [{ id: 'dev-2', name: 'Marc Quitalig', roleSpecialty: 'Lead Backend Dev', projectId: currentProject.id }];

  const [developerName, setDeveloperName] = useState(currentProject.backendLeadName || backendDevs[0]?.name || 'Marc Quitalig');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [serverUpdates, setServerUpdates] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUpdates.trim()) {
      alert('Please enter system update details');
      return;
    }

    const newLog: DailyLog = {
      id: `log-backend-${Date.now()}`,
      projectId: currentProject.id,
      developerName: developerName.trim(),
      date: logDate,
      tasks: [],
      plansForTomorrow: 'Maintain server health and API uptime.',
      blockers: '',
      serverUpdates: serverUpdates.trim(),
      backendDevName: developerName.trim(),
      backendDevAcknowledged: isAcknowledged,
      createdAt: new Date().toISOString()
    };

    onSaveLog(newLog);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
    setServerUpdates('');
  };

  const projectServerLogs = dailyLogs.filter(l => l.projectId === currentProject.id && l.serverUpdates);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Server className="w-3.5 h-3.5" />
              <span>Section 5: System Update to the Server (Backend Portal)</span>
            </div>
            <h1 className="text-2xl font-extrabold font-outfit text-white">
              Backend Deployments for <span className="text-emerald-400">{currentProject.name}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Log server updates, database migrations, health-check APIs, and sign off for Section 5 of the Accomplishment Report.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Backend Input Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">Backend Developer Name</label>
                <input
                  type="text"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  placeholder="e.g. Marc Quitalig"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">Deployment Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Server Update Detail */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-2 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>System Update to the Server (Section 5 Content)</span>
              </label>
              <textarea
                value={serverUpdates}
                onChange={(e) => setServerUpdates(e.target.value)}
                placeholder="e.g. Implemented a dedicated health-check API for monitoring Directus and database connectivity, configured root-level error boundaries."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            {/* Sign-Off Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase">Backend Dev Signature Acknowledgement</div>
                <div className="text-[11px] text-slate-400">Section 5 Acknowledgement: {developerName}</div>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAcknowledged}
                  onChange={(e) => setIsAcknowledged(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-400">Acknowledged & Signed</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition"
              >
                {submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Server Update Logged!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Log System Update</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Recent Server Updates Feed */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Logged Server Updates ({projectServerLogs.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono">SECTION 5</span>
            </h3>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {projectServerLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold text-emerald-300">{log.developerName}</span>
                    <span className="text-[10px] font-mono text-slate-500">{log.date}</span>
                  </div>
                  <p className="font-mono text-emerald-400 text-xs bg-slate-900 p-2 rounded border border-slate-800">
                    {log.serverUpdates}
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Backend Ack: Signed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
