/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Blog figures — small, honest artifacts that carry real information.
 *
 * These are intentionally NOT illustrations. No clip art, no floating
 * document graphics, no invented screenshots. Each figure is a minimal
 * HTML/CSS table, file-flow diagram, or example value that a reader can
 * verify against the article copy. If a figure can't earn its place with
 * real data, the article simply has none.
 */

import React from "react";

/* ------------------------------------------------------------------ */
/* Shared figure frame                                                 */
/* ------------------------------------------------------------------ */

const Figure: React.FC<{ caption: string; children: React.ReactNode }> = ({ caption, children }) => (
  <figure className="my-8">
    <figcaption className="blog-label text-text-muted mb-3">{caption}</figcaption>
    {children}
  </figure>
);

const FileChip: React.FC<{ name: string; highlight?: boolean }> = ({ name, highlight }) => (
  <span
    className={
      highlight
        ? "inline-block border border-brand-primary/50 bg-brand-primary/10 rounded-md px-2.5 py-1.5 font-mono text-[0.8125rem] text-brand-primary leading-none"
        : "inline-block border border-border-light bg-surface-muted rounded-md px-2.5 py-1.5 font-mono text-[0.8125rem] text-text-primary leading-none"
    }
  >
    {name}
  </span>
);

/* ------------------------------------------------------------------ */
/* Metrics example — before/after table of real file values            */
/* ------------------------------------------------------------------ */

export interface ExampleRow {
  label: string;
  before: string;
  after: string;
}

const ExampleTable: React.FC<{ caption: string; rows: ExampleRow[] }> = ({ caption, rows }) => (
  <Figure caption={caption}>
    <div className="overflow-x-auto rounded-lg border border-border-light">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-light bg-surface-muted">
            <th scope="col" className="px-4 py-2.5 blog-label text-text-muted">Metric</th>
            <th scope="col" className="px-4 py-2.5 blog-label text-text-muted">Before</th>
            <th scope="col" className="px-4 py-2.5 blog-label text-text-muted">After</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border-light last:border-b-0">
              <th scope="row" className="px-4 py-2.5 font-medium text-text-primary">
                {row.label}
              </th>
              <td className="px-4 py-2.5 font-mono text-text-muted whitespace-nowrap">{row.before}</td>
              <td className="px-4 py-2.5 font-mono text-text-primary whitespace-nowrap">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Figure>
);

/* ------------------------------------------------------------------ */
/* File flow — inputs becoming one result                              */
/* ------------------------------------------------------------------ */

const FlowDiagram: React.FC<{ caption: string; inputs: string[]; result: string; note?: string }> = ({
  caption,
  inputs,
  result,
  note,
}) => (
  <Figure caption={caption}>
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {inputs.map((name, i) => (
        <React.Fragment key={name}>
          {i > 0 && <span className="text-text-disabled select-none" aria-hidden="true">+</span>}
          <FileChip name={name} />
        </React.Fragment>
      ))}
      <span className="text-text-disabled select-none px-1" aria-hidden="true">→</span>
      <FileChip name={result} highlight />
    </div>
    {note && <p className="mt-3 blog-body text-text-muted text-sm">{note}</p>}
  </Figure>
);

/* ------------------------------------------------------------------ */
/* Transparency legend — checkerboard squares                          */
/* ------------------------------------------------------------------ */

const CheckerLegend: React.FC = () => (
  <Figure caption="How transparency is shown">
    <div className="flex flex-wrap gap-6 items-center">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-block w-8 h-8 rounded border border-border-light"
          style={{
            backgroundImage:
              "conic-gradient(var(--text-muted) 0 25%, transparent 0 50%, var(--text-muted) 0 75%, transparent 0)",
            backgroundSize: "12px 12px",
          }}
        />
        <span className="text-sm text-text-muted">Checkerboard = transparent pixels</span>
      </div>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-block w-8 h-8 rounded border border-border-light bg-surface-muted" />
        <span className="text-sm text-text-muted">Solid = opaque background</span>
      </div>
    </div>
  </Figure>
);

/* ------------------------------------------------------------------ */
/* Size meter — current file vs the upload limit                       */
/* ------------------------------------------------------------------ */

