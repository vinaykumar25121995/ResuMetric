import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { AtsScoreBreakdown, QuickFixReport, ResumeData } from '../types/resume.ts';
import { DEFAULT_VINAY_RESUME, SAMPLE_JOB_DESCRIPTIONS } from '../data/defaultResume.ts';
import {
  applyQuickFixToResume,
  createLowScoreDraftResume,
  injectKeywordsIntoResume,
  parsePlainTextResume,
} from '../utils/atsEngine.ts';

interface JdScannerAndAtsViewProps {
  resume: ResumeData;
  onUpdateResume: (updated: ResumeData) => void;
  jobDescription: string;
  onChangeJobDescription: (jd: string) => void;
  atsBreakdown: AtsScoreBreakdown;
  onShowStatus: (msg: string) => void;
}

export const JdScannerAndAtsView: React.FC<JdScannerAndAtsViewProps> = ({
  resume,
  onUpdateResume,
  jobDescription,
  onChangeJobDescription,
  atsBreakdown,
  onShowStatus,
}) => {
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [isQuickFixing, setIsQuickFixing] = useState(false);
  const [quickFixReport, setQuickFixReport] = useState<QuickFixReport | null>(null);
  const [coachingNote, setCoachingNote] = useState<string>('');
  const [rawResumeCheckText, setRawResumeCheckText] = useState<string>('');

  const handleOneClickQuickFix = async () => {
    setIsQuickFixing(true);
    const { updatedResume, report } = applyQuickFixToResume(resume, jobDescription);
    onUpdateResume(updatedResume);
    setQuickFixReport(report);
    onShowStatus(
      `One-Click Quick Fix applied! ATS Score jumped from ${report.previousScore} to ${report.newScore}/100.`
    );
    setIsQuickFixing(false);

    fetch('/api/ai/quick-fix-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobDescription }),
    }).catch(() => null);
  };

  const handleInjectMissingKeywords = () => {
    if (atsBreakdown.missingKeywords.length === 0) {
      onShowStatus('All target keywords from this Job Description are already present in your resume!');
      return;
    }
    const updated = injectKeywordsIntoResume(resume, atsBreakdown.missingKeywords);
    onUpdateResume(updated);
    setCoachingNote(
      `Injected ${atsBreakdown.missingKeywords.length} missing keywords (${atsBreakdown.missingKeywords
        .slice(0, 5)
        .join(', ')}) into your Technical Skills and Summary.`
    );
    onShowStatus('Missing keywords woven into your resume! ATS Score updated.');
  };

  const handleAiOptimizeForJd = async () => {
    setIsAiOptimizing(true);
    try {
      const res = await fetch('/api/ai/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          jobDescription,
          missingKeywords: atsBreakdown.missingKeywords,
        }),
      });
      const data = await res.json();
      let updatedResume = injectKeywordsIntoResume(resume, atsBreakdown.missingKeywords);
      if (data.optimizedSummary) {
        updatedResume = {
          ...updatedResume,
          summary: data.optimizedSummary,
        };
      }
      if (Array.isArray(data.optimizedBullets) && data.optimizedBullets.length > 0 && updatedResume.experiences.length > 0) {
        const updatedExps = [...updatedResume.experiences];
        updatedExps[0] = {
          ...updatedExps[0],
          bullets: data.optimizedBullets,
        };
        updatedResume.experiences = updatedExps;
      }
      onUpdateResume(updatedResume);
      setCoachingNote(
        data.coachingTip ||
          'AI optimized your Professional Summary and Work Experience bullets for maximum ATS keyword density.'
      );
      onShowStatus('AI Resume Optimization complete!');
    } catch {
      handleInjectMissingKeywords();
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const handleParseExternalResume = () => {
    if (!rawResumeCheckText.trim()) return;
    const parsed = parsePlainTextResume(rawResumeCheckText, resume);
    onUpdateResume(parsed);
    onShowStatus('Parsed pasted resume text and updated live ATS score!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Cols: Job Description Scanner & External Resume Paste */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                Job Description Scanner & Keyword Alignment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste a target job description or select a role benchmark to scan for missing ATS keywords in real time.
              </p>
            </div>
          </div>

          {/* Preset Job Description Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-500">Load Sample JD:</span>
            {SAMPLE_JOB_DESCRIPTIONS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onChangeJobDescription(sample.description)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {sample.title}
              </button>
            ))}
            {jobDescription && (
              <button
                type="button"
                onClick={() => onChangeJobDescription('')}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Reset to Role Benchmark
              </button>
            )}
          </div>

          <label htmlFor="jd-scanner-textarea" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Job Description Text
          </label>
          <textarea
            id="jd-scanner-textarea"
            rows={7}
            value={jobDescription}
            onChange={(e) => onChangeJobDescription(e.target.value)}
            placeholder="Paste the full Job Description here (responsibilities, required skills, qualifications) to calculate exact keyword match..."
            className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleAiOptimizeForJd}
              disabled={isAiOptimizing}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {isAiOptimizing ? 'Optimizing Resume with AI...' : 'Optimize Resume with AI for JD'}
            </button>

            <button
              type="button"
              onClick={handleInjectMissingKeywords}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              One-Click Inject Missing Keywords ({atsBreakdown.missingKeywords.length})
            </button>
          </div>

          {coachingNote && (
            <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
              <strong className="font-semibold">Optimization Result: </strong>
              {coachingNote}
            </div>
          )}
        </div>

        {/* Instant External Resume ATS Checker */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <FileSearch className="w-4 h-4 text-teal-600" />
            Paste Any Resume Text for Instant ATS Audit
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Want to check another resume draft? Paste plain text below to parse it into the live builder and evaluate its ATS score.
          </p>
          <textarea
            rows={4}
            value={rawResumeCheckText}
            onChange={(e) => setRawResumeCheckText(e.target.value)}
            placeholder="Paste raw resume text (Name, Title, Email, • Bullet points)..."
            className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleParseExternalResume}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Parse & Check ATS Score
            </button>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Real-Time ATS Score Diagnostic Card */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Real-Time ATS Diagnostic
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Overall ATS Score
              </h3>
            </div>
            <div className="text-right">
              <div
                data-testid="ats-overall-score"
                className={`text-4xl font-extrabold font-mono tabular-nums ${
                  atsBreakdown.overall < 70 ? 'text-amber-600' : 'text-teal-600'
                }`}
              >
                {atsBreakdown.overall}
                <span className="text-lg text-slate-400 font-normal">/100</span>
              </div>
              <div
                className={`text-[11px] font-medium ${
                  atsBreakdown.overall < 70 ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {atsBreakdown.overall >= 85
                  ? 'Strong Applicant Match'
                  : atsBreakdown.overall >= 70
                  ? 'Moderate Match — Add Keywords'
                  : 'Below 70 Threshold — Quick Fix Recommended'}
              </div>
            </div>
          </div>

          {/* Quick Fix Panel when ATS Score < 70 */}
          {atsBreakdown.overall < 70 ? (
            <div
              data-testid="jd-scorecard-quick-fix-banner"
              className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    ATS Quick Fix Required (Score Below 70)
                  </div>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                    Automatically rewrite weak bullets with executive action verbs, fix grammar & typos, and inject quantified metrics.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="jd-scorecard-one-click-fix-btn"
                  disabled={isQuickFixing}
                  onClick={handleOneClickQuickFix}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isQuickFixing ? 'Applying Fixes...' : 'One-Click Fix'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
              <span className="text-slate-600">
                Want to test the <strong>&lt;70 ATS Score Quick Fix</strong> engine?
              </span>
              <button
                type="button"
                data-testid="jd-load-low-score-draft-btn"
                onClick={() => {
                  const lowDraft = createLowScoreDraftResume(DEFAULT_VINAY_RESUME);
                  onUpdateResume(lowDraft);
                  setQuickFixReport(null);
                  onShowStatus('Loaded unoptimized resume draft (ATS Score < 70). Click "One-Click Fix" to auto-improve!');
                }}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold shrink-0 transition-colors"
              >
                Simulate &lt;70 Draft
              </button>
            </div>
          )}

          {quickFixReport && (
            <div
              data-testid="jd-quick-fix-report"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col gap-1.5"
            >
              <div className="font-bold flex items-center justify-between">
                <span>
                  Quick Fix Applied: {quickFixReport.previousScore}/100 → {quickFixReport.newScore}/100
                </span>
                <span className="font-mono text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded">
                  +{quickFixReport.newScore - quickFixReport.previousScore} pts
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-900">
                {quickFixReport.changeLog.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 4 Sub-Score Progress Bars */}
          <div className="flex flex-col gap-3.5 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Keyword Alignment (38% weight)</span>
                <span className="font-mono tabular-nums font-bold">{atsBreakdown.keywordAlignment}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-200"
                  style={{ width: `${atsBreakdown.keywordAlignment}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Quantified ROI & Metrics ({atsBreakdown.quantifiedBulletsCount}/{atsBreakdown.totalBulletsCount} bullets)</span>
                <span className="font-mono tabular-nums font-bold">{atsBreakdown.quantifiedImpact}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-200"
                  style={{ width: `${atsBreakdown.quantifiedImpact}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Section Structure & Bold Highlights ({atsBreakdown.boldHighlightsCount} bold tags)</span>
                <span className="font-mono tabular-nums font-bold">{atsBreakdown.formattingAndStructure}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-200"
                  style={{ width: `${atsBreakdown.formattingAndStructure}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Action Verb Strength & Readability</span>
                <span className="font-mono tabular-nums font-bold">{atsBreakdown.actionVerbAndReadability}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${atsBreakdown.actionVerbAndReadability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matched vs Missing Keywords */}
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matched Keywords ({atsBreakdown.matchedKeywords.length})
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {atsBreakdown.matchedKeywords.length > 0
                  ? atsBreakdown.matchedKeywords.join(' · ')
                  : 'None detected yet'}
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Missing Target Keywords ({atsBreakdown.missingKeywords.length})
              </div>
              {atsBreakdown.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {atsBreakdown.missingKeywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        const updated = injectKeywordsIntoResume(resume, [kw]);
                        onUpdateResume(updated);
                        onShowStatus(`Added "${kw}" to your resume!`);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded transition-colors"
                    >
                      + Add {kw}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">
                  100% of target keywords are present in your resume!
                </p>
              )}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              Real-Time Improvement Recommendations
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-slate-600">
              {atsBreakdown.recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
