import React, { useState } from 'react';
import { GeminiConfig } from '../types';
import { testGeminiAPIConnection } from '../services/geminiService';
import { Sparkles, Key, CheckCircle, X, ExternalLink, ShieldCheck, Zap, AlertCircle, Loader2 } from 'lucide-react';

interface GeminiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GeminiConfig;
  onSave: (config: GeminiConfig) => void;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model || 'gemini-1.5-flash');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testGeminiAPIConnection({ apiKey: apiKey.trim(), model });
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ apiKey: apiKey.trim(), model });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">Gemini AI Settings & Diagnostics</h2>
            <p className="text-xs text-slate-400">Configure Google Gemini AI for smart task polishing & report generation</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini API Key</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 underline"
              >
                <span>Get Free API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>

            <div className="flex space-x-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API Key from Google AI Studio..."
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !apiKey.trim()}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Key</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-1.5 text-[11px] text-slate-400">
              Key is saved safely in your browser local storage.
            </p>
          </div>

          {/* Test Status Badge */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
              testResult.success 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Model Selection</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended & Standard)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block mb-0.5">Offline Fallback Engine Active</span>
              If no API key is provided or on network rate limit, the application uses the built-in smart synthesis engine so you can generate reports without interruptions.
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