const SizeMeter: React.FC<{ caption: string; currentMb: number; limitMb: number; afterMb?: number }> = ({
  caption,
  currentMb,
  limitMb,
  afterMb,
}) => {
  const scale = Math.max(currentMb, afterMb ?? 0, limitMb) * 1.15;
  const Row: React.FC<{ label: string; value: number; over: boolean; strong?: boolean }> = ({
    label,
    value,
    over,
    strong,
  }) => (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-sm text-text-muted">{label}</span>
      <div className="h-2.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
        <div
          className={
            "h-full rounded-full transition-all " + (over ? "bg-red-500/80" : "bg-brand-primary")
          }
          style={{ width: `${Math.min(100, (value / scale) * 100)}%` }}
        />
      </div>
      <span
        className={
          "w-16 shrink-0 text-right font-mono text-sm " +
          (strong ? "text-text-primary" : "text-text-muted")
        }
      >
        {value.toFixed(1)} MB
      </span>
    </div>
  );

  return (
    <Figure caption={caption}>
      <div className="rounded-lg border border-border-light px-4 py-3 space-y-2">
        <Row label="Your file" value={currentMb} over={currentMb > limitMb} strong />
        <Row label="Upload limit" value={limitMb} over={false} />
        {afterMb !== undefined && <Row label="After" value={afterMb} over={afterMb > limitMb} strong />}
      </div>
    </Figure>
  );
};

/* ------------------------------------------------------------------ */
/* JSON — same payload, minified vs formatted                          */
/* ------------------------------------------------------------------ */

const JsonExample: React.FC<{ caption: string; before: string; after: string }> = ({
  caption,
  before,
  after,
}) => (
  <Figure caption={caption}>
    <div className="space-y-3">
      <div>
        <p className="blog-label text-text-muted mb-1.5">Before — minified</p>
        <pre className="rounded-lg border border-border-light bg-surface-muted px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-text-muted overflow-x-auto">
          {before}
        </pre>
      </div>
      <div>
        <p className="blog-label text-text-muted mb-1.5">After — formatted</p>
        <pre className="rounded-lg border border-border-light bg-surface-base px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-text-primary overflow-x-auto">
          {after}
        </pre>
      </div>
    </div>
  </Figure>
);

/* ------------------------------------------------------------------ */
/* box-shadow research — charts fed by the measured dataset            */
/* ------------------------------------------------------------------ */

import { boxShadowData } from "./boxShadowData";

const fmt = (n: number | null): string => (n == null ? "–" : Number(n.toFixed(2)).toString());

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="rounded-lg border border-border-light px-4 py-3">
    <p className="text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
    <p className="blog-label text-text-muted mt-1">{label}</p>
  </div>
);

const HeadlineStats: React.FC = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <StatCard value={String(boxShadowData.successful)} label="sites crawled with usable CSS" />
    <StatCard value={String(boxShadowData.pxLayers + boxShadowData.remAt16Layers)} label="total shadow layers measured (px)" />
    <StatCard value={String(boxShadowData.distinctPxValues)} label="distinct usable values" />
    <StatCard value={`${boxShadowData.sitesWithShadowPct}%`} label="of sites ship a real box-shadow" />
  </div>
);

const Histogram: React.FC<{ caption: string; title: string; bins: number[]; axis: string; note: string }> = ({
  caption,
  title,
  bins,
  axis,
  note,
}) => {
  const max = Math.max(...bins, 1);
  const W = 560;
  const H = 190;
  const padL = 30;
  const padB = 24;
  const bw = W / bins.length;
  const ticks = 4;
  return (
    <Figure caption={caption}>
      <div className="rounded-lg border border-border-light p-4">
        <p className="blog-label text-text-muted mb-3">{title}</p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${caption} (${bins.length} bins, ${axis} on the horizontal axis, count on the vertical axis)`}
          className="w-full text-brand-primary"
        >
          {Array.from({ length: ticks + 1 }, (_, i) => {
            const y = (H - padB) * (i / ticks);
            return (
              <line
                key={i}
                x1={padL}
                y1={y}
                x2={W}
                y2={y}
                stroke="var(--border-light)"
                strokeWidth={1}
              />
            );
          })}
          {bins.map((v, i) => {
            const h = (H - padB) * (v / max);
            const x = padL + i * bw + (bw - 1) / 2;
            return v <= 0 ? null : (
              <rect key={i} x={x} y={H - padB - h} width={Math.max(0.75, bw - 1)} height={h} fill="currentColor" />
            );
          })}
          {Array.from({ length: ticks + 1 }, (_, i) => (
            <text key={i} x={padL - 6} y={7 + (H - padB) * (1 - i / ticks)} textAnchor="end" fontSize={11} fill="var(--text-muted)">
              {Math.round(max * (i / ticks))}
            </text>
          ))}
          {[0, Math.floor(bins.length / 2), bins.length - 1].map((i) => (
            <text key={i} x={padL + i * bw} y={H - 7} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
              {axis.includes("y") ? i : i === bins.length - 1 ? `${i}+` : i}
            </text>
          ))}
        </svg>
        <p className="mt-2 blog-label text-text-muted">{axis}</p>
      </div>
      <p className="mt-2 blog-body text-text-muted text-sm">{note}</p>
    </Figure>
  );
};

const BarRows: React.FC<{ caption: string; rows: { label: string; value: number; pct?: number }[] }> = ({
  caption,
  rows,
}) => {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <Figure caption={caption}>
      <div className="rounded-lg border border-border-light px-4 py-3 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-text-muted">{row.label}</span>
            <div className="h-2.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-primary"
                style={{ width: `${Math.min(100, (row.value / max) * 100)}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-sm text-text-muted">
              {row.value.toLocaleString()}
              {row.pct != null && <span className="text-text-disabled"> · {row.pct}%</span>}
            </span>
          </div>
        ))}
      </div>
    </Figure>
  );
};

