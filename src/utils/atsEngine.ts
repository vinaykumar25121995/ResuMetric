import {
  AtsScoreBreakdown,
  AutoFormatLayoutAnalysis,
  HeatmapBand,
  QuickFixReport,
  ResumeData,
  ResumeHeatmapAnalysis,
  ResumeSectionBoundary,
  ResumeTemplateConfig,
  SectionDividerItem,
  SectionDividerStyle,
  SectionHeatmapMetrics,
  SkillCategory,
  SkillProficiencyLevel,
} from '../types/resume.ts';

const BENCHMARK_KEYWORDS_BY_ROLE: Record<string, string[]> = {
  default: [
    'SQL',
    'Python',
    'Tableau',
    'Excel',
    'PivotTables',
    'Machine Learning',
    'Regression',
    'Classification',
    'Forecasting',
    'Data Cleaning',
    'Looker Studio',
    'Dashboard',
    'Predictive Modeling',
    'Customer Segmentation',
    'Trend Analysis',
    'Exploratory Analysis',
  ],
};

const STRONG_ACTION_VERBS = [
  'analyzed',
  'identified',
  'developed',
  'applied',
  'presented',
  'segmented',
  'completed',
  'wrote',
  'trained',
  'designed',
  'examined',
  'spotted',
  'compared',
  'built',
  'queried',
  'organized',
  'studied',
  'highlighted',
  'visualized',
  'surfaced',
  'supported',
  'architected',
  'engineered',
  'automated',
  'spearheaded',
  'optimized',
];

const CURATED_TECH_DOMAIN_VOCAB = [
  'SQL',
  'Python',
  'R',
  'Tableau',
  'Power BI',
  'Looker Studio',
  'Excel',
  'PivotTables',
  'Formulas',
  'Macros',
  'VBA',
  'Machine Learning',
  'Deep Learning',
  'Classification',
  'Regression',
  'Logistic Regression',
  'Predictive Modeling',
  'Forecasting',
  'Demand Forecasting',
  'Data Cleaning',
  'Exploratory Analysis',
  'Trend Analysis',
  'Customer Segmentation',
  'A/B Testing',
  'ETL',
  'Snowflake',
  'BigQuery',
  'Redshift',
  'Spark',
  'Git',
  'Statistics',
  'Statistical Analysis',
  'KPI',
  'Supply Chain',
  'Financial Analysis',
  'Profit Margins',
  'SLA',
  'Cohort Analysis',
  'Feature Engineering',
  'Dashboard Development',
  'Stakeholder Management',
  'Revenue Increase',
];

export function serializeResumeToPlainText(resume: ResumeData): string {
  const parts: string[] = [
    resume.fullName,
    resume.jobTitle,
    resume.summary,
    ...resume.skills.map((s) => `${s.category}: ${s.items}`),
    ...resume.experiences.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.title, p.techTag, ...p.bullets]),
    ...resume.certificates.map((c) => c.name),
    ...resume.education.flatMap((ed) => [ed.degree, ed.institution]),
    ...resume.languages.map((l) => `${l.language} ${l.proficiency}`),
  ];
  return parts.join(' \n ');
}

export function extractKeywordsFromJobDescription(jobDescription?: string): string[] {
  if (!jobDescription || !jobDescription.trim()) {
    return BENCHMARK_KEYWORDS_BY_ROLE.default;
  }

  const normalizedJD = jobDescription.toLowerCase();
  const matchedVocab: string[] = [];

  for (const term of CURATED_TECH_DOMAIN_VOCAB) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalizedJD)) {
      matchedVocab.push(term);
    }
  }

  if (matchedVocab.length >= 5) {
    return Array.from(new Set(matchedVocab));
  }

  // Fallback extraction of capitalized multi-word or technical tokens if custom JD
  const customTokens = jobDescription
    .split(/[,.;\n()/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && t.length <= 28 && /^[A-Z0-9]/.test(t));

  return Array.from(new Set([...matchedVocab, ...customTokens, ...BENCHMARK_KEYWORDS_BY_ROLE.default.slice(0, 8)])).slice(
    0,
    20
  );
}

