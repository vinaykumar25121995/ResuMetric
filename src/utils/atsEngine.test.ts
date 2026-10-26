import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSectionDivider,
  analyzeContentVolumeAndSuggestLayout,
  applyQuickFixToResume,
  calculateAtsScore,
  createLowScoreDraftResume,
  extractKeywordsFromJobDescription,
  getLanguageLevelPercent,
  getProficiencyIndicatorMeta,
  getSkillProficiency,
  injectKeywordsIntoResume,
  parsePlainTextResume,
  parseSkillItems,
  removeSectionDivider,
  reorderListItems,
  setSkillProficiency,
  suggestSkillsForCategory,
} from './atsEngine.ts';
import { DEFAULT_VINAY_RESUME, SAMPLE_JOB_DESCRIPTIONS } from '../data/defaultResume.ts';
import { RESUME_TEMPLATES } from '../data/templatesCatalog.ts';

test('calculateAtsScore computes high baseline score for Vinay Kumar default resume', () => {
  const result = calculateAtsScore(DEFAULT_VINAY_RESUME);
  assert.ok(result.overall >= 85 && result.overall <= 100, `Expected score >= 85, got ${result.overall}`);
  assert.equal(result.missingKeywords.length, 0);
  assert.ok(result.quantifiedBulletsCount >= 7);
  assert.ok(result.boldHighlightsCount >= 10);
});

test('extractKeywordsFromJobDescription identifies matched and missing skills from Senior Data Analyst JD', () => {
  const jd = SAMPLE_JOB_DESCRIPTIONS[0].description;
  const keywords = extractKeywordsFromJobDescription(jd);
  assert.ok(keywords.includes('SQL'));
  assert.ok(keywords.includes('Python'));
  assert.ok(keywords.includes('Power BI'));
  assert.ok(keywords.includes('Snowflake'));

  const scoreBefore = calculateAtsScore(DEFAULT_VINAY_RESUME, jd);
  assert.ok(scoreBefore.missingKeywords.includes('Power BI'));
  assert.ok(scoreBefore.missingKeywords.includes('Snowflake'));
});

test('injectKeywordsIntoResume adds missing JD keywords and measurably increases ATS score', () => {
  const jd = SAMPLE_JOB_DESCRIPTIONS[0].description;
  const scoreBefore = calculateAtsScore(DEFAULT_VINAY_RESUME, jd);
  const optimizedResume = injectKeywordsIntoResume(DEFAULT_VINAY_RESUME, scoreBefore.missingKeywords);
  const scoreAfter = calculateAtsScore(optimizedResume, jd);

  assert.ok(
    scoreAfter.keywordAlignment > scoreBefore.keywordAlignment,
    `Expected keywordAlignment to increase (${scoreBefore.keywordAlignment} -> ${scoreAfter.keywordAlignment})`
  );
  assert.equal(scoreAfter.missingKeywords.length, 0);
  assert.ok(scoreAfter.overall >= scoreBefore.overall);
});

test('parsePlainTextResume extracts contact details and bullet points accurately', () => {
  const rawSample = `Ananya Sharma
Senior Machine Learning Engineer
Email: ananya.ml@techcorp.in | Phone: +91 9876543210
linkedin.com/in/ananya-sharma-ml
• Built **Python and SQL** ETL pipelines processing **10M+ records** daily.
• Deployed **Classification** models reducing churn by **24%**.`;

  const parsed = parsePlainTextResume(rawSample, DEFAULT_VINAY_RESUME);
  assert.equal(parsed.fullName, 'Ananya Sharma');
  assert.equal(parsed.jobTitle, 'Senior Machine Learning Engineer');
  assert.equal(parsed.email, 'ananya.ml@techcorp.in');
  assert.equal(parsed.linkedin, 'linkedin.com/in/ananya-sharma-ml');
  assert.equal(parsed.experiences[0].bullets.length, 2);
});

test('suggestSkillsForCategory returns missing JD and industry-standard skills for a category', () => {
  const jd = SAMPLE_JOB_DESCRIPTIONS[0].description;
  const suggestions = suggestSkillsForCategory('Visualization & BI', 'Tableau, Looker Studio', jd);
  assert.ok(suggestions.length >= 3, 'Expected at least 3 skill suggestions');
  assert.ok(!suggestions.includes('Tableau'), 'Should not suggest already present skill');
  assert.ok(suggestions.includes('Power BI'), 'Should suggest missing JD skill Power BI');
});

test('reorderListItems moves experience and project items up and down safely', () => {
  const items = ['exp-1', 'exp-2', 'exp-3'];
  assert.deepEqual(reorderListItems(items, 0, 1), ['exp-2', 'exp-1', 'exp-3']);
  assert.deepEqual(reorderListItems(items, 2, 0), ['exp-3', 'exp-1', 'exp-2']);
  assert.deepEqual(reorderListItems(items, -1, 1), ['exp-1', 'exp-2', 'exp-3']);
  assert.deepEqual(reorderListItems(items, 0, 5), ['exp-1', 'exp-2', 'exp-3']);
});

