import React, { useState } from 'react';
import { Check, Eye, FileText, LayoutTemplate, X } from 'lucide-react';
import { RESUME_TEMPLATES } from '../data/templatesCatalog.ts';
import { DEFAULT_VINAY_RESUME } from '../data/defaultResume.ts';
import { ResumeData, ResumeTemplateConfig } from '../types/resume.ts';
import { ResumeCanvas } from './ResumeCanvas.tsx';

interface TemplateGalleryProps {
  resume?: ResumeData;
  selectedTemplateId: string;
  onSelectTemplate: (template: ResumeTemplateConfig) => void;
}

const UPLOADED_PDF_ASSETS = [
  {
    id: 'pdf-1',
    title: 'Uploaded Example 1 — Nordic Slate Sidebar',
    templateId: 'nordic-slate',
    url: '/assets/aistudio/Final_Resume_2_6a52baeb.pdf',
  },
  {
    id: 'pdf-2',
    title: 'Uploaded Example 2 — Executive Navy & Gold Banner',
    templateId: 'executive-navy-gold',
    url: '/assets/aistudio/Final_Resume_5_39324547.pdf',
  },
  {
    id: 'pdf-3',
    title: 'Uploaded Example 3 — Coral Editorial 3-Column',
    templateId: 'coral-editorial',
    url: '/assets/aistudio/Final_Resume_1_9bb7cb2a.pdf',
  },
  {
    id: 'pdf-4',
    title: 'Uploaded Example 4 — Modern Navy Contact Card',
    templateId: 'modern-navy-card',
    url: '/assets/aistudio/Final_Resume_8_c6cead34.pdf',
  },
];

const stripMd = (text?: string) => (text || '').replace(/\*\*/g, '');

