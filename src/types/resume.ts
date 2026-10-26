export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  techTag: string;
  bullets: string[];
}

export type SkillProficiencyLevel = 'Expert' | 'Proficient' | 'Familiar';

export interface SkillCategory {
  id: string;
  category: string;
  items: string;
  skillLevels?: Record<string, SkillProficiencyLevel>;
}

export interface CertificateItem {
  id: string;
  name: string;
  date: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
  levelPercent: number;
}

export type ResumeSectionBoundary =
  | 'after-header'
  | 'after-summary'
  | 'after-experience'
  | 'after-projects'
  | 'after-skills'
  | 'after-credentials';

export type SectionDividerStyle =
  | 'solid'
  | 'double'
  | 'dashed'
  | 'accent-gradient'
  | 'diamond-center';

export interface SectionDividerItem {
  id: string;
  placement: ResumeSectionBoundary;
  style: SectionDividerStyle;
  thicknessPx: number;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatarInitials: string;
  summary: string;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certificates: CertificateItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  sectionDividers?: SectionDividerItem[];
  compactPageFit?: boolean;
}

export interface QuickFixReport {
  previousScore: number;
  newScore: number;
  bulletsUpgradedCount: number;
  actionVerbsAdded: string[];
  grammarFixesApplied: number;
  keywordsInjected: string[];
  summaryImproved: boolean;
  changeLog: string[];
}

export interface AutoFormatLayoutAnalysis {
  totalWords: number;
  totalBullets: number;
  totalSections: number;
  rawEstimatedPages: number;
  fittedEstimatedPages: number;
  exceedsTwoPagesBeforeFix: boolean;
  suggestedCategory: 'Dense Content' | 'Minimalist';
  densityLabel: string;
  recommendedTemplateId: string;
  recommendedTemplateName: string;
  alternativeTemplateIds: string[];
  compactDensityApplied: boolean;
  reasoning: string;
}

export interface AtsScoreBreakdown {
  overall: number;
  keywordAlignment: number;
  quantifiedImpact: number;
  formattingAndStructure: number;
  actionVerbAndReadability: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  quantifiedBulletsCount: number;
  totalBulletsCount: number;
  boldHighlightsCount: number;
  recommendations: string[];
}

export type TemplateLayoutStyle =
  | 'nordic-sidebar-left'      // Uploaded PDF #1: Dark slate left sidebar, teal circle icons & diamonds
  | 'navy-gold-banner'         // Uploaded PDF #2: Dark navy top banner, gold role & photo ring, dark skill blocks
  | 'coral-split-three'        // Uploaded PDF #3: Coral terracotta name, center photo, right contact, coral skill blocks
  | 'navy-floating-card'       // Uploaded PDF #4: Floating dark navy contact box, coral square badges, two-tone dividers
  | 'jakes-latex-standard'     // Internet #1: Jake's Resume (Overleaf / Reddit r/EngineeringResumes FAANG standard)
  | 'enhancv-bento-modern'     // Internet #2: Enhancv Modern KPI Impact Bento cards + two-column strength matrix
  | 'novoresume-timeline'      // Internet #3: Novoresume connected vertical timeline rail + skill progress meters
  | 'canva-editorial-studio'   // Internet #4: Canva / Resume.io Warm Editorial Studio masthead + framed badges
  | 'single-column-classic'    // Harvard / Wall Street / Federal classic single-column
  | 'two-column-sidebar-right' // Tech / Data Scientist right sidebar
  | 'swiss-asymmetric-grid'    // Zurich / Berlin left label column + right content
  | 'compact-executive-banner';// Modern executive banner + 2-column matrix

export interface ResumeTemplateConfig {
  id: string;
  name: string;
  category:
    | 'Uploaded Reference'
    | 'Internet Trending'
    | 'Data & Tech'
    | 'Executive & Consulting'
    | 'Creative & Editorial'
    | 'Global & Academic';
  layout: TemplateLayoutStyle;
  primaryColor: string;
  accentColor: string;
  sidebarBg: string;
  sidebarText: string;
  skillBlockBg: string;
  skillBlockText: string;
  fontStyle: 'sans' | 'serif' | 'mono';
  badgeText?: string;
  inspirationSource?: string;
  atsCompatibility: number;
  description: string;
}
