import React, { useRef } from 'react';
import { MapPin, Globe, Mail, Phone } from 'lucide-react';
import { Project, DailyLog, TaskItem, ReportType, DocumentTemplateConfig, PaperSize } from '../types';

interface PrintableReportProps {
  project?: Project;
  projects?: Project[];
  reportType: ReportType;
  reportDateStr: string;
  logs: DailyLog[];
  templateConfig: DocumentTemplateConfig;
  aiSummary?: string;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  project,
  projects = [],
  reportType,
  reportDateStr,
  logs,
  templateConfig
}) => {
  const documentRef = useRef<HTMLDivElement>(null);

  // Extract unique developers across logs
  const developersList = Array.from(
    new Set(logs.map(l => l.developerName).filter(Boolean))
  );
  const developersStr = developersList.length > 0
    ? developersList.join(' and ')
    : 'Christian Parayno and Marc Quitalig';

  // Aggregate all tasks
  const allTasks: { task: TaskItem; developer: string; projectCode: string }[] = logs.flatMap(l => 
    l.tasks.map(t => {
      const taskProjId = t.projectId || l.projectId;
      const foundProj = projects.find(p => p.id === taskProjId);
      const code = foundProj?.code || project?.code || (taskProjId === '11111111-1111-1111-1111-111111111111' ? 'IDS' : 'VOS Sync');
      return {
        task: t,
        developer: l.developerName,
        projectCode: code
      };
    })
  );

  // Groupings matching exact requested structure
  const doneTasks = allTasks.filter(item => item.task.status === 'done' && !item.task.isOutofScope);
  const qaReviewTasks = allTasks.filter(item => item.task.isForQA || item.task.status === 'for_qa');
  const unfinishedTasks = allTasks.filter(item => item.task.status === 'in_progress' || item.task.status === 'blocked');
  const outOfScopeTasks = allTasks.filter(item => item.task.isOutofScope);
  
  // Extract server updates
  const serverUpdatesList = logs
    .filter(l => l.serverUpdates && l.serverUpdates.trim().length > 0)
    .map(l => l.serverUpdates!);

  // Extract blockers
  const blockersList = logs
    .filter(l => l.blockers && l.blockers.trim().length > 0 && l.blockers !== 'None')
    .map(l => l.blockers!);

  const fontFamilyStyle = {
    fontFamily: templateConfig.fontFamily === 'Times New Roman' 
      ? '"Times New Roman", Times, Georgia, serif'
      : templateConfig.fontFamily === 'Georgia'
      ? 'Georgia, serif'
      : templateConfig.fontFamily === 'Arial'
      ? 'Arial, Helvetica, sans-serif'
      : 'Inter, sans-serif'
  };

  const getPaperDimensionsClass = (size?: PaperSize) => {
    switch (size) {
      case 'letter':
        return 'w-full max-w-[816px] min-h-[1056px]'; // Letter 8.5" x 11"
      case 'legal':
        return 'w-full max-w-[816px] min-h-[1344px]'; // Legal 8.5" x 14"
      case 'a4':
      default:
        return 'w-full max-w-[794px] min-h-[1123px]'; // A4 210mm x 297mm
    }
  };

  // Determine if content length warrants a 2-page physical report split
  const evidenceCount = doneTasks.filter(item => Boolean(item.task.evidenceUrl)).length;
  const totalContentScore = (doneTasks.length * 2) + (qaReviewTasks.length * 2) + (evidenceCount * 4) + (unfinishedTasks.length * 2) + outOfScopeTasks.length + serverUpdatesList.length + blockersList.length + 6;
  const isMultiPage = totalContentScore > 10;
  const totalPages = isMultiPage ? 2 : 1;

  return (
    <div className="paper-document-outer-wrapper w-full flex flex-col items-center space-y-8 print:space-y-0 print:m-0 print:p-0">
      
      {/* ========================================================================= */}
      {/* PAGE 1 / SHEET 1 */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[794px] flex flex-col items-center print:m-0 print:p-0">
        
        {/* Page 1 Header Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 px-1 print:hidden select-none">
          <div className="flex items-center space-x-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">Printable Document Canvas</span>
            <span>• Size: <strong className="text-indigo-400 uppercase font-bold">{templateConfig.paperSize || 'A4'}</strong></span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>{templateConfig.fontFamily || 'Times New Roman'}</span>
            <span>•</span>
            <span className="font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-bold">
              Page 1 of {totalPages}
            </span>
          </div>
        </div>

        {/* Sheet 1 Body */}
        <div 
          ref={documentRef}
          id="printable-accomplishment-report"
          style={fontFamilyStyle}
          className={`printable-document document-page-sheet bg-white text-slate-900 p-8 sm:p-12 shadow-2xl border border-slate-300 mx-auto relative leading-snug transition-all duration-300 ${getPaperDimensionsClass(templateConfig.paperSize)}`}
        >
          {/* Watermark Image */}
          {templateConfig.showWatermark && templateConfig.watermarkLogoUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
              <img 
                src={templateConfig.watermarkLogoUrl} 
                alt="Corporate Watermark" 
                className="watermark-image w-[480px] h-[480px] object-contain opacity-5"
              />
            </div>
          )}

            <div className="relative z-10 flex flex-col justify-between min-h-[920px] space-y-5">
              
              <div className="space-y-5">
                
                {/* CORPORATE LETTERHEAD HEADER IMAGE */}
                {templateConfig.showLetterhead && (
                  <div className="document-header-letterhead pb-4 border-b border-slate-400">
                    {templateConfig.headerLogoUrl ? (
                      <div className="flex items-center justify-center">
                        <img 
                          src={templateConfig.headerLogoUrl} 
                          alt={templateConfig.companyName} 
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center space-y-0.5">
                        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900 font-serif">
                          {templateConfig.companyName}
                        </h1>
                        <p className="text-[11px] text-slate-600 tracking-widest">{templateConfig.tagline}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* REPORT METADATA SECTION */}
                <section className="space-y-0.5">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {reportType === 'daily' ? 'Daily Developer Accomplishment Report' : 'Weekly Developer Accomplishment Report'}
                  </h2>
                  <div className="text-xs font-semibold text-slate-800">
                    <strong>Reporting Period:</strong> {reportDateStr}
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    <strong>Developers:</strong> {developersStr}
                  </div>
                </section>

                {/* SECTION 1: Done Tasks with QA Approval */}
                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {reportType === 'daily' 
                      ? 'Done Task for Today with Approval of QA Manager' 
                      : 'Done Task for the Whole Week with Approval of QA Manager'}
                  </h3>

                  {doneTasks.length === 0 ? (
                    <p className="text-xs italic text-slate-500 pl-4">• No completed tasks recorded for this period.</p>
                  ) : (
                    <ul className="space-y-2 pl-2 text-xs text-slate-900">
                      {doneTasks.map((item, idx) => (
                        <li key={idx} className="space-y-1">
                          <div className="flex items-start space-x-2">
                            <span className="text-slate-500 font-mono">o</span>
                            <div>
                              <strong className="text-slate-900">{item.developer} ({item.projectCode}):</strong>{' '}
                              <span>{item.task.description || item.task.title}</span>
                            </div>
                          </div>
                          <div className="pl-5 text-slate-700 flex items-center space-x-2">
                            <span className="text-slate-400 font-mono">o</span>
                            <span>QA Approval: [{item.task.qaAcknowledged ? ' X ' : '   '}]</span>
                          </div>

                          {/* Evidence Screenshot or Link */}
                          {item.task.evidenceUrl && (
                            <div className="pl-5 pt-0.5 text-xs text-slate-800">
                              {item.task.evidenceUrl.startsWith('data:image') || item.task.evidenceUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ? (
                                <div className="my-1 space-y-0.5">
                                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">QA Evidence Screenshot:</div>
                                  <img
                                    src={item.task.evidenceUrl}
                                    alt="QA Evidence Proof"
                                    className="max-h-36 max-w-sm object-contain rounded border border-slate-300 bg-slate-50 p-1 shadow-sm"
                                  />
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-700 font-mono">
                                  <strong>Evidence Proof Link:</strong>{' '}
                                  <a href={item.task.evidenceUrl} target="_blank" rel="noreferrer" className="text-indigo-800 underline">
                                    {item.task.evidenceUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* SECTION 2: List of Tasks for QA Review & QA Manager Signature */}
                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    List of Tasks for QA Review
                  </h3>

                  {qaReviewTasks.length === 0 ? (
                    <p className="text-xs italic text-slate-500 pl-4">• No tasks currently submitted for QA review.</p>
                  ) : (
                    <ul className="space-y-1 pl-2 text-xs text-slate-900">
                      {qaReviewTasks.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-slate-500 font-mono">o</span>
                          <div>
                            <strong className="text-slate-900">{item.projectCode}:</strong>{' '}
                            <span>{item.task.title} {item.task.description ? `(${item.task.description})` : ''}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* QA Signature Lines */}
                  <div className="pt-2 space-y-0.5 text-xs font-semibold text-slate-900">
                    <div>Signature of QA Manager ({project?.qaManagerName || 'Regine Lachica'}): ____________________________________</div>
                    <div>Date Approved: ____________________________________</div>
                  </div>
                </section>

                {/* If Single Page: Render Remaining Sections on Page 1 */}
                {!isMultiPage && (
                  <>
                    {/* SECTION 3: Unfinished Tasks */}
                    <section className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        List of Unfinished Tasks with Valid Reasons
                      </h3>
                      {unfinishedTasks.length === 0 ? (
                        <p className="text-xs italic text-slate-500 pl-4">• None — 100% of scheduled tasks were completed.</p>
                      ) : (
                        <ul className="space-y-1.5 pl-2 text-xs text-slate-900">
                          {unfinishedTasks.map((item, idx) => (
                            <li key={idx} className="space-y-0.5">
                              <div className="flex items-start space-x-2">
                                <span className="text-slate-500 font-mono">o</span>
                                <div>
                                  <strong className="text-slate-900">Task:</strong>{' '}
                                  <span>{item.task.title} — {item.task.description}</span>
                                </div>
                              </div>
                              <div className="pl-5 text-slate-700 flex items-start space-x-2">
                                <span className="text-slate-400 font-mono">o</span>
                                <div>
                                  <strong className="text-slate-900">Valid Reason:</strong>{' '}
                                  <span>{item.task.unfinishedReason || 'Pending scheduled maintenance window.'}</span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    {/* SECTION 4: Out of Scope Tasks */}
                    <section className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        List of Tasks Done Out of Scope from the Planned Tasks for the Week
                      </h3>
                      {outOfScopeTasks.length === 0 ? (
                        <p className="text-xs italic text-slate-500 pl-4">• No out-of-scope tasks executed during this period.</p>
                      ) : (
                        <ul className="space-y-1 pl-2 text-xs text-slate-900">
                          {outOfScopeTasks.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-slate-500 font-mono">o</span>
                              <div>
                                <strong className="text-slate-900">{item.task.title}:</strong>{' '}
                                <span>{item.task.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    {/* SECTION 5: System Update to Server & Backend Signature */}
                    <section className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        System Update to the Server
                      </h3>
                      {serverUpdatesList.length === 0 ? (
                        <p className="text-xs italic text-slate-500 pl-4">• No system server updates deployed during this period.</p>
                      ) : (
                        <ul className="space-y-1 pl-2 text-xs text-slate-900">
                          {serverUpdatesList.map((update, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-slate-500 font-mono">o</span>
                              <span>{update}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="pt-2 space-y-0.5 text-xs font-semibold text-slate-900">
                        <div>Acknowledgement of Backend Dev ({project?.backendLeadName || 'James Ed Patrick Desear'}): ____________________________________</div>
                        <div>Date Acknowledged: ____________________________________</div>
                      </div>
                    </section>

                    {/* SECTION 6: Blockers & PM Signature */}
                    <section className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Blockers
                      </h3>
                      {blockersList.length === 0 ? (
                        <p className="text-xs italic text-slate-500 pl-4">• None — No active blockers encountered.</p>
                      ) : (
                        <ul className="space-y-1 pl-2 text-xs text-slate-900">
                          {blockersList.map((blocker, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-slate-500 font-mono">o</span>
                              <span>{blocker}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="pt-2 space-y-0.5 text-xs font-semibold text-slate-900">
                        <div>Prepared & Approved by Project Manager (Erwin Rillorta): ____________________________________</div>
                        <div>Date Signed: ____________________________________</div>
                      </div>
                    </section>
                  </>
                )}

              </div>

              {/* Corporate Footer ALWAYS on Sheet 1 */}
              <div className="document-footer-letterhead pt-4 border-t border-slate-400 text-[11px] text-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-sans">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>{templateConfig.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <a href={`http://${templateConfig.website}`} target="_blank" rel="noreferrer" className="text-slate-900 hover:underline font-medium">
                      {templateConfig.website}
                    </a>
                  </div>
                </div>

                <div className="space-y-0.5 text-left sm:text-right">
                  <div className="flex items-center sm:justify-end space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>{templateConfig.email}</span>
                  </div>
                  <div className="flex items-center sm:justify-end space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>{templateConfig.phone}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* PAGE 2 / SHEET 2 (Renders when content overflows page 1) */}
        {/* ========================================================================= */}
        {isMultiPage && (
          <div className="w-full max-w-[794px] flex flex-col items-center pt-4 print:pt-0 print:m-0 print:p-0">
            
            {/* Page 2 Header Bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 px-1 print:hidden select-none">
              <div className="flex items-center space-x-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="font-bold text-slate-200">Printable Document Canvas</span>
                <span>• Size: <strong className="text-indigo-400 uppercase font-bold">{templateConfig.paperSize || 'A4'}</strong></span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span>{templateConfig.fontFamily || 'Times New Roman'}</span>
                <span>•</span>
                <span className="font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-bold">
                  Page 2 of 2
                </span>
              </div>
            </div>

            {/* Sheet 2 Body */}
            <div 
              style={fontFamilyStyle}
              className={`printable-document document-page-sheet bg-white text-slate-900 p-8 sm:p-12 shadow-2xl border border-slate-300 mx-auto relative leading-snug transition-all duration-300 ${getPaperDimensionsClass(templateConfig.paperSize)}`}
            >
              {/* Watermark Image */}
              {templateConfig.showWatermark && templateConfig.watermarkLogoUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
                  <img 
                    src={templateConfig.watermarkLogoUrl} 
                    alt="Corporate Watermark" 
                    className="watermark-image w-[480px] h-[480px] object-contain opacity-5"
                  />
                </div>
              )}

              <div className="relative z-10 space-y-5 flex flex-col justify-between min-h-[920px]">
                
                <div className="space-y-5">
                  
                  {/* CORPORATE LETTERHEAD HEADER IMAGE ON PAGE 2 */}
                  {templateConfig.showLetterhead && (
                    <div className="document-header-letterhead pb-4 border-b border-slate-400">
                      {templateConfig.headerLogoUrl ? (
                        <div className="flex items-center justify-center">
                          <img 
                            src={templateConfig.headerLogoUrl} 
                            alt={templateConfig.companyName} 
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center space-y-0.5">
                          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900 font-serif">
                            {templateConfig.companyName}
                          </h1>
                          <p className="text-[11px] text-slate-600 tracking-widest">{templateConfig.tagline}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Page 2 Top Continuation Line */}
                  <div className="pb-3 border-b border-slate-300 flex items-center justify-between text-xs font-semibold text-slate-700 font-sans">
                    <span>VERTEX TECHNOLOGIES CORPORATION — ACCOMPLISHMENT REPORT</span>
                    <span>Page 2 of 2</span>
                  </div>

                  {/* SECTION 3: List of Unfinished Tasks with Valid Reasons */}
                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      List of Unfinished Tasks with Valid Reasons
                    </h3>

                    {unfinishedTasks.length === 0 ? (
                      <p className="text-xs italic text-slate-500 pl-4">• None — 100% of scheduled tasks were completed.</p>
                    ) : (
                      <ul className="space-y-1.5 pl-2 text-xs text-slate-900">
                        {unfinishedTasks.map((item, idx) => (
                          <li key={idx} className="space-y-0.5">
                            <div className="flex items-start space-x-2">
                              <span className="text-slate-500 font-mono">o</span>
                              <div>
                                <strong className="text-slate-900">Task:</strong>{' '}
                                <span>{item.task.title} — {item.task.description}</span>
                              </div>
                            </div>
                            <div className="pl-5 text-slate-700 flex items-start space-x-2">
                              <span className="text-slate-400 font-mono">o</span>
                              <div>
                                <strong className="text-slate-900">Valid Reason:</strong>{' '}
                                <span>{item.task.unfinishedReason || 'Pending scheduled maintenance window.'}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* SECTION 4: List of Tasks Done Out of Scope */}
                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      List of Tasks Done Out of Scope from the Planned Tasks for the Week
                    </h3>

                    {outOfScopeTasks.length === 0 ? (
                      <p className="text-xs italic text-slate-500 pl-4">• No out-of-scope tasks executed during this period.</p>
                    ) : (
                      <ul className="space-y-1 pl-2 text-xs text-slate-900">
                        {outOfScopeTasks.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-slate-500 font-mono">o</span>
                            <div>
                              <strong className="text-slate-900">{item.task.title}:</strong>{' '}
                              <span>{item.task.description}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* SECTION 5: System Update to Server & Backend Signature */}
                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      System Update to the Server
                    </h3>

                    {serverUpdatesList.length === 0 ? (
                      <p className="text-xs italic text-slate-500 pl-4">• No system server updates deployed during this period.</p>
                    ) : (
                      <ul className="space-y-1 pl-2 text-xs text-slate-900">
                        {serverUpdatesList.map((update, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-slate-500 font-mono">o</span>
                            <span>{update}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Backend Dev Signature Lines */}
                    <div className="pt-2 space-y-0.5 text-xs font-semibold text-slate-900">
                      <div>Acknowledgement of Backend Dev ({project?.backendLeadName || 'James Ed Patrick Desear'}): ____________________________________</div>
                      <div>Date Acknowledged: ____________________________________</div>
                    </div>
                  </section>

                  {/* SECTION 6: Blockers & PM Signature */}
                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Blockers
                    </h3>

                    {blockersList.length === 0 ? (
                      <p className="text-xs italic text-slate-500 pl-4">• None — No active blockers encountered.</p>
                    ) : (
                      <ul className="space-y-1 pl-2 text-xs text-slate-900">
                        {blockersList.map((blocker, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-slate-500 font-mono">o</span>
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* PM Signature Block */}
                    <div className="pt-2 space-y-0.5 text-xs font-semibold text-slate-900">
                      <div>Prepared & Approved by Project Manager (Erwin Rillorta): ____________________________________</div>
                      <div>Date Signed: ____________________________________</div>
                    </div>
                  </section>

                </div>

                {/* Corporate Footer at bottom of Page 2 */}
                <div className="document-footer-letterhead pt-4 border-t border-slate-400 text-[11px] text-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-sans">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{templateConfig.address}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <a href={`http://${templateConfig.website}`} target="_blank" rel="noreferrer" className="text-slate-900 hover:underline font-medium">
                        {templateConfig.website}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-left sm:text-right">
                    <div className="flex items-center sm:justify-end space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{templateConfig.email}</span>
                    </div>
                    <div className="flex items-center sm:justify-end space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{templateConfig.phone}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

    </div>
  );
};
