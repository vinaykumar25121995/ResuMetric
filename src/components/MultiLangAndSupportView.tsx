import React, { useState } from 'react';
import { Globe2, Languages, Mail, MessageSquare, Send, Sparkles } from 'lucide-react';
import { ResumeData } from '../types/resume.ts';
import { MULTILANG_PRESETS } from '../data/defaultResume.ts';
import { parsePlainTextResume } from '../utils/atsEngine.ts';

interface MultiLangAndSupportViewProps {
  resume: ResumeData;
  onUpdateResume: (updated: ResumeData) => void;
  activeLanguage: string;
  onChangeLanguage: (lang: string) => void;
  onTicketSubmitted: () => void;
  onShowStatus: (msg: string) => void;
}

export const MultiLangAndSupportView: React.FC<MultiLangAndSupportViewProps> = ({
  resume,
  onUpdateResume,
  activeLanguage,
  onChangeLanguage,
  onTicketSubmitted,
  onShowStatus,
}) => {
  const [multilangInput, setMultilangInput] = useState('');
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [marketComplianceNote, setMarketComplianceNote] = useState(
    MULTILANG_PRESETS[activeLanguage]?.marketNorm || MULTILANG_PRESETS.en.marketNorm
  );

  // Support Contact Form state -> atsfriendlyresumes.admin@gmail.com
  const [contactName, setContactName] = useState(resume.fullName || 'Vinay Kumar');
  const [contactEmail, setContactEmail] = useState(resume.email || 'vinay22y95@gmail.com');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleApplyLanguagePreset = async (langCode: string) => {
    onChangeLanguage(langCode);
    const preset = MULTILANG_PRESETS[langCode];
    if (preset) {
      setMarketComplianceNote(preset.marketNorm);
      onUpdateResume({
        ...resume,
        ...preset.resume,
      });
      onShowStatus(`Localized resume to ${preset.label}!`);
    }

    setIsLocalizing(true);
    try {
      await fetch('/api/ai/parse-multilang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          targetLanguage: langCode,
          rawInputText: multilangInput,
        }),
      });
    } catch {
      // Handled by preset
    } finally {
      setIsLocalizing(false);
    }
  };

  const handleParseMultilangText = () => {
    if (!multilangInput.trim()) return;
    const parsed = parsePlainTextResume(multilangInput, resume);
    onUpdateResume(parsed);
    onShowStatus('Parsed multi-language resume document into structured ATS blocks!');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');

    if (!contactName.trim() || !contactEmail.trim() || !contactSubject.trim() || !contactMessage.trim()) {
      setContactError('Please fill in your name, email, subject, and message.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          subject: contactSubject.trim(),
          message: contactMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setContactError(data.error || 'Failed to submit inquiry.');
      } else {
        setContactSuccess(
          `Support ticket #${data.ticket?.id || '104'} logged and routed to atsfriendlyresumes.admin@gmail.com.`
        );
        setContactSubject('');
        setContactMessage('');
        onTicketSubmitted();
        onShowStatus('Support inquiry sent to atsfriendlyresumes.admin@gmail.com!');
      }
    } catch {
      setContactError('Network error while submitting contact form.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Cols: Multi-Language Resume Parsing & International Job Market Optimization */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-teal-600" />
            Multi-Language Resume Parsing & International Market Localization
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Yes — ResuMetric supports multi-language resume parsing and region-specific ATS formatting across North America, Europe (DACH / EU), India, LATAM, and APAC.
          </p>

          <div className="mt-4">
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Select Target International Job Market & Language:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(MULTILANG_PRESETS).map(([code, cfg]) => {
                const isActive = activeLanguage === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleApplyLanguagePreset(code)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'border-teal-600 bg-teal-50/50 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{cfg.label}</span>
                      <span className="uppercase font-mono text-[11px] text-teal-700">{code}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {cfg.marketNorm}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong className="font-semibold text-slate-900">Active Regional ATS Protocol: </strong>
            {marketComplianceNote}
            {isLocalizing && <span className="ml-2 text-teal-600 font-medium">(Syncing...)</span>}
          </div>

          <div className="mt-5">
            <label htmlFor="multilang-parser-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paste Foreign-Language or Bilingual CV Text to Parse & Normalize
            </label>
            <textarea
              id="multilang-parser-input"
              rows={4}
              value={multilangInput}
              onChange={(e) => setMultilangInput(e.target.value)}
              placeholder="Paste resume content in English, German, Spanish, French, Hindi, Bangla, or Japanese..."
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleParseMultilangText}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Languages className="w-3.5 h-3.5" />
                Parse Multi-Language Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Support Contact Form (atsfriendlyresumes.admin@gmail.com) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-600" />
            Support & Career Specialist Contact
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Direct support inbox:{' '}
            <a
              href="mailto:atsfriendlyresumes.admin@gmail.com"
              className="font-mono font-semibold text-teal-700 underline"
            >
              atsfriendlyresumes.admin@gmail.com
            </a>
          </p>

          <form onSubmit={handleContactSubmit} className="mt-4 flex flex-col gap-3.5">
            <div>
              <label htmlFor="support-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name
              </label>
              <input
                id="support-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="support-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Your Email Address
              </label>
              <input
                id="support-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="support-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                Inquiry Subject
              </label>
              <input
                id="support-subject"
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="e.g. Custom ATS template formatting or billing inquiry"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="support-message" className="block text-xs font-semibold text-slate-700 mb-1">
                Message for atsfriendlyresumes.admin@gmail.com
              </label>
              <textarea
                id="support-message"
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Describe how we can help with your resume, LinkedIn import, or ATS score..."
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900"
              />
            </div>

            {contactError && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                {contactError}
              </div>
            )}

            {contactSuccess && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {contactSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingContact}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmittingContact
                ? 'Sending Support Inquiry...'
                : 'Send Support Ticket to atsfriendlyresumes.admin@gmail.com'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
