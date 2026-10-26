import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileText,
  Globe,
  LayoutTemplate,
  Sparkles,
  Zap,
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../data/templatesCatalog.ts';
import { ResumeTemplateConfig } from '../types/resume.ts';

interface WebsiteShowcaseProps {
  selectedTemplate: ResumeTemplateConfig;
  atsScore: number;
  onSelectTemplate: (tpl: ResumeTemplateConfig) => void;
  onNavigateTab: (
    tab: 'builder' | 'templates' | 'jd-scanner' | 'cover-letter' | 'admin-global'
  ) => void;
  onOpenPrintPreview: () => void;
}

const INTERNET_BENCHMARK_STYLES = [
  {
    templateId: 'jakes-latex-faang',
    platform: "Overleaf / Reddit r/EngineeringResumes",
    styleName: "Jake's Resume (LaTeX Standard)",
    atsPassRate: '100%',
    bestFor: 'FAANG, Software Engineering, Data Science & Quant',
    signatureFeature: 'Centered masthead, full-width small-caps rules, right-aligned italic dates',
  },
  {
    templateId: 'enhancv-kpi-bento',
    platform: 'Enhancv 2025 ATS Line',
    styleName: 'Enhancv KPI Impact Bento',
    atsPassRate: '98%',
    bestFor: 'Data Analysts, Product Managers & Growth Leaders',
    signatureFeature: '4-card quantified ROI metric ribbon + 2-column strength bento matrix',
  },
  {
    templateId: 'novoresume-timeline-pro',
    platform: 'Novoresume Executive',
    styleName: 'Connected Career Timeline',
    atsPassRate: '97%',
    bestFor: 'Operations, Supply Chain, Cloud & Career Progression',
    signatureFeature: 'Vertical milestone timeline rail with circular nodes & skill meters',
  },
  {
    templateId: 'harvard-classic',
    platform: 'Harvard OCS / Wall Street',
    styleName: 'Harvard Business School Institutional',
    atsPassRate: '100%',
    bestFor: 'Management Consulting, Investment Banking & Executive',
    signatureFeature: 'Authoritative single-column serif hierarchy with zero parsing risk',
  },
  {
    templateId: 'canva-warm-studio',
    platform: 'Canva ATS-Safe Studio',
    styleName: 'Warm Editorial Studio Card',
    atsPassRate: '97%',
    bestFor: 'Strategy, Marketing Analytics, Retail & Design-Forward Roles',
    signatureFeature: 'Warm sand-tinted masthead card, monogram seal & framed section badges',
  },
  {
    templateId: 'nordic-slate',
    platform: 'Your Uploaded PDF Reference #1',
    styleName: 'Nordic Slate Sidebar (Vinay Kumar)',
    atsPassRate: '98%',
    bestFor: 'Senior Data Analysts, BI Developers & ML Practitioners',
    signatureFeature: 'Dark slate contact/skills sidebar + teal section badges & diamond bullets',
  },
];

