import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyLog, Project, TaskItem, GeminiConfig } from '../types';

export interface DeveloperImprovementInput {
  tasks: { title: string; description: string; status: string; unfinishedReason?: string }[];
  plansForTomorrow: string;
  blockers: string;
  serverUpdates?: string;
}

export interface DeveloperImprovementResult {
  tasks: { title: string; description: string; status: string; unfinishedReason?: string }[];
  plansForTomorrow: string;
  blockers: string;
  serverUpdates?: string;
}

export const testGeminiAPIConnection = async (config: GeminiConfig): Promise<{ success: boolean; message: string }> => {
  if (!config.apiKey || config.apiKey.trim() === '') {
    return { success: false, message: 'Please enter your Gemini API Key.' };
  }

  const trimmedKey = config.apiKey.trim();
  const selectedModel = config.model || 'gemini-3.1-flash-lite';

  try {
    const genAI = new GoogleGenerativeAI(trimmedKey);
    const model = genAI.getGenerativeModel({ model: selectedModel });
    const res = await model.generateContent('Reply ACTIVE');
    const text = res.response.text();
    if (text) {
      return { success: true, message: `Connected! Model "${selectedModel}" is active and working.` };
    }
  } catch (err: any) {
    console.warn(`Gemini API Model "${selectedModel}" check error:`, err);
    const rawMsg = err?.message || String(err);
    if (rawMsg.includes('404') || rawMsg.includes('not found')) {
      return {
        success: false,
        message: `Google API Error 404: Model "${selectedModel}" returned Not Found. This happens when the Generative Language API is not enabled for this project or key in Google Cloud Console.`
      };
    }
    return {
      success: false,
      message: `Google API Error: ${rawMsg}`
    };
  }

  return { success: false, message: 'No response from Gemini API.' };
};

