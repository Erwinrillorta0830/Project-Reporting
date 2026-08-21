import React, { useState } from 'react';
import { Project, DailyLog, TaskItem } from '../types';
import { ShieldCheck, CheckCircle2, FileCheck2, ExternalLink, Calendar, UserCheck, Image as ImageIcon, Paperclip } from 'lucide-react';

interface QAManagerViewProps {
  projects: Project[];
  selectedProjectId: string;
  dailyLogs: DailyLog[];
  onSaveLog: (log: DailyLog) => void;
}

export const QAManagerView: React.FC<QAManagerViewProps> = ({
  projects,
  selectedProjectId,
  dailyLogs,
  onSaveLog
}) => {
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const qaCandidateTasks: { log: DailyLog; task: TaskItem; taskProjectCode: string }[] = dailyLogs
    .filter(l => l.projectId === currentProject.id || l.tasks.some(t => (t.projectId || l.projectId) === currentProject.id))
    .flatMap(l =>
      l.tasks
        .filter(t => (t.projectId || l.projectId) === currentProject.id && (t.isForQA || t.status === 'for_qa'))
        .map(t => {
          const taskProj = projects.find(p => p.id === (t.projectId || l.projectId));
          return {
            log: l,
            task: t,
            taskProjectCode: taskProj?.code || currentProject.code
          };
        })
    );

  const handleToggleQAApproval = (targetLog: DailyLog, taskId: string) => {
    const updatedTasks = targetLog.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          qaAcknowledged: !t.qaAcknowledged,
          qaManagerName: currentProject.qaManagerName
        };
      }
      return t;
    });

    const updatedLog: DailyLog = {
      ...targetLog,
      tasks: updatedTasks
    };

    onSaveLog(updatedLog);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Section 1 & 2: QA Manager Approval & Sign-Off Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold font-outfit text-white">
              QA Review Dashboard for <span className="text-cyan-400">{currentProject.name}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              QA Manager: <strong className="text-slate-200">{currentProject.qaManagerName}</strong> • Review PR evidence proof and sign off QA approvals.
            </p>
          </div>
        </div>
      </div>

      {/* QA Review Items List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <span>Tasks Pending QA Sign-Off ({qaCandidateTasks.length})</span>
          </h2>
        </div>

        {qaCandidateTasks.length === 0 ? (
          <p className="text-xs italic text-slate-500 py-8 text-center">No tasks currently submitted for QA review in this project.</p>
        ) : (
          <div className="space-y-4">
            {qaCandidateTasks.map(({ log, task, taskProjectCode }) => (
              <div key={task.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{task.title}</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {log.developerName} ({taskProjectCode} • {log.date})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line">{task.description}</p>
                  
                  {task.evidenceUrl && (
                    <div className="pt-2 space-y-2">
                      {task.evidenceUrl.startsWith('data:image') || task.evidenceUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ? (
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Attached Image Screenshot Proof:</span>
                          </div>
                          <a href={task.evidenceUrl} target="_blank" rel="noreferrer" className="inline-block group">
                            <img
                              src={task.evidenceUrl}
                              alt="Evidence Proof Screenshot"
                              className="max-h-36 max-w-xs object-cover rounded-xl border border-slate-700 shadow-md group-hover:border-cyan-400 transition"
                            />
                            <span className="text-[10px] text-cyan-400 group-hover:underline block mt-0.5">Click to view full resolution</span>
                          </a>
                        </div>
                      ) : (
                        <div className="text-xs text-cyan-400 font-mono flex items-center space-x-1">
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                          <a href={task.evidenceUrl} target="_blank" rel="noreferrer" className="hover:underline font-semibold">
                            Evidence Proof Link: {task.evidenceUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QA Approval Action */}
                <div className="flex items-center space-x-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleToggleQAApproval(log, task.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      task.qaAcknowledged
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{task.qaAcknowledged ? 'QA Approved [ X ]' : 'Approve & Sign QA'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
