/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Anonymous star-rating widget for the 11 flagship Popular Tools.
 *
 * Rendered by Layout.tsx at the bottom of every tool page (after the related
 * tools grid and before the footer) so there is exactly one ratings surface
 * per page. The widget is only visible after the user completes their task
 * (the `completed` prop gates rendering), so it never competes with the
 * primary tool action.
 *
 * Behavior:
 *  - SSR/prerender and first client render are identical (no aggregate line),
 *    then the summary is fetched on mount — no hydration mismatch.
 *  - A localStorage marker marks the visitor as having rated this tool so the
 *    input is replaced by the "Thanks for rating!" confirmation state and
 *    duplicate submissions are prevented client-side. The server enforces its
 *    own per-IP limits too.
 *  - Default state: compact 5-star selector with "How helpful was it?" label.
 *    Hovering fills stars and reveals only the hovered label.
 *  - On successful submission the widget locks to a passive confirmation:
 *    "Thanks for rating!" — the interactive stars are never shown again.
 *  - On failure an inline error is shown and the rating controls remain
 *    available for retry.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Card } from "./Common";

const RATING_OPTIONS = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Love it" },
] as const;

type RatingValue = (typeof RATING_OPTIONS)[number]["value"];

interface RatingSummary {
  count: number;
  average: number;
}

interface RatingSectionProps {
  toolSlug: string;
}

const storageKey = (slug: string): string => `gainutility:rating:v1:${slug}`;

const formatAverage = (average: number): string =>
  (Math.round(average * 10) / 10).toFixed(1);