export function calculateAtsScore(resume: ResumeData, jobDescription?: string): AtsScoreBreakdown {
  const fullText = serializeResumeToPlainText(resume);
  const fullTextLower = fullText.toLowerCase();

  // 1. Keyword Alignment (35% weight)
  const targetKeywords = extractKeywordsFromJobDescription(jobDescription);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of targetKeywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(fullTextLower)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordAlignment =
    targetKeywords.length > 0 ? Math.round((matchedKeywords.length / targetKeywords.length) * 100) : 90;

  // 2. Quantified Impact (25% weight)
  const allBullets = [
    ...resume.experiences.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
  ].filter((b) => b.trim().length > 0);

  const metricRegex = /(\d+%|\d+\+|\d{1,3}(,\d{3})+|\$\d+|\b\d+\s*(months|years|projects|queries|reports|dashboards|companies)\b)/i;
  const quantifiedBulletsCount = allBullets.filter((b) => metricRegex.test(b)).length;
  const totalBulletsCount = allBullets.length;

  const targetQuantRatio = 0.45; // 45%+ of bullets having numbers is executive-grade
  const actualRatio = totalBulletsCount > 0 ? quantifiedBulletsCount / totalBulletsCount : 0;
  const quantifiedImpact = Math.min(100, Math.round((actualRatio / targetQuantRatio) * 92) + (quantifiedBulletsCount > 0 ? 8 : 0));

  // 3. Formatting & Structure Completeness (20% weight)
  let structurePoints = 0;
  if (resume.fullName.trim() && resume.jobTitle.trim()) structurePoints += 15;
  if (resume.email.includes('@') && resume.phone.trim()) structurePoints += 15;
  if (resume.linkedin.trim() || resume.github.trim() || resume.website.trim()) structurePoints += 10;
  if (resume.summary.trim().length >= 80) structurePoints += 15;
  if (resume.experiences.length >= 1) structurePoints += 15;
  if (resume.skills.length >= 3) structurePoints += 10;
  if (resume.projects.length >= 2) structurePoints += 10;
  if (resume.education.length >= 1 && resume.certificates.length >= 1) structurePoints += 10;

  const boldMatches = fullText.match(/\*\*[^*]+\*\*/g) || [];
  const boldHighlightsCount = boldMatches.length;
  const formattingAndStructure = Math.min(100, structurePoints);

  // 4. Action Verb Strength & Readability (20% weight)
  let actionVerbHits = 0;
  for (const bullet of allBullets) {
    const cleanBullet = bullet.replace(/^\*\*|\*\*$/g, '').trim();
    const firstWord = cleanBullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && STRONG_ACTION_VERBS.includes(firstWord)) {
      actionVerbHits++;
    }
  }
  const verbRatio = totalBulletsCount > 0 ? actionVerbHits / totalBulletsCount : 0;
  const actionVerbAndReadability = Math.min(100, Math.round(65 + verbRatio * 35));

  const overall = Math.min(
    100,
    Math.round(
      keywordAlignment * 0.38 +
        quantifiedImpact * 0.24 +
        formattingAndStructure * 0.2 +
        actionVerbAndReadability * 0.18
    )
  );

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Add missing target keywords (${missingKeywords.slice(0, 4).join(', ')}) to your Technical Skills or Summary.`
    );
  }
  if (quantifiedBulletsCount < Math.ceil(totalBulletsCount * 0.45)) {
    recommendations.push(
      `Quantify more bullets with percentages or counts (currently ${quantifiedBulletsCount}/${totalBulletsCount} bullets include hard metrics).`
    );
  }
  if (boldHighlightsCount < 5) {
    recommendations.push(
      'Wrap high-value skills and ROI outcomes in **bold** markers to guide human recruiter eye-tracking.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Excellent ATS alignment! Your resume combines dense keyword coverage, quantified impact, and clean parser hierarchy.'
    );
  }

  return {
    overall,
    keywordAlignment,
    quantifiedImpact,
    formattingAndStructure,
    actionVerbAndReadability,
    matchedKeywords,
    missingKeywords,
    quantifiedBulletsCount,
    totalBulletsCount,
    boldHighlightsCount,
    recommendations,
  };
}

export function injectKeywordsIntoResume(resume: ResumeData, keywords: string[]): ResumeData {
  const cleanKeywords = keywords.map((k) => k.trim()).filter(Boolean);
  if (cleanKeywords.length === 0) return resume;

  const updatedSkills = [...resume.skills];
  const existingSkillsText = updatedSkills.map((s) => s.items.toLowerCase()).join(', ');
  const newToSkills = cleanKeywords.filter((k) => !existingSkillsText.includes(k.toLowerCase()));

  if (newToSkills.length > 0) {
    if (updatedSkills.length > 0) {
      const lastIdx = updatedSkills.length - 1;
      updatedSkills[lastIdx] = {
        ...updatedSkills[lastIdx],
        items: `${updatedSkills[lastIdx].items}, ${newToSkills.join(', ')}`,
      };
    } else {
      updatedSkills.push({
        id: `sk-${Date.now()}`,
        category: 'Core Competencies',
        items: newToSkills.join(', '),
      });
    }
  }

  let updatedSummary = resume.summary;
  const summaryMissing = cleanKeywords.filter(
    (k) => !updatedSummary.toLowerCase().includes(k.toLowerCase())
  );
  if (summaryMissing.length > 0) {
    const highlighted = summaryMissing.slice(0, 4).map((k) => `**${k}**`).join(', ');
    updatedSummary = `${updatedSummary.trim()} Proven proficiency in ${highlighted} to drive measurable operational efficiency.`;
  }

  return {
    ...resume,
    summary: updatedSummary,
    skills: updatedSkills,
  };
}

export function parsePlainTextResume(rawText: string, baseResume: ResumeData): ResumeData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return baseResume;

  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(\+?\d[\d\s-]{8,14}\d)/);
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[a-zA-Z0-9-_]+/i);
  const githubMatch = rawText.match(/github\.com\/[a-zA-Z0-9-_]+/i);

  const fullName = lines[0].length <= 45 ? lines[0].replace(/^#+\s*/, '') : baseResume.fullName;
  const jobTitle = lines[1] && lines[1].length <= 60 ? lines[1] : baseResume.jobTitle;

  const bulletLines = lines
    .filter((l) => /^[•◆\-*]\s+/.test(l))
    .map((l) => l.replace(/^[•◆\-*]\s+/, '').trim());

  const updatedExperiences = [...baseResume.experiences];
  if (bulletLines.length >= 2 && updatedExperiences.length > 0) {
    updatedExperiences[0] = {
      ...updatedExperiences[0],
      bullets: bulletLines.slice(0, 6),
    };
  }

  return {
    ...baseResume,
    fullName,
    jobTitle,
    email: emailMatch ? emailMatch[0] : baseResume.email,
    phone: phoneMatch ? phoneMatch[0].trim() : baseResume.phone,
    linkedin: linkedinMatch ? linkedinMatch[0] : baseResume.linkedin,
    github: githubMatch ? githubMatch[0] : baseResume.github,
    experiences: updatedExperiences,
  };
}

const INDUSTRY_SKILLS_BY_CATEGORY: Record<string, string[]> = {
  languages: ['Python', 'SQL', 'R', 'PostgreSQL', 'T-SQL', 'Bash', 'PySpark', 'Scala'],
  machinelearning: [
    'Random Forest',
    'XGBoost',
    'Time-Series Forecasting',
    'Feature Engineering',
    'Scikit-Learn',
    'A/B Testing',
    'Clustering (K-Means)',
    'Cross-Validation',
  ],
  visualization: [
    'Power BI',
    'DAX',
    'Executive KPI Storytelling',
    'Data Modeling',
    'Metabase',
    'Streamlit',
    'Plotly / Seaborn',
  ],
  excel: [
    'XLOOKUP / VLOOKUP',
    'Power Query',
    'VBA Macros',
    'Financial Modeling',
    'Conditional Formatting',
    'Dynamic Arrays',
  ],
  analysis: [
    'Cohort Analysis',
    'Root Cause Analysis',
    'Hypothesis Testing',
    'Variance Analysis',
    'Supply Chain Optimization',
    'ETL Data Pipelines',
    'Revenue Attribution',
  ],
  cloud: [
    'Snowflake',
    'Google BigQuery',
    'AWS Redshift',
    'dbt (Data Build Tool)',
    'Apache Airflow',
    'Git / GitHub Actions',
  ],
};

export function suggestSkillsForCategory(
  categoryName: string,
  currentItems: string,
  jobDescription?: string
): string[] {
  const existingSet = new Set(
    currentItems
      .split(/[,;|]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

  const normalizedCat = categoryName.toLowerCase();
  let benchmarkPool: string[] = [];

  if (normalizedCat.includes('lang') || normalizedCat.includes('code') || normalizedCat.includes('prog')) {
    benchmarkPool = INDUSTRY_SKILLS_BY_CATEGORY.languages;
  } else if (normalizedCat.includes('machine') || normalizedCat.includes('ml') || normalizedCat.includes('ai') || normalizedCat.includes('model')) {
    benchmarkPool = INDUSTRY_SKILLS_BY_CATEGORY.machinelearning;
  } else if (normalizedCat.includes('visual') || normalizedCat.includes('bi') || normalizedCat.includes('dashboard')) {
    benchmarkPool = INDUSTRY_SKILLS_BY_CATEGORY.visualization;
  } else if (normalizedCat.includes('excel') || normalizedCat.includes('spreadsheet')) {
    benchmarkPool = INDUSTRY_SKILLS_BY_CATEGORY.excel;
  } else if (normalizedCat.includes('cloud') || normalizedCat.includes('data eng') || normalizedCat.includes('warehouse')) {
    benchmarkPool = INDUSTRY_SKILLS_BY_CATEGORY.cloud;
  } else {
    benchmarkPool = [
      ...INDUSTRY_SKILLS_BY_CATEGORY.analysis,
      ...INDUSTRY_SKILLS_BY_CATEGORY.cloud.slice(0, 3),
    ];
  }

  // Extract keywords from the target Job Description that aren't already in this category
  const jdKeywords = jobDescription?.trim()
    ? extractKeywordsFromJobDescription(jobDescription).filter(
        (kw) => kw.toLowerCase() !== 'b testing'
      )
    : [];

  // Match JD keywords that belong to this category first, then category benchmark skills, then remaining JD keywords
  const categoryMatchedJd = jdKeywords.filter((kw) =>
    benchmarkPool.some(
      (b) =>
        b.toLowerCase().includes(kw.toLowerCase()) ||
        kw.toLowerCase().includes(b.toLowerCase())
    )
  );
  const otherJd = jdKeywords.filter((kw) => !categoryMatchedJd.includes(kw));

  const combinedCandidates = [
    ...categoryMatchedJd,
    ...benchmarkPool.slice(0, 4),
    ...otherJd.slice(0, 2),
    ...benchmarkPool.slice(4),
  ];
  const suggestions: string[] = [];

  for (const candidate of combinedCandidates) {
    const clean = candidate.trim();
    if (
      clean &&
      !existingSet.has(clean.toLowerCase()) &&
      !currentItems.toLowerCase().includes(clean.toLowerCase()) &&
      !suggestions.some((s) => s.toLowerCase() === clean.toLowerCase())
    ) {
      suggestions.push(clean);
    }
    if (suggestions.length >= 6) break;
  }

  return suggestions;
}

export function reorderListItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    !Array.isArray(items) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function parseSkillItems(items: string): string[] {
  if (!items || !items.trim()) return [];
  return items
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getSkillProficiency(
  category: SkillCategory,
  skillName: string
): SkillProficiencyLevel {
  const clean = skillName.trim();
  if (!clean) return 'Proficient';

  if (category.skillLevels) {
    if (category.skillLevels[clean]) {
      return category.skillLevels[clean];
    }
    const lowerKey = Object.keys(category.skillLevels).find(
      (k) => k.toLowerCase() === clean.toLowerCase()
    );
    if (lowerKey) {
      return category.skillLevels[lowerKey];
    }
  }

  // Deterministic sensible defaults for core skills if not explicitly overridden
  const expertDefaults = new Set([
    'python',
    'sql',
    'tableau',
    'excel',
    'formulas',
    'pivottables',
    'classification',
    'regression',
    'logistic regression',
    'data cleaning',
    'exploratory analysis',
    'trend analysis',
    'dashboard development',
  ]);
  if (expertDefaults.has(clean.toLowerCase())) {
    return 'Expert';
  }
  return 'Proficient';
}

export function setSkillProficiency(
  category: SkillCategory,
  skillName: string,
  level: SkillProficiencyLevel
): SkillCategory {
  const clean = skillName.trim();
  if (!clean) return category;
  return {
    ...category,
    skillLevels: {
      ...(category.skillLevels || {}),
      [clean]: level,
    },
  };
}

export function getProficiencyIndicatorMeta(level: SkillProficiencyLevel): {
  label: SkillProficiencyLevel;
  dots: number;
  percent: number;
} {
  if (level === 'Expert') {
    return { label: 'Expert', dots: 3, percent: 100 };
  }
  if (level === 'Proficient') {
    return { label: 'Proficient', dots: 2, percent: 75 };
  }
  return { label: 'Familiar', dots: 1, percent: 45 };
}

export function getLanguageLevelPercent(proficiency: string): number {
  const p = proficiency.toLowerCase();
  if (p.includes('native') || p.includes('bilingual')) return 100;
  if (p.includes('fluent') || p.includes('full professional')) return 95;
  if (p.includes('proficient') || p.includes('professional')) return 85;
  if (p.includes('intermediate') || p.includes('conversational')) return 70;
  return 50;
}

export const ALL_SECTION_BOUNDARIES: {
  value: ResumeSectionBoundary;
  label: string;
}[] = [
  { value: 'after-header', label: 'After Contact / Header' },
  { value: 'after-summary', label: 'After Professional Summary' },
  { value: 'after-experience', label: 'After Work Experience' },
  { value: 'after-projects', label: 'After Key Projects' },
  { value: 'after-skills', label: 'After Technical Skills' },
  { value: 'after-credentials', label: 'After Education & Certifications' },
];

export function addSectionDivider(
  existingDividers: SectionDividerItem[] | undefined,
  preferredPlacement?: ResumeSectionBoundary,
  style: SectionDividerStyle = 'solid',
  thicknessPx = 2
): SectionDividerItem[] {
  const current = existingDividers ? [...existingDividers] : [];
  const usedPlacements = new Set(current.map((d) => d.placement));

  let chosenPlacement: ResumeSectionBoundary = preferredPlacement || 'after-summary';
  if (usedPlacements.has(chosenPlacement)) {
    const nextAvailable = ALL_SECTION_BOUNDARIES.find((b) => !usedPlacements.has(b.value));
    if (nextAvailable) {
      chosenPlacement = nextAvailable.value;
    }
  }

  const newDivider: SectionDividerItem = {
    id: `div-${Date.now()}-${current.length + 1}`,
    placement: chosenPlacement,
    style,
    thicknessPx,
  };

  return [...current, newDivider];
}

export function removeSectionDivider(
  existingDividers: SectionDividerItem[] | undefined,
  dividerId: string
): SectionDividerItem[] {
  if (!existingDividers) return [];
  return existingDividers.filter((d) => d.id !== dividerId);
}

const WEAK_OPENINGS_MAP: Array<{ pattern: RegExp; verb: string }> = [
  { pattern: /^(worked on|working on|was working on)\b/i, verb: 'Engineered' },
  { pattern: /^(responsible for|was responsible for|in charge of)\b/i, verb: 'Spearheaded' },
  { pattern: /^(helped with|helped to|assisted with|assisted in|helped)\b/i, verb: 'Supported' },
  { pattern: /^(did|made|created|handled|managed)\b/i, verb: 'Developed' },
  { pattern: /^(looked at|checked|reviewed|studied)\b/i, verb: 'Analyzed' },
  { pattern: /^(fixed|resolved|solved)\b/i, verb: 'Optimized' },
  { pattern: /^(built|set up|setup)\b/i, verb: 'Architected' },
];

const FALLBACK_ACTION_VERBS = [
  'Analyzed',
  'Engineered',
  'Spearheaded',
  'Optimized',
  'Automated',
  'Developed',
  'Identified',
  'Architected',
];

const QUANTIFIED_CLAUSES = [
  ', improving operational reporting accuracy by **32%**.',
  ', reducing manual data processing overhead by **40%** across **5+ workflows**.',
  ', accelerating executive decision-making SLA by **28%**.',
  ', uncovering actionable KPI trends across **10,000+ records**.',
  ', boosting cross-functional forecast reliability by **24%**.',
];

export function applyQuickFixToResume(
  resume: ResumeData,
  jobDescription?: string
): { updatedResume: ResumeData; report: QuickFixReport } {
  const beforeBreakdown = calculateAtsScore(resume, jobDescription);
  const previousScore = beforeBreakdown.overall;

  let bulletsUpgradedCount = 0;
  let grammarFixesApplied = 0;
  const actionVerbsAddedSet = new Set<string>();
  const changeLog: string[] = [];

  const metricRegex =
    /(\d+%|\d+\+|\d{1,3}(,\d{3})+|\$\d+|\b\d+\s*(months|years|projects|queries|reports|dashboards|companies|records|workflows)\b)/i;

  const upgradeSingleBullet = (rawBullet: string, idx: number): string => {
    let text = rawBullet.trim();
    if (!text) return rawBullet;

    const original = text;

    // 1. Grammar & typo normalization
    const cleanedTypos = text
      .replace(/\s{2,}/g, ' ')
      .replace(/\bteh\b/gi, 'the')
      .replace(/\brecieve\b/gi, 'receive')
      .replace(/\bseperate\b/gi, 'separate')
      .replace(/\boccured\b/gi, 'occurred')
      .replace(/\bi\b/g, 'I')
      .replace(/^[-•*]\s*/, '');

    if (cleanedTypos !== text) {
      grammarFixesApplied++;
      text = cleanedTypos;
    }

    // 2. Replace weak passive opening or inject strong action verb
    let replacedWeakOpening = false;
    for (const rule of WEAK_OPENINGS_MAP) {
      if (rule.pattern.test(text)) {
        text = text.replace(rule.pattern, rule.verb);
        actionVerbsAddedSet.add(rule.verb);
        replacedWeakOpening = true;
        break;
      }
    }

    if (!replacedWeakOpening) {
      const cleanFirstWord = text
        .replace(/^\*\*|\*\*$/g, '')
        .trim()
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[^a-z]/g, '');

      if (!cleanFirstWord || !STRONG_ACTION_VERBS.includes(cleanFirstWord)) {
        const chosenVerb = FALLBACK_ACTION_VERBS[idx % FALLBACK_ACTION_VERBS.length];
        const lowerFirst = text.charAt(0).toLowerCase() + text.slice(1);
        text = `${chosenVerb} ${lowerFirst}`;
        actionVerbsAddedSet.add(chosenVerb);
      } else if (/^[a-z]/.test(text)) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
        grammarFixesApplied++;
      }
    }

    // 3. Inject quantified ROI outcome if bullet lacks numbers/metrics
    if (!metricRegex.test(text)) {
      text = text.replace(/[.!;,\s]+$/, '');
      const clause = QUANTIFIED_CLAUSES[idx % QUANTIFIED_CLAUSES.length];
      text = `${text}${clause}`;
    } else if (!/[.!?]$/.test(text.replace(/\*\*$/g, ''))) {
      text = `${text}.`;
      grammarFixesApplied++;
    }

    // 4. Add bold emphasis on key technical terms if none present
    if (!/\*\*[^*]+\*\*/.test(text)) {
      text = text.replace(
        /\b(SQL|Python|Tableau|Excel|Machine Learning|Power BI|Looker Studio|ETL|data pipelines|KPIs?|dashboards?|reports?)\b/i,
        '**$1**'
      );
    }

    if (text !== original) {
      bulletsUpgradedCount++;
    }
    return text;
  };

  let runningBulletIndex = 0;
  const updatedExperiences = resume.experiences.map((exp) => ({
    ...exp,
    bullets: exp.bullets.map((b) => upgradeSingleBullet(b, runningBulletIndex++)),
  }));

  const updatedProjects = resume.projects.map((proj) => ({
    ...proj,
    bullets: proj.bullets.map((b) => upgradeSingleBullet(b, runningBulletIndex++)),
  }));

  // 5. Improve Summary if weak or short
  let updatedSummary = resume.summary.trim();
  let summaryImproved = false;
  if (updatedSummary.length < 95 || !/\*\*[^*]+\*\*/.test(updatedSummary)) {
    updatedSummary =
      `Results-driven **${resume.jobTitle || 'Data Analyst'}** with **6+ years** of experience transforming complex datasets into executive KPI decisions. ` +
      `Expert in **SQL**, **Python**, **Tableau**, and **Excel PivotTables**, delivering **Predictive Modeling**, **Forecasting**, and **Customer Segmentation** across **8+ enterprise projects** to drive measurable **revenue growth**.`;
    summaryImproved = true;
    grammarFixesApplied++;
  }

  let workingResume: ResumeData = {
    ...resume,
    summary: updatedSummary,
    experiences: updatedExperiences,
    projects: updatedProjects,
  };

  // 6. Inject missing keywords from target JD or role benchmark
  const currentBreakdown = calculateAtsScore(workingResume, jobDescription);
  const keywordsInjected = currentBreakdown.missingKeywords.slice(0, 12);
  if (keywordsInjected.length > 0) {
    workingResume = injectKeywordsIntoResume(workingResume, keywordsInjected);
  }

  // Ensure at least 3 skill categories for 100% structure completeness
  if (workingResume.skills.length < 3) {
    const extraCategories: SkillCategory[] = [
      {
        id: 'qf-skill-1',
        category: 'Data Visualization & BI',
        items: 'Tableau, Looker Studio, Power BI, Dashboard Development, Excel, PivotTables',
      },
      {
        id: 'qf-skill-2',
        category: 'Machine Learning & Analytics',
        items: 'Regression, Classification, Forecasting, Predictive Modeling, Data Cleaning, Exploratory Analysis, Trend Analysis, Customer Segmentation',
      },
    ];
    workingResume = {
      ...workingResume,
      skills: [...workingResume.skills, ...extraCategories].slice(0, 4),
    };
  }

  const afterBreakdown = calculateAtsScore(workingResume, jobDescription);

  if (bulletsUpgradedCount > 0) {
    changeLog.push(
      `Upgraded ${bulletsUpgradedCount} bullet points with executive action verbs (${Array.from(actionVerbsAddedSet)
        .slice(0, 5)
        .join(', ')}) and quantified ROI metrics.`
    );
  }
  if (grammarFixesApplied > 0) {
    changeLog.push(
      `Corrected ${grammarFixesApplied} grammar, capitalization, and terminal punctuation issues.`
    );
  }
  if (keywordsInjected.length > 0) {
    changeLog.push(
      `Wove ${keywordsInjected.length} missing ATS keywords (${keywordsInjected.slice(0, 5).join(', ')}) into Skills & Summary.`
    );
  }
  if (summaryImproved) {
    changeLog.push('Enhanced Professional Summary with **bold** keyword anchors and quantified scope.');
  }

  return {
    updatedResume: workingResume,
    report: {
      previousScore,
      newScore: afterBreakdown.overall,
      bulletsUpgradedCount,
      actionVerbsAdded: Array.from(actionVerbsAddedSet),
      grammarFixesApplied,
      keywordsInjected,
      summaryImproved,
      changeLog,
    },
  };
}

export function createLowScoreDraftResume(baseResume: ResumeData): ResumeData {
  return {
    ...baseResume,
    summary: 'worked on data reports and spreadsheets for team meetings',
    skills: [
      {
        id: 'draft-sk-1',
        category: 'General',
        items: 'Spreadsheets, Word, Presentations',
      },
    ],
    experiences: baseResume.experiences.slice(0, 2).map((exp, idx) => ({
      ...exp,
      bullets:
        idx === 0
          ? [
              'worked on sales data reports in teh weekly team meeting',
              'responsible for checking numbers and helping team with spreadsheets',
              'helped with customer data and made charts for managers',
            ]
          : [
              'did analysis on historical records and looked at company trends',
              'was responsible for data entry and cleaning up seperate files',
            ],
    })),
    projects: baseResume.projects.slice(0, 1).map((proj) => ({
      ...proj,
      bullets: [
        'helped build a project for tracking orders and inventory',
        'looked at database tables to find errors',
      ],
    })),
  };
}

export function analyzeContentVolumeAndSuggestLayout(
  resume: ResumeData,
  templates: ResumeTemplateConfig[]
): AutoFormatLayoutAnalysis {
  const plainText = serializeResumeToPlainText(resume);
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const totalWords = words.length;

  const totalBullets =
    resume.experiences.reduce((acc, e) => acc + e.bullets.filter((b) => b.trim()).length, 0) +
    resume.projects.reduce((acc, p) => acc + p.bullets.filter((b) => b.trim()).length, 0);

  let totalSections = 2; // Contact + Summary
  if (resume.experiences.length > 0) totalSections++;
  if (resume.projects.length > 0) totalSections++;
  if (resume.skills.length > 0) totalSections++;
  if (resume.education.length > 0 || resume.certificates.length > 0) totalSections++;
  if (resume.languages.length > 0) totalSections++;

  // Standard single-column template fits ~340 words or ~14 bullets per page
  const pageByWords = totalWords / 340;
  const pageByBullets = totalBullets / 14;
  const rawEstimatedPages = Number(
    Math.max(0.8, Math.max(pageByWords, pageByBullets) + (totalSections >= 6 ? 0.25 : 0)).toFixed(1)
  );

  const isDenseVolume = totalWords >= 380 || totalBullets >= 14 || rawEstimatedPages > 1.6;
  const exceedsTwoPagesBeforeFix = rawEstimatedPages > 2.0;

  if (isDenseVolume) {
    // Recommend high-density 2-column or compact LaTeX layout so resume never exceeds 2 pages
    const densePriorityIds = [
      'jakes-latex-faang',
      'nordic-slate',
      'enhancv-bento',
      'modern-navy-card',
      'executive-navy-gold',
    ];
    const primaryMatch =
      templates.find((t) => t.id === 'nordic-slate') ||
      templates.find((t) => densePriorityIds.includes(t.id)) ||
      templates[0];

    const fittedEstimatedPages = Number(
      Math.min(2.0, Math.max(1.2, rawEstimatedPages * 0.72)).toFixed(1)
    );

    return {
      totalWords,
      totalBullets,
      totalSections,
      rawEstimatedPages,
      fittedEstimatedPages,
      exceedsTwoPagesBeforeFix,
      suggestedCategory: 'Dense Content',
      densityLabel: 'Dense Content (Compact 2-Column / High-Capacity)',
      recommendedTemplateId: primaryMatch?.id || 'nordic-slate',
      recommendedTemplateName: primaryMatch?.name || '01. Nordic Slate Sidebar',
      alternativeTemplateIds: densePriorityIds.filter((id) => id !== primaryMatch?.id).slice(0, 3),
      compactDensityApplied: true,
      reasoning: `Detected ${totalWords} words and ${totalBullets} bullet points across ${totalSections} sections (~${rawEstimatedPages} pages uncompressed). Auto-formatted with a Dense Content multi-column architecture and compact line-height to fit cleanly onto ${fittedEstimatedPages} pages (strictly ≤ 2 pages).`,
    };
  }

  // Minimalist / Spacious layout for concise content (< 380 words and < 14 bullets)
  const minimalistPriorityIds = [
    'harvard-hbs-classic',
    'canva-editorial',
    'coral-editorial',
    'novoresume-timeline',
  ];
  const minimalistMatch =
    templates.find((t) => minimalistPriorityIds.includes(t.id)) ||
    templates.find((t) => t.layout === 'single-column-classic') ||
    templates[0];

  const fittedEstimatedPages = Number(Math.min(1.8, Math.max(1.0, rawEstimatedPages)).toFixed(1));

  return {
    totalWords,
    totalBullets,
    totalSections,
    rawEstimatedPages,
    fittedEstimatedPages,
    exceedsTwoPagesBeforeFix: false,
    suggestedCategory: 'Minimalist',
    densityLabel: 'Minimalist (Balanced Single-Column Editorial)',
    recommendedTemplateId: minimalistMatch?.id || templates[0]?.id || 'nordic-slate',
    recommendedTemplateName: minimalistMatch?.name || templates[0]?.name || '01. Nordic Slate Sidebar',
    alternativeTemplateIds: minimalistPriorityIds
      .filter((id) => id !== minimalistMatch?.id)
      .slice(0, 3),
    compactDensityApplied: false,
    reasoning: `Detected concise volume (${totalWords} words, ${totalBullets} bullets across ${totalSections} sections). Recommended a Minimalist editorial layout with generous typographic breathing room (${fittedEstimatedPages} pages, well under the 2-page ceiling).`,
  };
}

/**
 * Maps a 0-100 keyword density score to a Green-to-Red heatmap band and color hex.
 */
export function getHeatmapBandMeta(score: number): {
  band: HeatmapBand;
  colorHex: string;
  label: string;
} {
  if (score >= 75) {
    return {
      band: 'high',
      colorHex: '#10b981', // Emerald Green
      label: 'Optimal Keyword Density',
    };
  }
  if (score >= 45) {
    return {
      band: 'medium',
      colorHex: '#f59e0b', // Amber Yellow
      label: 'Moderate Density',
    };
  }
  return {
    band: 'low',
    colorHex: '#ef4444', // Rose Red
    label: 'Critical Keyword Gap',
  };
}

function escapeRegExpForHeatmap(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countKeywordHitsInText(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const escaped = escapeRegExpForHeatmap(keyword.trim());
  if (!escaped) return 0;
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Determines if an individual experience or project bullet point has a keyword or quantified impact gap.
 */
export function isBulletKeywordGap(bulletText: string, targetKeywords: string[] = []): boolean {
  const cleaned = (bulletText || '').replace(/\*\*|__|\*/g, '').trim();
  if (!cleaned) return true;

  // Passive / weak bullet openings or known unoptimized typos indicate an immediate red gap
  if (
    /^(worked on|helped with|responsible for|did some|made charts|assisted with|handled|tasked with)\b/i.test(
      cleaned
    ) ||
    /\b(teh|recieve|seperate|occured)\b/i.test(cleaned)
  ) {
    return true;
  }

  const effectiveKeywords = Array.from(
    new Set([
      ...(targetKeywords.length > 0 ? targetKeywords : BENCHMARK_KEYWORDS_BY_ROLE.default),
      ...CURATED_TECH_DOMAIN_VOCAB,
    ])
  );

  const hasTargetKeyword = effectiveKeywords.some(
    (kw) => countKeywordHitsInText(cleaned, kw) > 0
  );
  const hasQuantifiedMetric =
    /\b\d+(?:\.\d+)?%|\b\d+\+|\$\d+|\b\d+\s*(?:records|rows|dashboards|models|clients|users|hours|days|months|segments|features|variables)\b/i.test(
      cleaned
    );
  const firstWord = cleaned
    .split(/\s+/)[0]
    ?.replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  const hasStrongVerbAndSubstance =
    Boolean(firstWord && STRONG_ACTION_VERBS.includes(firstWord)) &&
    cleaned.split(/\s+/).length >= 6;

  // If a bullet has neither a target/domain keyword, nor a quantified metric, nor strong action-verb substance, flag it as a red gap
  return !hasTargetKeyword && !hasQuantifiedMetric && !hasStrongVerbAndSubstance;
}

/**
 * Computes a comprehensive Green-to-Red Keyword Heatmap analysis across the entire resume
 * and each individual section (Summary, Experience, Projects, Skills, Edu & Certs).
 */
export function calculateResumeKeywordHeatmap(
  resume: ResumeData,
  jobDescription?: string
): ResumeHeatmapAnalysis {
  const jdTrimmed = (jobDescription || '').trim();
  const extractedJdKeywords = jdTrimmed ? extractKeywordsFromJobDescription(jdTrimmed) : [];

  const targetKeywords =
    extractedJdKeywords.length >= 3
      ? extractedJdKeywords
      : [...BENCHMARK_KEYWORDS_BY_ROLE.default];

  const summaryText = resume.summary || '';
  const experienceText = resume.experiences
    .map((e) => `${e.role} ${e.company} ${e.bullets.join(' ')}`)
    .join(' ');
  const projectsText = resume.projects
    .map((p) => `${p.title} ${p.techTag} ${p.bullets.join(' ')}`)
    .join(' ');
  const skillsText = resume.skills.map((s) => `${s.category} ${s.items}`).join(' ');
  const credentialsText = [
    ...resume.education.map((e) => `${e.degree} ${e.institution}`),
    ...resume.certificates.map((c) => c.name),
    ...resume.languages.map((l) => `${l.language} ${l.proficiency}`),
  ].join(' ');

  const fullText = [
    resume.jobTitle,
    summaryText,
    experienceText,
    projectsText,
    skillsText,
    credentialsText,
  ].join(' ');

  const keywordFrequencyMap: Record<string, number> = {};
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  let totalKeywordHits = 0;

  for (const kw of targetKeywords) {
    const count = countKeywordHitsInText(fullText, kw);
    keywordFrequencyMap[kw] = count;
    totalKeywordHits += count;
    if (count > 0) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // Also include high-value stretch ATS keywords in missing suggestions if the resume currently matches 100% of baseline
  const stretchBenchmarkGaps = ['Power BI', 'Snowflake', 'A/B Testing', 'ETL', 'BigQuery'].filter(
    (kw) => countKeywordHitsInText(fullText, kw) === 0 && !missingKeywords.includes(kw)
  );

  const expBullets = resume.experiences.flatMap((e) => e.bullets);
  const projBullets = resume.projects.flatMap((p) => p.bullets);
  const expGapBullets = expBullets.filter((b) => isBulletKeywordGap(b, targetKeywords)).length;
  const projGapBullets = projBullets.filter((b) => isBulletKeywordGap(b, targetKeywords)).length;

  const totalBulletsCount = expBullets.length + projBullets.length;
  const gapBulletsCount = expGapBullets + projGapBullets;

  const countWords = (str: string) =>
    str
      .replace(/\*\*|__|\*/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

  const evaluateSection = (
    sectionId: SectionHeatmapMetrics['sectionId'],
    label: string,
    text: string,
    expectedDistinctKeywords: number,
    sectionGapBullets: number,
    sectionTotalBullets: number
  ): SectionHeatmapMetrics => {
    const sectionMatched: string[] = [];
    let sectionHits = 0;

    for (const kw of targetKeywords) {
      const c = countKeywordHitsInText(text, kw);
      if (c > 0) {
        sectionMatched.push(kw);
        sectionHits += c;
      }
    }

    const wordCount = countWords(text);
    const keywordCoverageRatio = Math.min(
      1,
      sectionMatched.length / Math.max(1, expectedDistinctKeywords)
    );
    const hitDepthBonus = Math.min(20, sectionHits * 3);

    let rawScore = Math.round(keywordCoverageRatio * 82 + hitDepthBonus);

    if (sectionTotalBullets > 0) {
      const healthyBulletRatio =
        (sectionTotalBullets - sectionGapBullets) / Math.max(1, sectionTotalBullets);
      rawScore = Math.round(rawScore * 0.65 + healthyBulletRatio * 35);
      if (sectionGapBullets > 0 && sectionGapBullets >= sectionTotalBullets / 2) {
        rawScore = Math.min(rawScore, 42); // Force into red band when >=50% of bullets have gaps
      }
    }

    if (wordCount < 8) {
      rawScore = Math.min(rawScore, 35);
    }

    const densityScore = Math.max(12, Math.min(99, rawScore));
    const meta = getHeatmapBandMeta(densityScore);

    // Suggest missing keywords for this specific section
    const sectionMissingPool =
      missingKeywords.length > 0
        ? missingKeywords
        : [
            ...targetKeywords.filter((kw) => !sectionMatched.includes(kw)),
            ...stretchBenchmarkGaps,
          ];
    const missingSuggestedKeywords = sectionMissingPool.slice(0, 4);

    const diagnosticNote =
      meta.band === 'high'
        ? `Strong density (${sectionMatched.length} keywords, ${sectionHits} total hits)${
            sectionGapBullets === 0 && sectionTotalBullets > 0 ? ', 0 bullet gaps' : ''
          }.`
        : meta.band === 'medium'
        ? `Moderate coverage (${sectionMatched.length} keywords). Add ${
            missingSuggestedKeywords.slice(0, 2).join(', ') || 'domain terms'
          } to reach green.`
        : `Critical keyword gap (${sectionMatched.length} keywords${
            sectionGapBullets > 0 ? `, ${sectionGapBullets} weak bullets` : ''
          }). Inject ${missingSuggestedKeywords.slice(0, 2).join(', ') || 'core skills'}.`;

    return {
      sectionId,
      label,
      densityScore,
      band: meta.band,
      colorHex: meta.colorHex,
      matchedKeywords: sectionMatched,
      missingSuggestedKeywords,
      keywordHitCount: sectionHits,
      wordCount,
      gapBulletsCount: sectionGapBullets,
      totalBulletsCount: sectionTotalBullets,
      diagnosticNote,
    };
  };

  const sections: SectionHeatmapMetrics[] = [
    evaluateSection('summary', 'Executive Summary', summaryText, 4, 0, 0),
    evaluateSection(
      'experience',
      'Work Experience',
      experienceText,
      6,
      expGapBullets,
      expBullets.length
    ),
    evaluateSection(
      'projects',
      'Key Projects',
      projectsText,
      5,
      projGapBullets,
      projBullets.length
    ),
    evaluateSection('skills', 'Technical Skills', skillsText, 8, 0, 0),
    evaluateSection('credentials', 'Edu & Certifications', credentialsText, 2, 0, 0),
  ];

  // Weighted average across sections, with extra weight on Experience, Skills, and Projects
  const weightedSum =
    sections[0].densityScore * 0.18 +
    sections[1].densityScore * 0.32 +
    sections[2].densityScore * 0.22 +
    sections[3].densityScore * 0.2 +
    sections[4].densityScore * 0.08;

  const overallAlignmentRatio = matchedKeywords.length / Math.max(1, targetKeywords.length);
  let overallDensityScore = Math.round(weightedSum * 0.65 + overallAlignmentRatio * 35);

  if (gapBulletsCount >= 3 && gapBulletsCount >= totalBulletsCount / 2) {
    overallDensityScore = Math.min(overallDensityScore, 42);
  }

  overallDensityScore = Math.max(15, Math.min(99, overallDensityScore));
  const overallMeta = getHeatmapBandMeta(overallDensityScore);

  return {
    overallDensityScore,
    overallBand: overallMeta.band,
    overallColorHex: overallMeta.colorHex,
    targetKeywords,
    matchedKeywords,
    missingKeywords:
      missingKeywords.length > 0 ? missingKeywords : stretchBenchmarkGaps.slice(0, 4),
    keywordFrequencyMap,
    totalKeywordHits,
    gapBulletsCount,
    totalBulletsCount,
    sections,
  };
}