const FilledMiniatureResume: React.FC<{
  tpl: ResumeTemplateConfig;
  resume?: ResumeData;
}> = ({ tpl, resume: propResume }) => {
  const resume =
    propResume && Array.isArray(propResume.experiences) ? propResume : DEFAULT_VINAY_RESUME;
  const firstExp = resume.experiences?.[0];
  const secondExp = resume.experiences?.[1];
  const firstProj = resume.projects?.[0];
  const secondProj = resume.projects?.[1];
  const thirdProj = resume.projects?.[2];
  const edu = resume.education?.[0];

  if (tpl.layout === 'nordic-sidebar-left') {
    return (
      <div className="h-full w-full grid grid-cols-12 text-[5.5px] leading-[1.22] bg-white select-none overflow-hidden">
        {/* Left Dark Sidebar (Fully Filled) */}
        <div
          className="col-span-4 p-2 text-white flex flex-col justify-between gap-1"
          style={{ backgroundColor: tpl.sidebarBg }}
        >
          <div className="flex flex-col gap-0.5">
            <div className="text-[5px] tracking-wider uppercase font-bold text-slate-300 border-b border-white/20 pb-0.5">
              CONTACT
            </div>
            <div className="truncate opacity-90">{resume.email}</div>
            <div className="truncate opacity-90">{resume.phone}</div>
            <div className="truncate opacity-80">{resume.location}</div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="text-[5px] tracking-wider uppercase font-bold text-slate-300 border-b border-white/20 pb-0.5">
              TECHNICAL SKILLS
            </div>
            {resume.skills.slice(0, 4).map((sk) => (
              <div key={sk.id} className="truncate">
                <span className="font-bold text-white">{sk.category}: </span>
                <span className="text-slate-300">{sk.items}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="text-[5px] tracking-wider uppercase font-bold text-slate-300 border-b border-white/20 pb-0.5">
              EDUCATION & CERTS
            </div>
            {edu && (
              <div className="truncate font-semibold text-white">
                {edu.degree} · {edu.institution}
              </div>
            )}
            {resume.certificates.slice(0, 3).map((c) => (
              <div key={c.id} className="truncate text-slate-300">
                • {c.name}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="text-[5px] tracking-wider uppercase font-bold text-slate-300 border-b border-white/20 pb-0.5">
              LANGUAGES & IMPACT
            </div>
            <div className="truncate text-slate-200">
              {resume.languages.map((l) => l.name).join(' · ')}
            </div>
            <div className="text-[5px] text-teal-300 font-semibold">
              95%+ Model Accuracy · 20% Perf Boost
            </div>
          </div>
        </div>

        {/* Right Main Column (Fully Filled Top to Bottom) */}
        <div className="col-span-8 p-2 bg-white text-slate-800 flex flex-col justify-between gap-1">
          <div className="border-b pb-1" style={{ borderColor: tpl.primaryColor }}>
            <div
              className="text-[8.5px] font-extrabold leading-none tracking-tight"
              style={{ color: tpl.primaryColor }}
            >
              {resume.fullName}
            </div>
            <div className="text-[6px] font-bold mt-0.5" style={{ color: tpl.accentColor }}>
              {resume.jobTitle}
            </div>
            <p className="text-[5px] text-slate-600 line-clamp-2 mt-0.5">
              {stripMd(resume.summary)}
            </p>
          </div>

          {firstExp && (
            <div className="flex flex-col gap-0.5">
              <div
                className="text-[5.5px] font-extrabold uppercase tracking-wider"
                style={{ color: tpl.primaryColor }}
              >
                WORK EXPERIENCE
              </div>
              <div className="font-bold text-slate-900 truncate">
                {firstExp.role} · {firstExp.company} ({firstExp.period})
              </div>
              {firstExp.bullets.slice(0, 2).map((b, idx) => (
                <div key={idx} className="truncate text-slate-700">
                  • {stripMd(b)}
                </div>
              ))}
              {secondExp && (
                <div className="font-bold text-slate-800 truncate mt-0.5">
                  {secondExp.role} · {secondExp.company} — {stripMd(secondExp.bullets[0])}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <div
              className="text-[5.5px] font-extrabold uppercase tracking-wider"
              style={{ color: tpl.primaryColor }}
            >
              KEY DATA & ML PROJECTS
            </div>
            {[firstProj, secondProj, thirdProj].filter(Boolean).map((p) => (
              <div key={p!.id} className="border-l-2 pl-1" style={{ borderColor: tpl.accentColor }}>
                <div className="font-bold text-slate-900 truncate">
                  {p!.title} <span style={{ color: tpl.accentColor }}>({p!.techTag})</span>
                </div>
                <div className="truncate text-slate-600">{stripMd(p!.bullets[0])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'navy-gold-banner') {
    return (
      <div className="h-full w-full flex flex-col text-[5.5px] leading-[1.22] bg-white select-none overflow-hidden">
        {/* Top Navy & Gold Executive Banner */}
        <div
          className="px-2.5 py-1.5 text-white flex items-center justify-between gap-2"
          style={{ backgroundColor: tpl.primaryColor }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[8.5px] font-bold leading-none">{resume.fullName}</div>
            <div className="text-[6px] font-bold mt-0.5" style={{ color: tpl.accentColor }}>
              {resume.jobTitle}
            </div>
            <div className="text-[5px] text-slate-200 line-clamp-2 mt-0.5">
              {stripMd(resume.summary)}
            </div>
          </div>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[6.5px] shrink-0 border"
            style={{ borderColor: tpl.accentColor, backgroundColor: '#24344d' }}
          >
            VK
          </div>
        </div>

        {/* Contact Bar */}
        <div
          className="px-2.5 py-0.5 text-[5px] text-white flex items-center justify-between"
          style={{ backgroundColor: '#111927' }}
        >
          <span className="truncate">{resume.email}</span>
          <span>{resume.phone}</span>
          <span className="truncate">{resume.location}</span>
        </div>

        {/* 2-Column Body (Fully Filled) */}
        <div className="p-2 grid grid-cols-12 gap-2 flex-1">
          <div className="col-span-7 flex flex-col justify-between">
            {firstExp && (
              <div>
                <div
                  className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                  style={{ color: tpl.accentColor, borderColor: tpl.accentColor }}
                >
                  WORK EXPERIENCE
                </div>
                <div className="font-bold text-slate-900 truncate">
                  {firstExp.role} · {firstExp.company}
                </div>
                {firstExp.bullets.slice(0, 2).map((b, i) => (
                  <div key={i} className="truncate text-slate-700">
                    • {stripMd(b)}
                  </div>
                ))}
              </div>
            )}

            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                style={{ color: tpl.accentColor, borderColor: tpl.accentColor }}
              >
                PROJECTS & ANALYTICS
              </div>
              {[firstProj, secondProj].filter(Boolean).map((p) => (
                <div key={p!.id} className="mb-0.5">
                  <div className="font-bold text-slate-900 truncate">
                    {p!.title} ({p!.techTag})
                  </div>
                  <div className="truncate text-slate-600">• {stripMd(p!.bullets[0])}</div>
                </div>
              ))}
            </div>

            {edu && (
              <div className="truncate">
                <span className="font-extrabold uppercase" style={{ color: tpl.accentColor }}>
                  EDUCATION:{' '}
                </span>
                <span className="font-bold text-slate-900">
                  {edu.degree} — {edu.institution}
                </span>
              </div>
            )}
          </div>

          <div className="col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5">
              <div
                className="text-[5.5px] font-extrabold uppercase border-b pb-0.5"
                style={{ color: tpl.accentColor, borderColor: tpl.accentColor }}
              >
                SKILLS MATRIX
              </div>
              {resume.skills.slice(0, 4).map((sk) => (
                <div
                  key={sk.id}
                  className="px-1.5 py-0.5 rounded text-white truncate"
                  style={{ backgroundColor: tpl.skillBlockBg }}
                >
                  <span className="font-bold">{sk.category}: </span>
                  <span className="opacity-90">{sk.items}</span>
                </div>
              ))}
            </div>

            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                style={{ color: tpl.accentColor, borderColor: tpl.accentColor }}
              >
                CERTIFICATES
              </div>
              {resume.certificates.slice(0, 3).map((c) => (
                <div key={c.id} className="truncate text-slate-700">
                  • {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'coral-split-three') {
    return (
      <div className="h-full w-full p-2 flex flex-col justify-between text-[5.5px] leading-[1.22] bg-white select-none overflow-hidden">
        {/* 3-Part Coral Header */}
        <div
          className="grid grid-cols-12 gap-1.5 items-center pb-1 border-b"
          style={{ borderColor: tpl.primaryColor }}
        >
          <div className="col-span-6">
            <div className="text-[8.5px] font-bold leading-none" style={{ color: tpl.primaryColor }}>
              {resume.fullName}
            </div>
            <div className="text-[6px] font-semibold text-slate-600 mt-0.5">{resume.jobTitle}</div>
            <div className="text-[5px] text-slate-600 line-clamp-2 mt-0.5">
              {stripMd(resume.summary)}
            </div>
          </div>
          <div className="col-span-2 flex justify-center">
            <div
              className="w-6 h-6 rounded-full text-white font-bold flex items-center justify-center text-[6px]"
              style={{ backgroundColor: tpl.primaryColor }}
            >
              VK
            </div>
          </div>
          <div className="col-span-4 text-right text-[5px] text-slate-600">
            <div className="truncate">{resume.email}</div>
            <div>{resume.phone}</div>
            <div className="truncate">{resume.location}</div>
          </div>
        </div>

        {/* 2-Column Body (Fully Filled) */}
        <div className="grid grid-cols-12 gap-2 flex-1 pt-1">
          <div className="col-span-6 flex flex-col justify-between">
            {firstExp && (
              <div>
                <div
                  className="text-[5.5px] font-extrabold uppercase mb-0.5"
                  style={{ color: tpl.primaryColor }}
                >
                  WORK EXPERIENCE
                </div>
                <div className="font-bold text-slate-900 truncate">
                  {firstExp.role} · {firstExp.company}
                </div>
                {firstExp.bullets.slice(0, 2).map((b, i) => (
                  <div key={i} className="truncate text-slate-700">
                    • {stripMd(b)}
                  </div>
                ))}
              </div>
            )}

            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase mb-0.5"
                style={{ color: tpl.primaryColor }}
              >
                ANALYTICS PROJECTS
              </div>
              {[firstProj, secondProj].filter(Boolean).map((p) => (
                <div key={p!.id} className="mb-0.5">
                  <div className="font-bold text-slate-900 truncate">
                    {p!.title} ({p!.techTag})
                  </div>
                  <div className="truncate text-slate-600">• {stripMd(p!.bullets[0])}</div>
                </div>
              ))}
            </div>

            {edu && (
              <div className="truncate">
                <span className="font-bold" style={{ color: tpl.primaryColor }}>
                  EDUCATION:{' '}
                </span>
                <span className="font-semibold text-slate-800">{edu.degree}</span>
              </div>
            )}
          </div>

          <div className="col-span-6 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5">
              <div
                className="text-[5.5px] font-extrabold uppercase"
                style={{ color: tpl.primaryColor }}
              >
                TECHNICAL SKILLS
              </div>
              {resume.skills.slice(0, 4).map((sk) => (
                <div
                  key={sk.id}
                  className="px-1.5 py-0.5 rounded text-white truncate"
                  style={{ backgroundColor: tpl.skillBlockBg }}
                >
                  <span className="font-bold">{sk.category}: </span>
                  <span>{sk.items}</span>
                </div>
              ))}
            </div>

            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase mb-0.5"
                style={{ color: tpl.primaryColor }}
              >
                CERTIFICATIONS & LANGUAGES
              </div>
              {resume.certificates.slice(0, 2).map((c) => (
                <div key={c.id} className="truncate text-slate-700">
                  • {c.name} ({c.date})
                </div>
              ))}
              <div className="truncate text-slate-600 mt-0.5">
                {resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(' · ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'navy-floating-card') {
    return (
      <div className="h-full w-full p-2 flex flex-col justify-between text-[5.5px] leading-[1.22] bg-white select-none overflow-hidden">
        {/* Top Split with Floating Contact Card */}
        <div className="grid grid-cols-12 gap-1.5 items-start">
          <div className="col-span-7">
            <div className="text-[8.5px] font-bold leading-none" style={{ color: tpl.primaryColor }}>
              {resume.fullName}
            </div>
            <div className="text-[6px] font-bold mt-0.5" style={{ color: tpl.accentColor }}>
              {resume.jobTitle}
            </div>
            <div className="text-[5px] text-slate-600 line-clamp-2 mt-0.5">
              {stripMd(resume.summary)}
            </div>
          </div>
          <div
            className="col-span-5 rounded p-1.5 text-white text-[5px] flex flex-col gap-0.5"
            style={{ backgroundColor: tpl.sidebarBg }}
          >
            <div className="truncate">{resume.email}</div>
            <div className="truncate">{resume.phone}</div>
            <div className="truncate">{resume.location}</div>
          </div>
        </div>

        {/* Experience + Projects */}
        <div className="grid grid-cols-12 gap-2 flex-1 pt-1">
          <div className="col-span-7 flex flex-col justify-between">
            {firstExp && (
              <div>
                <div
                  className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                  style={{ color: tpl.primaryColor, borderColor: tpl.primaryColor }}
                >
                  WORK EXPERIENCE
                </div>
                <div className="font-bold text-slate-900 truncate">
                  {firstExp.role} — {firstExp.company}
                </div>
                <div className="truncate text-slate-600">• {stripMd(firstExp.bullets[0])}</div>
                <div className="truncate text-slate-600">• {stripMd(firstExp.bullets[1])}</div>
              </div>
            )}
            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                style={{ color: tpl.primaryColor, borderColor: tpl.primaryColor }}
              >
                KEY PROJECTS
              </div>
              {[firstProj, secondProj, thirdProj].filter(Boolean).map((p) => (
                <div key={p!.id} className="truncate text-slate-700">
                  • <span className="font-bold">{p!.title}:</span> {stripMd(p!.bullets[0])}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 flex flex-col justify-between">
            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                style={{ color: tpl.primaryColor, borderColor: tpl.primaryColor }}
              >
                SKILLS
              </div>
              <div className="flex flex-wrap gap-0.5">
                {resume.skills
                  .flatMap((s) => s.items.split(','))
                  .slice(0, 8)
                  .map((item, i) => (
                    <span
                      key={i}
                      className="px-1 py-0.5 rounded-xs text-white text-[4.5px] font-semibold"
                      style={{ backgroundColor: tpl.skillBlockBg }}
                    >
                      {item.trim()}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase border-b pb-0.5 mb-0.5"
                style={{ color: tpl.primaryColor, borderColor: tpl.primaryColor }}
              >
                CERTS & EDU
              </div>
              <div className="truncate font-semibold text-slate-800">{edu?.degree}</div>
              {resume.certificates.slice(0, 2).map((c) => (
                <div key={c.id} className="truncate text-slate-600">
                  • {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'jakes-latex-standard') {
    return (
      <div className="h-full w-full px-2.5 py-2 flex flex-col justify-between text-[5.3px] leading-[1.2] bg-white select-none overflow-hidden font-serif">
        <div className="text-center border-b border-slate-900 pb-1">
          <div className="text-[8.5px] font-bold leading-none text-slate-950">{resume.fullName}</div>
          <div className="text-[5px] text-slate-700 mt-0.5 truncate">
            {resume.phone} | {resume.email} | {resume.linkedin}
          </div>
        </div>

        {edu && (
          <div>
            <div className="text-[5px] font-bold uppercase tracking-wider border-b border-slate-800 mb-0.5">
              EDUCATION
            </div>
            <div className="flex justify-between font-bold text-slate-900 truncate">
              <span>{edu.institution}</span>
              <span className="italic font-normal">{edu.period}</span>
            </div>
            <div className="italic text-slate-700 truncate">{edu.degree}</div>
          </div>
        )}

        {firstExp && (
          <div>
            <div className="text-[5px] font-bold uppercase tracking-wider border-b border-slate-800 mb-0.5">
              EXPERIENCE
            </div>
            <div className="flex justify-between font-bold text-slate-900 truncate">
              <span>
                {firstExp.role} — {firstExp.company}
              </span>
              <span className="italic font-normal">{firstExp.period}</span>
            </div>
            <div className="truncate text-slate-800">• {stripMd(firstExp.bullets[0])}</div>
            <div className="truncate text-slate-800">• {stripMd(firstExp.bullets[1])}</div>
          </div>
        )}

        <div>
          <div className="text-[5px] font-bold uppercase tracking-wider border-b border-slate-800 mb-0.5">
            PROJECTS & TECHNICAL SKILLS
          </div>
          {[firstProj, secondProj].filter(Boolean).map((p) => (
            <div key={p!.id} className="truncate text-slate-800">
              <span className="font-bold">{p!.title}</span> |{' '}
              <span className="italic" style={{ color: tpl.accentColor }}>
                {p!.techTag}
              </span>{' '}
              — {stripMd(p!.bullets[0])}
            </div>
          ))}
          <div className="truncate text-slate-900 mt-0.5">
            <span className="font-bold">Skills:</span>{' '}
            {resume.skills.map((s) => s.items).join(', ')}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'enhancv-bento-modern') {
    return (
      <div className="h-full w-full flex flex-col justify-between text-[5.3px] leading-[1.2] bg-white select-none overflow-hidden">
        <div>
          <div className="h-1 w-full" style={{ backgroundColor: tpl.accentColor }} />
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100">
            <div>
              <div className="text-[8.5px] font-extrabold leading-none" style={{ color: tpl.primaryColor }}>
                {resume.fullName}
              </div>
              <div className="text-[6px] font-bold mt-0.5" style={{ color: tpl.accentColor }}>
                {resume.jobTitle}
              </div>
            </div>
            <div
              className="w-5 h-5 rounded-md text-white font-bold flex items-center justify-center text-[5.5px]"
              style={{ backgroundColor: tpl.primaryColor }}
            >
              VK
            </div>
          </div>
          {/* 4-Card KPI Impact Bento Strip */}
          <div
            className="px-2 py-1 grid grid-cols-4 gap-1 border-b border-slate-200"
            style={{ backgroundColor: tpl.sidebarBg }}
          >
            {[
              ['75% Cut', 'Damage'],
              ['+12% Lift', 'Revenue'],
              ['70+ BI', 'Tableau'],
              ['95% R²', 'ML Model'],
            ].map(([val, lbl]) => (
              <div key={val} className="bg-white p-0.5 rounded border border-slate-200 text-center">
                <div className="font-extrabold font-mono" style={{ color: tpl.accentColor }}>
                  {val}
                </div>
                <div className="text-[4.5px] text-slate-600 truncate">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 grid grid-cols-12 gap-2 flex-1">
          <div className="col-span-7 flex flex-col justify-between">
            {firstExp && (
              <div>
                <div className="font-extrabold uppercase" style={{ color: tpl.primaryColor }}>
                  EXPERIENCE — {firstExp.role}
                </div>
                <div className="truncate text-slate-700">• {stripMd(firstExp.bullets[0])}</div>
                <div className="truncate text-slate-700">• {stripMd(firstExp.bullets[1])}</div>
              </div>
            )}
            <div>
              <div className="font-extrabold uppercase" style={{ color: tpl.primaryColor }}>
                PROJECTS
              </div>
              {[firstProj, secondProj].filter(Boolean).map((p) => (
                <div key={p!.id} className="truncate text-slate-700">
                  • <span className="font-bold">{p!.title}:</span> {stripMd(p!.bullets[0])}
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="font-extrabold uppercase" style={{ color: tpl.primaryColor }}>
                SKILLS BENTO
              </div>
              {resume.skills.slice(0, 3).map((sk) => (
                <div key={sk.id} className="p-1 rounded bg-slate-50 border border-slate-200 truncate">
                  <span className="font-bold">{sk.category}:</span> {sk.items}
                </div>
              ))}
            </div>
            <div className="truncate font-semibold text-slate-700">{edu?.degree}</div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'novoresume-timeline') {
    return (
      <div className="h-full w-full flex flex-col justify-between text-[5.3px] leading-[1.2] bg-white select-none overflow-hidden">
        <div
          className="px-2.5 py-1.5 text-white flex items-center justify-between"
          style={{ backgroundColor: tpl.primaryColor }}
        >
          <div>
            <div className="text-[8.5px] font-extrabold leading-none">{resume.fullName}</div>
            <div className="text-[6px] font-bold mt-0.5" style={{ color: tpl.accentColor }}>
              {resume.jobTitle}
            </div>
          </div>
          <div className="text-right text-[4.8px] text-slate-200">
            <div>{resume.email}</div>
            <div>{resume.phone}</div>
          </div>
        </div>

        <div className="p-2 grid grid-cols-12 gap-2 flex-1">
          <div
            className="col-span-7 border-l-2 pl-2 ml-1 flex flex-col justify-between"
            style={{ borderColor: tpl.accentColor }}
          >
            {firstExp && (
              <div className="relative">
                <span
                  className="w-2 h-2 rounded-full absolute -left-[11px] top-0.5"
                  style={{ backgroundColor: tpl.accentColor }}
                />
                <div className="font-bold text-slate-900 truncate">
                  {firstExp.role} · {firstExp.company}
                </div>
                <div className="truncate text-slate-600">• {stripMd(firstExp.bullets[0])}</div>
                <div className="truncate text-slate-600">• {stripMd(firstExp.bullets[1])}</div>
              </div>
            )}
            {[firstProj, secondProj].filter(Boolean).map((p) => (
              <div key={p!.id} className="relative">
                <span
                  className="w-1.5 h-1.5 rounded-full absolute -left-[10px] top-0.5"
                  style={{ backgroundColor: tpl.primaryColor }}
                />
                <div className="font-bold text-slate-900 truncate">
                  {p!.title} ({p!.techTag})
                </div>
                <div className="truncate text-slate-600">• {stripMd(p!.bullets[0])}</div>
              </div>
            ))}
          </div>

          <div className="col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-extrabold uppercase" style={{ color: tpl.primaryColor }}>
                SKILL METERS
              </div>
              {resume.skills.slice(0, 3).map((sk) => (
                <div key={sk.id}>
                  <div className="font-bold text-slate-800 truncate">{sk.category}</div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: '90%', backgroundColor: tpl.accentColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-slate-900 truncate">{edu?.degree}</div>
              <div className="truncate text-slate-600">• {resume.certificates[0]?.name}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.layout === 'canva-editorial-studio') {
    return (
      <div className="h-full w-full p-2 flex flex-col justify-between text-[5.3px] leading-[1.2] bg-white select-none overflow-hidden">
        <div
          className="p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
          style={{ backgroundColor: tpl.sidebarBg }}
        >
          <div className="min-w-0">
            <div className="text-[4.8px] font-bold uppercase tracking-widest" style={{ color: tpl.accentColor }}>
              EDITORIAL CV · {resume.jobTitle}
            </div>
            <div className="text-[8.5px] font-extrabold leading-none mt-0.5" style={{ color: tpl.primaryColor }}>
              {resume.fullName}
            </div>
            <div className="text-[5px] text-slate-600 truncate mt-0.5">{stripMd(resume.summary)}</div>
          </div>
          <div
            className="w-6 h-6 rounded-full text-white font-bold flex items-center justify-center text-[6px] shrink-0"
            style={{ backgroundColor: tpl.primaryColor }}
          >
            VK
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 flex-1 pt-1.5">
          <div className="col-span-7 flex flex-col justify-between">
            {firstExp && (
              <div>
                <span
                  className="px-1.5 py-0.5 rounded text-white font-bold uppercase text-[4.8px] inline-block mb-0.5"
                  style={{ backgroundColor: tpl.primaryColor }}
                >
                  EXPERIENCE
                </span>
                <div className="font-bold text-slate-900 truncate">
                  {firstExp.role} · {firstExp.company}
                </div>
                <div className="truncate text-slate-700">• {stripMd(firstExp.bullets[0])}</div>
              </div>
            )}
            <div>
              <span
                className="px-1.5 py-0.5 rounded text-white font-bold uppercase text-[4.8px] inline-block mb-0.5"
                style={{ backgroundColor: tpl.primaryColor }}
              >
                PORTFOLIO
              </span>
              {[firstProj, secondProj].filter(Boolean).map((p) => (
                <div key={p!.id} className="truncate text-slate-700">
                  • <span className="font-bold">{p!.title}:</span> {stripMd(p!.bullets[0])}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5">
              <span
                className="px-1.5 py-0.5 rounded text-white font-bold uppercase text-[4.8px] inline-block w-fit"
                style={{ backgroundColor: tpl.accentColor }}
              >
                SKILLS
              </span>
              {resume.skills.slice(0, 3).map((sk) => (
                <div
                  key={sk.id}
                  className="p-1 rounded border border-slate-200 truncate"
                  style={{ backgroundColor: tpl.sidebarBg }}
                >
                  <span className="font-bold">{sk.category}:</span> {sk.items}
                </div>
              ))}
            </div>
            <div className="truncate font-semibold text-slate-800">{edu?.degree}</div>
          </div>
        </div>
      </div>
    );
  }

  // Classic Single, Executive Serif, & Swiss Asymmetric Grid (Fully Filled)
  return (
    <div className="h-full w-full p-2.5 flex flex-col justify-between text-[5.5px] leading-[1.22] bg-white select-none overflow-hidden">
      {/* Header */}
      <div
        className="pb-1 border-b-2 flex items-baseline justify-between gap-2"
        style={{ borderColor: tpl.primaryColor }}
      >
        <div>
          <div className="text-[8.5px] font-extrabold leading-none" style={{ color: tpl.primaryColor }}>
            {resume.fullName}
          </div>
          <div className="text-[6px] font-bold mt-0.5" style={{ color: tpl.accentColor }}>
            {resume.jobTitle}
          </div>
        </div>
        <div className="text-right text-[5px] text-slate-600 truncate">
          <div>{resume.email}</div>
          <div>
            {resume.phone} · {resume.location}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-[5px] text-slate-700 line-clamp-2">{stripMd(resume.summary)}</div>

      {/* Experience & Projects */}
      <div className="grid grid-cols-12 gap-2 flex-1 pt-1">
        <div className="col-span-7 flex flex-col justify-between">
          {firstExp && (
            <div>
              <div
                className="text-[5.5px] font-extrabold uppercase"
                style={{ color: tpl.primaryColor }}
              >
                EXPERIENCE — {firstExp.role} ({firstExp.company})
              </div>
              <div className="truncate text-slate-700">• {stripMd(firstExp.bullets[0])}</div>
              <div className="truncate text-slate-700">• {stripMd(firstExp.bullets[1])}</div>
            </div>
          )}
          <div>
            <div
              className="text-[5.5px] font-extrabold uppercase"
              style={{ color: tpl.primaryColor }}
            >
              KEY PROJECTS
            </div>
            {[firstProj, secondProj, thirdProj].filter(Boolean).map((p) => (
              <div key={p!.id} className="truncate text-slate-700">
                • <span className="font-bold">{p!.title}</span> ({p!.techTag}) —{' '}
                {stripMd(p!.bullets[0])}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <div
              className="text-[5.5px] font-extrabold uppercase mb-0.5"
              style={{ color: tpl.primaryColor }}
            >
              TECHNICAL SKILLS
            </div>
            {resume.skills.slice(0, 4).map((sk) => (
              <div key={sk.id} className="truncate text-slate-700">
                <span className="font-bold">{sk.category}:</span> {sk.items}
              </div>
            ))}
          </div>
          <div
            className="p-1 rounded text-white truncate"
            style={{ backgroundColor: tpl.skillBlockBg }}
          >
            <div className="font-bold truncate">{edu?.degree}</div>
            <div className="opacity-90 truncate">{resume.certificates[0]?.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateGalleryView: React.FC<TemplateGalleryProps> = ({
  resume: propResume,
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const resume =
    propResume && Array.isArray(propResume.experiences) ? propResume : DEFAULT_VINAY_RESUME;
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activePdfPreview, setActivePdfPreview] = useState<string | null>(null);
  const [fullPreviewTemplate, setFullPreviewTemplate] = useState<ResumeTemplateConfig | null>(
    null
  );

  const categories = [
    'All',
    'Internet Trending',
    'Uploaded Reference',
    'Data & Tech',
    'Executive & Consulting',
    'Creative & Editorial',
    'Global & Academic',
  ];

  const filteredTemplates =
    categoryFilter === 'All'
      ? RESUME_TEMPLATES
      : RESUME_TEMPLATES.filter((t) => t.category === categoryFilter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            28 Professional & Internet-Trending ATS Templates (Fully Populated Live Previews)
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Includes your 4 uploaded PDF recreations plus iconic internet-trending formats (Overleaf Jake&apos;s Resume, Enhancv KPI Bento, Novoresume Timeline, Canva Studio, Harvard HBS, and Resume.io).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Reference PDFs Quick Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Your Uploaded Reference PDF Resumes (Vinay Kumar — Data Analyst)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any reference below to apply its live editable template or inspect the original PDF attachment.
            </p>
          </div>
          {activePdfPreview && (
            <button
              type="button"
              onClick={() => setActivePdfPreview(null)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Close PDF Viewer
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {UPLOADED_PDF_ASSETS.map((item) => {
            const matchedTpl = RESUME_TEMPLATES.find((t) => t.id === item.templateId);
            const isSelected = selectedTemplateId === item.templateId;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-colors flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    ATS Score Compatibility · <span className="font-mono">98%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => matchedTpl && onSelectTemplate(matchedTpl)}
                    className="flex-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 whitespace-nowrap"
                  >
                    {isSelected ? 'Active Template' : 'Apply Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePdfPreview(activePdfPreview === item.url ? null : item.url)
                    }
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 whitespace-nowrap"
                  >
                    View PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {activePdfPreview && (
          <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-900">
            <iframe
              src={activePdfPreview}
              title="Uploaded Reference Resume PDF"
              className="w-full h-[520px]"
            />
          </div>
        )}
      </div>

      {/* 24 Templates Grid (Each Card Fully Filled with Live Resume Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((tpl) => {
          const isSelected = tpl.id === selectedTemplateId;
          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-teal-600 ring-2 ring-teal-600/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Fully Populated Miniature Resume Preview */}
                <div
                  onClick={() => setFullPreviewTemplate(tpl)}
                  className="h-48 rounded-lg border border-slate-200 mb-3 overflow-hidden bg-white shadow-xs cursor-pointer group relative"
                  title="Click to inspect full-page populated template"
                >
                  <FilledMiniatureResume tpl={tpl} resume={resume} />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-end justify-end p-2">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Full Preview
                    </span>
                  </div>
                </div>

                {/* Metadata & Title (Zero-Pill Unboxed Metadata Discipline) */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                  <span>{tpl.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">ATS {tpl.atsCompatibility}%</span>
                  {tpl.badgeText && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-teal-700">{tpl.badgeText}</span>
                    </>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Selected Template
                    </>
                  ) : (
                    <>
                      <LayoutTemplate className="w-3.5 h-3.5" />
                      Use This Template
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFullPreviewTemplate(tpl)}
                  aria-label={`Inspect full preview of ${tpl.name}`}
                  className="py-2 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Page Populated Template Modal */}
      {fullPreviewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300">
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {fullPreviewTemplate.name} — Full Populated Resume Preview
                </h3>
                <p className="text-xs text-slate-500">
                  ATS Compatibility {fullPreviewTemplate.atsCompatibility}% · Showing complete data for{' '}
                  {resume.fullName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(fullPreviewTemplate);
                    setFullPreviewTemplate(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700"
                >
                  Apply This Template
                </button>
                <button
                  type="button"
                  onClick={() => setFullPreviewTemplate(null)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close full preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <ResumeCanvas resume={resume} template={fullPreviewTemplate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