export const RatingSection: React.FC<RatingSectionProps> = ({ toolSlug }) => {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [summaryFailed, setSummaryFailed] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<RatingValue | null>(null);
  const [hoverRating, setHoverRating] = useState<RatingValue | 0>(0);
  const [pendingRating, setPendingRating] = useState<RatingValue | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const requestLock = useRef(false);

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/ratings?tool_slug=${encodeURIComponent(toolSlug)}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { count?: number; average?: number };
      setSummary({
        count: Math.max(0, Number(data?.count) || 0),
        average: Math.max(0, Number(data?.average) || 0),
      });
      setSummaryFailed(false);
    } catch {
      setSummaryFailed(true);
    }
  }, [toolSlug]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey(toolSlug));
      if (stored) {
        const parsed = JSON.parse(stored) as { rating?: number };
        const rating = parsed?.rating;
        if (typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5) {
          setSubmittedRating(rating as RatingValue);
        }
      }
    } catch {
      /* storage unavailable — still allow one submission per session */
    }
    void loadSummary();
  }, [loadSummary, toolSlug]);

  const submitRating = useCallback(
    async (value: RatingValue) => {
      if (submittedRating !== null || pendingRating !== null || requestLock.current) return;
      requestLock.current = true;
      setPostError(null);
      setPendingRating(value);
      try {
        const res = await fetch("/api/ratings", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ tool_slug: toolSlug, rating: value }),
        });
        if (!res.ok) {
          let message = "Couldn't submit your rating. Please try again.";
          try {
            const body = (await res.json()) as { error?: string };
            if (body?.error) message = body.error;
          } catch {
            /* keep default message */
          }
          throw new Error(message);
        }
        setSubmittedRating(value);
        setPostError(null);
        try {
          window.localStorage.setItem(
            storageKey(toolSlug),
            JSON.stringify({ rating: value })
          );
        } catch {
          /* storage unavailable — the rating was still stored server-side */
        }
        void loadSummary();
      } catch (err) {
        setPostError(
          err instanceof Error ? err.message : "Couldn't submit your rating. Please try again."
        );
      } finally {
        requestLock.current = false;
        setPendingRating(null);
      }
    },
    [submittedRating, pendingRating, toolSlug, loadSummary]
  );

  const hasSummary = summary !== null;
  const hasRatings = hasSummary && summary.count > 0;

  const locked = submittedRating !== null;
  const displayed = hoverRating > 0 ? hoverRating : (submittedRating ?? pendingRating ?? 0);
  const displayedOption = displayed > 0
    ? RATING_OPTIONS.find((o) => o.value === displayed)
    : undefined;
  const submittedOption = submittedRating !== null
    ? RATING_OPTIONS.find((o) => o.value === submittedRating)
    : undefined;

  const renderStars = (value: number, sizeClass: string) => (
    <div className="flex items-center gap-1" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${sizeClass} transition-all duration-150 ${
            i <= value
              ? "fill-brand-primary text-brand-primary"
              : "text-border-light"
          }`}
        />
      ))}
    </div>
  );

  return (
    <section className="w-full" aria-label="Rate this tool">
      {locked && submittedOption ? (
        /* ---- POST-SUBMIT: passive confirmation, no interactive stars ---- */
        <div
          className="flex flex-col items-center gap-2 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 px-4 py-6 text-center"
          role="status"
        >
          {renderStars(submittedOption.value, "w-5 h-5 sm:w-6 sm:h-6")}
          <p className="text-base font-semibold text-text-main">Thanks for rating!</p>
          {hasRatings && (
            <p className="text-[13px] text-text-muted">
              {formatAverage(summary.average)} / 5 ·{" "}
              {summary.count} {summary.count === 1 ? "rating" : "ratings"}
            </p>
          )}
        </div>
      ) : (
        /* ---- DEFAULT / ERROR: compact interactive rating ---- */
        <Card
          title="How was your experience?"
          subtitle="Anonymous 1–5 rating. Your feedback helps others pick the right tool."
        >
          <div className="flex flex-col gap-4">
            {hasRatings && (
              <div className="text-sm text-text-sub font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {renderStars(Math.round(summary.average), "w-4 h-4")}
                <span className="font-semibold text-text-main">
                  {formatAverage(summary.average)} / 5
                </span>
                <span aria-hidden="true" className="text-text-muted">·</span>
                <span className="text-text-muted">
                  {summary.count} {summary.count === 1 ? "rating" : "ratings"}
                </span>
              </div>
            )}

            {hasSummary && !hasRatings && !summaryFailed && (
              <p className="text-[13px] text-text-muted leading-relaxed">
                No ratings yet — be the first to share your feedback.
              </p>
            )}

            {summaryFailed && (
              <p className="text-[13px] text-text-muted leading-relaxed" role="status">
                Ratings are temporarily unavailable. The tool works normally.
              </p>
            )}

            <div className="w-full">
              <div
                role="group"
                aria-label="Rate this tool from 1 to 5"
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="flex items-center justify-center gap-1 sm:gap-1.5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {RATING_OPTIONS.map((option) => {
                    const filled = option.value <= displayed;
                    const disabled = pendingRating !== null;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => void submitRating(option.value)}
                        onMouseEnter={() => { if (!disabled) setHoverRating(option.value); }}
                        onFocus={() => { if (!disabled) setHoverRating(option.value); }}
                        onBlur={() => setHoverRating(0)}
                        disabled={disabled}
                        aria-label={`Rate this tool ${option.value} out of 5 — ${option.label}`}
                        className="group relative p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Star
                          aria-hidden="true"
                          className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-150 ${
                            filled
                              ? "fill-brand-primary text-brand-primary scale-105"
                              : "text-border-light group-hover:scale-105"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div
                  className="min-h-[18px] text-xs sm:text-sm font-semibold text-brand-primary transition-opacity duration-150"
                  aria-live="polite"
                >
                  {displayedOption ? displayedOption.label : "How helpful was it?"}
                </div>
              </div>
              {pendingRating !== null && (
                <p className="mt-2 text-center text-[13px] text-text-muted" role="status">
                  Submitting your rating…
                </p>
              )}
              {postError && (
                <p className="mt-2 text-center text-[13px] text-status-error" role="alert">
                  {postError}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  );
};
