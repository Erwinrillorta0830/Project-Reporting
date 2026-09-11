import { DailyLog, Project, QAEmailLog } from '../types';
import { sendQADailyEmailDigest } from './emailService';

const LAST_SENT_DATE_KEY = 'vtc_qa_email_last_sent_date';
const QA_EMAIL_LOGS_KEY = 'vtc_qa_email_history_logs_v1';
const AUTO_SCHEDULER_ENABLED_KEY = 'vtc_qa_email_auto_enabled';

let timerId: any = null;

/**
 * Get all stored QA email dispatch logs
 */
export const getQAEmailLogs = (): QAEmailLog[] => {
  try {
    const raw = localStorage.getItem(QA_EMAIL_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse QA email logs:', e);
  }
  return [];
};

/**
 * Store a new QA email log
 */
export const saveQAEmailLog = (log: QAEmailLog) => {
  const existing = getQAEmailLogs();
  const updated = [log, ...existing].slice(0, 50); // Keep last 50 logs
  localStorage.setItem(QA_EMAIL_LOGS_KEY, JSON.stringify(updated));
};

/**
 * Get last sent date string (YYYY-MM-DD)
 */
export const getLastQASentDate = (): string | null => {
  return localStorage.getItem(LAST_SENT_DATE_KEY);
};

/**
 * Check if automated scheduler is enabled (default: true)
 */
export const isAutoSchedulerEnabled = (): boolean => {
  const val = localStorage.getItem(AUTO_SCHEDULER_ENABLED_KEY);
  return val !== 'false'; // Default to true
};

/**
 * Set auto scheduler state
 */
export const setAutoSchedulerEnabled = (enabled: boolean) => {
  localStorage.setItem(AUTO_SCHEDULER_ENABLED_KEY, String(enabled));
};

/**
 * Core check and trigger function for 5:00 AM Monday-Friday schedule
 */
export const checkAndTrigger5AMQADigest = async (
  dailyLogs: DailyLog[],
  projects: Project[],
  qaManagerEmail: string = 'reginevertex1201@gmail.com',
  qaManagerName: string = 'Regine Lachica'
) => {
  if (!isAutoSchedulerEnabled()) return;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Check if today is Monday to Friday (1-5)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  
  // Check if current time is 5:00 AM to 5:05 AM window
  const is5AMWindow = hours === 5 && minutes <= 5;

  const todayStr = now.toISOString().split('T')[0];
  const lastSentStr = getLastQASentDate();

  if (isWeekday && is5AMWindow && lastSentStr !== todayStr) {
    console.log(`[QA Cron Scheduler] 5:00 AM Mon-Fri trigger active! Dispatching QA email digest for ${todayStr}...`);
    
    const result = await sendQADailyEmailDigest(dailyLogs, projects, qaManagerEmail, qaManagerName);

    const logEntry: QAEmailLog = {
      id: `log-${Date.now()}`,
      sentAt: now.toISOString(),
      recipientEmail: result.recipient,
      taskCount: result.taskCount,
      status: result.success ? 'success' : 'failed',
      triggerType: 'scheduled_5am',
      messageId: result.messageId,
      error: result.error
    };

    saveQAEmailLog(logEntry);

    if (result.success) {
      localStorage.setItem(LAST_SENT_DATE_KEY, todayStr);
      console.log(`[QA Cron Scheduler] Daily 5:00 AM QA email successfully sent to ${result.recipient}`);
    }
  }
};

/**
 * Start background timer interval (checks every 30 seconds)
 */
export const initQACronScheduler = (
  getLatestLogs: () => DailyLog[],
  getLatestProjects: () => Project[],
  getQAEmail: () => string,
  getQAName: () => string
) => {
  if (timerId) clearInterval(timerId);

  // Run immediate check
  checkAndTrigger5AMQADigest(getLatestLogs(), getLatestProjects(), getQAEmail(), getQAName());

  // Check every 30 seconds
  timerId = setInterval(() => {
    checkAndTrigger5AMQADigest(getLatestLogs(), getLatestProjects(), getQAEmail(), getQAName());
  }, 30000);
};

/**
 * Stop scheduler
 */
export const stopQACronScheduler = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

/**
 * Manual trigger helper for testing / sending on demand from UI
 */
export const triggerManualQADigest = async (
  dailyLogs: DailyLog[],
  projects: Project[],
  targetEmail: string = 'reginevertex1201@gmail.com',
  qaManagerName: string = 'Regine Lachica'
): Promise<{ success: boolean; message: string }> => {
  const result = await sendQADailyEmailDigest(dailyLogs, projects, targetEmail, qaManagerName);

  const logEntry: QAEmailLog = {
    id: `log-${Date.now()}`,
    sentAt: new Date().toISOString(),
    recipientEmail: result.recipient,
    taskCount: result.taskCount,
    status: result.success ? 'success' : 'failed',
    triggerType: 'manual',
    messageId: result.messageId,
    error: result.error
  };

  saveQAEmailLog(logEntry);

  if (result.success) {
    return {
      success: true,
      message: `QA Digest email successfully sent to ${result.recipient} (${result.taskCount} tasks included)`
    };
  } else {
    return {
      success: false,
      message: `Failed to send email: ${result.error || 'Unknown error'}`
    };
  }
};
