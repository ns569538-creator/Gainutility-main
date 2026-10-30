/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exam Selector — the hub that ties the Application File Checker suite together.
 * Lets you browse exams / applications and jump straight to the right fixer
 * (photo, signature, thumb, declaration, PDF) or the full checklist.
 */

import React, { useState } from "react";
import {
  FileImage,
  PenTool,
  Fingerprint,
  FileSignature,
  FileText,
  ClipboardList,
  Search,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button, Card } from "../Common";
import { EXAMS } from "../../exams/requirements";
import { ExamPreset } from "../../exams/examTypes";
import { ExamRequirementsSection, Disclaimer } from "../../exams/examUi";
import type { ViewState, ToolId } from "../../types";

interface FixerEntry {
  id: ToolId;
  name: string;
  desc: string;
  icon: React.ReactNode;
}

const FIXERS: FixerEntry[] = [
  { id: "exam-photo-fixer", name: "Exam Photo Resizer", desc: "Resize, crop & compress your photo to the exact KB and pixels.", icon: <FileImage className="w-5 h-5" /> },
  { id: "exam-signature-fixer", name: "Exam Signature Resizer", desc: "Clean the background, sharpen and size your signature.", icon: <PenTool className="w-5 h-5" /> },
  { id: "exam-thumb-fixer", name: "Thumb Impression Resizer", desc: "Clean, sharpen and compress your thumb impression.", icon: <Fingerprint className="w-5 h-5" /> },
  { id: "declaration-fixer", name: "Declaration Photo Compressor", desc: "Compress your handwritten declaration photo/scan to the size limit.", icon: <FileSignature className="w-5 h-5" /> },
  { id: "pdf-exact-size", name: "PDF Size Reducer for Applications", desc: "Reduce a PDF so it fits your application's size limit.", icon: <FileText className="w-5 h-5" /> },
  { id: "application-file-checker", name: "Application File Checker", desc: "The full checklist — check, fix and download all your files.", icon: <ClipboardList className="w-5 h-5" /> },
];

export default function ExamSelector({
  onAddToast,
  onChangeView,
}: {
  onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExamPreset | null>(null);
  const results = query.trim() ? EXAMS.filter((e) => e.examName.toLowerCase().includes(query.toLowerCase()) || e.authority.toLowerCase().includes(query.toLowerCase())) : EXAMS;

  const go = (id: ToolId) => onChangeView?.({ type: "tool", id });

  void onAddToast;

  return (
    <div className="space-y-6">
      {/* Fixer chooser */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FIXERS.map((f) => (
          <button
            key={f.id}
            onClick={() => go(f.id)}
            className="group border border-border-light rounded-2xl bg-surface-base p-4 hover:border-brand-primary hover:shadow-sm transition-all text-left cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">{f.icon}</span>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
            </div>
            <p className="mt-3 font-bold text-text-main text-sm">{f.name}</p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Exam browse */}
      <Card
        title="Browse exams & applications"
        subtitle="Choose an exam to see its requirements and the document checklist."
        extra={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exam…"
              className="pl-9 pr-3 py-2.5 w-full rounded-xl border border-border-light bg-surface-base focus:border-brand-primary outline-none text-sm"
              aria-label="Search exams"
            />
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(selected?.id === e.id ? null : e)}
              className={`text-left border rounded-2xl p-4 transition-all cursor-pointer ${
                selected?.id === e.id ? "border-brand-primary bg-brand-primary-light/30" : "border-border-light bg-surface-base hover:border-brand-primary"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-text-main text-sm">{e.examName} {e.year}</p>
                <span className="text-[10px] font-semibold text-text-muted">{e.country}</span>
              </div>
              <p className="mt-1 text-xs text-text-muted line-clamp-2">{e.tagline}</p>
            </button>
          ))}
          {results.length === 0 && <p className="text-sm text-text-muted sm:col-span-3">No exam matches “{query}”. Use the Custom option inside a fixer, or the Declaration / PDF tools.</p>}
        </div>
      </Card>

      {selected && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-black text-text-main">{selected.examName} {selected.year} — file requirements</h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={() => go("exam-photo-fixer")} leftIcon={<FileImage className="w-4 h-4" />}>Fix my photo</Button>
            <Button variant="outline" onClick={() => go("exam-signature-fixer")} leftIcon={<PenTool className="w-4 h-4" />}>Fix my signature</Button>
            <Button variant="outline" onClick={() => go("exam-thumb-fixer")} leftIcon={<Fingerprint className="w-4 h-4" />}>Fix my thumb impression</Button>
            <Button variant="primary" onClick={() => go("application-file-checker")} leftIcon={<ClipboardList className="w-4 h-4" />}>Full checklist</Button>
          </div>
          <ExamRequirementsSection exam={selected} />
          {selected.seo?.faqs && selected.seo.faqs.length > 0 && (
            <div className="space-y-3">
              {selected.seo.faqs.map((f, i) => (
                <div key={i} className="border border-border-light rounded-2xl bg-surface-base p-4">
                  <p className="font-bold text-text-main text-sm">Q: {f.question}</p>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="max-w-3xl">
        <Disclaimer />
      </div>
    </div>
  );
}