test('skill and language proficiency helpers assign and compute visual indicator metadata accurately', () => {
  const cat = DEFAULT_VINAY_RESUME.skills[0];
  const parsed = parseSkillItems(cat.items);
  assert.deepEqual(parsed, ['Python', 'SQL']);
  assert.equal(getSkillProficiency(cat, 'Python'), 'Expert');

  const updated = setSkillProficiency(cat, 'Python', 'Familiar');
  assert.equal(getSkillProficiency(updated, 'Python'), 'Familiar');
  assert.deepEqual(getProficiencyIndicatorMeta('Expert'), { label: 'Expert', dots: 3, percent: 100 });
  assert.deepEqual(getProficiencyIndicatorMeta('Proficient'), { label: 'Proficient', dots: 2, percent: 75 });
  assert.deepEqual(getProficiencyIndicatorMeta('Familiar'), { label: 'Familiar', dots: 1, percent: 45 });
  assert.equal(getLanguageLevelPercent('Native / Bilingual'), 100);
  assert.equal(getLanguageLevelPercent('Fluent'), 95);
});

test('addSectionDivider and removeSectionDivider insert and remove horizontal section dividers', () => {
  const list1 = addSectionDivider([], 'after-summary', 'solid', 2);
  assert.equal(list1.length, 1);
  assert.equal(list1[0].placement, 'after-summary');
  assert.equal(list1[0].style, 'solid');

  // Calling addSectionDivider again with same placement picks next available boundary
  const list2 = addSectionDivider(list1, 'after-summary', 'double', 2);
  assert.equal(list2.length, 2);
  assert.notEqual(list2[1].placement, 'after-summary');

  const afterRemove = removeSectionDivider(list2, list1[0].id);
  assert.equal(afterRemove.length, 1);
});

test('applyQuickFixToResume upgrades a low-score (<70) resume with action verbs, grammar fixes, and quantified bullets', () => {
  const lowScoreResume = createLowScoreDraftResume(DEFAULT_VINAY_RESUME);
  const beforeScore = calculateAtsScore(lowScoreResume);
  assert.ok(beforeScore.overall < 70, `Expected low-score draft to be < 70, got ${beforeScore.overall}`);

  const { updatedResume, report } = applyQuickFixToResume(lowScoreResume);
  assert.equal(report.previousScore, beforeScore.overall);
  assert.ok(report.newScore >= 85, `Expected Quick Fix score >= 85, got ${report.newScore}`);
  assert.ok(report.bulletsUpgradedCount >= 5, `Expected >= 5 bullets upgraded, got ${report.bulletsUpgradedCount}`);
  assert.ok(report.actionVerbsAdded.length >= 2, 'Expected strong action verbs added');
  assert.ok(report.grammarFixesApplied >= 2, 'Expected grammar fixes applied');
  assert.ok(
    !updatedResume.experiences[0].bullets[0].includes('teh'),
    'Expected typo "teh" to be corrected to "the"'
  );
  assert.ok(
    /^(Engineered|Spearheaded|Supported|Developed|Analyzed|Optimized|Architected|Automated|Identified)/.test(
      updatedResume.experiences[0].bullets[0]
    ),
    'Expected first bullet to start with a strong action verb'
  );
});

test('analyzeContentVolumeAndSuggestLayout suggests Dense Content for high volume and Minimalist for concise volume, capping at <= 2 pages', () => {
  const denseAnalysis = analyzeContentVolumeAndSuggestLayout(DEFAULT_VINAY_RESUME, RESUME_TEMPLATES);
  assert.equal(denseAnalysis.suggestedCategory, 'Dense Content');
  assert.ok(
    denseAnalysis.fittedEstimatedPages <= 2.0,
    `Expected fitted pages <= 2.0, got ${denseAnalysis.fittedEstimatedPages}`
  );
  assert.ok(denseAnalysis.compactDensityApplied === true);

  const conciseResume = createLowScoreDraftResume(DEFAULT_VINAY_RESUME);
  const minimalistAnalysis = analyzeContentVolumeAndSuggestLayout(conciseResume, RESUME_TEMPLATES);
  assert.equal(minimalistAnalysis.suggestedCategory, 'Minimalist');
  assert.ok(
    minimalistAnalysis.fittedEstimatedPages <= 2.0,
    `Expected minimalist fitted pages <= 2.0, got ${minimalistAnalysis.fittedEstimatedPages}`
  );
  assert.ok(minimalistAnalysis.compactDensityApplied === false);
});