const TopValues: React.FC = () => {
  const keep = boxShadowData.topValues.filter((v, i) => i < 12 || v.kind !== "varPartial");
  return (
    <Figure caption="The most-shipped shadows, by number of sites where the value appears">
      <div className="overflow-x-auto rounded-lg border border-border-light">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-light bg-surface-muted">
              <th scope="col" className="px-4 py-2.5 blog-label text-text-muted">Value</th>
              <th scope="col" className="px-4 py-2.5 blog-label text-text-muted text-right whitespace-nowrap">Sites</th>
              <th scope="col" className="px-4 py-2.5 blog-label text-text-muted text-right whitespace-nowrap">Declarations</th>
            </tr>
          </thead>
          <tbody>
            {keep.map((v) => (
              <tr key={v.value} className="border-b border-border-light last:border-b-0">
                <td className="px-4 py-2 font-mono text-[0.8125rem] text-text-primary align-top break-words">{v.value}</td>
                <td className="px-4 py-2 font-mono text-text-muted text-right align-top whitespace-nowrap">{v.sites}</td>
                <td className="px-4 py-2 font-mono text-text-muted text-right align-top whitespace-nowrap">{v.decls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
};

const DatasetCard: React.FC = () => (
  <Figure caption="Check the numbers yourself">
    <div className="rounded-lg border border-border-light px-4 py-4 space-y-2">
      <p className="blog-body text-sm text-text-muted">
        Every measured value, per site: <span className="font-mono text-text-primary">box-shadow-values.csv</span> (columns
        domains, value, declarations, kind), regenerated from the pinned Tranco list.
      </p>
      <p className="blog-body text-sm text-text-muted">
        The crawler and analyzer used to collect it live in the repo under <span className="font-mono text-text-primary">scripts/</span>:
        <span className="font-mono text-text-primary"> collect-box-shadow.mjs</span> and <span className="font-mono text-text-primary"> analyze-box-shadow.mjs</span>.
      </p>
      <a
        href="/research/box-shadow-values.csv"
        download="box-shadow-values.csv"
        className="inline-block rounded-md border border-brand-primary/50 bg-brand-primary/10 px-3 py-1.5 text-sm text-brand-primary hover:bg-brand-primary/15"
      >
        Download the dataset (CSV)
      </a>
    </div>
  </Figure>
);

/* ------------------------------------------------------------------ */
/* Registry — figures keyed by article slug                            */
/* ------------------------------------------------------------------ */

const INLINE_FIGURES: Record<string, React.ReactNode> = {
  "box-shadow-headline-stats": <HeadlineStats />,
  "box-shadow-y-offset": (
    <Histogram
      caption="Vertical offset (Y) across 21,887 measured layers"
      title="Where the shadow is placed vertically"
      bins={boxShadowData.yHistogram}
      axis="y offset in px — 0 is level with the box, negative values read upward"
      note="Almost half of all layers sit exactly at 0. When a site does offset, it is downward and small — the busiest bin after 0 is 1–2 px."
    />
  ),
  "box-shadow-blur": (
    <Histogram
      caption="Blur radius across 21,887 measured layers"
      title="How much the shadow is softened"
      bins={boxShadowData.blurHistogram}
      axis="blur in px"
      note="39.8% of layers use blur 0 — those are focus rings and thin borders, not glows. Among soft shadows, single-digit blurs dominate: the 75th percentile is 10 px."
    />
  ),
  "box-shadow-spread-inset": (
    <BarRows
      caption="Spread and inset across 21,887 measured layers"
      rows={[
        { label: "No spread", value: Math.round((boxShadowData.details.spreadZeroPct / 100) * boxShadowData.pxLayers), pct: boxShadowData.details.spreadZeroPct },
        { label: "Positive spread", value: Math.round((boxShadowData.details.spreadPositivePct / 100) * boxShadowData.pxLayers), pct: boxShadowData.details.spreadPositivePct },
        { label: "Negative spread", value: Math.round((boxShadowData.details.spreadNegativePct / 100) * boxShadowData.pxLayers), pct: boxShadowData.details.spreadNegativePct },
        { label: "Inset shadows", value: Math.round((boxShadowData.details.insetLayersPct / 100) * boxShadowData.pxLayers), pct: boxShadowData.details.insetLayersPct },
      ]}
    />
  ),
  "box-shadow-alpha": (
    <BarRows
      caption="Shadow opacity across 21,887 measured layers"
      rows={boxShadowData.alphaBuckets.map((b) => ({ label: b.label, value: b.value }))}
    />
  ),
  "box-shadow-layers": (
    <BarRows caption="Layers per declaration (of 14,517 resolvable declarations)" rows={boxShadowData.layerOverview} />
  ),
  "box-shadow-top-values": <TopValues />,
  "box-shadow-dataset": <DatasetCard />,
};

export const InlineFigure: React.FC<{ figureKey: string }> = ({ figureKey }) =>
  INLINE_FIGURES[figureKey] ? <div>{INLINE_FIGURES[figureKey]}</div> : null;

const FIGURES: Record<string, React.ReactNode> = {
  "how-to-make-a-transparent-png": (
    <CheckerLegend />
  ),
  "how-to-merge-pdf-files": (
    <FlowDiagram
      caption="One set of files, one document"
      inputs={["scan-1.pdf", "scan-2.pdf", "scan-3.pdf"]}
      result="scan-all.pdf"
      note="The merged file reads in the order the files sit in the list — number the sources and the result follows."
    />
  ),
  "how-to-split-a-pdf": (
    <FlowDiagram
      caption="Extract only what you need"
      inputs={["report.pdf (8 pages)"]}
      result="report-pages-1-3.pdf"
      note="A range extraction keeps pages 1–3 and leaves the original file untouched."
    />
  ),
  "how-to-convert-pdf-to-jpg": (
    <FlowDiagram
      caption="Every page becomes its own image"
      inputs={["notes.pdf (3 pages)"]}
      result={["notes-page-1.jpg", "notes-page-2.jpg", "notes-page-3.jpg"].join(",  ")}
      note="Choose a page range up front so you export the two images you need, not the seven you don't."
    />
  ),
  "how-to-convert-jpg-to-pdf": (
    <FlowDiagram
      caption="Images in reading order become one PDF"
      inputs={["page-01.jpg", "page-02.jpg", "page-03.jpg"]}
      result="notes.pdf"
      note="Rename the images first (page-01, page-02…) so any upload order sorts itself into reading order."
    />
  ),
  "how-to-compress-an-image": (
    <ExampleTable
      caption="What the two dials do to one photo"
      rows={[
        { label: "File", before: "photo.jpg", after: "photo.jpg" },
        { label: "Dimensions", before: "4000 × 3000", after: "2000 × 1500" },
        { label: "Quality", before: "92", after: "62" },
        { label: "Size", before: "4.8 MB", after: "1.2 MB" },
      ]}
    />
  ),
  "how-to-resize-an-image": (
    <ExampleTable
      caption="One camera shot, resized for a listing form"
      rows={[
        { label: "Dimensions", before: "4032 × 3024", after: "1200 × 900" },
        { label: "Width", before: "4032 px", after: "1200 px" },
        { label: "Size", before: "4.6 MB", after: "780 KB" },
        { label: "Limit", before: "—", after: "1 MB" },
      ]}
    />
  ),
  "how-to-compress-a-pdf": (
    <ExampleTable
      caption="One scanned report, medium compression"
      rows={[
        { label: "File", before: "report-scan.pdf", after: "report-scan.pdf" },
        { label: "Size", before: "12.4 MB", after: "4.5 MB" },
        { label: "Reading", before: "full quality", after: "still legible" },
      ]}
    />
  ),
  "fix-pdf-too-big-to-upload": (
    <SizeMeter
      caption="Before and after a submission limit"
      currentMb={9.1}
      limitMb={5}
      afterMb={3.2}
    />
  ),
  "format-and-debug-json-when-api-responses-are-unreadable": (
    <JsonExample
      caption="The same payload, twice"
      before={'{"name":"gau","active":true,"items":[{"id":1,"qty":2}],"ok":true}'}
      after={
        [
          "{",
          '  "name": "gau",',
          '  "active": true,',
          '  "items": [',
          "    {",
          '      "id": 1,',
          '      "qty": 2',
          "    }",
          "  ],",
          '  "ok": true',
          "}",
        ].join("\n")
      }
    />
  ),
  "box-shadow-values-real-websites": <HeadlineStats />,
};

export const ArticleFigure: React.FC<{ slug: string }> = ({ slug }) => {
  const figure = FIGURES[slug];
  return figure ? <div aria-hidden="false">{figure}</div> : null;
};