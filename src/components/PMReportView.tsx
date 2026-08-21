import React, { useState } from 'react';
import { Project, DailyLog, ReportType, GeminiConfig, DocumentTemplateConfig } from '../types';
import { generateAIReportExecutiveSummary } from '../services/geminiService';
import { PrintableReport } from './PrintableReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Calendar, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  CalendarDays,
  Layers,
  UserCheck,
  Settings,
  Download,
  FileDown
} from 'lucide-react';

interface PMReportViewProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  dailyLogs: DailyLog[];
  geminiConfig: GeminiConfig;
  templateConfig: DocumentTemplateConfig;
  onOpenTemplateConfig: () => void;
}

export const PMReportView: React.FC<PMReportViewProps> = ({
  projects,
  selectedProjectId,
  onProjectChange,
  dailyLogs,
  geminiConfig,
  templateConfig,
  onOpenTemplateConfig
}) => {
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0] || {
    id: 'proj-vtc-1',
    name: 'Inventory & Dispatch System',
    code: 'IDS',
    description: 'Enterprise Purchase Order receiving, serial validation, and dispatch management system',
    qaManagerName: 'Sarah Jenkins (QA Manager)',
    backendLeadName: 'Marc Quitalig (Lead Backend Dev)'
  };

  const TODAY = new Date().toISOString().split('T')[0];
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getPastDate(5));
  const [endDate, setEndDate] = useState(TODAY);

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const formatDateLabel = (str: string) => {
    try {
      const d = new Date(str);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return str;
    }
  };

  const formatDateRangeLabel = (startStr: string, endStr: string) => {
    try {
      const d1 = new Date(startStr);
      const d2 = new Date(endStr);
      const m1 = d1.toLocaleString('en-US', { month: 'long' });
      const m2 = d2.toLocaleString('en-US', { month: 'long' });
      const day1 = d1.getDate();
      const day2 = d2.getDate();
      const year = d2.getFullYear();

      if (m1 === m2) {
        return `${m1} ${day1}–${day2}, ${year}`;
      }
      return `${m1} ${day1} – ${m2} ${day2}, ${year}`;
    } catch {
      return `${startStr} to ${endStr}`;
    }
  };

  // Filter logs & tasks based on project and date selection
  const filteredLogs = dailyLogs
    .filter(log => {
      const matchesDate = reportType === 'daily' 
        ? log.date === selectedDate 
        : (log.date >= startDate && log.date <= endDate);
      if (!matchesDate) return false;
      return log.projectId === selectedProjectId || log.tasks.some(t => (t.projectId || log.projectId) === selectedProjectId);
    })
    .map(log => ({
      ...log,
      tasks: log.tasks.filter(t => (t.projectId || log.projectId) === selectedProjectId)
    }));

  const reportPeriodLabel = reportType === 'daily' 
    ? formatDateLabel(selectedDate)
    : formatDateRangeLabel(startDate, endDate);

  const developersList = Array.from(new Set(filteredLogs.map(l => l.developerName).filter(Boolean)));
  const developersStr = developersList.length > 0
    ? developersList.join(' and ')
    : 'Christian Parayno and Marc Quitalig';

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const summary = await generateAIReportExecutiveSummary(
        currentProject,
        reportType,
        reportPeriodLabel,
        filteredLogs,
        geminiConfig
      );
      setAiSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const el = document.querySelector('.paper-document-outer-wrapper') as HTMLElement || document.getElementById('printable-accomplishment-report');
    if (!el) return;
    setIsGeneratingPDF(true);
    try {
      const sheets = el.querySelectorAll('.document-page-sheet');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      if (sheets.length > 0) {
        for (let i = 0; i < sheets.length; i++) {
          const sheetEl = sheets[i] as HTMLElement;
          const canvas = await html2canvas(sheetEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight));
        }
      } else {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${reportType}-accomplishment-report-${reportPeriodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Generating PDF failed. You can use the Print / Export button to save via browser print dialog.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyMarkdown = () => {
    let md = `# ${reportType === 'daily' ? 'Daily' : 'Weekly'} Developer Accomplishment Report\n`;
    md += `**Reporting Period:** ${reportPeriodLabel}\n`;
    md += `**Developers:** ${developersStr}\n\n`;

    const allTasks = filteredLogs.flatMap(l => 
      l.tasks.map(t => {
        const taskProjId = t.projectId || l.projectId;
        const foundProj = projects.find(p => p.id === taskProjId);
        const code = foundProj?.code || currentProject.code || (taskProjId === '11111111-1111-1111-1111-111111111111' ? 'IDS' : 'VOS Sync');
        return {
          task: t,
          developer: l.developerName,
          projectCode: code
        };
      })
    );

    md += `### Done Task for the Whole Week with Approval of QA Manager\n`;
    allTasks.filter(item => item.task.status === 'done' && !item.task.isOutofScope).forEach(item => {
      md += `o **${item.developer} (${item.projectCode}):** ${item.task.description || item.task.title}\n`;
      md += `  o QA Approval: [ ]\n`;
    });

    md += `\n### List of Tasks for QA Review\n`;
    allTasks.filter(item => item.task.isForQA || item.task.status === 'for_qa').forEach(item => {
      md += `o **${item.projectCode}:** ${item.task.title} (${item.task.description})\n`;
    });
    md += `\n${templateConfig.qaSignatureLabel}: ____________________\nDate Approved: ____________________\n`;

    md += `\n### List of Unfinished Tasks with Valid Reasons\n`;
    allTasks.filter(item => item.task.status === 'in_progress' || item.task.status === 'blocked').forEach(item => {
      md += `o **Task:** ${item.task.title}\n`;
      md += `  o **Valid Reason:** ${item.task.unfinishedReason || 'Pending workflow stabilization.'}\n`;
    });

    md += `\n### List of Tasks Done Out of Scope from the Planned Tasks for the Week\n`;
    allTasks.filter(item => item.task.isOutofScope).forEach(item => {
      md += `o **${item.task.title}:** ${item.task.description}\n`;
    });

    md += `\n### System Update to the Server\n`;
    filteredLogs.filter(l => l.serverUpdates).forEach(l => {
      md += `o ${l.serverUpdates}\n`;
    });
    md += `\n${templateConfig.backendSignatureLabel}: ____________________\nDate Acknowledged: ____________________\n`;

    md += `\n### Blockers\n`;
    filteredLogs.map(l => l.blockers).filter(b => b && b.toLowerCase() !== 'none').forEach(b => {
      md += `o ${b}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  const totalTasksCount = filteredLogs.flatMap(l => l.tasks).length;
  const qaItemsCount = filteredLogs.flatMap(l => l.tasks.filter(t => t.isForQA)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* PM Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 print:hidden">
        
        {/* Title & Mode Switcher Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>CORPORATE REPORT ENGINE</span>
            </div>
            <h1 className="text-2xl font-extrabold font-outfit text-white">
              Accomplishment Report: <span className="text-emerald-400">{currentProject.name}</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Template Configuration Launcher Button */}
            <button
              type="button"
              onClick={onOpenTemplateConfig}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
              title="Configure Document Template & Logos"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>Document Template</span>
            </button>

            {/* Daily vs Weekly Toggle */}
            <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setReportType('daily')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  reportType === 'daily'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Daily Report</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('weekly')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  reportType === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Weekly Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Filter & Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Date Picker Input */}
          <div className="lg:col-span-5">
            {reportType === 'daily' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select Log Date</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Week Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Week End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="lg:col-span-7 flex flex-wrap items-center space-x-2 justify-start lg:justify-end gap-y-2">
            
            {/* Gemini AI Summarizer */}
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Synthesizing...' : '✨ Gemini Summary'}</span>
            </button>

            {/* Direct PDF File Download */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-1.5 bg-indigo-950 border border-indigo-500/40 hover:bg-indigo-900/60 text-indigo-300 px-4 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 whitespace-nowrap"
            >
              <FileDown className={`w-4 h-4 text-indigo-400 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPDF ? 'Saving PDF...' : 'Save PDF'}</span>
            </button>

            {/* Copy Markdown */}
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition whitespace-nowrap"
              title="Copy formatted markdown report"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy MD</span>
                </>
              )}
            </button>

            {/* Print & Browser PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

          </div>

        </div>

        {/* Filter Stats Badge Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="text-slate-500">Collected Logs:</span>
              <strong className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded">{filteredLogs.length}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center space-x-1.5">
              <span className="text-slate-500">Total Tasks:</span>
              <strong className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded">{totalTasksCount}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center space-x-1.5">
              <span className="text-slate-500">Document Font:</span>
              <strong className="text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-serif">
                {templateConfig.fontFamily}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Developers: <strong className="text-slate-200 font-semibold">{developersStr}</strong></span>
          </div>
        </div>

      </div>

      {/* Main Printable Document Frame */}
      <div className="bg-slate-950 p-2 sm:p-6 rounded-2xl border border-slate-800/80 shadow-2xl print:bg-transparent print:p-0 print:border-none print:shadow-none print:rounded-none">
        <PrintableReport
          project={currentProject}
          projects={projects}
          reportType={reportType}
          reportDateStr={reportPeriodLabel}
          logs={filteredLogs}
          templateConfig={templateConfig}
          aiSummary={aiSummary}
        />
      </div>

    </div>
  );
};
