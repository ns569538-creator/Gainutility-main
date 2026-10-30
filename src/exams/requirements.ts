/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Requirement database for exams & government applications.
 *
 * IMPORTANT (source-of-truth policy):
 *  - Every requirement is tied to an official source and a last-verified date.
 *  - Requirements are verified against official recruitment notifications.
 *  - Anything with status "needs_review" is explicitly surfaced to the user with
 *    "Verify current notification" advice — the tool never claims unverified data as official fact.
 */

import { ExamPreset, DocumentRequirement } from "./examTypes";

/** Number of days before a "verified" preset is shown as needing a re-check. */
export const VERIFIED_MAX_AGE_DAYS = 365;

function doc(
  document: DocumentRequirement["document"],
  formats: string[],
  status: DocumentRequirement["status"],
  partial: Partial<DocumentRequirement> = {}
): DocumentRequirement {
  return { document, formats, status, ...partial };
}

/** Standard photo requirements for central Indian government exams (SSC, IBPS, RRB, etc.) */
const STANDARD_20_50_PHOTO: Partial<DocumentRequirement> = {
  maxKb: 50,
  minKb: 20,
  widthPx: 200,
  heightPx: 230,
  aspectRatio: "0.87 : 1",
  background: "Plain white or light-coloured background",
  notes: [
    "Front-facing portrait with both ears visible and neutral expression.",
    "Do not wear caps, hats, or dark tinted spectacles.",
    "File size must strictly sit between 20 KB and 50 KB in JPG/JPEG format.",
  ],
};

const STANDARD_10_20_SIG: Partial<DocumentRequirement> = {
  maxKb: 20,
  minKb: 10,
  widthPx: 140,
  heightPx: 60,
  background: "White paper with clear black ink",
  notes: [
    "Sign clearly in running handwriting using black or dark blue ink.",
    "Do not sign in ALL CAPITAL LETTERS.",
  ],
};

/**
 * The curated exam database.
 */
