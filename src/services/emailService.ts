import { DailyLog, Project, TaskItem } from '../types';

export interface QAEmailTaskItem {
  logId: string;
  developerName: string;
  date: string;
  projectCode: string;
  projectName: string;
  task: TaskItem;
}

/**
 * Filter and extract all QA candidate tasks from daily logs
 */
export const extractQACandidateTasks = (
  dailyLogs: DailyLog[],
  projects: Project[],
  targetProjectId?: string
): QAEmailTaskItem[] => {
  const result: QAEmailTaskItem[] = [];

  for (const log of dailyLogs) {
    if (targetProjectId && targetProjectId !== 'ALL' && log.projectId !== targetProjectId) {
      continue;
    }

    const logProject = projects.find((p) => p.id === log.projectId);
    const logProjectCode = logProject?.code || 'PROJECT';
    const logProjectName = logProject?.name || 'Project';

    for (const task of log.tasks) {
      const taskProjId = task.projectId || log.projectId;

      if (targetProjectId && targetProjectId !== 'ALL' && taskProjId !== targetProjectId) {
        continue;
      }

      if (task.isForQA || task.status === 'for_qa') {
        const taskProject = projects.find((p) => p.id === taskProjId) || logProject;

        result.push({
          logId: log.id,
          developerName: log.developerName,
          date: task.taskDate || log.date,
          projectCode: taskProject?.code || logProjectCode,
          projectName: taskProject?.name || logProjectName,
          task
        });
      }
    }
  }

  return result;
};

/**
 * Generate a responsive HTML email document for the QA Manager digest
 */
export const generateQAEmailHTML = (
  qaTasks: QAEmailTaskItem[],
  qaManagerName: string = 'Regine Lachica',
  digestDate: string = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
): string => {
  const pendingCount = qaTasks.filter((t) => !t.task.qaAcknowledged).length;
  const approvedCount = qaTasks.filter((t) => t.task.qaAcknowledged).length;

  const rowsHTML =
    qaTasks.length === 0
      ? `<tr>
          <td colspan="4" style="padding: 24px; text-align: center; color: #64748b; font-style: italic; background-color: #0f172a;">
            No QA tasks currently pending review for today.
          </td>
        </tr>`
      : qaTasks
          .map((item, index) => {
            const isApproved = item.task.qaAcknowledged;
            const statusBg = isApproved ? '#065f46' : '#1e293b';
            const statusColor = isApproved ? '#34d399' : '#38bdf8';
            const statusText = isApproved ? 'APPROVED' : 'PENDING QA';

            const evidenceHTML = item.task.evidenceUrl
              ? `<div style="margin-top: 8px; font-size: 12px; color: #38bdf8;">
                  <strong>Evidence Proof:</strong> 
                  <a href="${item.task.evidenceUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">
                    View Evidence Screenshot / Link
                  </a>
                </div>`
              : '';

            return `
        <tr style="background-color: ${index % 2 === 0 ? '#0f172a' : '#1e293b'}; border-bottom: 1px solid #334155;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: bold; color: #f8fafc; vertical-align: top;">
            ${item.developerName}
            <div style="font-size: 11px; font-weight: normal; color: #94a3b8; margin-top: 4px;">
              ${item.projectCode} • ${item.date}
            </div>
          </td>
          <td style="padding: 14px 16px; font-size: 13px; color: #f1f5f9; vertical-align: top;">
            <div style="font-weight: bold; color: #ffffff; margin-bottom: 4px;">${item.task.title}</div>
            <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${item.task.description}</div>
            ${evidenceHTML}
          </td>
          <td style="padding: 14px 16px; text-align: center; vertical-align: top;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor};">
              ${statusText}
            </span>
          </td>
        </tr>`;
          })
          .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VTC Daily QA Task Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc;">
  <div style="max-width: 680px; margin: 20px auto; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #020617 0%, #0891b2 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #06b6d4;">
      <div style="font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #a5f3fc; margin-bottom: 6px;">
        VERTEX TECHNOLOGIES CORPORATION
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Daily QA Task Digest
      </h1>
      <div style="font-size: 13px; color: #e0f2fe; margin-top: 8px;">
        Automated 5:00 AM Notification • ${digestDate}
      </div>
    </div>

    <!-- Greeting & Summary Box -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; color: #e2e8f0; margin-top: 0;">
        Hello <strong style="color: #38bdf8;">${qaManagerName}</strong>,
      </p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Below is the official automated daily digest of tasks submitted for Quality Assurance (QA) review as of <strong>5:00 AM</strong>.
      </p>

      <!-- Stat Cards -->
      <table width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
        <tr>
          <td width="32%" style="background-color: #1e293b; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #334155;">
            <div style="font-size: 26px; font-weight: 800; color: #ffffff;">${qaTasks.length}</div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-top: 4px;">Total QA Tasks</div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background-color: #1e293b; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #0284c7;">
            <div style="font-size: 26px; font-weight: 800; color: #38bdf8;">${pendingCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #38bdf8; margin-top: 4px;">Pending Review</div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background-color: #1e293b; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #059669;">
            <div style="font-size: 26px; font-weight: 800; color: #34d399;">${approvedCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #34d399; margin-top: 4px;">Signed Off</div>
          </td>
        </tr>
      </table>

      <!-- Tasks Table -->
      <div style="border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-top: 24px;">
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
          <thead>
            <tr style="background-color: #020617; border-bottom: 2px solid #334155;">
              <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #06b6d4;">Developer & Project</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #06b6d4;">Task & Evidence Description</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #06b6d4;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
        <a href="http://127.0.0.1:3000" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 14px rgba(8, 145, 178, 0.4);">
          Open QA Review Portal & Sign Off Tasks →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #020617; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b;">
      <p style="margin: 0;">Vertex Technologies Corporation • Automated Daily QA Dispatcher System</p>
      <p style="margin: 4px 0 0 0; font-size: 11px;">Gonzales Street, Bonuan Boquig, Dagupan City • support@vertextechcorp.com</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Dispatch the daily QA digest email via POST /api/send-qa-email
 */
export const sendQADailyEmailDigest = async (
  dailyLogs: DailyLog[],
  projects: Project[],
  targetEmail?: string,
  qaManagerName: string = 'Regine Lachica'
): Promise<{ success: boolean; recipient: string; taskCount: number; messageId?: string; error?: string }> => {
  const qaTasks = extractQACandidateTasks(dailyLogs, projects);
  const recipient = targetEmail || 'reginevertex1201@gmail.com';
  const htmlContent = generateQAEmailHTML(qaTasks, qaManagerName);
  const subject = `[VTC QA Digest] ${qaTasks.length} Task(s) Submitted for Review - ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;

  try {
    const response = await fetch('/api/send-qa-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipient,
        subject: subject,
        html: htmlContent
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        recipient,
        taskCount: qaTasks.length,
        messageId: result.messageId
      };
    } else {
      return {
        success: false,
        recipient,
        taskCount: qaTasks.length,
        error: result.error || 'Server responded with an error'
      };
    }
  } catch (err: any) {
    console.error('Failed to send QA daily email:', err);
    return {
      success: false,
      recipient,
      taskCount: qaTasks.length,
      error: err?.message || 'Network error attempting to send email'
    };
  }
};
