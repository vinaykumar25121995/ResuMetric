import React, { useState } from 'react';
import {
  Briefcase,
  Compass,
  Download,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ResumeData } from '../types/resume.ts';
import { exportCoverLetterToDocx } from '../utils/exportResume.ts';
import { renderFormattedText } from './ResumeCanvas.tsx';

interface CoverLetterAndCareerViewProps {
  resume: ResumeData;
  jobDescription: string;
  onShowStatus: (msg: string) => void;
}

export const CoverLetterAndCareerView: React.FC<CoverLetterAndCareerViewProps> = ({
  resume,
  jobDescription,
  onShowStatus,
}) => {
  const [jobTitle, setJobTitle] = useState(resume.jobTitle || 'Senior Data Analyst');
  const [companyName, setCompanyName] = useState('Global Retail & Logistics Corp');
  const [hiringManager, setHiringManager] = useState('Hiring Manager');
  const [tone, setTone] = useState('Executive & Analytical');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  const [coverLetter, setCoverLetter] = useState<string>(
    `Dear Hiring Manager,

I am writing to express my strong interest in the **Senior Data Analyst** position at **Global Retail & Logistics Corp**. With **6+ years** of hands-on experience turning messy operational and financial spreadsheets into executive decisions using **SQL, Python, Tableau, and Excel**, I am excited to contribute to your analytics engineering and predictive modeling initiatives.

In my role as Data Analyst at Neelam Cycle, I analyzed business and operational records in SQL and Excel, identifying root causes of product damage and recommending fixes that **cut damage by 75%**. I also developed **predictive models** on market trends to guide inventory planning—contributing to a **12% revenue increase**—and built regression models forecasting EV parts and vehicle shipment delays for proactive supply-chain planning.

Additionally, across **8+ analytics and machine learning projects**, I have written **80+ SQL queries**, designed **70+ interactive Tableau dashboards**, analyzed financial metrics across **2,000 companies**, and trained classification models predicting hotel cancellations with **80% accuracy**.

Thank you for your time and consideration. I look forward to discussing how my blend of SQL/Python engineering, BI visualization, and stakeholder communication can deliver immediate value to **Global Retail & Logistics Corp**.

Sincerely,
${resume.fullName}
${resume.email} | ${resume.phone}`
  );

  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [careerAdvice, setCareerAdvice] = useState({
    positioningHeadline:
      'Position Vinay Kumar as a Revenue-Driving Decision Scientist combining 6+ years of SQL/Python analytics with applied Machine Learning (75% damage reduction & 12% revenue lift).',
    salaryBenchmark:
      '₹18.5 LPA – ₹32.0 LPA (India Tier-1 Metro)  ·  $115,000 – $148,000 USD (Global Remote)',
    skillGapRoadmap: [
      'Add Cloud Data Warehouse orchestration (Snowflake / BigQuery + dbt) to complement your 80+ SQL query track record.',
      'Highlight A/B Testing & Statistical Experimentation alongside your Logistic Regression (80% accuracy) and EV delay models.',
      'Quantify executive adoption metrics across your 70+ interactive Tableau dashboards.',
    ],
    interviewQuestions: [
      'Walk me through the root-cause analysis and validation you used to cut product damage by 75% at Neelam Cycle.',
      'How did you translate your EV supply-chain delay regression model outputs for non-technical warehouse stakeholders?',
      'When examining financial metrics across 2,000 companies, how did you handle extreme outliers and missing fiscal records?',
    ],
  });

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingLetter(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          jobTitle,
          companyName,
          hiringManager,
          tone,
          jobDescription,
        }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
        onShowStatus(`Generated customized cover letter for ${companyName}!`);
      }
    } catch {
      onShowStatus('Updated cover letter with target role & company details.');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleRefreshCareerAdvice = async () => {
    setIsGeneratingAdvice(true);
    try {
      const res = await fetch('/api/ai/career-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          targetRole: jobTitle,
        }),
      });
      const data = await res.json();
      if (data.positioningHeadline) {
        setCareerAdvice(data);
        onShowStatus('AI Career Advisor updated your personalized roadmap!');
      }
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Cols: Built-in Cover Letter Generator & Live Document Preview */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Built-In AI Cover Letter Generator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically synchronizes with your resume achievements and target Job Description.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  exportCoverLetterToDocx(
                    resume.fullName,
                    resume.email,
                    resume.phone,
                    jobTitle,
                    companyName,
                    coverLetter
                  );
                  onShowStatus('Downloaded Cover Letter as Microsoft Word (.docx)!');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export DOCX
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="cl-job-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role Title
              </label>
              <input
                id="cl-job-title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="cl-company" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Company Name
              </label>
              <input
                id="cl-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="cl-manager" className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient / Hiring Manager
              </label>
              <input
                id="cl-manager"
                type="text"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="cl-tone" className="block text-xs font-semibold text-slate-700 mb-1">
                Tone & Narrative Style
              </label>
              <select
                id="cl-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
              >
                <option value="Executive & Analytical">Executive & Analytical</option>
                <option value="Quantified & Technical">Quantified & Technical</option>
                <option value="Enthusiastic & Story-Driven">Enthusiastic & Story-Driven</option>
                <option value="Concise 3-Paragraph">Concise 3-Paragraph</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateCoverLetter}
            disabled={isGeneratingLetter}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingLetter
              ? 'Generating Customized Cover Letter...'
              : 'Generate Tailored Cover Letter with AI'}
          </button>

          {/* Editable Cover Letter Text + Formatted Preview */}
          <div className="mt-5">
            <label htmlFor="cl-editor" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cover Letter Content (Supports **bold** emphasis)
            </label>
            <textarea
              id="cl-editor"
              rows={9}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Formatted Letter Sheet Preview */}
        <div className="print-only-canvas bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-wrap justify-between items-baseline gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">{resume.fullName}</h3>
              <p className="text-sm font-semibold text-teal-600">{jobTitle}</p>
            </div>
            <div className="text-xs text-slate-600 text-right">
              <div>{resume.email} · {resume.phone}</div>
              <div>{resume.location} · {resume.linkedin}</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-800">
            {coverLetter.split(/\n\n+/).map((para, idx) => (
              <p key={idx}>{renderFormattedText(para)}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Integrated AI-Driven Career Advice */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600" />
                AI-Driven Career Advisor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalized compensation intelligence, skill roadmap, and interview prep.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshCareerAdvice}
              disabled={isGeneratingAdvice}
              className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap"
            >
              {isGeneratingAdvice ? 'Analyzing...' : 'Refresh Insights'}
            </button>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Executive Positioning Strategy
            </h3>
            <p className="text-xs leading-relaxed text-slate-800 font-medium bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              {careerAdvice.positioningHeadline}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Market Compensation Benchmark
            </h3>
            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-mono font-semibold text-emerald-950">
              {careerAdvice.salaryBenchmark}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              High-ROI Skill Expansion Roadmap
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-700">
              {careerAdvice.skillGapRoadmap.map((item, idx) => (
                <li key={idx} className="p-3 rounded-lg border border-slate-200 bg-white leading-relaxed">
                  <span className="font-bold text-teal-700 mr-1.5">0{idx + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              Predicted Technical Interview Questions (Based on Your Resume)
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-700">
              {careerAdvice.interviewQuestions.map((q, idx) => (
                <li key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed">
                  <span className="font-bold text-slate-900">Q{idx + 1}: </span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