export const WebsiteHeroStrip: React.FC<WebsiteShowcaseProps> = ({
  selectedTemplate,
  atsScore,
  onSelectTemplate,
  onNavigateTab,
  onOpenPrintPreview,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const featuredTemplates = RESUME_TEMPLATES.filter((t) =>
    [
      'nordic-slate',
      'executive-navy-gold',
      'coral-editorial',
      'modern-navy-card',
      'jakes-latex-faang',
      'enhancv-kpi-bento',
      'novoresume-timeline-pro',
      'canva-warm-studio',
      'harvard-classic',
      'resumeio-amsterdam',
    ].includes(t.id)
  );

  return (
    <section className="no-print bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              28 ATS-Verified Templates · Internet Trending + Uploaded PDFs
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              AI ATS Resume Builder, Keyword Optimizer & Career Suite
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('templates')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-teal-400" />
              Explore All 28 Templates
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <span>Hide Template Strip</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Show Trending Templates</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-700">
                Instant 1-Click Switch: Trending Internet Styles (Overleaf, Enhancv, Novoresume, Canva, Harvard) & Your Uploaded PDFs
              </span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                Active: <strong className="text-teal-700">{selectedTemplate.name}</strong> · Live ATS Score: <strong className="text-slate-900">{atsScore}/100</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {featuredTemplates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplate.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onSelectTemplate(tpl)}
                    className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/15'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tpl.accentColor }}
                        />
                        <span className="text-[9.5px] font-mono text-slate-500 tabular-nums">
                          {tpl.atsCompatibility}% ATS
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 leading-tight mt-1 line-clamp-2">
                        {tpl.name.replace(/^\d+\.\s*/, '')}
                      </div>
                    </div>
                    <div className="text-[9.5px] font-semibold text-teal-700 truncate">
                      {tpl.badgeText || tpl.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const WebsiteBottomShowcase: React.FC<WebsiteShowcaseProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onNavigateTab,
  onOpenPrintPreview,
}) => {
  return (
    <section className="no-print max-w-[1440px] mx-auto w-full px-6 pt-6 pb-4 flex flex-col gap-8">
      {/* Internet Template Benchmark Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              Internet Design Research & ATS Architecture
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              How Our 28 Templates Compare Against Top Internet Resume Standards
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              We combined your 4 uploaded reference PDFs with the highest-converting resume layouts from Overleaf, Enhancv, Novoresume, Harvard OCS, Resume.io, and Canva.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPrintPreview}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              Inspect Print Grid & Margins
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('templates')}
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              Open Full 28-Template Gallery
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <th className="py-2.5 px-3 font-bold">Template Style</th>
                <th className="py-2.5 px-3 font-bold">Internet Inspiration</th>
                <th className="py-2.5 px-3 font-bold">ATS Pass Rate</th>
                <th className="py-2.5 px-3 font-bold">Best Target Roles</th>
                <th className="py-2.5 px-3 font-bold">Architectural Signature</th>
                <th className="py-2.5 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INTERNET_BENCHMARK_STYLES.map((row) => {
                const matchedTpl = RESUME_TEMPLATES.find((t) => t.id === row.templateId);
                const isCurrent = selectedTemplate.id === row.templateId;
                return (
                  <tr key={row.templateId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{row.styleName}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{row.platform}</td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-700 tabular-nums">
                      {row.atsPassRate}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{row.bestFor}</td>
                    <td className="py-3 px-3 text-slate-600">{row.signatureFeature}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (matchedTpl) {
                            onSelectTemplate(matchedTpl);
                            onNavigateTab('builder');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md font-semibold text-xs whitespace-nowrap cursor-pointer ${
                          isCurrent
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isCurrent ? 'Active Style' : 'Try This Style'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6-Pillar End-to-End Platform Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              1. Real-Time ATS Scoring & JD Keyword Scanner
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Evaluates keyword density, quantified ROI bullets, section structure, and action verbs in real time. Paste any job description to inject missing skills in one click.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('jd-scanner')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer w-fit"
          >
            Launch JD Scanner & ATS Checker →
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              2. 28 Fully Populated Templates & Print Grid Preview
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Switch seamlessly between your 4 uploaded PDF recreations and 24 internet-curated styles with 12-column grid lines, 0.5-inch safe print margin guides, and instant PDF/DOCX export.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('templates')}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer w-fit"
          >
            Browse All 28 Populated Templates →
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              3. AI Cover Letter Generator & Career Strategy Coach
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Generate role-tailored cover letters aligned to your resume metrics and receive executive AI career coaching on salary positioning and interview storytelling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('cover-letter')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer w-fit"
          >
            Open Cover Letter & AI Coach →
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              4. Multi-Language International Resume Parser
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Localize resume section headers and parse international CVs across English, Spanish, French, German, Hindi, and Japanese for global job markets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('admin-global')}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer w-fit"
          >
            Open Multi-Language Parser →
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              5. Google Login, LinkedIn Experience Sync & Cloud SQL
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Authenticate with Google, pull headline & experience data from LinkedIn, and persist resumes, cover letters, and analytics in PostgreSQL.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('builder')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer w-fit"
          >
            Sync Profile in Resume Builder →
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              6. Premium Checkout, Support Desk & Admin Console
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Includes Stripe/Razorpay upgrade checkout, direct support routing (atsfriendlyresumes.admin@gmail.com), live chat, and admin management (vinay22y95@gmail.com).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('admin-global')}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer w-fit"
          >
            Open Pricing, Support & Admin →
          </button>
        </div>
      </div>
    </section>
  );
};
