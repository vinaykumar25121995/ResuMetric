import React, { useState } from 'react';
import { Grid, Maximize2, Printer, Ruler, X } from 'lucide-react';
import { ResumeData, ResumeTemplateConfig } from '../types/resume.ts';
import { ResumeCanvas } from './ResumeCanvas.tsx';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  template: ResumeTemplateConfig;
  highlightKeywords?: string[];
  onTriggerPrint: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  resume,
  template,
  highlightKeywords = [],
  onTriggerPrint,
}) => {
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex flex-col overflow-hidden"
    >
      {/* Top Control Header (Hidden during actual browser print) */}
      <div className="no-print bg-slate-900 border-b border-slate-800 px-6 py-3.5 text-white flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 id="print-preview-modal-title" className="text-base font-bold text-white">
              Print Preview — {template.name}
            </h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono tabular-nums text-teal-400">
              ATS Compatibility {template.atsCompatibility}%
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-300">A4 (210 × 297 mm)</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect typographic alignment with 12-column grid lines and 0.5 in (12.7 mm) ATS safe print margin guides. Guides automatically hide during final print.
          </p>
        </div>

        {/* Interactive Guide Toggles, Zoom & Print Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Grid Lines */}
          <button
            type="button"
            aria-pressed={showGridLines}
            onClick={() => setShowGridLines((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showGridLines
                ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid Lines: {showGridLines ? 'ON' : 'OFF'}
          </button>

          {/* Toggle Margin Guides */}
          <button
            type="button"
            aria-pressed={showMarginGuides}
            onClick={() => setShowMarginGuides((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showMarginGuides
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Margin Guides: {showMarginGuides ? 'ON' : 'OFF'}
          </button>

          {/* Zoom Level Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {[90, 100, 110].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoomPercent(z)}
                className={`px-2 py-0.5 rounded font-mono tabular-nums text-[11px] font-semibold transition-colors ${
                  zoomPercent === z
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {z}%
              </button>
            ))}
          </div>

          {/* Final Print Action */}
          <button
            type="button"
            onClick={onTriggerPrint}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Print Preview"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Legend Strip */}
      <div className="no-print bg-slate-900/90 border-b border-slate-800 px-6 py-1.5 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs border border-teal-400 bg-teal-400/20 inline-block" />
            <span>
              <strong>12-Column Baseline Grid:</strong> {showGridLines ? 'Visible (24px vertical rhythm)' : 'Hidden'}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-amber-400 bg-amber-400/20 inline-block" />
            <span>
              <strong>ATS Safe Print Margins:</strong> {showMarginGuides ? 'Visible (0.5 in / 12.7 mm bleed zone)' : 'Hidden'}
            </span>
          </span>
        </div>
        <div className="font-mono text-slate-400">
          Candidate: {resume.fullName} · {resume.jobTitle}
        </div>
      </div>

      {/* Scrollable High-Fidelity A4 Preview Stage */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center items-start bg-slate-900/60">
        <div
          className="relative transition-transform origin-top"
          style={{
            transform: `scale(${zoomPercent / 100})`,
            width: '100%',
            maxWidth: '860px',
          }}
        >
          {/* High-Fidelity Resume Canvas */}
          <ResumeCanvas
            resume={resume}
            template={template}
            highlightKeywords={highlightKeywords}
          />

          {/* OVERLAY 1: 12-Column & 24px Baseline Typographic Grid Lines */}
          {showGridLines && (
            <div
              data-testid="print-preview-grid-overlay"
              className="no-print pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-sm"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(13, 148, 136, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(13, 148, 136, 0.14) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* 12-Column Structural Vertical Tracks */}
              <div className="h-full w-full grid grid-cols-12 gap-4 px-8">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-full border-x border-teal-500/20 bg-teal-500/[0.02] flex flex-col justify-between items-center py-1"
                  >
                    <span className="text-[8px] font-mono font-bold text-teal-700/70 bg-white/80 px-1 rounded">
                      C{idx + 1}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-teal-700/70 bg-white/80 px-1 rounded">
                      C{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERLAY 2: 0.5 in (12.7mm / 32px) ATS Safe Print Margin Guides */}
          {showMarginGuides && (
            <div
              data-testid="print-preview-margin-overlay"
              className="no-print pointer-events-none absolute inset-0 z-30 p-7 flex flex-col justify-between"
            >
              <div className="w-full h-full border-2 border-dashed border-amber-500/80 relative rounded-xs">
                {/* Top Margin Label */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase whitespace-nowrap">
                  TOP MARGIN GUIDE · 0.5 IN (12.7 MM) ATS SAFE PRINT BOUNDARY
                </div>

                {/* Bottom Margin Label */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase whitespace-nowrap">
                  BOTTOM MARGIN GUIDE · 0.5 IN (12.7 MM) ATS SAFE PRINT BOUNDARY
                </div>

                {/* Left Margin Label */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 bg-amber-500 text-slate-950 text-[8.5px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-xs tracking-wider uppercase whitespace-nowrap">
                  LEFT 0.5 IN SAFE MARGIN
                </div>

                {/* Right Margin Label */}
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 rotate-90 bg-amber-500 text-slate-950 text-[8.5px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-xs tracking-wider uppercase whitespace-nowrap">
                  RIGHT 0.5 IN SAFE MARGIN
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