export const improveDeveloperInput = async (
  input: DeveloperImprovementInput,
  config: GeminiConfig
): Promise<DeveloperImprovementResult> => {
  if (config.apiKey && config.apiKey.trim() !== '') {
    const trimmedKey = config.apiKey.trim();
    const selectedModel = config.model || 'gemini-3.1-flash-lite';

    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      
      const prompt = `You are a Senior Technical Project Manager. Refine and polish the following developer daily report log to make it professional, concise, grammatically correct, and action-oriented. Keep technical terms intact. Return ONLY a valid JSON object matching this structure:
{
  "tasks": [
    { "title": "polished title", "description": "polished description", "status": "same status as input", "unfinishedReason": "polished reason if any" }
  ],
  "plansForTomorrow": "polished plans",
  "blockers": "polished blockers",
  "serverUpdates": "polished server updates if any"
}

Input data to improve:
${JSON.stringify(input, null, 2)}`;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text() || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini API Exception] Model ${selectedModel} call failed:`, err);
    }
  }

  // Built-in smart fallback if no API key or on error
  return {
    tasks: input.tasks.map(t => ({
      ...t,
      title: t.title ? t.title.trim().replace(/^[-*•]\s*/, '') : 'Task Item',
      description: t.description
        ? t.description.charAt(0).toUpperCase() + t.description.slice(1).trim()
        : 'Completed implementation and self-verification.',
      unfinishedReason: t.unfinishedReason ? `[Reason]: ${t.unfinishedReason}` : ''
    })),
    plansForTomorrow: input.plansForTomorrow
      ? `• ${input.plansForTomorrow.trim()}`
      : '• Continue scheduled sprint deliverables.',
    blockers: input.blockers && input.blockers.trim().toLowerCase() !== 'none'
      ? `🚨 [BLOCKER]: ${input.blockers.trim()}`
      : 'No active blockers reported.',
    serverUpdates: input.serverUpdates ? input.serverUpdates.trim() : ''
  };
};

export const generateAIReportExecutiveSummary = async (
  project: Project,
  reportType: 'daily' | 'weekly',
  dateRangeStr: string,
  logs: DailyLog[],
  config: GeminiConfig
): Promise<string> => {
  if (config.apiKey && config.apiKey.trim() !== '') {
    const trimmedKey = config.apiKey.trim();
    const selectedModel = config.model || 'gemini-1.5-flash';

    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      
      const prompt = `You are a Lead Project Manager. Create an Executive Summary for the ${reportType.toUpperCase()} Project Report.
Project Name: ${project.name} (${project.code})
Period: ${dateRangeStr}
QA Manager: ${project.qaManagerName}
Backend Lead: ${project.backendLeadName}

Developer Daily Logs collected:
${JSON.stringify(logs, null, 2)}

Provide a concise 2-paragraph executive overview summarizing total task progress, QA ready items, server deployments, out-of-scope work, and critical blockers requiring executive attention. Format in clear Markdown.`;

      const response = await model.generateContent(prompt);
      return response.response.text() || 'Summary generated.';
    } catch (err) {
      console.warn(`[Gemini Executive Summary Exception] Model ${selectedModel} call failed:`, err);
    }
  }

  // Smart fallback synthesis
  const totalTasks = logs.reduce((acc, l) => acc + l.tasks.length, 0);
  const doneTasks = logs.reduce((acc, l) => acc + l.tasks.filter(t => t.status === 'done').length, 0);
  const qaTasks = logs.reduce((acc, l) => acc + l.tasks.filter(t => t.isForQA).length, 0);
  const outOfScope = logs.reduce((acc, l) => acc + l.tasks.filter(t => t.isOutofScope).length, 0);
  const serverUpdates = logs.filter(l => l.serverUpdates && l.serverUpdates.trim().length > 0);

  return `### Executive Overview — ${project.name} (${dateRangeStr})

During this reporting period, the development team submitted **${logs.length} log entry(s)** encompassing **${totalTasks} total tasks** (**${doneTasks} completed**, **${qaTasks} items for QA review**). 

${outOfScope > 0 ? `⚠️ **Note**: ${outOfScope} task(s) were completed out of the original weekly plan scope.` : 'All work remained aligned with scheduled weekly milestones.'} ${serverUpdates.length > 0 ? `🚀 **Deployments**: ${serverUpdates.length} system update(s) were pushed to server staging.` : ''} QA sign-offs have been attached below for formal physical signature by **${project.qaManagerName}**.`;
};

export interface ChatAnalystInput {
  userPrompt: string;
  chatHistory: { role: 'user' | 'model'; text: string }[];
  projects: Project[];
  selectedProjectId: string;
  logs: DailyLog[];
  config: GeminiConfig;
}

export const chatWithReportAnalyst = async (
  input: ChatAnalystInput
): Promise<string> => {
  const { userPrompt, chatHistory, projects, selectedProjectId, logs, config } = input;
  const currentProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : undefined);

  // Filter logs for selected project if specified
  const projectLogs = (!selectedProjectId || selectedProjectId === 'all')
    ? logs 
    : logs.filter(l => l.projectId === selectedProjectId);

  const logsSummary = projectLogs.map(l => ({
    date: l.date,
    developer: l.developerName,
    projectId: l.projectId,
    tasksCount: l.tasks.length,
    tasks: l.tasks.map(t => ({
      title: t.title,
      description: t.description,
      status: t.status,
      isForQA: t.isForQA,
      isOutofScope: t.isOutofScope,
      qaAcknowledged: t.qaAcknowledged,
      unfinishedReason: t.unfinishedReason
    })),
    plansTomorrow: l.plansForTomorrow,
    blockers: l.blockers,
    serverUpdates: l.serverUpdates,
    backendDevAcknowledged: l.backendDevAcknowledged
  }));

  if (config.apiKey && config.apiKey.trim() !== '') {
    const trimmedKey = config.apiKey.trim();
    const selectedModel = config.model || 'gemini-1.5-flash';

    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      const systemInstruction = `You are an expert AI Report Analyst and Lead Technical Program Manager for Vertex Technologies Corporation (VTC).
Your job is to read and analyze project accomplishment data, daily developer logs, QA reviews, and server deployment updates, and answer user queries, generate formatted reports, or provide actionable insights.

Context Data Available:
- Active Selected Project: ${currentProject ? `${currentProject.name} (${currentProject.code})` : 'All Projects'}
- Total Projects Registered: ${projects.length} (${projects.map(p => `${p.name} [${p.code}]`).join(', ')})
- Number of Daily Logs Loaded: ${projectLogs.length}

Detailed Daily Logs JSON Data:
${JSON.stringify(logsSummary, null, 2)}

Instructions:
1. Always base your analysis on the actual data provided above.
2. If asked to generate a report, use clean Markdown headers, bullet points, statistics, and structured sections (Executive Summary, Key Deliverables, QA & Deployment Status, Blockers & Risks, Next Steps).
3. If asked questions about tasks, developers, QA items, or server deployments, give direct, precise answers referencing specific developers, dates, or task names from the logs.
4. Keep a professional, encouraging, and clear tone.
5. CRITICAL REQUIREMENT: When generating reports or answering queries, NEVER include conversational filler or openings (e.g. "Certainly!", "Sure, here are...", "Below is the report...", "As an AI model..."). Start IMMEDIATELY with the report title or main content. Write in a formal, human corporate reporting tone.`;

      const formattedHistory = chatHistory.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n\n');

      const fullPrompt = `${systemInstruction}

Conversation History:
${formattedHistory}

User Query: ${userPrompt}

Response:`;

      const response = await model.generateContent(fullPrompt);
      const text = response.response.text();
      if (text) return text;
    } catch (err) {
      console.warn('[Gemini Analyst Exception]', err);
    }
  }

  // Smart Fallback response synthesizer when no API key or API call fails
  const totalTasks = projectLogs.reduce((sum, l) => sum + l.tasks.length, 0);
  const doneTasks = projectLogs.reduce((sum, l) => sum + l.tasks.filter(t => t.status === 'done').length, 0);
  const qaTasks = projectLogs.reduce((sum, l) => sum + l.tasks.filter(t => t.isForQA).length, 0);
  const blockers = projectLogs.filter(l => l.blockers && l.blockers.trim().toLowerCase() !== 'none' && l.blockers.trim() !== '');

  const promptLower = userPrompt.toLowerCase();

  if (promptLower.includes('blocker') || promptLower.includes('issue') || promptLower.includes('risk')) {
    if (blockers.length === 0) {
      return `### 🟢 Blockers & Risks Summary\n\nNo critical blockers reported across **${projectLogs.length} daily log(s)** for **${currentProject?.name || 'Selected Project'}**. All tasks are progressing smoothly.`;
    }
    return `### 🚨 Active Blockers & Risks Report\n\nFound **${blockers.length} reported blocker(s)**:\n\n` + 
      blockers.map(b => `- **${b.developerName}** (${b.date}): ${b.blockers}`).join('\n');
  }

  if (promptLower.includes('qa') || promptLower.includes('testing')) {
    const qaItems = projectLogs.flatMap(l => l.tasks.filter(t => t.isForQA).map(t => ({ dev: l.developerName, date: l.date, task: t })));
    return `### 🧪 QA Testing Status Report\n\nTotal tasks marked for QA: **${qaTasks}**\n\n` +
      (qaItems.length > 0 ? qaItems.map(q => `- **[${q.task.qaAcknowledged ? '✅ Signed Off' : '⏳ Pending QA'}]** ${q.task.title} (by ${q.dev} on ${q.date})`).join('\n') : 'No items currently queued for QA.');
  }

  if (promptLower.includes('report') || promptLower.includes('summary') || promptLower.includes('executive')) {
    return `### 📊 Project Accomplishment Report — ${currentProject?.name || 'All Projects'}\n\n` +
      `**Data Ingested**: ${projectLogs.length} Daily Log(s) | **Total Tasks**: ${totalTasks} | **Completed**: ${doneTasks} (${totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0}%)\n\n` +
      `#### 🚀 Executive Summary\n` +
      `The team has completed **${doneTasks} out of ${totalTasks} tasks**. ${qaTasks} item(s) are undergoing QA review, and ${blockers.length} active blocker(s) require management attention.\n\n` +
      `*Tip: Ensure your Gemini API key is active in Gemini Settings for deep custom conversational responses!*`;
  }

  return `### 🤖 AI Analyst Report Synthesis\n\nAnalyzed **${projectLogs.length} daily log entry(s)** with **${totalTasks} total task(s)** for **${currentProject?.name || 'Selected Project'}**.\n\n` +
    `- **Completed Tasks**: ${doneTasks}\n` +
    `- **QA Items Queued**: ${qaTasks}\n` +
    `- **Blockers Reported**: ${blockers.length}\n\n` +
    `**Analysis for your prompt**: "${userPrompt}"\n\n` +
    `All log entries have been parsed successfully. Provide specific requests like *"Summarize blockers"*, *"List QA items"*, or *"Draft executive report"* for detailed breakdown.`;
};

