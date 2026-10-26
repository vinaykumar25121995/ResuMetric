import React from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  FolderGit2,
  Github,
  Globe,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  ResumeData,
  ResumeSectionBoundary,
  ResumeTemplateConfig,
  SkillCategory,
} from '../types/resume.ts';
import {
  getProficiencyIndicatorMeta,
  getSkillProficiency,
  parseSkillItems,
} from '../utils/atsEngine.ts';

interface ResumeCanvasProps {
  resume: ResumeData;
  template: ResumeTemplateConfig;
  highlightKeywords?: string[];
}

export function renderFormattedText(
  text: string,
  _highlightKeywords: string[] = []
): React.ReactNode {
  if (!text) return null;
  const segments = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g);
  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('__') && seg.endsWith('__')) {
      return (
        <span key={idx} className="underline decoration-slate-400 underline-offset-2">
          {seg.slice(2, -2)}
        </span>
      );
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) {
      return (
        <em key={idx} className="italic text-slate-800">
          {seg.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{seg}</React.Fragment>;
  });
}

export function renderDarkFormattedText(text: string): React.ReactNode {
  if (!text) return null;
  const segments = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g);
  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('__') && seg.endsWith('__')) {
      return (
        <span key={idx} className="underline decoration-white/60 underline-offset-2">
          {seg.slice(2, -2)}
        </span>
      );
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) {
      return (
        <em key={idx} className="italic text-slate-100">
          {seg.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{seg}</React.Fragment>;
  });
}

const DiamondBullet: React.FC<{ color: string }> = ({ color }) => (
  <span
    aria-hidden="true"
    className="w-1.5 h-1.5 rotate-45 inline-block shrink-0 mt-1.5"
    style={{ backgroundColor: color }}
  />
);

const ResumeSectionDivider: React.FC<{
  resume: ResumeData;
  placement: ResumeSectionBoundary;
  accentColor: string;
  primaryColor: string;
  isDark?: boolean;
}> = ({ resume, placement, accentColor, primaryColor, isDark = false }) => {
  const dividers = (resume.sectionDividers || []).filter((d) => d.placement === placement);
  if (dividers.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 my-1">
      {dividers.map((div) => {
        const lineColor = isDark ? 'rgba(255,255,255,0.45)' : accentColor;
        const secondaryColor = isDark ? 'rgba(255,255,255,0.25)' : primaryColor;

        if (div.style === 'double') {
          return (
            <div
              key={div.id}
              data-testid="resume-section-divider"
              data-placement={placement}
              className="w-full py-0.5 flex flex-col gap-0.5"
            >
              <hr
                className="w-full border-0"
                style={{ height: `${div.thicknessPx}px`, backgroundColor: lineColor }}
              />
              <hr
                className="w-full border-0"
                style={{ height: '1px', backgroundColor: secondaryColor }}
              />
            </div>
          );
        }

        if (div.style === 'dashed') {
          return (
            <hr
              key={div.id}
              data-testid="resume-section-divider"
              data-placement={placement}
              className="w-full border-0 border-t border-dashed my-0.5"
              style={{
                borderTopWidth: `${div.thicknessPx}px`,
                borderColor: lineColor,
              }}
            />
          );
        }

        if (div.style === 'diamond-center') {
          return (
            <div
              key={div.id}
              data-testid="resume-section-divider"
              data-placement={placement}
              className="w-full flex items-center gap-2 my-0.5"
            >
              <div
                className="flex-1"
                style={{ height: `${div.thicknessPx}px`, backgroundColor: lineColor }}
              />
              <span
                className="w-2 h-2 rotate-45 inline-block shrink-0"
                style={{ backgroundColor: lineColor }}
              />
              <div
                className="flex-1"
                style={{ height: `${div.thicknessPx}px`, backgroundColor: lineColor }}
              />
            </div>
          );
        }

        if (div.style === 'accent-gradient') {
          return (
            <div
              key={div.id}
              data-testid="resume-section-divider"
              data-placement={placement}
              className="w-full flex items-center gap-1.5 my-0.5"
            >
              <div
                className="w-16 rounded-full"
                style={{ height: `${div.thicknessPx + 1}px`, backgroundColor: lineColor }}
              />
              <div
                className="flex-1 rounded-full opacity-50"
                style={{ height: `${div.thicknessPx}px`, backgroundColor: secondaryColor }}
              />
            </div>
          );
        }

        return (
          <hr
            key={div.id}
            data-testid="resume-section-divider"
            data-placement={placement}
            className="w-full border-0 rounded-full my-0.5"
            style={{
              height: `${div.thicknessPx}px`,
              backgroundColor: lineColor,
            }}
          />
        );
      })}
    </div>
  );
};

