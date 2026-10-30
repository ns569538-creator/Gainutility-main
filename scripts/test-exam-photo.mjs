import assert from "node:assert";
import { readExifOrientation } from "../src/exams/imageEngine.ts";
import { assessCompliance } from "../src/exams/validate.ts";
import { EXAMS } from "../src/exams/requirements.ts";

console.log("=== RUNNING EXAM PHOTO FIXER REGRESSION SUITE ===");

// ── TEST 1: PRESETS EXISTENCE & SPEC INTEGRITY ──
console.log("\n[TEST 1] Presets Integrity Check:");
const requiredExams = [
  "ssc-cgl",
  "ssc-chsl",
  "upsc",
  "ibps",
  "sbi",
  "rrb",
  "neet-ug",
  "jee-main",
  "ctet",
  "cuet",
  "upsssc",
  "bpsc",
  "ukpsc",
  "uppsc",
];

for (const id of requiredExams) {
  const found = EXAMS.find((e) => e.id === id);
  assert.ok(found, `Preset ${id} must exist in EXAMS database`);
  assert.ok(found.sourceTitle, `Preset ${id} must have official sourceTitle`);
  assert.ok(found.lastVerified, `Preset ${id} must have lastVerified year/date`);
  const photo = found.requirements.find((r) => r.document === "photo");
  assert.ok(photo, `Preset ${id} must have photo requirements`);
  assert.ok(photo.maxKb && photo.maxKb > 0, `Preset ${id} photo must define maxKb`);
  console.log(`  ✓ ${found.examName}: ${photo.minKb ? `${photo.minKb}–` : ""}${photo.maxKb} KB, ${photo.widthPx}×${photo.heightPx} px`);
}

// ── TEST 2: VALIDATION LOGIC FOR 20-50 KB RANGE ──
console.log("\n[TEST 2] Range Compliance Check (Target: 20-50 KB, 200x230 px, JPG):");
const sscReq = EXAMS.find((e) => e.id === "ssc-cgl").requirements.find((r) => r.document === "photo");

// Scenario A: 13 KB (The original failure reported by user)
const result13kb = assessCompliance(sscReq, {
  size: 13 * 1024,
  width: 200,
  height: 230,
  format: "image/jpeg",
});
assert.strictEqual(result13kb.allPassed, false, "13 KB MUST FAIL 20-50 KB range requirement");
assert.strictEqual(result13kb.status, "not_ready", "Status must be NOT READY");
const sizeCheck13 = result13kb.checks.find((c) => c.id === "size");
assert.strictEqual(sizeCheck13.passed, false, "Size check must report false for 13 KB");
console.log("  ✓ 13 KB output properly fails validation (Status: NOT READY, sizeCheck.passed = false)");

// Scenario B: 32 KB (Valid inside range)
const result32kb = assessCompliance(sscReq, {
  size: 32 * 1024,
  width: 200,
  height: 230,
  format: "image/jpeg",
});
assert.strictEqual(result32kb.allPassed, true, "32 KB must pass 20-50 KB range requirement");
assert.strictEqual(result32kb.status, "ready", "Status must be READY");
console.log("  ✓ 32 KB output successfully passes validation (Status: READY TO UPLOAD)");

// Scenario C: 52 KB (Exceeds maximum limit)
const result52kb = assessCompliance(sscReq, {
  size: 52 * 1024,
  width: 200,
  height: 230,
  format: "image/jpeg",
});
assert.strictEqual(result52kb.allPassed, false, "52 KB MUST FAIL max 50 KB requirement");
console.log("  ✓ 52 KB output properly fails validation");

// Scenario D: Wrong dimensions (200x200 px instead of 200x230 px)
const resultWrongDim = assessCompliance(sscReq, {
  size: 35 * 1024,
  width: 200,
  height: 200,
  format: "image/jpeg",
});
assert.strictEqual(resultWrongDim.allPassed, false, "Wrong dimensions must fail");
const dimCheck = resultWrongDim.checks.find((c) => c.id === "dimensions");
assert.strictEqual(dimCheck.passed, false);
console.log("  ✓ Dimension mismatch properly fails validation");

// ── TEST 3: EXIF PARSER UNIT TESTS ──
console.log("\n[TEST 3] EXIF Orientation Parser Tests:");
function makeExifJpeg(orientationCode) {
  // Construct minimal valid JPEG APP1 EXIF buffer
  // SOI (2 bytes): 0xFF, 0xD8
  // APP1 marker (2 bytes): 0xFF, 0xE1
  // Length (2 bytes): 30
  // "Exif\0\0" (6 bytes)
  // TIFF Header: "II" (0x4949) + 42 (0x002A) + IFD offset 8 (0x00000008)
  // IFD: 1 entry (count 1 = 0x0001)
  // Entry: Tag 0x0112, Type 3 (SHORT), Count 1, Value orientationCode (2 bytes) + 2 bytes padding
  const buf = new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xe1, // APP1
    0x00, 0x22, // length 34
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // Exif\0\0
    0x49, 0x49, // Little endian
    0x2a, 0x00, // 42
    0x08, 0x00, 0x00, 0x00, // offset to IFD0
    0x01, 0x00, // 1 entry
    0x12, 0x01, // Tag 0x0112 (Orientation)
    0x03, 0x00, // Type 3 (SHORT)
    0x01, 0x00, 0x00, 0x00, // Count 1
    orientationCode, 0x00, 0x00, 0x00, // Value + padding
    0xff, 0xd9, // EOI
  ]);
  return buf.buffer;
}

for (const o of [1, 3, 6, 8]) {
  const buf = makeExifJpeg(o);
  const parsed = readExifOrientation(buf);
  assert.strictEqual(parsed, o, `EXIF orientation ${o} must be parsed correctly`);
  console.log(`  ✓ EXIF orientation code ${o} correctly recognized`);
}

console.log("\n=== ALL REGRESSION TESTS PASSED (100% OK) ===");
