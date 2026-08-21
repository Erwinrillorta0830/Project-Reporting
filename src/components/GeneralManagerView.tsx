import React from 'react';
import { Project, DailyLog } from '../types';
import { Building2, ShieldCheck, CheckCircle2, AlertTriangle, Server, FileText, TrendingUp } from 'lucide-react';

interface GeneralManagerViewProps {
  projects: Project[];
  dailyLogs: DailyLog[];
}

export const GeneralManagerView: React.FC<GeneralManagerViewProps> = ({
  projects,
  dailyLogs
}) => {
  const totalDoneTasks = dailyLogs.flatMap(l => l.tasks.filter(t => t.status === 'done')).length;
  const totalQATasks = dailyLogs.flatMap(l => l.tasks.filter(t => t.isForQA)).length;
  const totalBlockers = dailyLogs.filter(l => l.blockers && l.blockers !== 'None').length;
  const totalServerUpdates = dailyLogs.filter(l => l.serverUpdates).length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Executive Overview Portal (General Manager Dashboard)</span>
            </div>
            <h1 className="text-2xl font-extrabold font-outfit text-white">
              Executive Project Health & Accomplishment Summary
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              High-level overview across all active projects, QA approvals, backend deployments, and operational blockers.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalDoneTasks}</div>
          <div className="text-[10px] text-slate-500">Across all projects</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>QA Review Tasks</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalQATasks}</div>
          <div className="text-[10px] text-slate-500">Tasks ready for QA</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Server Deployments</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalServerUpdates}</div>
          <div className="text-[10px] text-slate-500">Section 5 server updates</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Active Blockers</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{totalBlockers}</div>
          <div className="text-[10px] text-slate-500">Dependencies / issues</div>
        </div>
      </div>

      {/* Projects Overview List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Active Projects Executive Summary ({projects.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const logs = dailyLogs.filter(l => l.projectId === proj.id);
            const done = logs.flatMap(l => l.tasks.filter(t => t.status === 'done')).length;
            const qa = logs.flatMap(l => l.tasks.filter(t => t.isForQA)).length;

            return (
              <div key={proj.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{proj.name} ({proj.code})</span>
                  <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                    {logs.length} Logs
                  </span>
                </div>
                <p className="text-xs text-slate-400">{proj.description}</p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span>QA Manager: <strong className="text-slate-300">{proj.qaManagerName}</strong></span>
                  <span>Backend Lead: <strong className="text-slate-300">{proj.backendLeadName}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