const SkillProficiencyVisualList: React.FC<{
  category: SkillCategory;
  accentColor: string;
  variant?: 'light' | 'dark' | 'inline';
}> = ({ category, accentColor, variant = 'light' }) => {
  const skills = parseSkillItems(category.items);
  if (skills.length === 0) return null;

  if (variant === 'inline') {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        {skills.map((skillName, idx) => {
          const level = getSkillProficiency(category, skillName);
          const meta = getProficiencyIndicatorMeta(level);
          return (
            <span
              key={`${skillName}-${idx}`}
              data-testid="skill-proficiency-indicator"
              className="inline-flex items-center gap-1"
            >
              <span className="font-medium">{skillName}</span>
              <span
                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                title={`${skillName}: ${meta.label} (${meta.percent}%)`}
              >
                <span className="inline-flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3].map((dot) => (
                    <span
                      key={dot}
                      className="w-1 h-1 rounded-full inline-block"
                      style={{
                        backgroundColor: dot <= meta.dots ? accentColor : '#cbd5e1',
                      }}
                    />
                  ))}
                </span>
                <span>{meta.label}</span>
              </span>
              {idx < skills.length - 1 && <span className="text-slate-400">·</span>}
            </span>
          );
        })}
      </span>
    );
  }

  const isDark = variant === 'dark';

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {skills.map((skillName, idx) => {
        const level = getSkillProficiency(category, skillName);
        const meta = getProficiencyIndicatorMeta(level);
        return (
          <span
            key={`${skillName}-${idx}`}
            data-testid="skill-proficiency-indicator"
            className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10.5px] border ${
              isDark
                ? 'bg-black/20 border-white/20 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <span className="font-medium">{skillName}</span>
            <span
              className="inline-flex items-center gap-0.5"
              title={`${meta.label} (${meta.percent}%)`}
            >
              {[1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{
                    backgroundColor:
                      dot <= meta.dots
                        ? isDark
                          ? '#ffffff'
                          : accentColor
                        : isDark
                        ? 'rgba(255,255,255,0.28)'
                        : '#cbd5e1',
                  }}
                />
              ))}
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-tight ${
                isDark ? 'text-white/90' : 'text-slate-500'
              }`}
            >
              {meta.label}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const ResumeCanvas: React.FC<ResumeCanvasProps> = ({
  resume,
  template,
  highlightKeywords = [],
}) => {
  const fontClass =
    template.fontStyle === 'serif'
      ? 'font-serif-editorial'
      : template.fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // ============================================================================
  // LAYOUT 1: NORDIC SLATE SIDEBAR (Exact match for Uploaded PDF #1 - Final_Resume_2)
  // ============================================================================
  if (template.layout === 'nordic-sidebar-left') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] grid grid-cols-12 text-slate-800 ${fontClass}`}
      >
        {/* Left Dark Sidebar (4 cols) - Fully Filled */}
        <aside
          className="col-span-12 md:col-span-4 p-6 flex flex-col justify-between gap-6"
          style={{ backgroundColor: template.sidebarBg, color: template.sidebarText }}
        >
          <div className="flex flex-col gap-6">
            {/* Contact Boxed List */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-white/15 bg-white/5">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: template.accentColor }} />
                <span className="truncate">{resume.email}</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-white/15 bg-white/5">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: template.accentColor }} />
                <span className="truncate">{resume.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-white/15 bg-white/5">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: template.accentColor }} />
                <span className="truncate">{resume.location}</span>
              </div>
              {resume.website && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-white/15 bg-white/5">
                  <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: template.accentColor }} />
                  <span className="truncate">{resume.website}</span>
                </div>
              )}
              {resume.linkedin && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-white/15 bg-white/5">
                  <Linkedin
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: template.accentColor }}
                  />
                  <span className="truncate">{resume.linkedin}</span>
                </div>
              )}
              {resume.github && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-white/15 bg-white/5">
                  <Github
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: template.accentColor }}
                  />
                  <span className="truncate">{resume.github}</span>
                </div>
              )}
            </div>

            {/* Technical Skills */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/20">
                <Wrench className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                <h3 className="text-xs font-bold tracking-wider uppercase">Technical Skills</h3>
              </div>
              <div className="flex flex-col gap-2.5 text-xs leading-relaxed">
                {resume.skills.map((sk) => (
                  <div key={sk.id}>
                    <div className="font-semibold text-white">{sk.category}</div>
                    <SkillProficiencyVisualList
                      category={sk}
                      accentColor={template.accentColor}
                      variant="dark"
                    />
                  </div>
                ))}
              </div>
            </div>

            <ResumeSectionDivider
              resume={resume}
              placement="after-skills"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
              isDark
            />

            {/* Certificates */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/20">
                <Award className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                <h3 className="text-xs font-bold tracking-wider uppercase">Certificates</h3>
              </div>
              <ul className="flex flex-col gap-2 text-xs">
                {resume.certificates.map((cert) => (
                  <li key={cert.id} className="leading-snug">
                    <div className="font-semibold text-white">• {cert.name}</div>
                    <div className="text-slate-400 text-[11px] pl-2.5">• {cert.date}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/20">
                <GraduationCap className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                <h3 className="text-xs font-bold tracking-wider uppercase">Education</h3>
              </div>
              {resume.education.map((edu) => (
                <div key={edu.id} className="text-xs flex flex-col gap-1">
                  <div className="font-bold text-white leading-snug">{edu.degree}</div>
                  <div className="text-slate-300">{edu.institution}</div>
                  <div className="text-slate-400 text-[11px]">{edu.period}</div>
                </div>
              ))}
            </div>

            <ResumeSectionDivider
              resume={resume}
              placement="after-credentials"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
              isDark
            />

            {/* Languages */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/20">
                <Languages className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                <h3 className="text-xs font-bold tracking-wider uppercase">Languages</h3>
              </div>
              <div className="flex flex-col gap-2.5 text-xs">
                {resume.languages.map((lang) => (
                  <div key={lang.id}>
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">{lang.language}</span>
                      <span className="text-slate-300 text-[11px]">{lang.proficiency}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/15 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${lang.levelPercent || 90}%`,
                          backgroundColor: template.accentColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Impact & Domain Highlights (Fills bottom of sidebar cleanly) */}
          <div className="pt-4 border-t border-white/15 text-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <h3 className="text-xs font-bold tracking-wider uppercase">Key Impact Metrics</h3>
            </div>
            <ul className="flex flex-col gap-1.5 text-[11px] text-slate-300 leading-snug">
              <li>• 75% Product Damage Reduction via Root-Cause SQL Analytics</li>
              <li>• 12% Revenue Lift from Market Trend Predictive Models</li>
              <li>• 70+ Interactive Executive Tableau Dashboards Deployed</li>
              <li>• 80% Classification Accuracy on Hotel Cancellation ML</li>
            </ul>
          </div>
        </aside>

        {/* Right White Main Column (8 cols) */}
        <div className="col-span-12 md:col-span-8 p-7 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-5">
            {/* Header Name & Role */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {resume.fullName}
              </h1>
              <p className="text-lg font-medium mt-0.5" style={{ color: template.accentColor }}>
                {resume.jobTitle}
              </p>
            </div>

            <ResumeSectionDivider
              resume={resume}
              placement="after-header"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />

            {/* Professional Summary */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: template.accentColor }}
                >
                  <Sparkles className="w-3 h-3" />
                </span>
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900">
                  Professional Summary
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {renderFormattedText(resume.summary, highlightKeywords)}
              </p>
            </section>

            <ResumeSectionDivider
              resume={resume}
              placement="after-summary"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />

            {/* Work Experience */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: template.accentColor }}
                >
                  <Briefcase className="w-3 h-3" />
                </span>
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900">
                  Work Experience
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {resume.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                      <span className="text-[11px] text-slate-500 tabular-nums">{exp.period}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: template.accentColor }}
                      >
                        {exp.company}
                      </span>
                      <span className="text-[11px] text-slate-400">{exp.location}</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-xs text-slate-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <ResumeSectionDivider
              resume={resume}
              placement="after-experience"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />

            {/* Key Projects */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: template.accentColor }}
                >
                  <FolderGit2 className="w-3 h-3" />
                </span>
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900">
                  Key Projects
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {resume.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                      {proj.title}{' '}
                      <span className="font-semibold" style={{ color: template.accentColor }}>
                        | ({proj.techTag})
                      </span>
                    </h3>
                    <ul className="flex flex-col gap-1 text-xs text-slate-700">
                      {proj.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <ResumeSectionDivider
              resume={resume}
              placement="after-projects"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 2: EXECUTIVE NAVY & GOLD BANNER (Exact match for Uploaded PDF #2 - Final_Resume_5)
  // ============================================================================
  if (template.layout === 'navy-gold-banner') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] flex flex-col text-slate-800 ${fontClass}`}
      >
        {/* Top Dark Navy Banner */}
        <header className="p-7 text-white" style={{ backgroundColor: template.primaryColor }}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {resume.fullName}
              </h1>
              <p
                className="text-lg font-semibold mt-0.5 mb-3"
                style={{ color: template.accentColor }}
              >
                {resume.jobTitle}
              </p>
              <p className="text-xs leading-relaxed text-slate-200">
                {renderDarkFormattedText(resume.summary)}
              </p>
            </div>
            {/* Profile Avatar Circle with Gold Ring */}
            <div
              className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center text-2xl font-bold bg-slate-800 text-white border-4"
              style={{ borderColor: template.accentColor }}
            >
              {resume.avatarInitials || 'VK'}
            </div>
          </div>

          {/* 2-Column Contact Grid at Bottom of Navy Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 mt-5 pt-4 border-t border-white/15 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <span>{resume.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <span>{resume.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <span>{resume.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <span>{resume.linkedin}</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <span>{resume.github}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
              <span>{resume.website}</span>
            </div>
          </div>
        </header>

        {/* 2-Column Asymmetric Body */}
        <div className="p-7 grid grid-cols-12 gap-7 flex-1">
          {/* Left Column (7 cols): Work Experience & Projects */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
            <section>
              <h2
                className="text-xs font-extrabold tracking-wider uppercase mb-3"
                style={{ color: template.accentColor }}
              >
                Work Experience
              </h2>
              <div className="flex flex-col gap-5">
                {resume.experiences.map((exp) => (
                  <div key={exp.id}>
                    <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                    <div className="text-xs font-medium text-slate-700">{exp.company}</div>
                    <div
                      className="text-[11px] mb-2 tabular-nums"
                      style={{ color: template.accentColor }}
                    >
                      {exp.period}
                    </div>
                    <ul className="flex flex-col gap-1.5 text-xs text-slate-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <ResumeSectionDivider
              resume={resume}
              placement="after-summary"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />
            <ResumeSectionDivider
              resume={resume}
              placement="after-experience"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />

            <section>
              <h2
                className="text-xs font-extrabold tracking-wider uppercase mb-3"
                style={{ color: template.accentColor }}
              >
                Projects
              </h2>
              <div className="flex flex-col gap-3">
                {resume.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                      {proj.title}{' '}
                      <span className="font-semibold" style={{ color: template.accentColor }}>
                        | ({proj.techTag})
                      </span>
                    </h3>
                    <ul className="flex flex-col gap-1 text-xs text-slate-700">
                      {proj.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <ResumeSectionDivider
              resume={resume}
              placement="after-projects"
              accentColor={template.accentColor}
              primaryColor={template.primaryColor}
            />
          </div>

          {/* Right Column (5 cols): Dark Skill Blocks, Certificates, Education, Languages & Domain Highlights */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-6">
              <section>
                <h2
                  className="text-xs font-extrabold tracking-wider uppercase mb-3"
                  style={{ color: template.accentColor }}
                >
                  Technical Skills
                </h2>
                <div className="flex flex-col gap-2">
                  {resume.skills.map((sk) => (
                    <div
                      key={sk.id}
                      className="px-3 py-2 rounded text-xs leading-snug"
                      style={{
                        backgroundColor: template.skillBlockBg,
                        color: template.skillBlockText,
                      }}
                    >
                      <div className="font-bold">{sk.category}</div>
                      <SkillProficiencyVisualList
                        category={sk}
                        accentColor={template.accentColor}
                        variant="dark"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold tracking-wider uppercase mb-3"
                  style={{ color: template.accentColor }}
                >
                  Certificates
                </h2>
                <ul className="flex flex-col gap-2 text-xs text-slate-800 font-semibold">
                  {resume.certificates.map((cert) => (
                    <li key={cert.id} className="flex justify-between gap-2">
                      <span>• {cert.name}</span>
                      <span className="text-slate-400 font-normal shrink-0">{cert.date}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold tracking-wider uppercase mb-3"
                  style={{ color: template.accentColor }}
                >
                  Education
                </h2>
                {resume.education.map((edu) => (
                  <div key={edu.id} className="text-xs flex flex-col gap-1">
                    <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-slate-400 text-[11px]">{edu.period}</div>
                  </div>
                ))}
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold tracking-wider uppercase mb-3"
                  style={{ color: template.accentColor }}
                >
                  Languages
                </h2>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {resume.languages.map((lang) => (
                    <div key={lang.id} className="flex flex-col gap-1">
                      <div
                        className="h-3 rounded-sm"
                        style={{
                          backgroundColor: template.primaryColor,
                          borderBottom: `3px solid ${template.accentColor}`,
                        }}
                      />
                      <span className="font-bold text-slate-800">{lang.language}</span>
                      <span className="text-[10px] text-slate-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Domain & Analytical Methodology Box to keep Right Column 100% filled */}
            <section className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <h2
                className="text-xs font-extrabold tracking-wider uppercase mb-2"
                style={{ color: template.accentColor }}
              >
                Analytical Methodology & ROI
              </h2>
              <ul className="flex flex-col gap-1.5 text-slate-700 text-[11px] leading-relaxed">
                <li>
                  • <strong>End-to-End BI Pipelines:</strong> Raw SQL extraction, Python cleaning, and interactive Tableau storytelling.
                </li>
                <li>
                  • <strong>Predictive Modeling:</strong> Logistic & linear regression achieving 80%+ validation accuracy.
                </li>
                <li>
                  • <strong>Business Impact:</strong> 75% reduction in product damage and 12% inventory-driven revenue growth.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 3: CORAL EDITORIAL 3-COLUMN (Exact match for Uploaded PDF #3 - Final_Resume_1)
  // ============================================================================
  if (template.layout === 'coral-split-three') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] p-7 flex flex-col gap-6 text-slate-800 ${fontClass}`}
      >
        {/* 3-Column Header: Left Summary, Center Portrait, Right Contact */}
        <header className="grid grid-cols-12 gap-5 items-start">
          <div className="col-span-12 md:col-span-6">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: template.primaryColor }}
            >
              {resume.fullName}
            </h1>
            <p className="text-base font-medium text-slate-500 mb-2.5">{resume.jobTitle}</p>
            <p className="text-xs leading-relaxed text-slate-700 text-justify">
              {renderFormattedText(resume.summary, highlightKeywords)}
            </p>
          </div>

          <div className="col-span-12 md:col-span-2 flex justify-center pt-2">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm"
              style={{ backgroundColor: template.primaryColor }}
            >
              {resume.avatarInitials || 'VK'}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 flex flex-col items-end gap-2 text-xs text-slate-700 text-right">
            <div className="flex items-center gap-2">
              <span>{resume.email}</span>
              <Mail className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
            </div>
            <div className="flex items-center gap-2">
              <span>{resume.phone}</span>
              <Phone className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
            </div>
            <div className="flex items-center gap-2">
              <span>{resume.location}</span>
              <MapPin className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
            </div>
            <div className="flex items-center gap-2">
              <span>{resume.linkedin}</span>
              <Linkedin className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
            </div>
            <div className="flex items-center gap-2">
              <span>{resume.github}</span>
              <Github className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
            </div>
            <div className="flex items-center gap-2">
              <span>{resume.website}</span>
              <Globe className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
            </div>
          </div>
        </header>

        <ResumeSectionDivider
          resume={resume}
          placement="after-header"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />
        <ResumeSectionDivider
          resume={resume}
          placement="after-summary"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />

        {/* 2-Column Body */}
        <div className="grid grid-cols-12 gap-7 flex-1">
          {/* Left Column (6 cols) */}
          <div className="col-span-12 md:col-span-6 flex flex-col gap-6">
            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                style={{ borderColor: template.accentColor }}
              >
                Work Experience
              </h2>
              <div className="flex flex-col gap-4">
                {resume.experiences.map((exp) => (
                  <div key={exp.id}>
                    <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                    <div className="text-xs text-slate-600">{exp.company}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 italic">
                      <span>{exp.period}</span>
                      <span>{exp.location}</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-xs text-slate-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                style={{ borderColor: template.accentColor }}
              >
                Personal Projects
              </h2>
              <div className="flex flex-col gap-3">
                {resume.projects.slice(0, 5).map((proj) => (
                  <div key={proj.id}>
                    <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                      {proj.title} | ({proj.techTag})
                    </h3>
                    <ul className="flex flex-col gap-1 text-xs text-slate-700">
                      {proj.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (6 cols) - Balanced with remaining projects & expertise */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-6">
              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                  style={{ borderColor: template.accentColor }}
                >
                  Areas of Expertise
                </h2>
                <div className="flex flex-col gap-2">
                  {resume.skills.map((sk) => (
                    <div
                      key={sk.id}
                      className="px-3 py-2 rounded text-xs leading-snug"
                      style={{
                        backgroundColor: template.skillBlockBg,
                        color: template.skillBlockText,
                      }}
                    >
                      <div className="font-semibold">{sk.category}</div>
                      <SkillProficiencyVisualList
                        category={sk}
                        accentColor={template.accentColor}
                        variant="dark"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {resume.projects.length > 5 && (
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                    style={{ borderColor: template.accentColor }}
                  >
                    Machine Learning & BI Initiatives
                  </h2>
                  <div className="flex flex-col gap-3">
                    {resume.projects.slice(5).map((proj) => (
                      <div key={proj.id}>
                        <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                          {proj.title} | ({proj.techTag})
                        </h3>
                        <ul className="flex flex-col gap-1 text-xs text-slate-700">
                          {proj.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                              <DiamondBullet color={template.accentColor} />
                              <span>{renderFormattedText(b, highlightKeywords)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                  style={{ borderColor: template.accentColor }}
                >
                  Certificates
                </h2>
                <ul className="flex flex-col gap-1.5 text-xs font-bold text-slate-800">
                  {resume.certificates.map((cert) => (
                    <li key={cert.id}>
                      • {cert.name} <span className="font-normal text-slate-500">({cert.date})</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                  style={{ borderColor: template.accentColor }}
                >
                  Education
                </h2>
                {resume.education.map((edu) => (
                  <div key={edu.id} className="text-xs flex flex-col gap-1">
                    <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-slate-400 text-[11px] italic">{edu.period}</div>
                  </div>
                ))}
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1.5 mb-3 border-b-2 text-slate-900"
                  style={{ borderColor: template.accentColor }}
                >
                  Languages
                </h2>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {resume.languages.map((lang) => (
                    <div key={lang.id}>
                      <div className="font-bold text-slate-900">{lang.language}</div>
                      <div className="text-slate-500 italic text-[11px]">{lang.proficiency}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 4: MODERN NAVY CONTACT CARD (Exact match for Uploaded PDF #4 - Final_Resume_8)
  // ============================================================================
  if (template.layout === 'navy-floating-card') {
    const SectionHeaderWithTwoToneRule = ({
      icon: Icon,
      title,
    }: {
      icon: React.ElementType;
      title: string;
    }) => (
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-6 h-6 rounded flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: template.accentColor }}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <h2
          className="text-xs font-extrabold uppercase tracking-wider shrink-0"
          style={{ color: template.primaryColor }}
        >
          {title}
        </h2>
        <div className="flex items-center gap-1.5 flex-1">
          <div className="h-0.5 w-10" style={{ backgroundColor: template.accentColor }} />
          <div className="h-0.5 flex-1" style={{ backgroundColor: template.primaryColor }} />
        </div>
      </div>
    );

    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] p-7 flex flex-col gap-6 text-slate-800 ${fontClass}`}
      >
        {/* Top Split Header with Floating Rounded Navy Contact Card */}
        <header className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-7">
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: template.primaryColor }}
            >
              {resume.fullName}
            </h1>
            <p
              className="text-lg font-medium mt-0.5 mb-2.5"
              style={{ color: template.accentColor }}
            >
              {resume.jobTitle}
            </p>
            <p className="text-xs leading-relaxed text-slate-700">
              {renderFormattedText(resume.summary, highlightKeywords)}
            </p>
          </div>

          <div
            className="col-span-12 md:col-span-5 rounded-xl p-4 text-xs flex flex-col gap-2 shadow-sm"
            style={{ backgroundColor: template.sidebarBg, color: template.sidebarText }}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span className="truncate">{resume.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span className="truncate">{resume.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span className="truncate">{resume.location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Linkedin className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span className="truncate">{resume.linkedin}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Github className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span className="truncate">{resume.github}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span className="truncate">{resume.website}</span>
            </div>
          </div>
        </header>

        <ResumeSectionDivider
          resume={resume}
          placement="after-header"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />
        <ResumeSectionDivider
          resume={resume}
          placement="after-summary"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />

        {/* Work Experience */}
        <section>
          <SectionHeaderWithTwoToneRule icon={Briefcase} title="Work Experience" />
          <div className="flex flex-col gap-4">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                <div className="text-xs font-semibold text-slate-700">{exp.company}</div>
                <div className="text-[11px] mb-1.5 italic" style={{ color: template.accentColor }}>
                  {exp.period}
                </div>
                <ul className="flex flex-col gap-1 text-xs text-slate-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <DiamondBullet color={template.accentColor} />
                      <span>{renderFormattedText(b, highlightKeywords)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Skills in Slate Blocks */}
        <section>
          <SectionHeaderWithTwoToneRule icon={Wrench} title="Technical Skills" />
          <div className="flex flex-col gap-2">
            {resume.skills.map((sk) => (
              <div
                key={sk.id}
                className="px-3 py-2 rounded text-xs"
                style={{
                  backgroundColor: template.skillBlockBg,
                  color: template.skillBlockText,
                }}
              >
                <div className="font-semibold">{sk.category}</div>
                <SkillProficiencyVisualList
                  category={sk}
                  accentColor={template.accentColor}
                  variant="dark"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Certifications in 2-Column Grid */}
        <section>
          <SectionHeaderWithTwoToneRule icon={Award} title="Certifications" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {resume.certificates.map((cert) => (
              <div key={cert.id}>
                <div className="font-bold text-slate-900">• {cert.name}</div>
                <div className="text-slate-500 italic text-[11px]">({cert.date})</div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <SectionHeaderWithTwoToneRule icon={GraduationCap} title="Education" />
          {resume.education.map((edu) => (
            <div key={edu.id} className="text-xs">
              <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
              <div className="text-slate-700">{edu.institution}</div>
              <div className="text-[11px] italic" style={{ color: template.accentColor }}>
                {edu.period}
              </div>
            </div>
          ))}
        </section>

        {/* Languages Inline */}
        <section>
          <SectionHeaderWithTwoToneRule icon={Languages} title="Languages" />
          <div className="flex flex-wrap items-center gap-6 text-xs">
            {resume.languages.map((lang) => (
              <div key={lang.id}>
                <span className="font-bold text-slate-900">{lang.language}</span>{' '}
                <span className="text-slate-500 italic">({lang.proficiency})</span>
              </div>
            ))}
          </div>
        </section>

        {/* Projects & Initiatives */}
        <section>
          <SectionHeaderWithTwoToneRule icon={FolderGit2} title="Projects & Initiatives" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-2.5 rounded border border-slate-100 bg-slate-50/40">
                <h3 className="text-xs font-bold text-slate-900 mb-1">
                  {proj.title}{' '}
                  <span className="font-semibold" style={{ color: template.accentColor }}>
                    | ({proj.techTag})
                  </span>
                </h3>
                <ul className="flex flex-col gap-1 text-xs text-slate-700">
                  {proj.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <DiamondBullet color={template.accentColor} />
                      <span>{renderFormattedText(b, highlightKeywords)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 5: SWISS ASYMMETRIC GRID (Zurich / Tokyo)
  // ============================================================================
  if (template.layout === 'swiss-asymmetric-grid') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] p-8 flex flex-col justify-between gap-5 text-slate-800 ${fontClass}`}
      >
        <header className="border-b-2 pb-5" style={{ borderColor: template.primaryColor }}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {resume.fullName}
              </h1>
              <p className="text-base font-semibold mt-1" style={{ color: template.accentColor }}>
                {resume.jobTitle}
              </p>
            </div>
            <div className="text-xs text-slate-600 text-right flex flex-col gap-0.5">
              <span>
                {resume.email} · {resume.phone}
              </span>
              <span>{resume.location}</span>
              <span>
                {resume.linkedin} · {resume.github}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-4">
          <div className="col-span-12 md:col-span-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: template.accentColor }}
            >
              01 / Summary
            </h2>
          </div>
          <div className="col-span-12 md:col-span-9 text-xs leading-relaxed text-slate-700">
            {renderFormattedText(resume.summary, highlightKeywords)}
          </div>
        </div>

        <ResumeSectionDivider
          resume={resume}
          placement="after-summary"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />

        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-4">
          <div className="col-span-12 md:col-span-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: template.accentColor }}
            >
              02 / Experience
            </h2>
          </div>
          <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {exp.role} · <span className="font-medium text-slate-600">{exp.company}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 tabular-nums">{exp.period}</span>
                </div>
                <ul className="mt-1.5 flex flex-col gap-1 text-xs text-slate-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <DiamondBullet color={template.accentColor} />
                      <span>{renderFormattedText(b, highlightKeywords)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-4">
          <div className="col-span-12 md:col-span-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: template.accentColor }}
            >
              03 / Expertise
            </h2>
          </div>
          <div className="col-span-12 md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {resume.skills.map((sk) => (
              <div key={sk.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">{sk.category}</div>
                <SkillProficiencyVisualList
                  category={sk}
                  accentColor={template.accentColor}
                  variant="light"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-4">
          <div className="col-span-12 md:col-span-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: template.accentColor }}
            >
              04 / Key Projects
            </h2>
          </div>
          <div className="col-span-12 md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-2 rounded border border-slate-100 bg-slate-50/40">
                <h3 className="text-xs font-bold text-slate-900">
                  {proj.title} <span className="text-slate-500">({proj.techTag})</span>
                </h3>
                <ul className="mt-1 flex flex-col gap-1 text-xs text-slate-700">
                  {proj.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <DiamondBullet color={template.accentColor} />
                      <span>{renderFormattedText(b, highlightKeywords)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: template.accentColor }}
            >
              05 / Credentials
            </h2>
          </div>
          <div className="col-span-12 md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-900 mb-1">Education</div>
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-medium">{edu.degree}</div>
                  <div className="text-slate-500">{edu.institution}</div>
                  <div className="text-slate-400 text-[11px]">{edu.period}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-1">Certifications & Languages</div>
              <div className="text-slate-600">
                {resume.certificates.map((c) => c.name).join(' · ')}
              </div>
              <div className="text-slate-800 font-medium mt-2">
                {resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 6: JAKE'S RESUME (Overleaf / Reddit r/EngineeringResumes FAANG Standard)
  // ============================================================================
  if (template.layout === 'jakes-latex-standard') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] px-9 py-7 flex flex-col justify-between gap-3.5 text-slate-900 ${fontClass}`}
      >
        <div className="flex flex-col gap-3.5">
          {/* Centered LaTeX Masthead */}
          <header className="text-center pb-1">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: template.primaryColor }}
            >
              {resume.fullName}
            </h1>
            <p className="text-xs font-semibold mt-0.5" style={{ color: template.accentColor }}>
              {resume.jobTitle} · {resume.location}
            </p>
            <div className="text-[11px] text-slate-700 mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
              <span>{resume.phone}</span>
              <span>|</span>
              <span className="underline">{resume.email}</span>
              <span>|</span>
              <span className="underline">{resume.linkedin}</span>
              <span>|</span>
              <span className="underline">{resume.github}</span>
              <span>|</span>
              <span className="underline">{resume.website}</span>
            </div>
          </header>

          {/* Summary */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-1.5"
              style={{ color: template.primaryColor, borderColor: template.primaryColor }}
            >
              Executive Summary
            </h2>
            <p className="text-[11.5px] leading-snug text-slate-800">
              {renderFormattedText(resume.summary, highlightKeywords)}
            </p>
          </section>

          <ResumeSectionDivider
            resume={resume}
            placement="after-summary"
            accentColor={template.accentColor}
            primaryColor={template.primaryColor}
          />

          {/* Education (Top-Placed in Classic LaTeX / Academic / Tech Hybrid) */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-1.5"
              style={{ color: template.primaryColor, borderColor: template.primaryColor }}
            >
              Education
            </h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="text-xs flex items-baseline justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span> —{' '}
                  <span className="italic text-slate-700">{edu.degree}</span>
                </div>
                <span className="text-[11px] italic text-slate-600 tabular-nums">{edu.period}</span>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2"
              style={{ color: template.primaryColor, borderColor: template.primaryColor }}
            >
              Experience
            </h2>
            <div className="flex flex-col gap-3">
              {resume.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                    <span className="text-[11px] text-slate-700 tabular-nums">{exp.period}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs italic text-slate-700 mb-1">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc pl-4 flex flex-col gap-0.5 text-[11.5px] text-slate-800 leading-snug">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{renderFormattedText(b, highlightKeywords)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects (Dense LaTeX Style with Tech Stack Pipe) */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2"
              style={{ color: template.primaryColor, borderColor: template.primaryColor }}
            >
              Projects & Quantitative Engineering
            </h2>
            <div className="flex flex-col gap-2">
              {resume.projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="italic font-medium" style={{ color: template.accentColor }}>
                        {proj.techTag}
                      </span>
                    </div>
                    <span className="text-[10.5px] italic text-slate-500">Production Verified</span>
                  </div>
                  <ul className="list-disc pl-4 flex flex-col gap-0.5 text-[11.5px] text-slate-800 leading-snug mt-0.5">
                    {proj.bullets.map((b, i) => (
                      <li key={i}>{renderFormattedText(b, highlightKeywords)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Technical Skills & Certifications Footer Block */}
        <section className="pt-1">
          <h2
            className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-1.5"
            style={{ color: template.primaryColor, borderColor: template.primaryColor }}
          >
            Technical Skills, Certifications & Languages
          </h2>
          <div className="flex flex-col gap-1 text-[11.5px] text-slate-800">
            {resume.skills.map((sk) => (
              <div key={sk.id} className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-950">{sk.category}: </span>
                <SkillProficiencyVisualList
                  category={sk}
                  accentColor={template.accentColor}
                  variant="inline"
                />
              </div>
            ))}
            <div>
              <span className="font-bold text-slate-950">Certifications: </span>
              <span>{resume.certificates.map((c) => `${c.name} (${c.date})`).join(' · ')}</span>
            </div>
            <div>
              <span className="font-bold text-slate-950">Languages: </span>
              <span>
                {resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')}
              </span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 7: ENHANCV MODERN KPI IMPACT BENTO (Internet Trending #2)
  // ============================================================================
  if (template.layout === 'enhancv-bento-modern') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] flex flex-col justify-between text-slate-800 ${fontClass}`}
      >
        {/* Top Accent Strip + Header */}
        <div>
          <div className="h-2.5 w-full" style={{ backgroundColor: template.accentColor }} />
          <header className="px-8 pt-6 pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[260px]">
              <h1
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: template.primaryColor }}
              >
                {resume.fullName}
              </h1>
              <p className="text-base font-bold mt-0.5" style={{ color: template.accentColor }}>
                {resume.jobTitle}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                  {resume.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                  {resume.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                  {resume.location}
                </span>
                <span className="flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5" style={{ color: template.accentColor }} />
                  {resume.linkedin}
                </span>
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shadow-xs shrink-0"
              style={{ backgroundColor: template.primaryColor }}
            >
              {resume.avatarInitials || 'VK'}
            </div>
          </header>

          {/* Enhancv Signature 4-Card KPI Impact Bento Strip */}
          <div
            className="px-8 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-200"
            style={{ backgroundColor: template.sidebarBg }}
          >
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <div
                className="text-base font-extrabold font-mono tabular-nums"
                style={{ color: template.accentColor }}
              >
                75% Cut
              </div>
              <div className="text-[10.5px] font-semibold text-slate-700">
                Product Damage Reduction via Root-Cause SQL
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <div
                className="text-base font-extrabold font-mono tabular-nums"
                style={{ color: template.accentColor }}
              >
                +12% Lift
              </div>
              <div className="text-[10.5px] font-semibold text-slate-700">
                Revenue Growth from Predictive Stock Models
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <div
                className="text-base font-extrabold font-mono tabular-nums"
                style={{ color: template.accentColor }}
              >
                70+ BI
              </div>
              <div className="text-[10.5px] font-semibold text-slate-700">
                Interactive Tableau Dashboards & 80+ SQL Queries
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <div
                className="text-base font-extrabold font-mono tabular-nums"
                style={{ color: template.accentColor }}
              >
                95%+ R²
              </div>
              <div className="text-[10.5px] font-semibold text-slate-700">
                ML Classification & Forecasting Validation
              </div>
            </div>
          </div>

          {/* 2-Column Enhancv Body */}
          <div className="px-8 py-6 grid grid-cols-12 gap-6">
            {/* Left 7 Cols: Summary, Experience, Projects */}
            <div className="col-span-12 md:col-span-7 flex flex-col gap-5">
              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b-2"
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}
                >
                  Professional Summary
                </h2>
                <p className="text-xs leading-relaxed text-slate-700">
                  {renderFormattedText(resume.summary, highlightKeywords)}
                </p>
              </section>

              <ResumeSectionDivider
                resume={resume}
                placement="after-summary"
                accentColor={template.accentColor}
                primaryColor={template.primaryColor}
              />

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b-2"
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}
                >
                  Work Experience
                </h2>
                <div className="flex flex-col gap-4">
                  {resume.experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-[11px] font-mono text-slate-500">{exp.period}</span>
                      </div>
                      <div
                        className="text-xs font-bold mb-1.5"
                        style={{ color: template.accentColor }}
                      >
                        {exp.company} · {exp.location}
                      </div>
                      <ul className="flex flex-col gap-1 text-xs text-slate-700">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <DiamondBullet color={template.accentColor} />
                            <span>{renderFormattedText(b, highlightKeywords)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b-2"
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}
                >
                  Featured Data & ML Projects (Part I)
                </h2>
                <div className="flex flex-col gap-3">
                  {resume.projects.slice(0, 3).map((proj) => (
                    <div key={proj.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                        <span
                          className="text-[10.5px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: template.skillBlockBg }}
                        >
                          {proj.techTag}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1 text-xs text-slate-700">
                        {proj.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 leading-snug">
                            <DiamondBullet color={template.accentColor} />
                            <span>{renderFormattedText(b, highlightKeywords)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right 5 Cols: Additional Projects, Skills Bento, Education, Certs, Languages */}
            <div className="col-span-12 md:col-span-5 flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-5">
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b-2"
                    style={{ color: template.primaryColor, borderColor: template.accentColor }}
                  >
                    Technical Skills Matrix
                  </h2>
                  <div className="flex flex-col gap-2">
                    {resume.skills.map((sk) => (
                      <div
                        key={sk.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <div
                          className="text-xs font-bold mb-1"
                          style={{ color: template.primaryColor }}
                        >
                          {sk.category}
                        </div>
                        <SkillProficiencyVisualList
                          category={sk}
                          accentColor={template.accentColor}
                          variant="light"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b-2"
                    style={{ color: template.primaryColor, borderColor: template.accentColor }}
                  >
                    Featured Projects (Part II)
                  </h2>
                  <div className="flex flex-col gap-2.5">
                    {resume.projects.slice(3).map((proj) => (
                      <div
                        key={proj.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                      >
                        <div className="text-xs font-bold text-slate-900">
                          {proj.title}{' '}
                          <span style={{ color: template.accentColor }}>({proj.techTag})</span>
                        </div>
                        <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                          {renderFormattedText(proj.bullets[0] || '', highlightKeywords)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2.5 border-b-2"
                    style={{ color: template.primaryColor, borderColor: template.accentColor }}
                  >
                    Education & Certifications
                  </h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="text-xs mb-2.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.institution}</div>
                      <div className="text-[11px] text-slate-400">{edu.period}</div>
                    </div>
                  ))}
                  <ul className="flex flex-col gap-1 text-xs text-slate-700">
                    {resume.certificates.map((c) => (
                      <li key={c.id} className="flex justify-between gap-2">
                        <span className="font-semibold">• {c.name}</span>
                        <span className="text-slate-400 shrink-0">{c.date}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-2"
                  style={{ color: template.primaryColor }}
                >
                  Languages & Global Readiness
                </h2>
                <div className="flex flex-col gap-1.5">
                  {resume.languages.map((l) => (
                    <div key={l.id} className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{l.language}</span>
                      <span className="text-slate-600">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 8: NOVORESUME CONNECTED TIMELINE (Internet Trending #3)
  // ============================================================================
  if (template.layout === 'novoresume-timeline') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] flex flex-col justify-between text-slate-800 ${fontClass}`}
      >
        <div>
          {/* Top Novoresume Header */}
          <header
            className="px-8 py-6 text-white flex flex-wrap items-center justify-between gap-4"
            style={{ backgroundColor: template.primaryColor }}
          >
            <div className="flex-1 min-w-[260px]">
              <h1 className="text-3xl font-extrabold tracking-tight">{resume.fullName}</h1>
              <p className="text-base font-bold mt-0.5" style={{ color: template.accentColor }}>
                {resume.jobTitle}
              </p>
              <p className="text-xs text-slate-200 leading-relaxed mt-2 max-w-xl">
                {renderFormattedText(resume.summary, highlightKeywords)}
              </p>
            </div>
            <div className="text-xs text-slate-200 flex flex-col gap-1.5 items-end text-right">
              <span>{resume.email}</span>
              <span>{resume.phone}</span>
              <span>{resume.location}</span>
              <span>{resume.linkedin}</span>
              <span>{resume.github}</span>
            </div>
          </header>

          {/* Connected Vertical Timeline Body */}
          <div className="p-8 grid grid-cols-12 gap-6">
            {/* Left 7 Cols: Connected Timeline for Experience & Projects */}
            <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: template.primaryColor }}
                >
                  <Briefcase className="w-4 h-4" style={{ color: template.accentColor }} />
                  Career Progression Timeline
                </h2>
                <div
                  className="border-l-2 pl-4 ml-2 flex flex-col gap-5"
                  style={{ borderColor: template.accentColor }}
                >
                  {resume.experiences.map((exp) => (
                    <div key={exp.id} className="relative">
                      <span
                        className="w-3 h-3 rounded-full absolute -left-[23px] top-1 border-2 border-white"
                        style={{ backgroundColor: template.accentColor }}
                      />
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                        <span
                          className="text-[11px] font-bold tabular-nums"
                          style={{ color: template.accentColor }}
                        >
                          {exp.period}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">
                        {exp.company} · {exp.location}
                      </div>
                      <ul className="flex flex-col gap-1 text-xs text-slate-700">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="leading-relaxed">
                            • {renderFormattedText(b, highlightKeywords)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <ResumeSectionDivider
                resume={resume}
                placement="after-summary"
                accentColor={template.accentColor}
                primaryColor={template.primaryColor}
              />
              <ResumeSectionDivider
                resume={resume}
                placement="after-experience"
                accentColor={template.accentColor}
                primaryColor={template.primaryColor}
              />

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: template.primaryColor }}
                >
                  <FolderGit2 className="w-4 h-4" style={{ color: template.accentColor }} />
                  Project Milestones
                </h2>
                <div
                  className="border-l-2 pl-4 ml-2 flex flex-col gap-3.5"
                  style={{ borderColor: template.accentColor }}
                >
                  {resume.projects.slice(0, 4).map((proj) => (
                    <div key={proj.id} className="relative">
                      <span
                        className="w-2.5 h-2.5 rounded-full absolute -left-[22px] top-1.5 border-2 border-white"
                        style={{ backgroundColor: template.primaryColor }}
                      />
                      <div className="text-xs font-bold text-slate-900">
                        {proj.title}{' '}
                        <span style={{ color: template.accentColor }}>({proj.techTag})</span>
                      </div>
                      <ul className="flex flex-col gap-0.5 text-xs text-slate-700 mt-0.5">
                        {proj.bullets.map((b, i) => (
                          <li key={i} className="leading-snug">
                            • {renderFormattedText(b, highlightKeywords)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right 5 Cols: Skill Bars, Remaining Projects, Certs, Education */}
            <div className="col-span-12 md:col-span-5 flex flex-col justify-between gap-5">
              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Core Technical Competencies
                </h2>
                <div className="flex flex-col gap-2.5">
                  {resume.skills.map((sk) => (
                    <div key={sk.id} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{sk.category}</span>
                      </div>
                      <SkillProficiencyVisualList
                        category={sk}
                        accentColor={template.accentColor}
                        variant="light"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-2.5"
                  style={{ color: template.primaryColor }}
                >
                  Additional Analytics Projects
                </h2>
                <div className="flex flex-col gap-2">
                  {resume.projects.slice(4).map((proj) => (
                    <div
                      key={proj.id}
                      className="p-2.5 rounded border border-slate-200 bg-slate-50 text-xs"
                    >
                      <div className="font-bold text-slate-900">
                        {proj.title} ({proj.techTag})
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {renderFormattedText(proj.bullets[0] || '', highlightKeywords)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-2.5"
                  style={{ color: template.primaryColor }}
                >
                  Education & Verified Certificates
                </h2>
                {resume.education.map((edu) => (
                  <div key={edu.id} className="text-xs mb-2.5">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-[11px] text-slate-400">{edu.period}</div>
                  </div>
                ))}
                <div className="flex flex-col gap-1 text-xs text-slate-700">
                  {resume.certificates.map((c) => (
                    <div key={c.id}>
                      • <span className="font-semibold">{c.name}</span> ({c.date})
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider mb-2"
                  style={{ color: template.primaryColor }}
                >
                  Languages
                </h2>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {resume.languages.map((l) => (
                    <div
                      key={l.id}
                      className="p-2 rounded border border-slate-200 bg-slate-50 text-center"
                    >
                      <div className="font-bold text-slate-900">{l.language}</div>
                      <div className="text-[10px] text-slate-500">{l.proficiency}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 9: CANVA / RESUME.IO WARM EDITORIAL STUDIO (Internet Trending #4)
  // ============================================================================
  if (template.layout === 'canva-editorial-studio') {
    return (
      <div
        data-testid="resume-canvas"
        className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] p-8 flex flex-col justify-between gap-5 text-slate-800 ${fontClass}`}
      >
        {/* Warm Editorial Tinted Header Card */}
        <header
          className="p-6 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-5"
          style={{ backgroundColor: template.sidebarBg }}
        >
          <div className="flex-1 min-w-[260px]">
            <div
              className="text-[11px] font-bold uppercase tracking-widest mb-1"
              style={{ color: template.accentColor }}
            >
              Curriculum Vitae · {resume.jobTitle}
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: template.primaryColor }}
            >
              {resume.fullName}
            </h1>
            <p className="text-xs leading-relaxed text-slate-700 mt-2">
              {renderFormattedText(resume.summary, highlightKeywords)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-slate-700 text-right">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1"
              style={{ backgroundColor: template.primaryColor }}
            >
              {resume.avatarInitials || 'VK'}
            </div>
            <span className="font-semibold">{resume.email}</span>
            <span>{resume.phone}</span>
            <span>{resume.location}</span>
            <span>{resume.linkedin}</span>
          </div>
        </header>

        <ResumeSectionDivider
          resume={resume}
          placement="after-summary"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />

        {/* Framed Editorial Body */}
        <div className="grid grid-cols-12 gap-6 flex-1">
          <div className="col-span-12 md:col-span-7 flex flex-col justify-between gap-5">
            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded mb-3 inline-block text-white"
                style={{ backgroundColor: template.primaryColor }}
              >
                Work Experience
              </h2>
              <div className="flex flex-col gap-4">
                {resume.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                      <span className="text-[11px] text-slate-500 tabular-nums">{exp.period}</span>
                    </div>
                    <div
                      className="text-xs font-semibold mb-1.5"
                      style={{ color: template.accentColor }}
                    >
                      {exp.company} · {exp.location}
                    </div>
                    <ul className="flex flex-col gap-1 text-xs text-slate-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <DiamondBullet color={template.accentColor} />
                          <span>{renderFormattedText(b, highlightKeywords)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded mb-3 inline-block text-white"
                style={{ backgroundColor: template.primaryColor }}
              >
                Selected Analytics Portfolio
              </h2>
              <div className="flex flex-col gap-2.5">
                {resume.projects.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="border-l-2 pl-3" style={{ borderColor: template.accentColor }}>
                    <div className="text-xs font-bold text-slate-900">
                      {proj.title}{' '}
                      <span style={{ color: template.accentColor }}>— {proj.techTag}</span>
                    </div>
                    <ul className="flex flex-col gap-0.5 text-xs text-slate-700 mt-0.5">
                      {proj.bullets.map((b, i) => (
                        <li key={i}>• {renderFormattedText(b, highlightKeywords)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="col-span-12 md:col-span-5 flex flex-col justify-between gap-5">
            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded mb-3 inline-block text-white"
                style={{ backgroundColor: template.accentColor }}
              >
                Skills & Tools
              </h2>
              <div className="flex flex-col gap-2">
                {resume.skills.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-2.5 rounded-xl border border-slate-200"
                    style={{ backgroundColor: template.sidebarBg }}
                  >
                    <div className="text-xs font-bold" style={{ color: template.primaryColor }}>
                      {sk.category}
                    </div>
                    <SkillProficiencyVisualList
                      category={sk}
                      accentColor={template.accentColor}
                      variant="light"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded mb-3 inline-block text-white"
                style={{ backgroundColor: template.accentColor }}
              >
                Additional Projects
              </h2>
              <div className="flex flex-col gap-2">
                {resume.projects.slice(3).map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="font-bold text-slate-900">
                      {proj.title} ({proj.techTag})
                    </div>
                    <div className="text-slate-600">
                      {renderFormattedText(proj.bullets[0] || '', highlightKeywords)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded mb-2.5 inline-block text-white"
                style={{ backgroundColor: template.primaryColor }}
              >
                Credentials & Languages
              </h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="text-xs mb-2">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">
                    {edu.institution} · {edu.period}
                  </div>
                </div>
              ))}
              <div className="text-xs text-slate-700 flex flex-col gap-1 mt-2">
                {resume.certificates.map((c) => (
                  <div key={c.id}>
                    • <strong>{c.name}</strong> ({c.date})
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-2.5 pt-2 border-t border-slate-200">
                {resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LAYOUT 10: CLASSIC / EXECUTIVE / RIGHT-SIDEBAR FULL-SHEET
  // ============================================================================
  return (
    <div
      data-testid="resume-canvas"
      className={`print-only-canvas bg-white shadow-sm border border-slate-200 w-full max-w-[850px] mx-auto min-h-[1120px] p-8 flex flex-col justify-between gap-5 text-slate-800 ${fontClass}`}
    >
      <div className="flex flex-col gap-5">
        {/* Classic / Executive Header */}
        <header className="pb-4 border-b-2" style={{ borderColor: template.primaryColor }}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: template.primaryColor }}
              >
                {resume.fullName}
              </h1>
              <p className="text-base font-semibold mt-0.5" style={{ color: template.accentColor }}>
                {resume.jobTitle}
              </p>
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1 max-w-md justify-end">
              <span>{resume.email}</span>
              <span>·</span>
              <span>{resume.phone}</span>
              <span>·</span>
              <span>{resume.location}</span>
              <span>·</span>
              <span>{resume.linkedin}</span>
              <span>·</span>
              <span>{resume.github}</span>
            </div>
          </div>
        </header>

        {/* Summary */}
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200"
            style={{ color: template.primaryColor }}
          >
            Professional Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">
            {renderFormattedText(resume.summary, highlightKeywords)}
          </p>
        </section>

        <ResumeSectionDivider
          resume={resume}
          placement="after-summary"
          accentColor={template.accentColor}
          primaryColor={template.primaryColor}
        />

        {/* Skills Strip */}
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200"
            style={{ color: template.primaryColor }}
          >
            Technical Skills & Core Competencies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {resume.skills.map((sk) => (
              <div key={sk.id} className="leading-snug">
                <div className="font-bold text-slate-900">{sk.category}</div>
                <SkillProficiencyVisualList
                  category={sk}
                  accentColor={template.accentColor}
                  variant="light"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200"
            style={{ color: template.primaryColor }}
          >
            Professional Experience
          </h2>
          <div className="flex flex-col gap-4">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {exp.role} — <span style={{ color: template.accentColor }}>{exp.company}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {exp.period} | {exp.location}
                  </span>
                </div>
                <ul className="mt-1.5 flex flex-col gap-1 text-xs text-slate-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <DiamondBullet color={template.accentColor} />
                      <span>{renderFormattedText(b, highlightKeywords)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200"
            style={{ color: template.primaryColor }}
          >
            Key Analytics & Machine Learning Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-2.5 rounded border border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900 mb-1">
                  {proj.title}{' '}
                  <span style={{ color: template.accentColor }}>| ({proj.techTag})</span>
                </h3>
                <ul className="flex flex-col gap-1 text-xs text-slate-700">
                  {proj.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 leading-snug">
                      <DiamondBullet color={template.accentColor} />
                      <span>{renderFormattedText(b, highlightKeywords)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom 3-Column Credentials */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 text-xs">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-1.5">Education</h3>
          {resume.education.map((edu) => (
            <div key={edu.id}>
              <div className="font-semibold text-slate-900">{edu.degree}</div>
              <div className="text-slate-600">{edu.institution}</div>
              <div className="text-slate-400 text-[11px]">{edu.period}</div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            Certifications
          </h3>
          <ul className="flex flex-col gap-1 text-slate-700">
            {resume.certificates.map((c) => (
              <li key={c.id}>
                • {c.name} <span className="text-slate-400">({c.date})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-1.5">Languages</h3>
          <div className="flex flex-col gap-1 text-slate-700">
            {resume.languages.map((l) => (
              <div key={l.id}>
                <span className="font-semibold text-slate-900">{l.language}:</span> {l.proficiency}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
