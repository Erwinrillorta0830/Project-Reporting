import React, { useState, useEffect } from 'react';
import { Project, DailyLog, TaskItem, QAEmailLog } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck2, 
  ExternalLink, 
  ImageIcon, 
  Mail, 
  Clock, 
  Send, 
  Eye, 
  Check, 
  AlertCircle, 
  RefreshCw,
  X,
  History
} from 'lucide-react';
import { generateQAEmailHTML, extractQACandidateTasks } from '../services/emailService';
import { 
  triggerManualQADigest, 
  getQAEmailLogs, 
  getLastQASentDate,
  isAutoSchedulerEnabled,
  setAutoSchedulerEnabled
} from '../services/qaCronSchedulerService';

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

  const [qaEmail, setQaEmail] = useState<string>(
    currentProject.qaManagerEmail || 'reginevertex1201@gmail.com'
  );
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [emailLogs, setEmailLogs] = useState<QAEmailLog[]>([]);
  const [autoScheduleActive, setAutoScheduleActive] = useState<boolean>(isAutoSchedulerEnabled());

  useEffect(() => {
    setEmailLogs(getQAEmailLogs());
  }, []);

  useEffect(() => {
    if (currentProject.qaManagerEmail) {
      setQaEmail(currentProject.qaManagerEmail);
    }
  }, [currentProject.id]);

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

  const handleSendManualEmail = async () => {
    setIsSending(true);
    setSendResult(null);

    const res = await triggerManualQADigest(
      dailyLogs,
      projects,
      qaEmail,
      currentProject.qaManagerName || 'Regine Lachica'
    );

    setIsSending(false);
    setSendResult(res);
    setEmailLogs(getQAEmailLogs());

    setTimeout(() => {
      setSendResult(null);
    }, 6000);
  };

  const handleToggleScheduler = () => {
    const nextState = !autoScheduleActive;
    setAutoScheduleActive(nextState);
    setAutoSchedulerEnabled(nextState);
  };

  const allQATasks = extractQACandidateTasks(dailyLogs, projects);
  const previewHTML = generateQAEmailHTML(
    allQATasks,
    currentProject.qaManagerName || 'Regine Lachica'
  );
  const lastSentDate = getLastQASentDate();

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
              QA Manager: <strong className="text-slate-200">{currentProject.qaManagerName}</strong> • Review daily tasks and automated 5:00 AM notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Automated 5:00 AM Email Digest Control Card */}
      <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-extrabold text-white font-outfit">
                Automated 5:00 AM Monday-to-Friday Daily QA Email Digest
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                autoScheduleActive 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {autoScheduleActive ? '🟢 SCHEDULER ACTIVE' : '⚪ PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automatically compiles all daily QA tasks and sends an HTML digest to the QA Manager every <strong>Monday to Friday at 5:00 AM</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleScheduler}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition ${
                autoScheduleActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border-cyan-800'
              }`}
            >
              {autoScheduleActive ? 'Pause Auto-Schedule' : 'Enable Auto-Schedule'}
            </button>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Logs ({emailLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Email Settings & Direct Dispatch Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <span>QA Manager Email Recipient (Gmail SMTP):</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={qaEmail}
                onChange={(e) => setQaEmail(e.target.value)}
                placeholder="reginevertex1201@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Configured SMTP Sender: <strong className="text-cyan-400">erwinrillorta0830@gmail.com</strong>
            </p>
          </div>

          <div className="md:col-span-6 flex flex-wrap items-center gap-2 justify-start md:justify-end">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview Email HTML</span>
            </button>

            <button
              onClick={handleSendManualEmail}
              disabled={isSending}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending via Gmail SMTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Daily QA Email Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Schedule Info Box */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 rounded-xl p-3 border border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next Automated Schedule: <strong>Every Monday to Friday at 5:00 AM</strong></span>
          </div>

          <div>
            Last Sent Date: <strong className="text-slate-200">{lastSentDate || 'Not yet sent today'}</strong>
          </div>
        </div>

        {/* Status Toast Alert */}
        {sendResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
            sendResult.success 
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
              : 'bg-red-950/80 border-red-700 text-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {sendResult.success ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{sendResult.message}</span>
            </div>
            <button onClick={() => setSendResult(null)} className="hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* History Drawer */}
        {showHistory && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Email Dispatch Logs</h4>
            {emailLogs.length === 0 ? (
              <p className="text-xs italic text-slate-500">No email dispatches recorded yet.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">
                        {log.triggerType === 'scheduled_5am' ? '⏰ 5:00 AM Cron Schedule' : '⚡ Manual Send Trigger'} 
                        <span className="text-slate-400"> → {log.recipientEmail}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(log.sentAt).toLocaleString()} • {log.taskCount} tasks included
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

      {/* HTML Email Digest Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">HTML Email Digest Preview</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
              <iframe
                title="QA Email Digest HTML Preview"
                srcDoc={previewHTML}
                className="w-full h-[600px] border border-slate-800 rounded-xl bg-white"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleSendManualEmail();
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send This Email Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