export const EXAMS: ExamPreset[] = [
  {
    id: "ssc-cgl",
    examName: "SSC CGL",
    authority: "Staff Selection Commission",
    year: 2026,
    country: "India",
    tagline: "Combined Graduate Level examination — photo & signature.",
    officialSource: "Official SSC notice & application instructions",
    sourceTitle: "SSC CGL Official Notification / Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "ssc-cgl",
    seo: {
      title: "SSC CGL Photo & Signature Resizer — Exact KB & Dimensions",
      description: "Check and fix your SSC CGL photo and signature to the required 20–50 KB and 200×230 px before uploading.",
      intro: "Prepare your SSC CGL photo and signature to the exact dimensions and file size required by the SSC portal.",
      faqs: [
        {
          question: "What is the official photo size for SSC CGL?",
          answer: "SSC CGL requires a 200×230 px photo between 20 KB and 50 KB in JPEG format.",
        },
      ],
    },
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
      doc("thumb", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
    ],
  },
  {
    id: "ssc-chsl",
    examName: "SSC CHSL",
    authority: "Staff Selection Commission",
    year: 2026,
    country: "India",
    tagline: "Combined Higher Secondary Level — photo & signature.",
    officialSource: "Official SSC notice & application instructions",
    sourceTitle: "SSC CHSL Official Notification / Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "ssc-chsl",
    seo: {
      title: "SSC CHSL Photo & Signature Resizer — Exact KB & Dimensions",
      description: "Fix SSC CHSL photo and signature to 20–50 KB and exact dimensions.",
      intro: "Ensure your SSC CHSL photo meets all technical portal requirements.",
      faqs: [],
    },
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
  {
    id: "ssc-gd",
    examName: "SSC GD Constable",
    authority: "Staff Selection Commission",
    year: 2026,
    country: "India",
    tagline: "SSC General Duty Constable examination.",
    officialSource: "Official SSC GD notice",
    sourceTitle: "SSC GD Official Notification",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "ssc-gd",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
  {
    id: "upsc",
    examName: "UPSC Civil Services",
    authority: "Union Public Service Commission",
    year: 2026,
    country: "India",
    tagline: "Civil Services (IAS/IPS), NDA, CDS One Time Registration (OTR).",
    officialSource: "UPSC OTR portal photo guidelines",
    sourceTitle: "UPSC Examination Notice / OTR Instructions",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "upsc",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 20,
        maxKb: 300,
        widthPx: 350,
        heightPx: 350,
        aspectRatio: "1 : 1",
        background: "Plain white background",
        notes: [
          "Square aspect ratio (min 350×350 px, max 1000×1000 px).",
          "File size must be strictly between 20 KB and 300 KB.",
          "Face must occupy 3/4th (75%) of the photograph space.",
        ],
      }),
      doc("signature", ["JPG", "JPEG"], "verified", {
        minKb: 20,
        maxKb: 300,
        widthPx: 350,
        heightPx: 350,
        aspectRatio: "1 : 1",
        background: "White paper with clear black ink",
      }),
    ],
  },
  {
    id: "ibps",
    examName: "IBPS (PO / Clerk / RRB)",
    authority: "Institute of Banking Personnel Selection",
    year: 2026,
    country: "India",
    tagline: "Bank PO, Clerk, SO & Regional Rural Banks recruitment.",
    officialSource: "IBPS official notification guidelines",
    sourceTitle: "IBPS Common Recruitment Process Notice",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "ibps",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
      doc("thumb", ["JPG", "JPEG"], "verified", {
        minKb: 20,
        maxKb: 50,
        widthPx: 240,
        heightPx: 240,
        background: "White paper with blue or black ink",
      }),
      doc("declaration", ["JPG", "JPEG"], "verified", {
        minKb: 50,
        maxKb: 100,
        widthPx: 800,
        heightPx: 400,
      }),
    ],
  },
  {
    id: "sbi",
    examName: "SBI (PO / Clerk)",
    authority: "State Bank of India",
    year: 2026,
    country: "India",
    tagline: "State Bank of India Probationary Officer & Junior Associate recruitment.",
    officialSource: "SBI Recruitment Notification",
    sourceTitle: "SBI Official Recruitment Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "sbi",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
      doc("thumb", ["JPG", "JPEG"], "verified", {
        minKb: 20,
        maxKb: 50,
        widthPx: 240,
        heightPx: 240,
      }),
    ],
  },
  {
    id: "rrb",
    examName: "RRB (NTPC / Group D / ALP)",
    authority: "Railway Recruitment Boards",
    year: 2026,
    country: "India",
    tagline: "Indian Railways non-technical & technical recruitments.",
    officialSource: "Railway Recruitment Board Centralised Employment Notice (CEN)",
    sourceTitle: "RRB CEN Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "rrb",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 20,
        maxKb: 50,
        widthPx: 200,
        heightPx: 230,
        background: "Plain light / white background",
      }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
  {
    id: "neet-ug",
    examName: "NEET UG",
    authority: "National Testing Agency (NTA)",
    year: 2026,
    country: "India",
    tagline: "National Eligibility cum Entrance Test for Medical (MBBS/BDS).",
    officialSource: "NTA NEET UG Information Bulletin",
    sourceTitle: "NEET UG Information Bulletin",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "neet-ug",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 10,
        maxKb: 200,
        widthPx: 400,
        heightPx: 500,
        aspectRatio: "0.80 : 1",
        background: "Plain white background (80% face coverage)",
        notes: [
          "Recent passport photo with 80% face coverage showing ears clearly.",
          "Must be taken against a plain white background.",
          "Size must be between 10 KB and 200 KB in JPG format.",
        ],
      }),
      doc("signature", ["JPG", "JPEG"], "verified", {
        minKb: 4,
        maxKb: 30,
        widthPx: 140,
        heightPx: 60,
      }),
    ],
  },
  {
    id: "jee-main",
    examName: "JEE Main",
    authority: "National Testing Agency (NTA)",
    year: 2026,
    country: "India",
    tagline: "Joint Entrance Examination for Engineering Admissions.",
    officialSource: "NTA JEE Main Information Bulletin",
    sourceTitle: "JEE Main Information Bulletin",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "jee-main",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 10,
        maxKb: 200,
        widthPx: 400,
        heightPx: 500,
        background: "Plain white background (80% face coverage)",
        notes: ["Passport photograph between 10 KB and 200 KB, clear front view."],
      }),
      doc("signature", ["JPG", "JPEG"], "verified", {
        minKb: 4,
        maxKb: 30,
        widthPx: 140,
        heightPx: 60,
      }),
    ],
  },
  {
    id: "ctet",
    examName: "CTET",
    authority: "Central Board of Secondary Education (CBSE)",
    year: 2026,
    country: "India",
    tagline: "Central Teacher Eligibility Test.",
    officialSource: "CBSE CTET Information Bulletin",
    sourceTitle: "CTET Official Notification / Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "ctet",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 10,
        maxKb: 100,
        widthPx: 200,
        heightPx: 230,
        background: "Plain light background",
      }),
      doc("signature", ["JPG", "JPEG"], "verified", {
        minKb: 3,
        maxKb: 30,
        widthPx: 140,
        heightPx: 60,
      }),
    ],
  },
  {
    id: "cuet",
    examName: "CUET (UG / PG)",
    authority: "National Testing Agency (NTA)",
    year: 2026,
    country: "India",
    tagline: "Common University Entrance Test for Central Universities.",
    officialSource: "NTA CUET Information Bulletin",
    sourceTitle: "CUET Official Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "cuet",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 10,
        maxKb: 200,
        widthPx: 200,
        heightPx: 230,
        background: "Plain white background",
      }),
      doc("signature", ["JPG", "JPEG"], "verified", {
        minKb: 4,
        maxKb: 30,
        widthPx: 140,
        heightPx: 60,
      }),
    ],
  },
  {
    id: "upsssc",
    examName: "UPSSSC",
    authority: "Uttar Pradesh Subordinate Services Selection Commission",
    year: 2026,
    country: "India",
    tagline: "UP subordinate services — photo & signature.",
    officialSource: "Official UPSSSC application instructions",
    sourceTitle: "UPSSSC Official Notification / Guidelines",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "upsssc",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
  {
    id: "uppsc",
    examName: "UPPSC",
    authority: "Uttar Pradesh Public Service Commission",
    year: 2026,
    country: "India",
    tagline: "UP public service examinations.",
    officialSource: "Official UPPSC instructions",
    sourceTitle: "UPPSC Official Notification",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "uppsc",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
  {
    id: "bpsc",
    examName: "BPSC",
    authority: "Bihar Public Service Commission",
    year: 2026,
    country: "India",
    tagline: "Bihar public service examinations.",
    officialSource: "Official BPSC instructions",
    sourceTitle: "BPSC Official Notification",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "bpsc",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", {
        minKb: 15,
        maxKb: 50,
        widthPx: 200,
        heightPx: 230,
      }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
  {
    id: "ukpsc",
    examName: "UKPSC",
    authority: "Uttarakhand Public Service Commission",
    year: 2026,
    country: "India",
    tagline: "Uttarakhand public service examinations.",
    officialSource: "Official UKPSC application instructions",
    sourceTitle: "UKPSC Official Notification",
    sourceDate: "2026",
    lastVerified: "2026",
    slug: "ukpsc",
    requirements: [
      doc("photo", ["JPG", "JPEG"], "verified", { ...STANDARD_20_50_PHOTO }),
      doc("signature", ["JPG", "JPEG"], "verified", { ...STANDARD_10_20_SIG }),
    ],
  },
];

/**
 * Create a custom throwaway preset from user-entered rules.
 */
export function customPreset(input: {
  name?: string;
  maxKb?: number;
  minKb?: number;
  widthPx?: number;
  heightPx?: number;
  format?: string;
}): ExamPreset {
  return {
    id: "custom",
    examName: input.name || "Custom requirements",
    authority: "Custom",
    year: new Date().getFullYear(),
    country: "—",
    tagline: "Custom dimensions and file size specified by you.",
    officialSource: "User-defined requirements (Always confirm against current official notification)",
    sourceTitle: "Custom Specification",
    sourceDate: String(new Date().getFullYear()),
    lastVerified: String(new Date().getFullYear()),
    requirements: [
      doc(
        "photo",
        input.format
          ? input.format.split(/[\/,]/).map((s) => s.trim().toUpperCase())
          : ["JPG", "JPEG"],
        "needs_review",
        {
          maxKb: input.maxKb,
          minKb: input.minKb,
          widthPx: input.widthPx,
          heightPx: input.heightPx,
          notes: ["Custom parameters entered by you. Confirm with official instructions before submitting."],
        }
      ),
    ],
  };
}

/** Search presets by name/authority substring. */
export function searchExams(query: string): ExamPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return EXAMS;
  return EXAMS.filter((e) => {
    return (
      e.examName.toLowerCase().includes(q) ||
      e.authority.toLowerCase().includes(q) ||
      e.id.includes(q) ||
      (e.tagline && e.tagline.toLowerCase().includes(q))
    );
  });
}

export function getExam(id: string): ExamPreset | undefined {
  return EXAMS.find((e) => e.id === id);
}

export const DOCUMENT_LABELS: Record<string, string> = {
  photo: "Photo",
  signature: "Signature",
  thumb: "Thumb impression",
  declaration: "Handwritten declaration",
  certificate: "Certificate / document",
  document: "Document",
  pdf: "PDF document",
};

export const DOCUMENT_HINTS: Record<string, string> = {
  photo: "A clear, front-facing photo on a plain light background.",
  signature: "Your handwritten signature in black ink on white paper.",
  thumb: "A clear impression of your thumb, typically on white paper.",
  declaration: "A handwritten declaration exactly as required by the official instructions.",
  certificate: "Supporting certificates or documents you must upload.",
  document: "A scanned document you need to prepare.",
  pdf: "A PDF document compressed to an acceptable size.",
};
