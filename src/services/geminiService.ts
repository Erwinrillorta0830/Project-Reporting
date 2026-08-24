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
