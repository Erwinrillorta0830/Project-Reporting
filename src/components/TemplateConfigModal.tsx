import React, { useState } from 'react';
import { DocumentTemplateConfig, PaperSize } from '../types';
import { FileText, Image as ImageIcon, Upload, X, CheckCircle, Type, MapPin, Globe, Mail, Phone, Settings } from 'lucide-react';

interface TemplateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DocumentTemplateConfig;
  onSave: (config: DocumentTemplateConfig) => void;
}

export const TemplateConfigModal: React.FC<TemplateConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<DocumentTemplateConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleHeaderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData(prev => ({ ...prev, headerLogoUrl: evt.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData(prev => ({ ...prev, watermarkLogoUrl: evt.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">Document Template Configuration</h2>
            <p className="text-xs text-slate-400">Customize paper size, corporate header logo images, watermark, fonts, and contact details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Paper Size Selection */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Physical Paper Size Layout</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paperSize: 'a4' }))}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1 ${
                  (formData.paperSize || 'a4') === 'a4'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📄 A4 Standard</span>
                <span className="text-[10px] font-mono opacity-80">210mm x 297mm</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paperSize: 'letter' }))}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1 ${
                  formData.paperSize === 'letter'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📄 Letter</span>
                <span className="text-[10px] font-mono opacity-80">8.5" x 11"</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paperSize: 'legal' }))}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1 ${
                  formData.paperSize === 'legal'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📄 Legal</span>
                <span className="text-[10px] font-mono opacity-80">8.5" x 14"</span>
              </button>
            </div>
          </div>

          {/* Header Logo Upload */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Corporate Header Logo Image</span>
            </label>

            {formData.headerLogoUrl && (
              <div className="p-3 bg-white rounded-lg border border-slate-700 flex items-center justify-center max-h-24 overflow-hidden">
                <img src={formData.headerLogoUrl} alt="Header Logo Preview" className="max-h-20 object-contain" />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload New Header Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Watermark Emblem Upload */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Background Watermark Emblem Image</span>
            </label>

            {formData.watermarkLogoUrl && (
              <div className="p-3 bg-white rounded-lg border border-slate-700 flex items-center justify-center max-h-24 overflow-hidden">
                <img src={formData.watermarkLogoUrl} alt="Watermark Preview" className="max-h-20 object-contain opacity-40" />
              </div>
            )}

            <label className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer transition">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Watermark Emblem Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleWatermarkUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Typography / Font Family Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Document Font Family</span>
            </label>
            <select
              value={formData.fontFamily}
              onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value as any }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="Times New Roman">Times New Roman (Official Corporate Standard)</option>
              <option value="Arial">Arial (Clean Sans-serif)</option>
              <option value="Georgia">Georgia (Classic Serif)</option>
              <option value="Inter">Inter (Modern Clean)</option>
            </select>
          </div>

          {/* Corporate Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Office Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-cyan-400 mb-1">QA Manager Email (Daily 5:00 AM Mon-Fri Digest Recipient)</label>
              <input
                type="email"
                value={formData.qaManagerEmail || 'reginevertex1201@gmail.com'}
                onChange={(e) => setFormData(prev => ({ ...prev, qaManagerEmail: e.target.value }))}
                placeholder="reginevertex1201@gmail.com"
                className="w-full bg-slate-950 border border-cyan-800/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Template Settings</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
