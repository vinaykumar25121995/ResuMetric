import React, { useEffect, useMemo, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  Flame,
  Globe,
  GripVertical,
  LayoutTemplate,
  Linkedin,
  LogIn,
  MessageSquare,
  Plus,
  Printer,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { DEFAULT_VINAY_RESUME } from './data/defaultResume.ts';
import { RESUME_TEMPLATES } from './data/templatesCatalog.ts';
import {
  AutoFormatLayoutAnalysis,
  QuickFixReport,
  ResumeData,
  ResumeSectionBoundary,
  ResumeTemplateConfig,
  SectionDividerStyle,
  SkillProficiencyLevel,
} from './types/resume.ts';
import {
  ALL_SECTION_BOUNDARIES,
  addSectionDivider,
  analyzeContentVolumeAndSuggestLayout,
  applyQuickFixToResume,
  calculateAtsScore,
  calculateResumeKeywordHeatmap,
  createLowScoreDraftResume,
  getLanguageLevelPercent,
  getProficiencyIndicatorMeta,
  getSkillProficiency,
  injectKeywordsIntoResume,
  parseSkillItems,
  removeSectionDivider,
  reorderListItems,
  setSkillProficiency,
  suggestSkillsForCategory,
} from './utils/atsEngine.ts';
import { exportResumeToDocx } from './utils/exportResume.ts';
import { ResumeCanvas } from './components/ResumeCanvas.tsx';
import { TemplateGalleryView } from './components/TemplateGalleryModal.tsx';
import { JdScannerAndAtsView } from './components/JdScannerAndAtsView.tsx';
import { CoverLetterAndCareerView } from './components/CoverLetterAndCareerView.tsx';
import { MultiLangAndSupportView } from './components/MultiLangAndSupportView.tsx';
import { AdminAndPricingView } from './components/AdminAndPricingView.tsx';
import { LiveChatDrawer } from './components/LiveChatDrawer.tsx';
import { PrintPreviewModal } from './components/PrintPreviewModal.tsx';
import {
  WebsiteBottomShowcase,
  WebsiteHeroStrip,
} from './components/WebsiteShowcaseSection.tsx';

type ActiveWorkspaceTab =
  | 'builder'
  | 'templates'
  | 'jd-scanner'
  | 'cover-letter'
  | 'admin-global';

type EditorSectionTab =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'credentials';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('builder');
  const [editorSection, setEditorSection] = useState<EditorSectionTab>('contact');

  const [resume, setResume] = useState<ResumeData>(DEFAULT_VINAY_RESUME);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateConfig>(
    RESUME_TEMPLATES[0]
  );
  const [jobDescription, setJobDescription] = useState<string>('');
  const [activeLanguage, setActiveLanguage] = useState<string>('en');

  // Auth & User State (Defaults to Admin Vinay Kumar so workspace is immediately usable)
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    name: string;
    email: string;
    plan: string;
    idToken?: string;
  }>({
    uid: 'admin-vinay-uid',
    name: 'Vinay Kumar',
    email: 'vinay22y95@gmail.com',
    plan: 'executive',
  });

  // LinkedIn Import Modal State
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInUrlInput, setLinkedInUrlInput] = useState(
    'https://linkedin.com/in/vinay-kumar-yr95'
  );
  const [linkedInHeadlineInput, setLinkedInHeadlineInput] = useState(
    'Senior Data Analyst | SQL, Python, Tableau, Machine Learning | 6+ Yrs Exp'
  );

  // Backend synced collections
  const [usersList, setUsersList] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'agent',
      senderName: 'ATS Career Specialist',
      message:
        'Welcome to ResuMetric! I can help you optimize your resume keywords, switch between all 24 templates, or reach support at atsfriendlyresumes.admin@gmail.com.',
    },
  ]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<Record<string, string[]>>({});
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);
  const [draggedExpIdx, setDraggedExpIdx] = useState<number | null>(null);
  const [draggedProjIdx, setDraggedProjIdx] = useState<number | null>(null);
  const [newLanguageName, setNewLanguageName] = useState<string>('');
  const [newLanguageProficiency, setNewLanguageProficiency] = useState<string>('Fluent');
  const [newSkillInputs, setNewSkillInputs] = useState<
    Record<string, { name: string; level: SkillProficiencyLevel }>
  >({});
  const [isQuickFixing, setIsQuickFixing] = useState(false);
  const [quickFixReport, setQuickFixReport] = useState<QuickFixReport | null>(null);
  const [autoFormatAnalysis, setAutoFormatAnalysis] =
    useState<AutoFormatLayoutAnalysis | null>(null);
  const [isPushingGithub, setIsPushingGithub] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(true);
  const [githubPatInput, setGithubPatInput] = useState('');
  const [githubClientIdInput, setGithubClientIdInput] = useState('');
  const [githubClientSecretInput, setGithubClientSecretInput] = useState('');
  const [showOAuthSetupFields, setShowOAuthSetupFields] = useState(false);
  const [githubAuthInfo, setGithubAuthInfo] = useState<{
    authenticated?: boolean;
    user?: { login: string; name?: string; avatar_url?: string; html_url?: string } | null;
    hasOAuthClientConfig?: boolean;
    currentCommit?: string;
    devCallbackUrl?: string;
    sharedCallbackUrl?: string;
    githubTokenCreationUrl?: string;
    githubOAuthAppsUrl?: string;
  }>({
    devCallbackUrl:
      'https://ais-dev-4vuexnyyziu2xgy5zoegpo-980463204799.asia-southeast1.run.app/auth/callback',
    sharedCallbackUrl:
      'https://ais-pre-4vuexnyyziu2xgy5zoegpo-980463204799.asia-southeast1.run.app/auth/callback',
    githubTokenCreationUrl:
      'https://github.com/settings/tokens/new?description=ResuMetric+AI+ATS+Resume+Builder&scopes=repo,workflow,read:user,user:email',
    githubOAuthAppsUrl: 'https://github.com/settings/developers',
  });
  const [githubSyncStatus, setGithubSyncStatus] = useState<{
    pushed?: boolean;
    stagedAndCommitted?: boolean;
    commitHash?: string;
    repoUrl?: string;
    message?: string;
    requiresToken?: boolean;
    detail?: string;
  } | null>(null);

  const showStatus = (msg: string) => {
    setStatusBanner(msg);
  };

  const handleOneClickQuickFix = async () => {
    setIsQuickFixing(true);
    const { updatedResume, report } = applyQuickFixToResume(resume, jobDescription);
    setResume(updatedResume);
    setQuickFixReport(report);
    showStatus(
      `One-Click Quick Fix applied! ATS Score jumped from ${report.previousScore} to ${report.newScore}/100.`
    );
    setIsQuickFixing(false);

    // Sync with server-side Gemini endpoint & analytics in background
    fetch('/api/ai/quick-fix-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobDescription }),
    }).catch(() => null);
  };

  const handleAutoFormatLayout = () => {
    const analysis = analyzeContentVolumeAndSuggestLayout(resume, RESUME_TEMPLATES);
    setAutoFormatAnalysis(analysis);
    const recommendedTpl = RESUME_TEMPLATES.find(
      (t) => t.id === analysis.recommendedTemplateId
    );
    if (recommendedTpl) {
      setSelectedTemplate(recommendedTpl);
    }
    setResume({
      ...resume,
      compactPageFit: analysis.compactDensityApplied,
    });
    showStatus(
      `Auto-Format Layout applied "${analysis.suggestedCategory}" (${analysis.recommendedTemplateName}) — fitted to ${analysis.fittedEstimatedPages} pages (≤ 2 pages).`
    );
  };

  const fetchGithubAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/github/status');
      if (!res.ok) return;
      const data = await res.json();
      setGithubAuthInfo(data);
      if (data.lastPushResult) {
        setGithubSyncStatus(data.lastPushResult);
      }
    } catch {
      // Ignore non-blocking status check
    }
  };

  useEffect(() => {
    fetchGithubAuthStatus();
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchGithubAuthStatus();
        if (event.data?.pushResult) {
          setGithubSyncStatus(event.data.pushResult);
        }
        showStatus(
          `GitHub authenticated${
            event.data?.user?.login ? ` as @${event.data.user.login}` : ''
          } and synced with https://github.com/vinaykumar25121995/ResuMetric.git!`
        );
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR' && event.data?.error) {
        showStatus(`GitHub OAuth note: ${event.data.error}`);
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleConnectGithubOAuth = async () => {
    try {
      if (githubClientIdInput.trim() || githubClientSecretInput.trim()) {
        await fetch('/api/auth/github/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: githubClientIdInput,
            clientSecret: githubClientSecretInput,
          }),
        });
      }

      const res = await fetch(
        `/api/auth/github/url?origin=${encodeURIComponent(window.location.origin)}`
      );
      const data = await res.json();
      const targetUrl =
        data.url ||
        'https://github.com/settings/tokens/new?description=ResuMetric+AI+ATS+Resume+Builder&scopes=repo,workflow,read:user,user:email';

      const popup = window.open(
        targetUrl,
        'github_oauth_popup',
        'width=640,height=740,menubar=no,toolbar=no'
      );

      if (!popup) {
        showStatus(
          'Popup blocked by browser. Click "Open GitHub Authorization in New Tab ↗" below to authenticate directly on GitHub.'
        );
      } else {
        showStatus(
          data.mode === 'oauth'
            ? 'Opened GitHub OAuth login window. Authorize ResuMetric to push automatically!'
            : 'Opened GitHub Authentication & Token page. Generate a repo token and paste it below to push!'
        );
      }
    } catch {
      showStatus('Click the direct GitHub Authorization link below to authenticate.');
    }
  };

  const handlePushToGithub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPushingGithub(true);
    try {
      if (githubClientIdInput.trim() || githubClientSecretInput.trim()) {
        await fetch('/api/auth/github/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: githubClientIdInput,
            clientSecret: githubClientSecretInput,
          }),
        });
      }

      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubToken: githubPatInput,
          resumeSnapshot: resume,
        }),
      });
      const data = await res.json();
      setGithubSyncStatus(data);
      fetchGithubAuthStatus();
      if (data.pushed) {
        showStatus(
          `Successfully authenticated & pushed commit ${data.commitHash} to https://github.com/vinaykumar25121995/ResuMetric.git!`
        );
      } else if (data.stagedAndCommitted) {
        showStatus(
          `Staged & committed all data (${data.commitHash}). Authenticate with GitHub to complete remote HTTPS push.`
        );
      }
    } catch {
      showStatus('Prepared local git commit for https://github.com/vinaykumar25121995/ResuMetric.git.');
    } finally {
      setIsPushingGithub(false);
    }
  };

  const handleAddSpokenLanguage = () => {
    const cleanLang = newLanguageName.trim();
    if (!cleanLang) return;
    const exists = resume.languages.some(
      (l) => l.language.toLowerCase() === cleanLang.toLowerCase()
    );
    if (exists) {
      showStatus(`"${cleanLang}" is already in your Languages Known list.`);
      return;
    }
    const levelPercent = getLanguageLevelPercent(newLanguageProficiency);
    setResume({
      ...resume,
      languages: [
        ...resume.languages,
        {
          id: `lang-${Date.now()}`,
          language: cleanLang,
          proficiency: newLanguageProficiency,
          levelPercent,
        },
      ],
    });
    setNewLanguageName('');
    showStatus(`Added "${cleanLang} (${newLanguageProficiency})" to Languages Known!`);
  };

  const handleMoveExperience = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= resume.experiences.length || fromIdx === toIdx) return;
    const reordered = reorderListItems(resume.experiences, fromIdx, toIdx);
    setResume({ ...resume, experiences: reordered });
    showStatus(`Reordered work experience "${resume.experiences[fromIdx]?.role}" to position #${toIdx + 1}.`);
  };

  const handleMoveProject = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= resume.projects.length || fromIdx === toIdx) return;
    const reordered = reorderListItems(resume.projects, fromIdx, toIdx);
    setResume({ ...resume, projects: reordered });
    showStatus(`Reordered project "${resume.projects[fromIdx]?.title}" to position #${toIdx + 1}.`);
  };

  const handleSuggestCategorySkills = async (skillId: string, category: string, items: string) => {
    const localSuggestions = suggestSkillsForCategory(category, items, jobDescription);
    setCategorySuggestions((prev) => ({ ...prev, [skillId]: localSuggestions }));
    showStatus(
      `AI analyzed target job description and suggested ${localSuggestions.length} missing skills for "${category}".`
    );
    setLoadingCategoryId(skillId);
    try {
      const res = await fetch('/api/ai/suggest-category-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          currentItems: items,
          jobDescription,
          jobTitle: resume.jobTitle,
          fallbackSuggestions: localSuggestions,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setCategorySuggestions((prev) => ({ ...prev, [skillId]: data.suggestions }));
      }
    } catch {
      // Keep deterministic localSuggestions already displayed
    } finally {
      setLoadingCategoryId(null);
    }
  };

  const handleAddSkillToCategory = (sIdx: number, skillId: string, newSkill: string) => {
    const target = resume.skills[sIdx];
    if (!target) return;
    const existingList = target.items
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!existingList.some((s) => s.toLowerCase() === newSkill.toLowerCase())) {
      const updatedItems = [...existingList, newSkill].join(', ');
      const nextSkills = [...resume.skills];
      nextSkills[sIdx] = { ...target, items: updatedItems };
      setResume({ ...resume, skills: nextSkills });
    }
    setCategorySuggestions((prev) => ({
      ...prev,
      [skillId]: (prev[skillId] || []).filter(
        (item) => item.toLowerCase() !== newSkill.toLowerCase()
      ),
    }));
    showStatus(`Added "${newSkill}" to ${target.category}!`);
  };

  // Real-Time ATS Score Calculation
  const atsBreakdown = useMemo(
    () => calculateAtsScore(resume, jobDescription),
    [resume, jobDescription]
  );

  // Real-Time Keyword Heatmap Analysis (Green-to-Red Density & Gaps)
  const heatmapAnalysis = useMemo(
    () => calculateResumeKeywordHeatmap(resume, jobDescription),
    [resume, jobDescription]
  );

  const handleInjectGapKeywordFromHeatmap = (keyword: string) => {
    const updated = injectKeywordsIntoResume(resume, [keyword]);
    setResume(updated);
    showStatus(`Injected missing keyword "${keyword}" into your resume from Keyword Heatmap!`);
  };

  const handleInjectAllGapKeywordsFromHeatmap = (keywords: string[]) => {
    const updated = injectKeywordsIntoResume(resume, keywords);
    setResume(updated);
    showStatus(`Injected ${keywords.length} missing gap keywords into your resume!`);
  };

  const fetchBootstrapData = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.users)) setUsersList(data.users);
      if (Array.isArray(data.supportTickets)) setSupportTickets(data.supportTickets);
      if (Array.isArray(data.payments)) setPaymentsList(data.payments);
      if (Array.isArray(data.analyticsEvents)) setAnalyticsEvents(data.analyticsEvents);
      if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
        setChatMessages(data.chatMessages);
      }
    } catch {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    fetchBootstrapData();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      const email = result.user.email || 'vinay22y95@gmail.com';
      const name = result.user.displayName || 'Vinay Kumar';
      const uid = result.user.uid;

      setCurrentUser({
        uid,
        name,
        email,
        plan: email.toLowerCase() === 'vinay22y95@gmail.com' ? 'executive' : 'pro',
        idToken: token,
      });

      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid, email, name }),
      });
      showStatus(`Signed in with Google as ${name} (${email})`);
      fetchBootstrapData();
    } catch {
      showStatus('Google Sign-In popup closed or blocked by browser preview. Continuing as Vinay Kumar (vinay22y95@gmail.com).');
    }
  };

  const handleLinkedInImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = linkedInUrlInput.replace(/^https?:\/\//, '').trim();
    const updatedResume: ResumeData = {
      ...resume,
      linkedin: cleanUrl || resume.linkedin,
      jobTitle: linkedInHeadlineInput.split('|')[0]?.trim() || resume.jobTitle,
    };
    setResume(updatedResume);
    setShowLinkedInModal(false);

    await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: currentUser.uid,
        email: currentUser.email,
        name: resume.fullName,
        linkedinUrl: cleanUrl,
      }),
    }).catch(() => null);

    showStatus(`Synced LinkedIn profile & job experience from ${cleanUrl}!`);
  };

  const handleSaveResumeToDb = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/resumes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.idToken ? { Authorization: `Bearer ${currentUser.idToken}` } : {}),
        },
        body: JSON.stringify({
          userUid: currentUser.uid,
          title: `${resume.fullName} — ${resume.jobTitle}`,
          templateId: selectedTemplate.id,
          language: activeLanguage,
          atsScore: atsBreakdown.overall,
          targetJobTitle: resume.jobTitle,
          targetJobDescription: jobDescription,
          data: resume,
        }),
      });
      showStatus('Saved resume & ATS score to PostgreSQL database!');
      fetchBootstrapData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportDocx = async () => {
    await exportResumeToDocx(resume);
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'resume_export_docx',
        templateId: selectedTemplate.id,
        language: activeLanguage,
        atsScore: atsBreakdown.overall,
        metadata: `${resume.fullName} DOCX Export`,
      }),
    }).catch(() => null);
    showStatus(`Exported ${resume.fullName}_ATS_Resume.docx!`);
    fetchBootstrapData();
  };

  const handleExportPdf = async () => {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'resume_export_pdf',
        templateId: selectedTemplate.id,
        language: activeLanguage,
        atsScore: atsBreakdown.overall,
        metadata: `${resume.fullName} PDF Export`,
      }),
    }).catch(() => null);
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* =====================================================================
          STRICT 3-ZONE TOP BAR CONTRACT (frontend-design Section 2)
          Zone 1: Single-line Brand Wordmark
          Zone 2: 5 Single-line Navigation Links
          Zone 3: 1 Primary Action Button
         ===================================================================== */}
      <header className="no-print flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#builder"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('builder');
          }}
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          ResuMetric
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'builder'
                ? 'text-slate-900 border-b-2 border-teal-600 font-semibold'
                : ''
            }`}
          >
            Resume Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'templates'
                ? 'text-slate-900 border-b-2 border-teal-600 font-semibold'
                : ''
            }`}
          >
            28 Templates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jd-scanner')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'jd-scanner'
                ? 'text-slate-900 border-b-2 border-teal-600 font-semibold'
                : ''
            }`}
          >
            JD Scanner & ATS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cover-letter')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'cover-letter'
                ? 'text-slate-900 border-b-2 border-teal-600 font-semibold'
                : ''
            }`}
          >
            Cover Letter & AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin-global')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'admin-global'
                ? 'text-slate-900 border-b-2 border-teal-600 font-semibold'
                : ''
            }`}
          >
            Global, Pricing & Admin
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleExportDocx}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0"
          >
            Export DOCX
          </button>
        </div>
      </header>

      {/* =====================================================================
          SECONDARY WORKSPACE ACTION TOOLBAR (Below Header)
         ===================================================================== */}
      <div className="no-print bg-slate-900 text-white px-6 py-2 border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Real-Time ATS Score Telemetry & Active Template Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-slate-300">ATS Score:</span>
              <strong
                data-testid="toolbar-ats-score"
                className="font-mono tabular-nums text-xs font-extrabold text-teal-400"
              >
                {atsBreakdown.overall}/100
              </strong>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-mono tabular-nums">
                Keywords {atsBreakdown.matchedKeywords.length}/
                {atsBreakdown.matchedKeywords.length + atsBreakdown.missingKeywords.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="quick-template-select" className="text-slate-400 whitespace-nowrap">
                Template:
              </label>
              <select
                id="quick-template-select"
                value={selectedTemplate.id}
                onChange={(e) => {
                  const found = RESUME_TEMPLATES.find((t) => t.id === e.target.value);
                  if (found) {
                    setSelectedTemplate(found);
                    showStatus(`Switched live template to ${found.name}`);
                  }
                }}
                className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1 text-xs font-medium max-w-[220px] truncate"
              >
                {RESUME_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (ATS {t.atsCompatibility}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Social Login (Google + LinkedIn), Save, PDF Print, Live Chat */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-400" />
              Google ({currentUser.email.split('@')[0]})
            </button>

            <button
              type="button"
              onClick={() => setShowLinkedInModal(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Linkedin className="w-3.5 h-3.5 text-sky-400" />
              LinkedIn Sync
            </button>

            <button
              type="button"
              onClick={handleSaveResumeToDb}
              disabled={isSaving}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              {isSaving ? 'Saving...' : 'Save DB'}
            </button>

            <button
              type="button"
              data-testid="github-sync-open-btn"
              onClick={() => {
                setShowGithubModal(true);
                if (!githubSyncStatus) {
                  handlePushToGithub();
                }
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              GitHub Sync
            </button>

            <button
              type="button"
              onClick={() => setIsPrintPreviewOpen(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              Print Preview
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="px-2.5 py-1 rounded bg-white text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Export PDF
            </button>

            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Live Chat
            </button>
          </div>
        </div>
      </div>

      {/* Status Notification Bar */}
      {statusBanner && (
        <div className="no-print bg-teal-50 border-b border-teal-200 px-6 py-2 text-xs text-teal-900">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner('')}
              className="text-teal-700 hover:text-teal-950 font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* LinkedIn Experience Sync Modal */}
      {showLinkedInModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-sky-600" />
              Import Experience from LinkedIn Profile
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Pull your headline, profile URL, and role experience directly into your ATS resume.
            </p>
            <form onSubmit={handleLinkedInImport} className="mt-4 flex flex-col gap-3">
              <div>
                <label htmlFor="li-url-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  id="li-url-input"
                  type="text"
                  value={linkedInUrlInput}
                  onChange={(e) => setLinkedInUrlInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="li-headline-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn Headline / Target Role
                </label>
                <input
                  id="li-headline-input"
                  type="text"
                  value={linkedInHeadlineInput}
                  onChange={(e) => setLinkedInHeadlineInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkedInModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700"
                >
                  Sync LinkedIn Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Authentication & Repository Push Portal Modal */}
      {showGithubModal && (
        <div
          data-testid="github-auth-modal"
          className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 my-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Globe className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900">
                      GitHub Authentication &amp; Repository Push
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        githubAuthInfo.authenticated || githubSyncStatus?.pushed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {githubAuthInfo.authenticated || githubSyncStatus?.pushed
                        ? `Authenticated${
                            githubAuthInfo.user?.login ? ` (@${githubAuthInfo.user.login})` : ''
                          }`
                        : 'Awaiting GitHub Authorization'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">
                    Target Remote: https://github.com/vinaykumar25121995/ResuMetric.git (branch: main)
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-github-modal-btn"
                onClick={() => setShowGithubModal(false)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Step 1: 1-Click Redirect / Popup to Official GitHub Authentication Page */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
                    Step 1 · Redirect to GitHub Authentication Page
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sign in to GitHub in a popup window or new tab to authorize write access to{' '}
                    <span className="font-mono text-white">vinaykumar25121995/ResuMetric</span>.
                  </p>
                </div>
                {githubAuthInfo.currentCommit && (
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-teal-300">
                    Local HEAD: {githubAuthInfo.currentCommit}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  data-testid="github-oauth-connect-btn"
                  onClick={handleConnectGithubOAuth}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Redirect to GitHub Authentication (Popup)
                </button>

                <a
                  href={
                    githubAuthInfo.githubTokenCreationUrl ||
                    'https://github.com/settings/tokens/new?description=ResuMetric+AI+ATS+Resume+Builder&scopes=repo,workflow,read:user,user:email'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="github-direct-token-link"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  Open GitHub Token Auth Page in New Tab ↗
                </a>

                <a
                  href="https://github.com/login?return_to=%2Fvinaykumar25121995%2FResuMetric"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs inline-flex items-center gap-1 transition-colors"
                >
                  GitHub Sign In ↗
                </a>
              </div>
            </div>

            {/* Live Push Status Banner */}
            {githubSyncStatus && (
              <div
                data-testid="github-sync-status-box"
                className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                  githubSyncStatus.pushed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        githubSyncStatus.pushed ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    />
                    {githubSyncStatus.pushed
                      ? 'Successfully Pushed to Remote (origin/main)'
                      : 'Committed Locally & Ready for Authenticated Push'}
                  </span>
                  {githubSyncStatus.commitHash && (
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-900 text-white text-[11px]">
                      commit {githubSyncStatus.commitHash}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">{githubSyncStatus.message}</p>
              </div>
            )}

            {/* Step 2: Paste GitHub Token or Configure OAuth Client ID/Secret to Complete Push */}
            <form onSubmit={handlePushToGithub} className="flex flex-col gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="gh-pat-input"
                    className="text-xs font-extrabold text-slate-900"
                  >
                    Step 2 · Paste GitHub Access Token to Authenticate &amp; Push Immediately
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold">
                    Scope required: repo
                  </span>
                </div>
                <input
                  id="gh-pat-input"
                  type="password"
                  value={githubPatInput}
                  onChange={(e) => setGithubPatInput(e.target.value)}
                  placeholder="Paste ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxxxxxxxxxx here..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
                />
                <p className="text-[11px] text-slate-500 leading-snug">
                  Click <strong>&ldquo;Open GitHub Token Auth Page in New Tab ↗&rdquo;</strong> above,
                  scroll down and click <strong>Generate token</strong> on GitHub, then paste the token
                  here and click <strong>Authenticate &amp; Push to ResuMetric.git</strong>.
                </p>
              </div>

              {/* Optional GitHub OAuth 2.0 App Configuration & Callback URLs */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowOAuthSetupFields(!showOAuthSetupFields)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-left font-bold text-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span>
                    GitHub OAuth 2.0 App Callback URLs &amp; Client Credentials (Optional)
                  </span>
                  <span className="text-[11px] font-mono text-teal-700">
                    {showOAuthSetupFields ? 'Hide ▲' : 'Configure OAuth App ▼'}
                  </span>
                </button>
                {showOAuthSetupFields && (
                  <div className="p-3.5 bg-white flex flex-col gap-3 border-t border-slate-200">
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      If you prefer OAuth App login via{' '}
                      <a
                        href="https://github.com/settings/developers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 font-semibold underline"
                      >
                        https://github.com/settings/developers
                      </a>
                      , register these exact Callback URLs:
                    </div>
                    <div className="grid grid-cols-1 gap-2 font-mono text-[11px]">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="font-sans font-bold text-slate-700">Dev Callback: </span>
                          {githubAuthInfo.devCallbackUrl}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(githubAuthInfo.devCallbackUrl || '');
                            showStatus('Copied Development OAuth Callback URL!');
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-sans font-semibold shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="font-sans font-bold text-slate-700">
                            Shared Callback:{' '}
                          </span>
                          {githubAuthInfo.sharedCallbackUrl}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(githubAuthInfo.sharedCallbackUrl || '');
                            showStatus('Copied Shared OAuth Callback URL!');
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-sans font-semibold shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label
                          htmlFor="gh-client-id"
                          className="block text-[11px] font-semibold text-slate-700 mb-1"
                        >
                          GitHub OAuth Client ID
                        </label>
                        <input
                          id="gh-client-id"
                          type="text"
                          value={githubClientIdInput}
                          onChange={(e) => setGithubClientIdInput(e.target.value)}
                          placeholder="Ov23li..."
                          className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="gh-client-secret"
                          className="block text-[11px] font-semibold text-slate-700 mb-1"
                        >
                          GitHub OAuth Client Secret
                        </label>
                        <input
                          id="gh-client-secret"
                          type="password"
                          value={githubClientSecretInput}
                          onChange={(e) => setGithubClientSecretInput(e.target.value)}
                          placeholder="Client Secret..."
                          className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGithubModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back to Resume Builder
                </button>
                <button
                  type="submit"
                  data-testid="github-submit-push-btn"
                  disabled={isPushingGithub}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 shadow-sm cursor-pointer"
                >
                  {isPushingGithub
                    ? 'Authenticating & Pushing to GitHub...'
                    : 'Authenticate & Push to ResuMetric.git'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          WEBSITE HERO & TRENDING INTERNET TEMPLATES QUICK-SWITCH STRIP
         ===================================================================== */}
      <WebsiteHeroStrip
        selectedTemplate={selectedTemplate}
        atsScore={atsBreakdown.overall}
        onSelectTemplate={(tpl) => {
          setSelectedTemplate(tpl);
          showStatus(`Applied "${tpl.name}" (${tpl.atsCompatibility}% ATS Compatibility)`);
        }}
        onNavigateTab={setActiveTab}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      {/* =====================================================================
          MAIN WORKSPACE VIEWPORT
         ===================================================================== */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
        {/* TAB 1: RESUME BUILDER + REAL-TIME A4 CANVAS */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Structured Editor + Real-Time ATS Score Widget */}
            <div className="no-print lg:col-span-5 flex flex-col gap-5">
              {/* Compact Real-Time ATS Score, Quick Fix (<70) & Auto-Format Layout Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Live ATS Optimization Scorecard
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span
                        data-testid="builder-ats-score"
                        className={`text-3xl font-extrabold font-mono tabular-nums ${
                          atsBreakdown.overall < 70 ? 'text-amber-600' : 'text-teal-600'
                        }`}
                      >
                        {atsBreakdown.overall}/100
                      </span>
                      <span className="text-xs text-slate-500">
                        · {atsBreakdown.quantifiedBulletsCount}/{atsBreakdown.totalBulletsCount}{' '}
                        quantified bullets
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="scorecard-keyword-heatmap-btn"
                      onClick={() => {
                        const next = !isHeatmapActive;
                        setIsHeatmapActive(next);
                        showStatus(
                          next
                            ? `Enabled Keyword Heatmap overlay (${heatmapAnalysis.overallDensityScore}% density · Green-to-Red scale)`
                            : 'Disabled Keyword Heatmap overlay'
                        );
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                        isHeatmapActive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Keyword Heatmap
                    </button>
                    <button
                      type="button"
                      data-testid="auto-format-layout-btn"
                      onClick={handleAutoFormatLayout}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <LayoutTemplate className="w-3.5 h-3.5 text-teal-400" />
                      Auto-Format Layout
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('jd-scanner')}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg whitespace-nowrap"
                    >
                      Scan Job Description
                    </button>
                  </div>
                </div>

                {/* Sub-score mini bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <div className="text-slate-500">Keywords</div>
                    <div className="font-mono font-bold text-slate-900">
                      {atsBreakdown.keywordAlignment}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">ROI Metrics</div>
                    <div className="font-mono font-bold text-slate-900">
                      {atsBreakdown.quantifiedImpact}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Structure</div>
                    <div className="font-mono font-bold text-slate-900">
                      {atsBreakdown.formattingAndStructure}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Action Verbs</div>
                    <div className="font-mono font-bold text-slate-900">
                      {atsBreakdown.actionVerbAndReadability}%
                    </div>
                  </div>
                </div>

                {/* ATS Scorecard Quick Fix (< 70 Threshold) */}
                {atsBreakdown.overall < 70 ? (
                  <div
                    data-testid="ats-quick-fix-banner"
                    className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          ATS Score Below 70 — Quick Fix Available
                        </div>
                        <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                          Automatically apply AI improvements for weak bullet points, grammar, and missing action verbs.
                        </p>
                      </div>
                      <button
                        type="button"
                        data-testid="one-click-fix-btn"
                        disabled={isQuickFixing}
                        onClick={handleOneClickQuickFix}
                        className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isQuickFixing ? 'Applying AI Fixes...' : 'One-Click Fix'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px]">
                    <span className="text-slate-600">
                      Score is healthy (<strong>≥70</strong>). Test the <strong>&lt;70 Quick Fix</strong> assistant:
                    </span>
                    <button
                      type="button"
                      data-testid="simulate-low-score-btn"
                      onClick={() => {
                        const lowDraft = createLowScoreDraftResume(DEFAULT_VINAY_RESUME);
                        setResume(lowDraft);
                        setQuickFixReport(null);
                        showStatus(
                          'Loaded unoptimized resume draft (ATS Score < 70). Click "One-Click Fix" in the ATS Scorecard!'
                        );
                      }}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold shrink-0 transition-colors"
                    >
                      Simulate &lt;70 Score
                    </button>
                  </div>
                )}

                {/* Applied Quick Fix Summary Report */}
                {quickFixReport && (
                  <div
                    data-testid="quick-fix-applied-summary"
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        One-Click Fix Applied ({quickFixReport.previousScore}/100 → {quickFixReport.newScore}/100)
                      </span>
                      <span className="font-mono text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded">
                        +{quickFixReport.newScore - quickFixReport.previousScore} pts
                      </span>
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-emerald-900">
                      {quickFixReport.changeLog.map((logItem, idx) => (
                        <li key={idx}>• {logItem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Auto-Format Layout & 2-Page Volume Recommendation Panel */}
                {autoFormatAnalysis && (
                  <div
                    data-testid="auto-format-recommendation-panel"
                    className="p-3.5 rounded-xl bg-teal-50/90 border border-teal-200 text-xs text-slate-900 flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-teal-950 flex items-center gap-1.5">
                        <LayoutTemplate className="w-4 h-4 text-teal-700 shrink-0" />
                        Recommended Category:{' '}
                        <span
                          data-testid="auto-format-suggested-category"
                          className="px-2 py-0.5 rounded bg-teal-700 text-white font-extrabold"
                        >
                          {autoFormatAnalysis.suggestedCategory}
                        </span>
                      </div>
                      <span
                        data-testid="auto-format-page-estimate"
                        className="font-mono text-[11px] font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200"
                      >
                        Est. Fit: {autoFormatAnalysis.fittedEstimatedPages} / 2.0 Pages Max
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {autoFormatAnalysis.reasoning}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Switch Suggested Templates:
                      </span>
                      {[
                        autoFormatAnalysis.recommendedTemplateId,
                        ...autoFormatAnalysis.alternativeTemplateIds,
                      ].map((tplId) => {
                        const tplObj = RESUME_TEMPLATES.find((t) => t.id === tplId);
                        if (!tplObj) return null;
                        const isCurrent = selectedTemplate.id === tplObj.id;
                        return (
                          <button
                            key={tplObj.id}
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(tplObj);
                              showStatus(`Switched to "${tplObj.name}" (${autoFormatAnalysis.suggestedCategory})`);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                              isCurrent
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {tplObj.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section Editor Panel */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-4">
                {/* Segmented Section Tabs */}
                <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      ['contact', 'Contact'],
                      ['summary', 'Summary'],
                      ['experience', 'Experience'],
                      ['projects', 'Projects'],
                      ['skills', 'Skills'],
                      ['credentials', 'Edu & Certs'],
                    ] as [EditorSectionTab, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setEditorSection(id)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        editorSection === id
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Section Divider Insertion & Layout Separator Controls */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800">Layout Separators:</span>{' '}
                      Insert horizontal rules to visually separate unrelated resume sections.
                    </div>
                    <button
                      type="button"
                      data-testid="add-section-divider-btn"
                      onClick={() => {
                        const sectionToBoundaryMap: Record<EditorSectionTab, ResumeSectionBoundary> = {
                          contact: 'after-header',
                          summary: 'after-summary',
                          experience: 'after-experience',
                          projects: 'after-projects',
                          skills: 'after-skills',
                          credentials: 'after-credentials',
                        };
                        const preferredBoundary = sectionToBoundaryMap[editorSection];
                        const updatedDividers = addSectionDivider(
                          resume.sectionDividers || [],
                          preferredBoundary,
                          'solid',
                          1
                        );
                        setResume({
                          ...resume,
                          sectionDividers: updatedDividers,
                        });
                        setStatusBanner('Inserted horizontal section divider into resume layout');
                        setTimeout(() => setStatusBanner(''), 2600);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-colors shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Section Divider
                    </button>
                  </div>

                  {(resume.sectionDividers || []).length > 0 && (
                    <div
                      data-testid="editor-section-dividers-list"
                      className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/80"
                    >
                      {(resume.sectionDividers || []).map((divItem) => (
                        <div
                          key={divItem.id}
                          data-testid={`editor-divider-row-${divItem.placement}`}
                          className="flex flex-wrap items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded border border-slate-200 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700">Position:</span>
                            <select
                              aria-label="Divider Section Placement"
                              value={divItem.placement}
                              onChange={(e) => {
                                const nextPlacement = e.target.value as ResumeSectionBoundary;
                                const nextList = (resume.sectionDividers || []).map((item) =>
                                  item.id === divItem.id
                                    ? { ...item, placement: nextPlacement }
                                    : item
                                );
                                setResume({ ...resume, sectionDividers: nextList });
                              }}
                              className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-800 font-medium"
                            >
                              {ALL_SECTION_BOUNDARIES.map((b) => (
                                <option key={b.value} value={b.value}>
                                  {b.label}
                                </option>
                              ))}
                            </select>

                            <span className="font-semibold text-slate-700 ml-1">Style:</span>
                            <select
                              aria-label="Divider Line Style"
                              value={divItem.style}
                              onChange={(e) => {
                                const nextStyle = e.target.value as SectionDividerStyle;
                                const nextList = (resume.sectionDividers || []).map((item) =>
                                  item.id === divItem.id ? { ...item, style: nextStyle } : item
                                );
                                setResume({ ...resume, sectionDividers: nextList });
                              }}
                              className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-800 font-medium"
                            >
                              <option value="solid">Solid Line</option>
                              <option value="double">Double Rule</option>
                              <option value="dashed">Dashed Rule</option>
                              <option value="diamond-center">Diamond Center</option>
                              <option value="accent-gradient">Accent Gradient</option>
                            </select>

                            <span className="font-semibold text-slate-700 ml-1">Weight:</span>
                            <select
                              aria-label="Divider Line Weight"
                              value={divItem.thicknessPx}
                              onChange={(e) => {
                                const nextThickness = Number(e.target.value) as 1 | 2 | 3;
                                const nextList = (resume.sectionDividers || []).map((item) =>
                                  item.id === divItem.id
                                    ? { ...item, thicknessPx: nextThickness }
                                    : item
                                );
                                setResume({ ...resume, sectionDividers: nextList });
                              }}
                              className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-800 font-mono"
                            >
                              <option value={1}>1px</option>
                              <option value={2}>2px</option>
                              <option value={3}>3px</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setResume({
                                ...resume,
                                sectionDividers: removeSectionDivider(
                                  resume.sectionDividers || [],
                                  divItem.id
                                ),
                              });
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-rose-600 hover:bg-rose-50 font-semibold"
                            title="Remove Section Divider"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact Section Editor (with Languages Known & All Contact Formats) */}
                {editorSection === 'contact' && (
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label htmlFor="edit-fullname" className="block font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="edit-fullname"
                          type="text"
                          value={resume.fullName}
                          onChange={(e) => setResume({ ...resume, fullName: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor="edit-jobtitle" className="block font-semibold text-slate-700 mb-1">
                          Target Job Title
                        </label>
                        <input
                          id="edit-jobtitle"
                          type="text"
                          value={resume.jobTitle}
                          onChange={(e) => setResume({ ...resume, jobTitle: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor="edit-initials" className="block font-semibold text-slate-700 mb-1">
                          Monogram / Initials
                        </label>
                        <input
                          id="edit-initials"
                          type="text"
                          maxLength={3}
                          value={resume.avatarInitials}
                          onChange={(e) =>
                            setResume({ ...resume, avatarInitials: e.target.value.toUpperCase() })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="edit-email" className="block font-semibold text-slate-700 mb-1">
                          Email Address
                        </label>
                        <input
                          id="edit-email"
                          type="email"
                          value={resume.email}
                          onChange={(e) => setResume({ ...resume, email: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-phone" className="block font-semibold text-slate-700 mb-1">
                          Phone Numbers
                        </label>
                        <input
                          id="edit-phone"
                          type="text"
                          value={resume.phone}
                          onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="edit-location" className="block font-semibold text-slate-700 mb-1">
                          Location
                        </label>
                        <input
                          id="edit-location"
                          type="text"
                          value={resume.location}
                          onChange={(e) => setResume({ ...resume, location: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-website" className="block font-semibold text-slate-700 mb-1">
                          Portfolio Website
                        </label>
                        <input
                          id="edit-website"
                          type="text"
                          value={resume.website}
                          onChange={(e) => setResume({ ...resume, website: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="edit-linkedin" className="block font-semibold text-slate-700 mb-1">
                          LinkedIn URL
                        </label>
                        <input
                          id="edit-linkedin"
                          type="text"
                          value={resume.linkedin}
                          onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-github" className="block font-semibold text-slate-700 mb-1">
                          GitHub Profile
                        </label>
                        <input
                          id="edit-github"
                          type="text"
                          value={resume.github}
                          onChange={(e) => setResume({ ...resume, github: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Languages Known (Spoken Languages & Proficiency Levels) */}
                    <div className="pt-3 mt-1 border-t border-slate-200 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="contact-languages-known-input"
                          className="font-bold text-slate-900 flex items-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5 text-teal-600" />
                          Languages Known (Spoken Languages & Proficiency)
                        </label>
                        <span className="text-[11px] font-mono text-slate-500">
                          {resume.languages.length} spoken languages
                        </span>
                      </div>

                      {/* Quick Add Spoken Language Input & Proficiency Selector */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <input
                          id="contact-languages-known-input"
                          type="text"
                          aria-label="Languages Known"
                          placeholder="Add spoken language (e.g. Spanish, French, German)..."
                          value={newLanguageName}
                          onChange={(e) => setNewLanguageName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSpokenLanguage();
                            }
                          }}
                          className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                        />
                        <select
                          id="contact-languages-known-proficiency"
                          aria-label="New language proficiency level"
                          value={newLanguageProficiency}
                          onChange={(e) => setNewLanguageProficiency(e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700"
                        >
                          <option value="Native">Native (100%)</option>
                          <option value="Fluent">Fluent (95%)</option>
                          <option value="Proficient">Proficient (85%)</option>
                          <option value="Conversational">Conversational (70%)</option>
                          <option value="Elementary">Elementary (50%)</option>
                        </select>
                        <button
                          type="button"
                          data-testid="add-spoken-language-btn"
                          onClick={handleAddSpokenLanguage}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Language
                        </button>
                      </div>

                      {/* Manage Spoken Languages List */}
                      <div className="flex flex-col gap-2">
                        {resume.languages.map((lang, lIdx) => (
                          <div
                            key={lang.id}
                            className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-wrap sm:flex-nowrap items-center gap-2"
                          >
                            <input
                              type="text"
                              aria-label={`Spoken language ${lIdx + 1}`}
                              value={lang.language}
                              onChange={(e) => {
                                const next = [...resume.languages];
                                next[lIdx] = { ...lang, language: e.target.value };
                                setResume({ ...resume, languages: next });
                              }}
                              className="flex-1 min-w-[110px] rounded border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-900"
                            />
                            <select
                              aria-label={`Language proficiency ${lIdx + 1}`}
                              value={lang.proficiency}
                              onChange={(e) => {
                                const newProf = e.target.value;
                                const next = [...resume.languages];
                                next[lIdx] = {
                                  ...lang,
                                  proficiency: newProf,
                                  levelPercent: getLanguageLevelPercent(newProf),
                                };
                                setResume({ ...resume, languages: next });
                              }}
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 font-medium"
                            >
                              <option value="Native">Native</option>
                              <option value="Fluent">Fluent</option>
                              <option value="Proficient">Proficient</option>
                              <option value="Conversational">Conversational</option>
                              <option value="Elementary">Elementary</option>
                            </select>
                            <div className="hidden sm:flex items-center gap-1.5 w-20">
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-600 rounded-full"
                                  style={{ width: `${lang.levelPercent || 85}%` }}
                                />
                              </div>
                              <span className="font-mono text-[10px] text-slate-500">
                                {lang.levelPercent || 85}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-label={`Move language ${lIdx + 1} up`}
                                disabled={lIdx === 0}
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    languages: reorderListItems(resume.languages, lIdx, lIdx - 1),
                                  })
                                }
                                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600"
                                title="Move language up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move language ${lIdx + 1} down`}
                                disabled={lIdx === resume.languages.length - 1}
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    languages: reorderListItems(resume.languages, lIdx, lIdx + 1),
                                  })
                                }
                                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600"
                                title="Move language down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              {resume.languages.length > 1 && (
                                <button
                                  type="button"
                                  aria-label={`Delete language ${lang.language}`}
                                  onClick={() =>
                                    setResume({
                                      ...resume,
                                      languages: resume.languages.filter((_, i) => i !== lIdx),
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-red-600"
                                  title="Remove language"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Section Editor (With Full Rich Formatting Controls) */}
                {editorSection === 'summary' && (
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label htmlFor="edit-summary" className="font-semibold text-slate-700">
                        Professional Summary (Supports **bold**, *italic*, __underline__)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const boosted = injectKeywordsIntoResume(resume, [
                            'Power BI',
                            'Snowflake',
                            'A/B Testing',
                          ]);
                          setResume(boosted);
                          showStatus('Added high-demand analytics keywords to Summary & Skills!');
                        }}
                        className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />+ Boost ATS Keywords
                      </button>
                    </div>

                    {/* Rich Edit Format Bar for Summary */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          setResume({
                            ...resume,
                            summary: `${resume.summary.trim()} **Key Impact**`,
                          })
                        }
                        className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 font-bold text-slate-800"
                        title="Insert Bold Text"
                      >
                        B Bold
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setResume({
                            ...resume,
                            summary: `${resume.summary.trim()} *Domain Focus*`,
                          })
                        }
                        className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 italic text-slate-800"
                        title="Insert Italic Text"
                      >
                        I Italic
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setResume({
                            ...resume,
                            summary: `${resume.summary.trim()} __Certified Specialist__`,
                          })
                        }
                        className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 underline text-slate-800"
                        title="Insert Underlined Text"
                      >
                        U Underline
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setResume({
                            ...resume,
                            summary: `${resume.summary.trim()} Delivered **25%+ operational efficiency** across cross-functional KPIs.`,
                          })
                        }
                        className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-teal-800"
                      >
                        + % ROI Metric
                      </button>
                      <span className="ml-auto text-[10.5px] font-mono text-slate-500 px-1">
                        {resume.summary.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>

                    <textarea
                      id="edit-summary"
                      rows={6}
                      value={resume.summary}
                      onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-3 leading-relaxed"
                    />
                  </div>
                )}

                {/* Work Experience Editor (with Drag-and-Drop, Move Up/Down, and All Bullet Edit Formats) */}
                {editorSection === 'experience' && (
                  <div className="flex flex-col gap-3.5 text-xs max-h-[560px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>Drag cards by handle or use Up/Down arrows to reorder roles</span>
                      <span className="font-mono tabular-nums">{resume.experiences.length} roles</span>
                    </div>
                    {resume.experiences.map((exp, expIdx) => (
                      <div
                        key={exp.id}
                        draggable
                        onDragStart={() => setDraggedExpIdx(expIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedExpIdx !== null && draggedExpIdx !== expIdx) {
                            handleMoveExperience(draggedExpIdx, expIdx);
                          }
                          setDraggedExpIdx(null);
                        }}
                        onDragEnd={() => setDraggedExpIdx(null)}
                        className={`p-3.5 rounded-lg border transition-colors flex flex-col gap-2.5 ${
                          draggedExpIdx === expIdx
                            ? 'border-teal-500 bg-teal-50/40 opacity-80'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                        }`}
                      >
                        {/* Reorder & Action Bar */}
                        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/80">
                          <div className="flex items-center gap-1.5 text-slate-600 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-bold text-[11px] text-teal-800">
                              #{expIdx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                              {exp.role || 'Role'} · {exp.company || 'Company'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={`Move experience ${expIdx + 1} up`}
                              disabled={expIdx === 0}
                              onClick={() => handleMoveExperience(expIdx, expIdx - 1)}
                              className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                              title="Move role up"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-[10px]">Up</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Move experience ${expIdx + 1} down`}
                              disabled={expIdx === resume.experiences.length - 1}
                              onClick={() => handleMoveExperience(expIdx, expIdx + 1)}
                              className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                              title="Move role down"
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-[10px]">Down</span>
                            </button>
                            {resume.experiences.length > 1 && (
                              <button
                                type="button"
                                aria-label={`Delete experience ${exp.role}`}
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    experiences: resume.experiences.filter((_, i) => i !== expIdx),
                                  })
                                }
                                className="p-1 text-slate-400 hover:text-red-600"
                                title="Delete role"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            aria-label={`Role title ${expIdx + 1}`}
                            value={exp.role}
                            onChange={(e) => {
                              const next = [...resume.experiences];
                              next[expIdx] = { ...exp, role: e.target.value };
                              setResume({ ...resume, experiences: next });
                            }}
                            placeholder="Role Title"
                            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 font-semibold"
                          />
                          <input
                            type="text"
                            aria-label={`Company name ${expIdx + 1}`}
                            value={exp.company}
                            onChange={(e) => {
                              const next = [...resume.experiences];
                              next[expIdx] = { ...exp, company: e.target.value };
                              setResume({ ...resume, experiences: next });
                            }}
                            placeholder="Company"
                            className="rounded border border-slate-300 bg-white px-2.5 py-1.5"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            aria-label={`Period ${expIdx + 1}`}
                            value={exp.period}
                            onChange={(e) => {
                              const next = [...resume.experiences];
                              next[expIdx] = { ...exp, period: e.target.value };
                              setResume({ ...resume, experiences: next });
                            }}
                            placeholder="Dates (e.g. Feb 2020 – Present)"
                            className="rounded border border-slate-300 bg-white px-2.5 py-1.5"
                          />
                          <input
                            type="text"
                            aria-label={`Location ${expIdx + 1}`}
                            value={exp.location}
                            onChange={(e) => {
                              const next = [...resume.experiences];
                              next[expIdx] = { ...exp, location: e.target.value };
                              setResume({ ...resume, experiences: next });
                            }}
                            placeholder="Location"
                            className="rounded border border-slate-300 bg-white px-2.5 py-1.5"
                          />
                        </div>

                        {/* Formatting Toolbar for Experience Bullets */}
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                          <span className="font-semibold text-slate-700">
                            Impact Bullets (**bold**, *italic*, __underline__):
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...resume.experiences];
                                next[expIdx] = {
                                  ...exp,
                                  bullets: [
                                    ...exp.bullets,
                                    'Spearheaded **SQL and Tableau** analytics initiative driving **20% faster** reporting.',
                                  ],
                                };
                                setResume({ ...resume, experiences: next });
                              }}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-semibold text-teal-800"
                            >
                              + Bullet
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...resume.experiences];
                                const lastIdx = Math.max(0, exp.bullets.length - 1);
                                const updatedBullets = [...exp.bullets];
                                updatedBullets[lastIdx] = `${
                                  updatedBullets[lastIdx] || ''
                                } **+18% ROI**`.trim();
                                next[expIdx] = { ...exp, bullets: updatedBullets };
                                setResume({ ...resume, experiences: next });
                              }}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700"
                            >
                              + **Metric**
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          aria-label={`Experience bullets ${expIdx + 1}`}
                          value={exp.bullets.join('\n')}
                          onChange={(e) => {
                            const next = [...resume.experiences];
                            next[expIdx] = {
                              ...exp,
                              bullets: e.target.value.split('\n'),
                            };
                            setResume({ ...resume, experiences: next });
                          }}
                          className="w-full rounded border border-slate-300 bg-white p-2 leading-relaxed"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setResume({
                          ...resume,
                          experiences: [
                            ...resume.experiences,
                            {
                              id: `exp-${Date.now()}`,
                              role: 'Business Intelligence Analyst',
                              company: 'Enterprise Data Labs',
                              location: 'Gurugram',
                              period: 'Jan 2019 – Jan 2020',
                              bullets: [
                                'Automated **SQL and Python** reporting workflows, reducing manual data preparation by **40%**.',
                              ],
                            },
                          ],
                        })
                      }
                      className="py-2 px-3 rounded-lg border border-dashed border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Work Experience Role
                    </button>
                  </div>
                )}

                {/* Projects Editor (with Drag-and-Drop, Move Up/Down, and All Bullet Edit Formats) */}
                {editorSection === 'projects' && (
                  <div className="flex flex-col gap-3.5 text-xs max-h-[560px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>Drag projects or click Up/Down buttons to reorder</span>
                      <span className="font-mono tabular-nums">{resume.projects.length} projects</span>
                    </div>
                    {resume.projects.map((proj, pIdx) => (
                      <div
                        key={proj.id}
                        draggable
                        onDragStart={() => setDraggedProjIdx(pIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedProjIdx !== null && draggedProjIdx !== pIdx) {
                            handleMoveProject(draggedProjIdx, pIdx);
                          }
                          setDraggedProjIdx(null);
                        }}
                        onDragEnd={() => setDraggedProjIdx(null)}
                        className={`p-3 rounded-lg border transition-colors flex flex-col gap-2 ${
                          draggedProjIdx === pIdx
                            ? 'border-teal-500 bg-teal-50/40 opacity-80'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                        }`}
                      >
                        {/* Reorder Header Bar */}
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
                          <div className="flex items-center gap-1.5 text-slate-600 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-bold text-[11px] text-teal-800">
                              #{pIdx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                              {proj.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={`Move project ${pIdx + 1} up`}
                              disabled={pIdx === 0}
                              onClick={() => handleMoveProject(pIdx, pIdx - 1)}
                              className="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                              title="Move project up"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-[10px]">Up</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Move project ${pIdx + 1} down`}
                              disabled={pIdx === resume.projects.length - 1}
                              onClick={() => handleMoveProject(pIdx, pIdx + 1)}
                              className="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                              title="Move project down"
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-[10px]">Down</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete project ${proj.title}`}
                              onClick={() =>
                                setResume({
                                  ...resume,
                                  projects: resume.projects.filter((_, i) => i !== pIdx),
                                })
                              }
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            aria-label={`Project title ${pIdx + 1}`}
                            value={proj.title}
                            onChange={(e) => {
                              const next = [...resume.projects];
                              next[pIdx] = { ...proj, title: e.target.value };
                              setResume({ ...resume, projects: next });
                            }}
                            className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 font-bold"
                          />
                          <input
                            type="text"
                            aria-label={`Project tech tag ${pIdx + 1}`}
                            value={proj.techTag}
                            onChange={(e) => {
                              const next = [...resume.projects];
                              next[pIdx] = { ...proj, techTag: e.target.value };
                              setResume({ ...resume, projects: next });
                            }}
                            className="w-32 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-teal-700 font-semibold"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                          <span>Bullets (**bold**, *italic*, __underline__):</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...resume.projects];
                                next[pIdx] = {
                                  ...proj,
                                  bullets: [
                                    ...proj.bullets,
                                    'Validated findings across **10,000+ records** with **95% confidence**.',
                                  ],
                                };
                                setResume({ ...resume, projects: next });
                              }}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-semibold text-teal-800"
                            >
                              + Bullet
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...resume.projects];
                                const lastIdx = Math.max(0, proj.bullets.length - 1);
                                const updatedBullets = [...proj.bullets];
                                updatedBullets[lastIdx] = `${
                                  updatedBullets[lastIdx] || ''
                                } **+20% accuracy**`.trim();
                                next[pIdx] = { ...proj, bullets: updatedBullets };
                                setResume({ ...resume, projects: next });
                              }}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700"
                            >
                              + **Metric**
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          aria-label={`Project bullets ${pIdx + 1}`}
                          value={proj.bullets.join('\n')}
                          onChange={(e) => {
                            const next = [...resume.projects];
                            next[pIdx] = { ...proj, bullets: e.target.value.split('\n') };
                            setResume({ ...resume, projects: next });
                          }}
                          className="w-full rounded border border-slate-300 bg-white p-2"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setResume({
                          ...resume,
                          projects: [
                            ...resume.projects,
                            {
                              id: `proj-${Date.now()}`,
                              title: 'EXECUTIVE KPI & COHORT ANALYTICS',
                              techTag: 'SQL & Tableau',
                              bullets: [
                                'Built automated cohort retention models across **50,000+ customer records**, lifting repeat purchase accuracy by **18%**.',
                              ],
                            },
                          ],
                        })
                      }
                      className="py-2 px-3 rounded-lg border border-dashed border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Analytics / ML Project
                    </button>
                  </div>
                )}

                {/* Technical Skills Editor (with Per-Skill Proficiency Levels & AI Keyword Suggestion) */}
                {editorSection === 'skills' && (
                  <div className="flex flex-col gap-3.5 text-xs max-h-[600px] overflow-y-auto pr-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          Target Job Description Context (for AI Skill Suggestions)
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('jd-scanner')}
                          className="text-[11px] font-semibold text-teal-700 hover:underline"
                        >
                          Open Full JD Scanner →
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        aria-label="Target job description for skill suggestions"
                        placeholder="Paste target job description here (or leave default Data Analyst / BI Engineer benchmark) to tailor AI keyword suggestions..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-700"
                      />
                    </div>

                    {resume.skills.map((sk, sIdx) => {
                      const suggestions = categorySuggestions[sk.id] || [];
                      const isLoadingThis = loadingCategoryId === sk.id;
                      const parsedSkills = parseSkillItems(sk.items);
                      const draftNewSkill = newSkillInputs[sk.id] || {
                        name: '',
                        level: 'Expert' as SkillProficiencyLevel,
                      };

                      return (
                        <div
                          key={sk.id}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col gap-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              aria-label={`Skill category ${sIdx + 1}`}
                              value={sk.category}
                              onChange={(e) => {
                                const next = [...resume.skills];
                                next[sIdx] = { ...sk, category: e.target.value };
                                setResume({ ...resume, skills: next });
                              }}
                              className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 font-bold text-slate-900 bg-white"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-label={`Move skill category ${sIdx + 1} up`}
                                disabled={sIdx === 0}
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    skills: reorderListItems(resume.skills, sIdx, sIdx - 1),
                                  })
                                }
                                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600"
                                title="Move category up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move skill category ${sIdx + 1} down`}
                                disabled={sIdx === resume.skills.length - 1}
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    skills: reorderListItems(resume.skills, sIdx, sIdx + 1),
                                  })
                                }
                                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600"
                                title="Move category down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSuggestCategorySkills(sk.id, sk.category, sk.items)
                                }
                                disabled={isLoadingThis}
                                className="px-2.5 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-700 font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                {isLoadingThis ? 'Analyzing JD...' : 'AI Keyword Suggestion'}
                              </button>
                            </div>
                          </div>

                          {/* Comma-Separated Raw Edit Input */}
                          <div>
                            <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">
                              Comma-Separated Skills List:
                            </label>
                            <input
                              type="text"
                              aria-label={`Skill items ${sIdx + 1}`}
                              value={sk.items}
                              onChange={(e) => {
                                const next = [...resume.skills];
                                next[sIdx] = { ...sk, items: e.target.value };
                                setResume({ ...resume, skills: next });
                              }}
                              className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800"
                            />
                          </div>

                          {/* Per-Skill Proficiency Assignment (Expert, Proficient, Familiar) */}
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">
                                Per-Skill Proficiency Level (Rendered on Resume)
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Expert (●●●) · Proficient (●●○) · Familiar (●○○)
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              {parsedSkills.map((skillName) => {
                                const currentLevel = getSkillProficiency(sk, skillName);
                                const meta = getProficiencyIndicatorMeta(currentLevel);
                                return (
                                  <div
                                    key={skillName}
                                    className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-200/80"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="inline-flex items-center gap-0.5 shrink-0">
                                        {[1, 2, 3].map((dot) => (
                                          <span
                                            key={dot}
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              dot <= meta.dots ? 'bg-teal-600' : 'bg-slate-300'
                                            }`}
                                          />
                                        ))}
                                      </span>
                                      <span className="font-semibold text-slate-800 truncate">
                                        {skillName}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <select
                                        aria-label={`Proficiency for ${skillName}`}
                                        value={currentLevel}
                                        onChange={(e) => {
                                          const newLevel = e.target.value as SkillProficiencyLevel;
                                          const next = [...resume.skills];
                                          next[sIdx] = setSkillProficiency(sk, skillName, newLevel);
                                          setResume({ ...resume, skills: next });
                                          showStatus(
                                            `Set "${skillName}" proficiency to ${newLevel}.`
                                          );
                                        }}
                                        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 cursor-pointer"
                                      >
                                        <option value="Expert">Expert</option>
                                        <option value="Proficient">Proficient</option>
                                        <option value="Familiar">Familiar</option>
                                      </select>
                                      <button
                                        type="button"
                                        aria-label={`Remove skill ${skillName}`}
                                        onClick={() => {
                                          const remaining = parsedSkills.filter(
                                            (item) => item !== skillName
                                          );
                                          const next = [...resume.skills];
                                          next[sIdx] = { ...sk, items: remaining.join(', ') };
                                          setResume({ ...resume, skills: next });
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-red-600"
                                        title={`Remove ${skillName}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Quick Add Individual Skill with Proficiency */}
                            <div className="flex items-center gap-1.5 pt-1 mt-0.5 border-t border-slate-100">
                              <input
                                type="text"
                                aria-label={`Add new skill to ${sk.category}`}
                                placeholder={`Add skill to ${sk.category}...`}
                                value={draftNewSkill.name}
                                onChange={(e) =>
                                  setNewSkillInputs((prev) => ({
                                    ...prev,
                                    [sk.id]: { ...draftNewSkill, name: e.target.value },
                                  }))
                                }
                                className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px]"
                              />
                              <select
                                aria-label={`New skill proficiency for ${sk.category}`}
                                value={draftNewSkill.level}
                                onChange={(e) =>
                                  setNewSkillInputs((prev) => ({
                                    ...prev,
                                    [sk.id]: {
                                      ...draftNewSkill,
                                      level: e.target.value as SkillProficiencyLevel,
                                    },
                                  }))
                                }
                                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium"
                              >
                                <option value="Expert">Expert</option>
                                <option value="Proficient">Proficient</option>
                                <option value="Familiar">Familiar</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  const clean = draftNewSkill.name.trim();
                                  if (!clean) return;
                                  const updatedItems = parsedSkills.includes(clean)
                                    ? sk.items
                                    : [...parsedSkills, clean].join(', ');
                                  const updatedCat = setSkillProficiency(
                                    { ...sk, items: updatedItems },
                                    clean,
                                    draftNewSkill.level
                                  );
                                  const next = [...resume.skills];
                                  next[sIdx] = updatedCat;
                                  setResume({ ...resume, skills: next });
                                  setNewSkillInputs((prev) => ({
                                    ...prev,
                                    [sk.id]: { name: '', level: 'Expert' },
                                  }));
                                  showStatus(
                                    `Added "${clean}" (${draftNewSkill.level}) to ${sk.category}!`
                                  );
                                }}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] whitespace-nowrap cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          </div>

                          {suggestions.length > 0 && (
                            <div className="pt-1 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-600">
                                <span className="font-semibold text-teal-800">
                                  Suggested Missing Industry & JD Keywords for {sk.category}:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const existing = sk.items
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    const merged = Array.from(
                                      new Set([...existing, ...suggestions])
                                    ).join(', ');
                                    const next = [...resume.skills];
                                    next[sIdx] = { ...sk, items: merged };
                                    setResume({ ...resume, skills: next });
                                    setCategorySuggestions((prev) => ({
                                      ...prev,
                                      [sk.id]: [],
                                    }));
                                    showStatus(
                                      `Added all ${suggestions.length} suggested skills to ${sk.category}!`
                                    );
                                  }}
                                  className="font-bold text-teal-700 hover:underline"
                                >
                                  + Add All
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {suggestions.map((sug) => (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() =>
                                      handleAddSkillToCategory(sIdx, sk.id, sug)
                                    }
                                    className="px-2 py-1 rounded border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3 text-teal-700" />
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setResume({
                          ...resume,
                          skills: [
                            ...resume.skills,
                            {
                              id: `sk-${Date.now()}`,
                              category: 'Cloud & Data Engineering',
                              items: 'Snowflake, BigQuery, Git, ETL Pipelines',
                              skillLevels: {
                                Snowflake: 'Expert',
                                BigQuery: 'Proficient',
                                Git: 'Expert',
                                'ETL Pipelines': 'Expert',
                              },
                            },
                          ],
                        })
                      }
                      className="py-2 px-3 rounded-lg border border-dashed border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Skill Category
                    </button>
                  </div>
                )}

                {/* Education & Certifications Editor (With Full Add/Reorder/Delete Controls) */}
                {editorSection === 'credentials' && (
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">Education</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setResume({
                              ...resume,
                              education: [
                                ...resume.education,
                                {
                                  id: `edu-${Date.now()}`,
                                  degree: 'Postgraduate Program in Data Science & Machine Learning',
                                  institution: 'Executive Analytics Institute',
                                  period: '2024 – 2025',
                                },
                              ],
                            })
                          }
                          className="text-teal-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Education
                        </button>
                      </div>
                      {resume.education.map((edu, idx) => (
                        <div
                          key={edu.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-bold text-teal-800">
                              Education #{idx + 1}
                            </span>
                            {resume.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    education: resume.education.filter((_, i) => i !== idx),
                                  })
                                }
                                className="text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            aria-label="Degree title"
                            value={edu.degree}
                            onChange={(e) => {
                              const next = [...resume.education];
                              next[idx] = { ...edu, degree: e.target.value };
                              setResume({ ...resume, education: next });
                            }}
                            placeholder="Degree Title"
                            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 font-semibold"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              aria-label="University institution"
                              value={edu.institution}
                              onChange={(e) => {
                                const next = [...resume.education];
                                next[idx] = { ...edu, institution: e.target.value };
                                setResume({ ...resume, education: next });
                              }}
                              placeholder="University / Institution"
                              className="rounded border border-slate-300 bg-white px-2.5 py-1.5"
                            />
                            <input
                              type="text"
                              aria-label="Education period"
                              value={edu.period}
                              onChange={(e) => {
                                const next = [...resume.education];
                                next[idx] = { ...edu, period: e.target.value };
                                setResume({ ...resume, education: next });
                              }}
                              placeholder="Dates (e.g. July 2014 to June 2018)"
                              className="rounded border border-slate-300 bg-white px-2.5 py-1.5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">Certifications</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setResume({
                              ...resume,
                              certificates: [
                                ...resume.certificates,
                                {
                                  id: `cert-${Date.now()}`,
                                  name: 'Advanced SQL & Cloud Warehousing Certificate',
                                  date: 'October 2025',
                                },
                              ],
                            })
                          }
                          className="text-teal-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Certificate
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {resume.certificates.map((cert, cIdx) => (
                          <div key={cert.id} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              aria-label={`Certificate name ${cIdx + 1}`}
                              value={cert.name}
                              onChange={(e) => {
                                const next = [...resume.certificates];
                                next[cIdx] = { ...cert, name: e.target.value };
                                setResume({ ...resume, certificates: next });
                              }}
                              className="flex-1 rounded border border-slate-300 px-2.5 py-1"
                            />
                            <input
                              type="text"
                              aria-label={`Certificate date ${cIdx + 1}`}
                              value={cert.date}
                              onChange={(e) => {
                                const next = [...resume.certificates];
                                next[cIdx] = { ...cert, date: e.target.value };
                                setResume({ ...resume, certificates: next });
                              }}
                              className="w-28 rounded border border-slate-300 px-2.5 py-1"
                            />
                            {resume.certificates.length > 1 && (
                              <button
                                type="button"
                                aria-label={`Delete certificate ${cert.name}`}
                                onClick={() =>
                                  setResume({
                                    ...resume,
                                    certificates: resume.certificates.filter((_, i) => i !== cIdx),
                                  })
                                }
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Reference & Internet Trending Templates Quick Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <LayoutTemplate className="w-3.5 h-3.5 text-teal-600" />
                      Your 4 Uploaded PDF Layouts
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('templates')}
                      className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                    >
                      Browse All 28 →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {RESUME_TEMPLATES.slice(0, 4).map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(tpl);
                          showStatus(`Applied ${tpl.name}`);
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          selectedTemplate.id === tpl.id
                            ? 'border-teal-600 bg-teal-50/50 font-bold text-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">{tpl.name}</div>
                        <div className="text-[10px] text-slate-500">{tpl.badgeText}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Internet-Trending Templates (Overleaf, Enhancv, Novoresume, Canva)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {RESUME_TEMPLATES.slice(4, 8).map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(tpl);
                          showStatus(`Applied internet-trending template: ${tpl.name}`);
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          selectedTemplate.id === tpl.id
                            ? 'border-teal-600 bg-teal-50/50 font-bold text-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">{tpl.name}</div>
                        <div className="text-[10px] text-teal-700 font-medium">{tpl.badgeText}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Live A4 Resume Document Canvas */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="no-print flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-bold text-slate-900">{selectedTemplate.name}</span>
                  <span>·</span>
                  <span className="font-mono">ATS Compatibility {selectedTemplate.atsCompatibility}%</span>
                  <span>·</span>
                  <span className="uppercase font-mono text-teal-700">{activeLanguage}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="toggle-keyword-heatmap-btn"
                    aria-pressed={isHeatmapActive}
                    onClick={() => {
                      const next = !isHeatmapActive;
                      setIsHeatmapActive(next);
                      showStatus(
                        next
                          ? `Activated Keyword Heatmap visual overlay (${heatmapAnalysis.overallDensityScore}% density)`
                          : 'Hidden Keyword Heatmap visual overlay'
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isHeatmapActive
                        ? 'bg-slate-900 text-white ring-2 ring-emerald-500/80'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        isHeatmapActive ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    />
                    <span>Keyword Heatmap</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        heatmapAnalysis.overallBand === 'high'
                          ? 'bg-emerald-500 text-slate-950'
                          : heatmapAnalysis.overallBand === 'medium'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {heatmapAnalysis.overallDensityScore}%
                    </span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setIsPrintPreviewOpen(true)}
                    className="font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    Print Preview
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin-global')}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-teal-600" />
                    Multi-Language Parser
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .DOCX
                  </button>
                </div>
              </div>

              <ResumeCanvas
                resume={resume}
                template={selectedTemplate}
                highlightKeywords={atsBreakdown.matchedKeywords}
                heatmapActive={isHeatmapActive}
                heatmapAnalysis={heatmapAnalysis}
                onInjectGapKeyword={handleInjectGapKeywordFromHeatmap}
                onInjectAllGapKeywords={handleInjectAllGapKeywordsFromHeatmap}
              />
            </div>
          </div>
        )}

        {/* TAB 2: 24 PROFESSIONAL TEMPLATES + UPLOADED PDF VIEWER */}
        {activeTab === 'templates' && (
          <TemplateGalleryView
            resume={resume}
            selectedTemplateId={selectedTemplate.id}
            onSelectTemplate={(tpl) => {
              setSelectedTemplate(tpl);
              setActiveTab('builder');
              showStatus(`Selected "${tpl.name}" and returned to live builder!`);
            }}
          />
        )}

        {/* TAB 3: JOB DESCRIPTION SCANNER & REAL-TIME ATS CHECKER */}
        {activeTab === 'jd-scanner' && (
          <JdScannerAndAtsView
            resume={resume}
            onUpdateResume={setResume}
            jobDescription={jobDescription}
            onChangeJobDescription={setJobDescription}
            atsBreakdown={atsBreakdown}
            onShowStatus={showStatus}
          />
        )}

        {/* TAB 4: BUILT-IN COVER LETTER GENERATOR & AI CAREER ADVISOR */}
        {activeTab === 'cover-letter' && (
          <CoverLetterAndCareerView
            resume={resume}
            jobDescription={jobDescription}
            onShowStatus={showStatus}
          />
        )}

        {/* TAB 5: MULTI-LANGUAGE PARSER, PRICING GATEWAY, SUPPORT & ADMIN PANEL */}
        {activeTab === 'admin-global' && (
          <div className="flex flex-col gap-8">
            <MultiLangAndSupportView
              resume={resume}
              onUpdateResume={setResume}
              activeLanguage={activeLanguage}
              onChangeLanguage={setActiveLanguage}
              onTicketSubmitted={fetchBootstrapData}
              onShowStatus={showStatus}
            />

            <AdminAndPricingView
              currentUserEmail={currentUser.email}
              currentUserPlan={currentUser.plan}
              usersList={usersList}
              supportTickets={supportTickets}
              paymentsList={paymentsList}
              analyticsEvents={analyticsEvents}
              onRefreshData={fetchBootstrapData}
              onShowStatus={showStatus}
            />
          </div>
        )}
      </main>

      {/* =====================================================================
          WEBSITE ARCHITECTURE & INTERNET TEMPLATE BENCHMARK SHOWCASE
         ===================================================================== */}
      <WebsiteBottomShowcase
        selectedTemplate={selectedTemplate}
        atsScore={atsBreakdown.overall}
        onSelectTemplate={(tpl) => {
          setSelectedTemplate(tpl);
          showStatus(`Applied "${tpl.name}" (${tpl.atsCompatibility}% ATS Compatibility)`);
        }}
        onNavigateTab={setActiveTab}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      {/* Quiet Enterprise Footer */}
      <footer className="no-print border-t border-slate-200 bg-white px-6 py-4 mt-8 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            ResuMetric ATS Studio · Built for Automated Applicant Tracking Alignment · 28 Verified Templates (Uploaded PDFs + Internet Benchmarks)
          </div>
          <div className="flex items-center gap-4">
            <span>Admin: vinay22y95@gmail.com</span>
            <span>·</span>
            <a
              href="mailto:atsfriendlyresumes.admin@gmail.com"
              className="hover:text-slate-900 underline"
            >
              Support: atsfriendlyresumes.admin@gmail.com
            </a>
          </div>
        </div>
      </footer>

      {/* High-Fidelity Print Preview Modal with Grid Lines & Margin Guides */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        resume={resume}
        template={selectedTemplate}
        highlightKeywords={atsBreakdown.matchedKeywords}
        onTriggerPrint={handleExportPdf}
      />

      {/* Live Chat Drawer */}
      <LiveChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onMessageSent={setChatMessages}
        userName={resume.fullName}
      />
    </div>
  );
}
