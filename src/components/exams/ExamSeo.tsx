/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exam requirements overview — a long-form, truthful landing page that
 * documents each exam's recorded file requirements, its official source, and
 * the verification status. Everything shown is flagged verified / needs-review,
 * never presented as fact unless sourced.
 */

import React from "react";
import { FileImage, PenTool, Fingerprint, ClipboardList, AlertTriangle, ExternalLink } from "lucide-react";
import { Button, Card } from "../Common";
import { EXAMS } from "../../exams/requirements";
import { ExamRequirementsSection, StatusBadge, Disclaimer } from "../../exams/examUi";
import type { ViewState } from "../../types";

export default function ExamSeo({
  onChangeView,
}: {
  onChangeView?: (view: ViewState) => void;
  onAddToast?: (m: string, t: "success" | "error" | "warning" | "info") => void;
}) {
  const go = (id: string) => onChangeView?.({ type: "tool", id: id as any });

return (
    <div className="space-y-8">
      {/* How it works / honesty block */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card title="1 · Recorded from official sources">
          <p className="text-xs text-text-muted leading-relaxed">
            Every value is tied to an official notification or application guideline with a verification date. We never pull figures from other resizer tools.
          </p>
        </Card>
        <Card title="2 · Verified or flagged">
          <p className="text-xs text-text-muted leading-relaxed">
            Each requirement carries a status: verified, needs-review (unverified — please confirm), or outdated. We never hide uncertainty.
          </p>
        </Card>
        <Card title="3 · You confirm before submitting">
          <p className="text-xs text-text-muted leading-relaxed">
            Requirements change every year. These are a helper, not a guarantee — final acceptance is decided by the application portal.
          </p>
        </Card>
      </div>

      {/* Exam-by-exam requirements */}
      {EXAMS.map((exam) => (
        <section key={exam.id} className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-black text-text-main">{exam.examName} ({exam.year}) — {exam.authority}</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Source: {exam.officialSource} · Last verified: {exam.lastVerified}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go("exam-photo-fixer")} leftIcon={<FileImage className="w-4 h-4" />}>Fix photo</Button>
              <Button variant="outline" onClick={() => go("exam-signature-fixer")} leftIcon={<PenTool className="w-4 h-4" />}>Fix signature</Button>
              <Button variant="primary" onClick={() => go("application-file-checker")} leftIcon={<ClipboardList className="w-4 h-4" />}>Check all</Button>
            </div>
          </div>

          {exam.seo?.faqs && exam.seo.faqs.length > 0 && (
            <p className="text-xs text-text-muted leading-relaxed max-w-3xl">{exam.seo.intro}</p>
          )}

          <ExamRequirementsSection exam={exam} />

          {/* status summary */}
          <div className="flex flex-wrap gap-2">
            {exam.requirements.map((r, i) => (
              <span key={i} className="text-[11px] font-semibold text-text-muted inline-flex items-center gap-1">
                <StatusBadge status={r.status} />
              </span>
            ))}
          </div>
        </section>
      ))}

      {/* Important caution */}
      <div className="flex items-start gap-3 rounded-2xl border border-brand-secondary/30 bg-brand-secondary-light/20 p-4 max-w-3xl">
        <AlertTriangle className="w-5 h-5 text-brand-secondary-hover shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          <span className="font-bold text-brand-secondary-hover">Important:</span> Requirements differ by year, exam, category and application portal, and portals often add their own checks. Treat this page as a starting point and always confirm against the current official instructions for <em>your</em> application before final submission.
        </p>
      </div>

      <div className="max-w-3xl">
        <Disclaimer />
      </div>
    </div>
  );
}
