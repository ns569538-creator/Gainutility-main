import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Copy, Trash2, Sparkles, Download, Check, AlertCircle, RefreshCw, 
  Settings, Sliders, Play, Code, Eye, Search, Key, Shield, Clock, 
  Calendar, ArrowRight, ArrowLeftRight, CheckCircle, FileCode, List, 
  HelpCircle, CheckSquare, Palette, Info, FileText, Globe, Loader2
} from "lucide-react";
import { Card } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { tt, ttf } from "../i18n/toolUi";
import { copyWithToast } from "../lib/clipboard";
import "../i18n/tools/passwordGenerator";

// Generic copy helper that triggers standard copy with visual feedback
interface ToolProps {
  onCopy?: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  onChangeView?: (view: any) => void;
}

// Cryptographically strong random bytes (crypto.getRandomValues with fallback).
const randomBytes = (count: number): Uint8Array => {
  const bytes = new Uint8Array(count);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < count; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** UTF-8 safe base64url encode (JWT style, no padding). */
export const b64urlEncode = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

/** UTF-8 safe base64url decode. */
export const b64urlDecode = (s: string): string => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/** Real HMAC signature via the Web Crypto API (works offline once page is loaded). */
export const hmacSignB64Url = async (
  secret: string,
  data: string,
  alg: "HS256" | "HS384" | "HS512"
): Promise<string> => {
  const hashMap = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" } as const;
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto is not available in this browser context.");
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: hashMap[alg] },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  let bin = "";
  new Uint8Array(sigBuf).forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

/** RFC 4122/9562-compliant UUID generation for v1, v4 and v7. */
export const generateUUID = (ver: "v1" | "v4" | "v7"): string => {
  if (ver === "v4") {
    const b = randomBytes(16);
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
    const h = bytesToHex(b);
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  if (ver === "v7") {
    // 48-bit big-endian Unix millisecond timestamp + random rand_a/rand_b fields.
    const now = Date.now();
    const b = new Uint8Array(16);
    b[0] = (now >>> 40) & 0xff;
    b[1] = (now >>> 32) & 0xff;
    b[2] = (now >>> 24) & 0xff;
    b[3] = (now >>> 16) & 0xff;
    b[4] = (now >>> 8) & 0xff;
    b[5] = now & 0xff;
    b.set(randomBytes(10), 6);
    b[6] = (b[6] & 0x0f) | 0x70; // version 7
    b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
    const h = bytesToHex(b);
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  // v1: 60-bit timestamp (100ns intervals since 1582-10-15), clock sequence, random node.
  const GREGORIAN_OFFSET_MS = 12219292800000; // milliseconds from 1582-10-15 to 1970-01-01
  let ts = (Date.now() + GREGORIAN_OFFSET_MS) * 10000; // 100ns units
  const timeLow = ts % 0x100000000;
  ts = Math.floor(ts / 0x100000000);
  const timeMid = ts % 0x10000;
  const timeHi = Math.floor(ts / 0x10000) & 0x0fff;

  const rand = randomBytes(8);
  const clockSeq = ((rand[0] << 8) | rand[1]) & 0x3fff; // 14 bits, variant 10xx
  const node = rand.slice(2); // 6 random bytes
  node[0] |= 0x01; // set multicast bit per spec for random nodes

  const hex = (n: number, len: number) => n.toString(16).padStart(len, "0");
  const nodeHex = bytesToHex(node);
  return [
    hex(timeLow, 8),
    hex(timeMid, 4),
    `1${hex(timeHi, 3)}`, // version nibble + 12-bit time_hi
    hex(clockSeq | 0x8000, 4), // variant 10xx + clock sequence
    nodeHex,
  ].join("-");
};

// ==========================================
// 1. RANDOM ID GENERATOR (UUID Generator)
// ==========================================
export const UuidGenerator: React.FC<ToolProps> = ({ onAddToast }) => {
  const [version, setVersion] = useState<"v1" | "v4" | "v7">("v4");
  const [quantity, setQuantity] = useState<number>(10);
  const [format, setFormat] = useState<"plain" | "quotes" | "json" | "csv">("plain");
  const [generated, setGenerated] = useState<string[]>([]);

  const handleGenerate = () => {
    const list: string[] = [];
    const limit = Math.min(Math.max(quantity, 1), 10000);
    for (let i = 0; i < limit; i++) {
      list.push(generateUUID(version));
    }
    setGenerated(list);
    onAddToast(`Generated ${limit} UUID ${version} tokens`, "success");
  };

  useEffect(() => {
    handleGenerate();
  }, [version]);

  const getFormattedText = () => {
    if (format === "quotes") {
      return generated.map(id => `"${id}"`).join(",\n");
    } else if (format === "json") {
      return JSON.stringify(generated, null, 2);
    } else if (format === "csv") {
      return "id\n" + generated.join("\n");
    }
    return generated.join("\n");
  };

  const handleCopy = () => {
    copyWithToast(getFormattedText(), onAddToast, "Copied generated IDs to clipboard");
  };

  const handleDownload = (ext: "txt" | "csv" | "json") => {
    const text = ext === "json" 
      ? JSON.stringify(generated, null, 2) 
      : ext === "csv" 
        ? "id\n" + generated.join("\n")
        : generated.join("\n");
        
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated_uuids.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    onAddToast(`Downloaded ${ext.toUpperCase()} file`, "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Generator Settings" subtitle="Configure UUID version and quantity">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-text-main block mb-2 font-sans">UUID Version</label>
              <div className="grid grid-cols-3 gap-2">
                {(["v1", "v4", "v7"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setVersion(v)}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold font-mono transition-all cursor-pointer ${
                      version === v 
                        ? "bg-brand-primary-light text-brand-primary border-brand-primary" 
                        : "bg-surface-base border-border-light text-text-sub hover:bg-surface-muted"
                    }`}
                  >
                    UUID {v.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">
                {version === "v4" && "v4: Random numbers (most common for unique database IDs)"}
                {version === "v7" && "v7: Time-ordered (best for indexed primary database keys)"}
                {version === "v1" && "v1: Timestamp, clock sequence & random MAC-style node"}
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-text-main block mb-2 font-sans" htmlFor="advanced-developer-tools-quantity">Quantity</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-background border border-border-light rounded-xl px-4 py-2 text-sm text-text-main font-mono h-11 focus:border-brand-primary outline-none"
              id="advanced-developer-tools-quantity"/>
              <p className="text-xs text-text-muted mt-1">Generate between 1 and 10,000 unique keys</p>
            </div>

            <div>
              <label className="text-sm font-bold text-text-main block mb-2 font-sans">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "plain", label: "Plain Text" },
                  { id: "quotes", label: "Quoted Array" },
                  { id: "json", label: "JSON Array" },
                  { id: "csv", label: "CSV File" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      format === f.id 
                        ? "bg-brand-primary-light text-brand-primary border-brand-primary" 
                        : "bg-surface-base border-border-light text-text-sub hover:bg-surface-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] font-sans font-bold flex items-center justify-center gap-2 shadow-premium-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" />
              Generate Identifiers
            </button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card 
          title="Generated Keys" 
          subtitle="Direct view of secure randomized IDs"
          actions={
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="p-2 bg-surface-muted hover:bg-brand-primary-light hover:text-brand-primary text-text-sub rounded-lg transition-colors cursor-pointer" title="Copy to Clipboard">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => handleDownload("txt")} className="p-2 bg-surface-muted hover:bg-brand-primary-light hover:text-brand-primary text-text-sub rounded-lg transition-colors cursor-pointer" title="Download Text File">
                <Download className="w-4 h-4" />
              </button>
            </div>
          }
        >
          <textarea aria-label="Formatted text output"
            readOnly
            value={getFormattedText()}
            className="w-full flex-1 min-h-[380px] bg-background border border-border-light rounded-[16px] p-5 text-base sm:text-sm text-text-main font-mono focus:border-brand-primary outline-none resize-none leading-relaxed"
          />
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 2. DECODE JWT TOKEN (JWT Decoder & Generator)
// ==========================================
export const JwtDecoder: React.FC<ToolProps> = ({ onAddToast }) => {
  const [activeTab, setActiveTab] = useState<"decode" | "generate">("decode");
  const [tokenInput, setTokenInput] = useState<string>("");
  
  // Decoded states
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [signature, setSignature] = useState<string>("");
  const [jwtError, setJwtError] = useState<string>("");

  // Generator states
  const [genAlg, setGenAlg] = useState<string>("HS256");
  const [genHeader, setGenHeader] = useState<string>('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [genPayload, setGenPayload] = useState<string>('{\n  "sub": "1234567890",\n  "name": "Jane Doe",\n  "admin": true,\n  "iat": 1783773600,\n  "exp": 1783780000\n}');
  const [genSecret, setGenSecret] = useState<string>("super-secret-key-phrase");
  const [genToken, setGenToken] = useState<string>("");

  // Live Decoder handler
  const decodeToken = (jwtStr: string) => {
    if (!jwtStr.trim()) {
      setHeader(null);
      setPayload(null);
      setSignature("");
      setJwtError("");
      return;
    }

    try {
      const parts = jwtStr.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("A valid JWT must consist of exactly 3 parts separated by dots (.)");
      }

      const decodedHeader = JSON.parse(b64urlDecode(parts[0]));
      const decodedPayload = JSON.parse(b64urlDecode(parts[1]));
      const sigB64 = parts[2];

      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setSignature(sigB64);
      setJwtError("");
    } catch (err: any) {
      setHeader(null);
      setPayload(null);
      setSignature("");
      setJwtError(err.message || "Invalid JWT Token structure");
    }
  };

  useEffect(() => {
    decodeToken(tokenInput);
  }, [tokenInput]);

  // JWT Generator: real HMAC signing via Web Crypto.
  const handleGenerate = async () => {
    try {
      const headObj = JSON.parse(genHeader);
      JSON.parse(genPayload); // validate payload is JSON

      const alg = headObj?.alg === "HS384" ? "HS384" : headObj?.alg === "HS512" ? "HS512" : "HS256";
      if (!["HS256", "HS384", "HS512"].includes(alg)) {
        throw new Error("Only HS256, HS384 and HS512 algorithms are supported in-browser");
      }

      const b64Header = b64urlEncode(JSON.stringify(headObj));
      const b64Payload = b64urlEncode(JSON.stringify(JSON.parse(genPayload)));
      const signaturePayload = `${b64Header}.${b64Payload}`;
      const realSig = await hmacSignB64Url(genSecret, signaturePayload, alg);

      setGenToken(`${signaturePayload}.${realSig}`);
      onAddToast(`Signed JWT with ${alg} via Web Crypto`, "success");
    } catch (e: any) {
      setGenToken("");
      onAddToast(e?.message?.includes("JSON")
        ? "Error: Header and Payload must be valid JSON strings"
        : `Signing failed: ${e?.message || "unknown error"}`, "error");
    }
  };

  useEffect(() => {
    if (activeTab === "generate") {
      handleGenerate();
    }
  }, [genHeader, genPayload, genSecret, activeTab]);

  const loadExampleToken = () => {
    const sampleHeader = b64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const samplePayload = b64urlEncode(JSON.stringify({ sub: "usr_gainutility_8", name: "Alex Mercer", role: "Developer", exp: 1983773600 }));
    hmacSignB64Url("your-256-bit-secret", `${sampleHeader}.${samplePayload}`, "HS256").then((sig) => {
      setTokenInput(`${sampleHeader}.${samplePayload}.${sig}`);
    });
    onAddToast("Loaded demo token (signed with 'your-256-bit-secret')", "info");
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-surface-base border border-border-light p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab("decode")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "decode" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          Decode Token
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "generate" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          Generate Token
        </button>
      </div>

      {activeTab === "decode" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card 
              title="Encoded JWT Input" 
              subtitle="Paste your secure JWT payload token to decode"
              actions={
                <button 
                  onClick={loadExampleToken}
                  className="px-3 py-1.5 text-xs bg-brand-primary-light text-brand-primary hover:bg-brand-primary border border-brand-primary/10 rounded-lg font-bold cursor-pointer transition-all"
                >
                  Load Demo Token
                </button>
              }
            >
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ..."
                className="w-full min-h-[300px] bg-background border border-border-light rounded-[16px] p-5 text-sm text-text-main font-mono focus:border-brand-primary outline-none resize-none leading-relaxed"
              />
              {jwtError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-status-error/10 border border-status-error/25 text-status-error rounded-xl text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{jwtError}</span>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Decoded Content" subtitle="Parsed headers and signature information">
              {header || payload ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted mb-2">HEADER: ALGORITHM & TOKEN TYPE</h4>
                    <pre className="bg-background border border-border-light p-4 rounded-xl text-xs font-mono text-text-main overflow-x-auto">
                      {JSON.stringify(header, null, 2)}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted mb-2">PAYLOAD: DATA CLAIMS</h4>
                    <pre className="bg-background border border-border-light p-4 rounded-xl text-xs font-mono text-text-main overflow-x-auto">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-muted/30 border border-border-light p-3.5 rounded-xl text-xs">
                      <span className="block font-bold text-text-main">Issued At</span>
                      <span className="font-mono text-text-sub">
                        {payload?.iat ? new Date(payload.iat * 1000).toLocaleString() : "Not specified"}
                      </span>
                    </div>
                    <div className="bg-surface-muted/30 border border-border-light p-3.5 rounded-xl text-xs">
                      <span className="block font-bold text-text-main">Expiration Time</span>
                      <span className="font-mono text-text-sub">
                        {payload?.exp ? new Date(payload.exp * 1000).toLocaleString() : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted gap-3">
                  <FileCode className="w-12 h-12 stroke-[1.5]" />
                  <p className="text-sm font-medium">Decoded claims will appear here once you paste a valid JWT.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card title="JWT Encoder" subtitle="Customize the JSON fields and secret values">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-main block mb-1.5 font-sans" htmlFor="advanced-developer-tools-algorithm">ALGORITHM</label>
                  <select
                    value={genAlg}
                    onChange={(e) => {
                      setGenAlg(e.target.value);
                      setGenHeader(JSON.stringify({ alg: e.target.value, typ: "JWT" }, null, 2));
                    }}
                    className="w-full bg-background border border-border-light rounded-xl px-4 py-2.5 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
                   id="advanced-developer-tools-algorithm">
                    <option value="HS256">HS256 (HMAC-SHA256)</option>
                    <option value="HS384">HS384 (HMAC-SHA384)</option>
                    <option value="HS512">HS512 (HMAC-SHA512)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-main block mb-1.5 font-sans" htmlFor="advanced-developer-tools-header-json">HEADER (JSON)</label>
                  <textarea
                    value={genHeader}
                    onChange={(e) => setGenHeader(e.target.value)}
                    className="w-full min-h-[100px] bg-background border border-border-light rounded-xl p-3.5 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-normal"
                  id="advanced-developer-tools-header-json"/>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-main block mb-1.5 font-sans" htmlFor="advanced-developer-tools-payload-json">PAYLOAD (JSON)</label>
                  <textarea
                    value={genPayload}
                    onChange={(e) => setGenPayload(e.target.value)}
                    className="w-full min-h-[160px] bg-background border border-border-light rounded-xl p-3.5 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-normal"
                  id="advanced-developer-tools-payload-json"/>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-main block mb-1.5 font-sans">SECRET KEY</label>
                  <input
                    type="text"
                    value={genSecret}
                    onChange={(e) => setGenSecret(e.target.value)}
                    placeholder="Provide a verification secret string"
                    className="w-full bg-background border border-border-light rounded-xl px-4 py-2.5 text-sm font-mono text-text-main focus:border-brand-primary outline-none h-11"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Generated JWT Token" subtitle="Resulting Base64 token with signature">
              <div className="space-y-4">
                <textarea aria-label="Generated JWT token"
                  readOnly
                  value={genToken}
                  className="w-full min-h-[180px] bg-background border border-border-light rounded-[16px] p-5 text-base sm:text-sm text-brand-primary font-mono focus:border-brand-primary outline-none resize-none leading-relaxed select-all"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      copyWithToast(genToken, onAddToast, "Copied token to clipboard");
                    }}
                    className="flex-1 h-12 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] font-sans font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Token
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([genToken], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "jwt_token.txt";
                      link.click();
                      URL.revokeObjectURL(url);
                      onAddToast("Token downloaded as TXT", "success");
                    }}
                    className="h-12 px-5 bg-surface-muted hover:bg-brand-primary-light hover:text-brand-primary text-text-sub border border-border-light font-sans font-bold rounded-xl flex items-center justify-center transition-colors cursor-pointer text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 3. PASSWORD GENERATOR
// ==========================================
export const PasswordGenerator: React.FC<ToolProps> = ({ onAddToast }) => {
  const locale = useLocale();
  const [length, setLength] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const handleGenerate = () => {
    let charset = "";
    if (uppercase) charset += excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) charset += excludeSimilar ? "abcdefghijkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    if (numbers) charset += excludeSimilar ? "23456789" : "0123456789";
    if (symbols) {
      charset += excludeAmbiguous ? "#$%&*" : "!@#$%^&*()_+-=[]{}|;':\",./<>?";
    }

    if (!charset) {
      onAddToast(tt("password-generator", "toastCharset", locale, "Please enable at least one character set"), "warning");
      return;
    }

    let generatedPass = "";
    // Rejection sampling with crypto.getRandomValues: uniform, unbiased selection.
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      onAddToast(tt("password-generator", "toastCrypto", locale, "Web Crypto is not available in this browser context."), "error");
      return;
    }
    const buf = new Uint32Array(length);
    crypto.getRandomValues(buf);
    const limit = Math.floor(0xffffffff / charset.length) * charset.length;
    for (let i = 0; i < length; i++) {
      let r = buf[i];
      while (r >= limit) {
        crypto.getRandomValues(buf.subarray(i, i + 1));
        r = buf[i];
      }
      generatedPass += charset[r % charset.length];
    }
    setPassword(generatedPass);
  };

  useEffect(() => {
    handleGenerate();
  }, [length, uppercase, lowercase, numbers, symbols, excludeSimilar, excludeAmbiguous]);

  const getStrengthMetrics = () => {
    if (!password) return { label: tt("password-generator", "strengthNone", locale, "None"), color: "text-text-muted", width: "w-0", entropy: 0 };
    
    // Calculate entropy
    let poolSize = 0;
    if (uppercase) poolSize += excludeSimilar ? 24 : 26;
    if (lowercase) poolSize += excludeSimilar ? 24 : 26;
    if (numbers) poolSize += excludeSimilar ? 8 : 10;
    if (symbols) poolSize += excludeAmbiguous ? 5 : 32;

    const entropy = Math.round(length * Math.log2(poolSize || 2));
    
    let label = tt("password-generator", "strengthWeak", locale, "Weak");
    let color = "bg-status-error";
    let textColor = "text-status-error";
    let width = "w-1/4";

    if (entropy >= 80) {
      label = tt("password-generator", "strengthExcellent", locale, "Excellent");
      color = "bg-[#4D7E2B]";
      textColor = "text-[#4D7E2B]";
      width = "w-full";
    } else if (entropy >= 60) {
      label = tt("password-generator", "strengthStrong", locale, "Strong");
      color = "bg-brand-primary";
      textColor = "text-brand-primary";
      width = "w-3/4";
    } else if (entropy >= 40) {
      label = tt("password-generator", "strengthMedium", locale, "Medium");
      color = "bg-brand-accent";
      textColor = "text-brand-accent";
      width = "w-1/2";
    }

    return { label, color, textColor, width, entropy };
  };

  const metrics = getStrengthMetrics();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title={tt("password-generator", "settingsTitle", locale, "Password Settings")} subtitle={tt("password-generator", "settingsSubtitle", locale, "Configure complexity constraints")}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-text-main font-sans" htmlFor="advanced-developer-tools-ttf-password-generator-lengthlabel-local">{ttf("password-generator", "lengthLabel", locale, { length: String(length) }, `Length (${length})`)}</label>
              </div>
              <input
                type="range"
                min="6"
                max="128"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-brand-primary"
              id="advanced-developer-tools-ttf-password-generator-lengthlabel-local"/>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main block mb-1 font-sans">{tt("password-generator", "charSets", locale, "Character Sets")}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { state: uppercase, set: setUppercase, label: tt("password-generator", "uppercase", locale, "Uppercase (A-Z)") },
                  { state: lowercase, set: setLowercase, label: tt("password-generator", "lowercase", locale, "Lowercase (a-z)") },
                  { state: numbers, set: setNumbers, label: tt("password-generator", "numbers", locale, "Numbers (0-9)") },
                  { state: symbols, set: setSymbols, label: tt("password-generator", "symbols", locale, "Symbols (!@#...)") }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => item.set(!item.state)}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      item.state 
                        ? "bg-brand-primary-light/40 border-brand-primary/30 text-brand-primary" 
                        : "bg-surface-base border-border-light text-text-sub"
                    }`}
                  >
                    <CheckSquare className={`w-4 h-4 ${item.state ? "text-brand-primary" : "text-text-disabled"}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-border-light pt-4">
              <span className="text-sm font-bold text-text-main block mb-1 font-sans">{tt("password-generator", "exclusionRules", locale, "Exclusion Rules")}</span>
              
              <button
                onClick={() => setExcludeSimilar(!excludeSimilar)}
                aria-pressed={excludeSimilar}
                className={`w-full flex items-center justify-between p-2.5 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  excludeSimilar 
                    ? "bg-brand-primary-light/40 border-brand-primary/30 text-brand-primary" 
                    : "bg-surface-base border-border-light text-text-sub"
                }`}
              >
                <span>{tt("password-generator", "avoidSimilar", locale, "Avoid similar (i, l, 1, o, 0)")}</span>
                <input type="checkbox" checked={excludeSimilar} readOnly aria-hidden="true" tabIndex={-1} className="pointer-events-none accent-brand-primary" />
              </button>

              <button
                onClick={() => setExcludeAmbiguous(!excludeAmbiguous)}
                aria-pressed={excludeAmbiguous}
                className={`w-full flex items-center justify-between p-2.5 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  excludeAmbiguous 
                    ? "bg-brand-primary-light/40 border-brand-primary/30 text-brand-primary" 
                    : "bg-surface-base border-border-light text-text-sub"
                }`}
              >
                <span>{tt("password-generator", "avoidBraces", locale, "Avoid braces/slashes")}</span>
                <input type="checkbox" checked={excludeAmbiguous} readOnly aria-hidden="true" tabIndex={-1} className="pointer-events-none accent-brand-primary" />
              </button>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-premium-sm"
            >
              <RefreshCw className="w-4 h-4" />
              {tt("password-generator", "regenerate", locale, "Regenerate")}
            </button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card title={tt("password-generator", "generatedTitle", locale, "Generated Password")} subtitle={tt("password-generator", "generatedSubtitle", locale, "Highly secure generated string payload")}>
          <div className="space-y-5">
            <div className="relative">
              <input aria-label="Generated password"
                type="text"
                readOnly
                value={password}
                className="w-full bg-background border border-border-light rounded-xl pl-5 pr-14 py-4 text-lg font-mono text-brand-primary-dark font-black tracking-wide focus:border-brand-primary outline-none"
              />
              <button
                onClick={() => {
                  copyWithToast(password, onAddToast, tt("password-generator", "toastCopied", locale, "Password copied!"));
                }}
                className="absolute right-3.5 top-3.5 p-2 bg-surface-muted hover:bg-brand-primary-light hover:text-brand-primary text-text-sub rounded-lg transition-colors cursor-pointer"
                title={tt("password-generator", "copyPassword", locale, "Copy Password")}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Strength indicator */}
            <div className="p-5 bg-background border border-border-light rounded-[16px] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text-sub">{tt("password-generator", "securityRating", locale, "Security Rating")}</span>
                <span className={`text-sm font-black uppercase font-mono ${metrics.textColor}`}>{metrics.label}</span>
              </div>
              
              <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden">
                <div className={`h-full ${metrics.color} ${metrics.width} transition-all duration-300`} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="block text-text-muted font-mono uppercase">{tt("password-generator", "entropyLabel", locale, "Calculated Entropy")}</span>
                  <span className="font-mono font-bold text-text-main">{metrics.entropy} {tt("password-generator", "bits", locale, "bits")}</span>
                </div>
                <div>
                  <span className="block text-text-muted font-mono uppercase">{tt("password-generator", "bruteForceLabel", locale, "Brute-Force Estimate")}</span>
                  <span className="font-mono font-bold text-text-main">
                    {metrics.entropy > 70 ? tt("password-generator", "estimateCenturies", locale, "Over 1,000 centuries") : metrics.entropy > 45 ? tt("password-generator", "estimateYears", locale, "A few years") : tt("password-generator", "estimateMinutes", locale, "A few minutes")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 4. CHECK PASSWORD STRENGTH
// ==========================================
export const PasswordStrengthChecker: React.FC<ToolProps> = ({ onAddToast }) => {
  const [password, setPassword] = useState<string>("");

  const analyzePassword = () => {
    if (!password) return null;

    let score = 0;
    const tips: string[] = [];

    // Length check
    if (password.length >= 12) {
      score += 30;
    } else if (password.length >= 8) {
      score += 15;
      tips.push("Make it longer. Standard secure passwords should be at least 12 characters.");
    } else {
      score += 5;
      tips.push("Critical: Password is too short! Use at least 8 to 12 characters.");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      tips.push("Add uppercase letters (A-Z) to increase character diversity.");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 15;
    } else {
      tips.push("Add lowercase letters (a-z).");
    }

    // Numbers check
    if (/[0-9]/.test(password)) {
      score += 15;
    } else {
      tips.push("Add at least one number (0-9).");
    }

    // Symbols check
    if (/[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(password)) {
      score += 20;
    } else {
      tips.push("Add symbols (e.g. !, @, #, $, %) to prevent standard dictionary attacks.");
    }

    // Common passwords check
    const common = ["password", "123456", "qwerty", "password123", "admin", "welcome"];
    if (common.includes(password.toLowerCase())) {
      score = 5;
      tips.unshift("WARNING: This is a highly common password easily matched by automated scrapers!");
    }

    let status = "Weak";
    let color = "bg-status-error text-status-error";
    if (score >= 80) {
      status = "Excellent";
      color = "bg-[#4D7E2B] text-[#4D7E2B]";
    } else if (score >= 60) {
      status = "Strong";
      color = "bg-brand-primary text-brand-primary";
    } else if (score >= 40) {
      status = "Medium";
      color = "bg-brand-accent text-brand-accent";
    }

    return { score, status, color, tips };
  };

  const analysis = analyzePassword();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Password Strength Analyzer" subtitle="Audit password complexity against secure formulas">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-text-main block mb-2 font-sans">Test Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type or paste password to evaluate..."
              className="w-full bg-background border border-border-light rounded-xl px-4 py-3.5 text-base font-mono text-text-main focus:border-brand-primary outline-none"
            />
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Note: All password auditing operates completely offline on your device. We do not transmit or log any password entries.
          </p>
        </div>
      </Card>

      <Card title="Analysis Metrics" subtitle="Interactive scores and recommendations">
        {analysis ? (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-text-sub">Strength Status</span>
              <span className={`text-base font-black uppercase font-mono ${analysis.color.split(" ")[1]}`}>{analysis.status}</span>
            </div>

            <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full ${analysis.color.split(" ")[0]} transition-all duration-300`} 
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            <div className="p-4 bg-background border border-border-light rounded-xl">
              <span className="text-xs font-bold text-text-muted block uppercase tracking-wider mb-2 font-mono">Dynamic Improvement Checklist</span>
              {analysis.tips.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-xs font-mono text-text-sub leading-normal">
                      <span className="text-brand-accent font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-[#4D7E2B]">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Excellent! Password meets all standard security recommendations.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted gap-3">
            <Shield className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm font-medium">Provide a password in the left input panel to evaluate strength metrics.</p>
          </div>
        )}
      </Card>
    </div>
  );
};


// ==========================================
// 5. GENERATE FILE HASH
// ==========================================
export const HashGenerator: React.FC<ToolProps> = ({ onAddToast }) => {
  const [activeTab, setActiveTab] = useState<"generate" | "compare">("generate");
  const [text, setText] = useState<string>("");
  const [alg, setAlg] = useState<string>("SHA-256");
  const [computedHash, setComputedHash] = useState<string>("");

  // Compare states
  const [sourceHash, setSourceHash] = useState<string>("");
  const [expectedHash, setExpectedHash] = useState<string>("");

  // Compute standard cryptographic hash locally in browser
  const [hashError, setHashError] = useState<string>("");
  const computeHash = async (payloadStr: string) => {
    if (!payloadStr) {
      setComputedHash("");
      setHashError("");
      return;
    }
    try {
      const msgUint8 = new TextEncoder().encode(payloadStr);
      const hashBuffer = await crypto.subtle.digest(alg as any, msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setComputedHash(hashHex);
      setHashError("");
    } catch {
      // No silent fake hashes: surface the failure honestly.
      setComputedHash("");
      setHashError(`Unable to compute ${alg} - this environment blocks Web Crypto (requires a secure HTTPS or localhost context).`);
    }
  };

  useEffect(() => {
    computeHash(text);
  }, [text, alg]);

  return (
    <div className="space-y-6">
      <div className="flex bg-surface-base border border-border-light p-1 rounded-2xl max-w-xs">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "generate" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          Hash Generator
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "compare" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          Hash Compare
        </button>
      </div>

      {activeTab === "generate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Input Text Stream" subtitle="Type or paste payload to calculate hash checksum">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5 font-sans" htmlFor="advanced-developer-tools-cryptographic-algorithm">CRYPTOGRAPHIC ALGORITHM</label>
                <select
                  value={alg}
                  onChange={(e) => setAlg(e.target.value)}
                  className="w-full bg-background border border-border-light rounded-xl px-4 py-2.5 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
                 id="advanced-developer-tools-cryptographic-algorithm">
                  <option value="SHA-256">SHA-256 (Secure & Recommended)</option>
                  <option value="SHA-384">SHA-384 (Balanced)</option>
                  <option value="SHA-1">SHA-1 (Legacy Integrity)</option>
                  <option value="SHA-512">SHA-512 (High Entropy)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5 font-sans">TEXT INPUT</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter standard string values..."
                  className="w-full min-h-[160px] bg-background border border-border-light rounded-xl p-4 text-sm font-mono text-text-main focus:border-brand-primary outline-none resize-none h-40"
                />
              </div>
            </div>
          </Card>

          <Card title="Calculated Hash Output" subtitle="Hexadecimal output checksum">
            {hashError ? (
              <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs rounded-xl p-4 font-mono">
                {hashError}
              </div>
            ) : computedHash ? (
              <div className="space-y-4">
                <textarea aria-label="Calculated hash output"
                  readOnly
                  value={computedHash}
                  className="w-full min-h-[120px] bg-background border border-border-light rounded-xl p-4 text-base font-mono text-brand-primary-dark font-bold focus:border-brand-primary outline-none resize-none leading-relaxed select-all"
                />
                <button
                  onClick={() => {
                    copyWithToast(computedHash, onAddToast, "Copied hash to clipboard");
                  }}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] font-sans font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Copy Hash Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted gap-3">
                <FileCode className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm font-medium">Provide a text input stream to compute its cryptographic hash checksum.</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Compare Integrity Checksums" subtitle="Verify if two hash digests match exactly">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5 font-sans">CALCULATED HASH</label>
                <input
                  type="text"
                  value={sourceHash}
                  onChange={(e) => setSourceHash(e.target.value.trim())}
                  placeholder="Paste computed file checksum..."
                  className="w-full bg-background border border-border-light rounded-xl px-4 py-2.5 text-sm font-mono text-text-main focus:border-brand-primary outline-none h-11"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5 font-sans">EXPECTED AUTHORITATIVE HASH</label>
                <input
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value.trim())}
                  placeholder="Paste reference checksum..."
                  className="w-full bg-background border border-border-light rounded-xl px-4 py-2.5 text-sm font-mono text-text-main focus:border-brand-primary outline-none h-11"
                />
              </div>
            </div>
          </Card>

          <Card title="Verification Result" subtitle="Integrity status validation">
            {sourceHash && expectedHash ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                {sourceHash.toLowerCase() === expectedHash.toLowerCase() ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#4D7E2B]/10 flex items-center justify-center text-[#4D7E2B]">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-[#4D7E2B] text-xl">Integrity Verified</h4>
                      <p className="text-sm text-text-muted mt-1.5">Both hash checksums match perfectly. File is untampered.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center text-status-error">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-status-error text-xl">Checksum Mismatch</h4>
                      <p className="text-sm text-text-muted mt-1.5">The digests do not match. Payload integrity cannot be guaranteed.</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted gap-3">
                <Sliders className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm font-medium">Provide both checksums to perform cryptographic verification.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 6. REGEX TESTER
// ==========================================
export const RegexTester: React.FC<ToolProps> = ({ onAddToast }) => {
  const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState<string>("gi");
  const [testText, setTestText] = useState<string>("Contact us at info@gainutility.com or support@developer-studio.org!");
  const [matches, setMatches] = useState<any[]>([]);

  const handleTest = () => {
    if (!pattern.trim()) {
      setMatches([]);
      return;
    }
    try {
      const regex = new RegExp(pattern, flags);
      const list: any[] = [];
      let match;
      
      // Prevent infinite loop with non-global patterns
      if (!flags.includes("g")) {
        match = regex.exec(testText);
        if (match) {
          list.push({ text: match[0], index: match.index });
        }
      } else {
        while ((match = regex.exec(testText)) !== null) {
          list.push({ text: match[0], index: match.index });
          if (regex.lastIndex === match.index) {
            regex.lastIndex++; // safety increments
          }
        }
      }
      setMatches(list);
    } catch (e) {
      setMatches([]);
    }
  };

  useEffect(() => {
    handleTest();
  }, [pattern, flags, testText]);

  const loadRegexPreset = (pat: string, desc: string) => {
    setPattern(pat);
    onAddToast(`Loaded ${desc} pattern preset`, "info");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Regex Settings" subtitle="Configure matches and flags">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-text-main block mb-1.5 font-sans" htmlFor="advanced-developer-tools-regular-expression">Regular Expression</label>
              <div className="flex bg-background border border-border-light rounded-xl items-center px-3.5 h-11">
                <span className="text-text-disabled font-mono text-sm mr-1">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="bg-transparent flex-1 font-mono text-sm text-brand-primary-dark outline-none border-none"
                id="advanced-developer-tools-regular-expression"/>
                <span className="text-text-disabled font-mono text-sm ml-1">/</span>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="flags"
                  className="bg-transparent w-10 text-center font-mono text-xs text-brand-accent outline-none border-none border-l border-border-light ml-1"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 border-t border-border-light pt-4">
              <span className="text-xs font-bold text-text-muted block uppercase tracking-wider font-mono">Common Presets</span>
              {[
                { label: "Email Address", pat: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
                { label: "URL Validator", pat: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)" },
                { label: "IPv4 Address", pat: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b" },
                { label: "Numbers Only", pat: "\\b\\d+\\b" }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadRegexPreset(p.pat, p.label)}
                  className="w-full text-left px-3.5 py-2 border border-border-light rounded-xl text-xs font-bold text-text-sub hover:bg-brand-primary-light hover:text-brand-primary transition-all cursor-pointer bg-surface-base"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card title="Regex Test Sandbox" subtitle="Input corpus text and view dynamic highlights">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-muted block uppercase tracking-wider mb-1.5 font-mono">TEST STRING</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter test text stream..."
                className="w-full min-h-[140px] bg-background border border-border-light rounded-xl p-4 text-sm font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Match indicators */}
            <div className="p-4 bg-background border border-border-light rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Captured Matches ({matches.length})</span>
              </div>
              
              {matches.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {matches.slice(0, 100).map((m, idx) => (
                    <span key={idx} className="bg-brand-primary-light/50 border border-brand-primary/20 text-brand-primary-dark font-mono text-xs px-2.5 py-1 rounded-lg">
                      {m.text} <span className="text-[9px] text-text-muted font-normal ml-1">@idx {m.index}</span>
                    </span>
                  ))}
                  {matches.length > 100 && (
                    <span className="text-xs text-text-muted font-mono pt-1">...and {matches.length - 100} more</span>
                  )}
                </div>
              ) : (
                <div className="text-xs font-mono text-text-disabled">No regular expression matches captured yet. Check your syntax.</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 7. DATE & TIMESTAMP CONVERTER (Unix Timestamp Converter)
// ==========================================
export const UnixTimestampConverter: React.FC<ToolProps> = ({ onAddToast }) => {
  const [nowStamp, setNowStamp] = useState<number>(Math.floor(Date.now() / 1000));
  const [unixInput, setUnixInput] = useState<string>("");
  const [dateResult, setDateResult] = useState<string>("");
  
  // Date to Timestamp state
  const [humanInput, setHumanInput] = useState<string>("");
  const [stampResult, setStampResult] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setNowStamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConvertUnix = () => {
    try {
      const num = parseInt(unixInput.trim());
      if (isNaN(num)) {
        throw new Error("Please enter a valid numeric Unix timestamp value");
      }
      
      // Handle both seconds and milliseconds auto-detect
      const date = unixInput.trim().length >= 12 ? new Date(num) : new Date(num * 1000);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid Timestamp range");
      }
      setDateResult(date.toUTCString() + " / " + date.toLocaleString());
      onAddToast("Converted Unix timestamp successfully", "success");
    } catch (e: any) {
      onAddToast(e.message || "Invalid Unix timestamp payload", "error");
    }
  };

  const handleConvertHuman = () => {
    try {
      const date = new Date(humanInput);
      if (isNaN(date.getTime())) {
        throw new Error("Please select or enter a valid calendar date format");
      }
      setStampResult(Math.floor(date.getTime() / 1000).toString());
      onAddToast("Converted calendar date to Unix timestamp", "success");
    } catch (e: any) {
      onAddToast(e.message || "Invalid calendar date string", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card title="Current Server Clock" subtitle="Real-time absolute timestamps">
          <div className="flex flex-col gap-4 p-5 bg-background border border-border-light rounded-[16px] items-center text-center">
            <Clock className="w-8 h-8 text-brand-primary animate-pulse" />
            <div>
              <span className="block text-2xl font-mono font-black text-brand-primary-dark">{nowStamp}</span>
              <span className="text-xs text-text-muted uppercase font-mono tracking-wider mt-1 block">Live UTC Epoch Seconds</span>
            </div>
            <button
              onClick={() => {
                copyWithToast(nowStamp.toString(), onAddToast, "Copied active timestamp!");
              }}
              className="px-4 py-2 bg-brand-primary-light hover:bg-brand-primary hover:text-[#FAF8F1] text-brand-primary text-xs font-bold font-mono border border-brand-primary/10 rounded-xl transition-all cursor-pointer"
            >
              Copy Timestamp
            </button>
          </div>
        </Card>

        <Card title="Unix Epoch to Calendar Date" subtitle="Decode timestamp numbers into readable calendar formats">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5 font-mono">UNIX TIMESTAMP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={unixInput}
                  onChange={(e) => setUnixInput(e.target.value)}
                  placeholder="e.g. 1783773600"
                  className="flex-1 bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
                />
                <button
                  onClick={handleConvertUnix}
                  className="px-4 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold text-xs cursor-pointer transition-colors"
                >
                  Decode
                </button>
              </div>
            </div>

            {dateResult && (
              <div className="p-4 bg-background border border-border-light rounded-xl font-mono text-xs text-text-main">
                <span className="block font-bold text-brand-primary mb-1">Human Format:</span>
                {dateResult}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Calendar Date to Unix Epoch" subtitle="Encode calendar dates into standard numeric timestamps">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5 font-mono" htmlFor="advanced-developer-tools-calendar-date-input">CALENDAR DATE INPUT</label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={humanInput}
                  onChange={(e) => setHumanInput(e.target.value)}
                  className="flex-1 bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
                id="advanced-developer-tools-calendar-date-input"/>
                <button
                  onClick={handleConvertHuman}
                  className="px-4 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold text-xs cursor-pointer transition-colors"
                >
                  Encode
                </button>
              </div>
            </div>

            {stampResult && (
              <div className="p-4 bg-background border border-border-light rounded-xl font-mono text-xs text-text-main flex justify-between items-center">
                <div>
                  <span className="block font-bold text-brand-primary mb-1">Epoch Seconds:</span>
                  <span className="text-base font-black text-brand-primary-dark">{stampResult}</span>
                </div>
                <button
                  onClick={() => {
                    copyWithToast(stampResult, onAddToast, "Copied calculated timestamp");
                  }}
                  className="p-2 bg-surface-muted hover:bg-brand-primary-light text-text-sub hover:text-brand-primary rounded-lg transition-colors cursor-pointer animate-fade-in"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 8. SCHEDULE GENERATOR (Cron Expression Builder)
// ==========================================
// Parse one cron field ("*", star-slash-step like "star/5", "1-5", "0,15,30") into allowed numbers.
const parseCronField = (
  field: string,
  min: number,
  max: number
): { values?: Set<number>; error?: string } => {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    let step = 1;
    let rangePart = part;
    const slashIdx = part.indexOf("/");
    if (slashIdx !== -1) {
      rangePart = part.slice(0, slashIdx);
      step = parseInt(part.slice(slashIdx + 1), 10);
      if (!Number.isFinite(step) || step < 1) return { error: `Invalid step in "${part}"` };
    }
    let start = min;
    let end = max;
    if (rangePart !== "" && rangePart !== "*") {
      const dashIdx = rangePart.indexOf("-");
      if (dashIdx !== -1) {
        start = parseInt(rangePart.slice(0, dashIdx), 10);
        end = parseInt(rangePart.slice(dashIdx + 1), 10);
      } else {
        start = parseInt(rangePart, 10);
        if (slashIdx === -1) end = start; // single value
      }
      if (!Number.isFinite(start) || !Number.isFinite(end)) return { error: `Invalid value "${rangePart}"` };
    }
    if (start < min || end > max || start > end) return { error: `"${part}" outside ${min}-${max}` };
    for (let v = start; v <= end; v += step) values.add(v);
  }
  return { values };
};

/** Compute the next N execution times of a standard 5-field cron expression (local time). */
export const getCronNextRuns = (
  expression: string,
  count = 5,
  from: Date = new Date()
): { runs: Date[]; error?: string } => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return { runs: [], error: "Expression needs exactly 5 fields (minute hour day month weekday)" };

  const mins = parseCronField(parts[0], 0, 59);
  if (mins.error) return { runs: [], error: `Minute: ${mins.error}` };
  const hours = parseCronField(parts[1], 0, 23);
  if (hours.error) return { runs: [], error: `Hour: ${hours.error}` };
  const days = parseCronField(parts[2], 1, 31);
  if (days.error) return { runs: [], error: `Day: ${days.error}` };
  const months = parseCronField(parts[3], 1, 12);
  if (months.error) return { runs: [], error: `Month: ${months.error}` };
  const weekdays = parseCronField(parts[4], 0, 6);
  if (weekdays.error) return { runs: [], error: `Weekday: ${weekdays.error}` };

  const runs: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);

  // Walk forward day by day (max ~4 years) then scan that day's minutes.
  for (let dayOffset = 0; dayOffset < 366 * 4 && runs.length < count; dayOffset++) {
    cursor.setDate(cursor.getDate() + (dayOffset === 0 ? 0 : 1));
    const monthOk = months.values!.has(cursor.getMonth() + 1);
    const domOk = days.values!.has(cursor.getDate());
    const dowOk = weekdays.values!.has(cursor.getDay());
    // Standard cron semantics: when both DOM and DOW are restricted, either may match.
    const restrictedBoth =
      parts[2] !== "*" && parts[4] !== "*";
    const dateOk = restrictedBoth ? domOk || dowOk : domOk && dowOk;
    if (!monthOk || !dateOk) continue;

    for (let m = 0; m < 24 * 60 && runs.length < count; m++) {
      const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0, m);
      if (candidate <= from) continue;
      if (!hours.values!.has(candidate.getHours())) continue;
      if (!mins.values!.has(candidate.getMinutes())) continue;
      runs.push(candidate);
    }
  }
  return { runs };
};

export const CronExpressionBuilder: React.FC<ToolProps> = ({ onAddToast }) => {
  const [min, setMin] = useState<string>("*");
  const [hour, setHour] = useState<string>("*");
  const [day, setDay] = useState<string>("*");
  const [month, setMonth] = useState<string>("*");
  const [weekday, setWeekday] = useState<string>("*");

  const buildExpression = () => {
    return `${min} ${hour} ${day} ${month} ${weekday}`;
  };

  const getHumanReadable = () => {
    if (min === "*" && hour === "*" && day === "*" && month === "*" && weekday === "*") {
      return "Runs every single minute of every day.";
    }
    const parts: string[] = [];
    if (min !== "*") parts.push(`At minute ${min}`);
    else parts.push("Every minute");

    if (hour !== "*") parts.push(`at hour ${hour}`);
    if (day !== "*") parts.push(`on day of month ${day}`);
    if (month !== "*") parts.push(`of month ${month}`);
    if (weekday !== "*") parts.push(`on weekday ${weekday}`);

    return parts.join(" ") + ".";
  };

  const loadPreset = (m: string, h: string, d: string, mo: string, w: string) => {
    setMin(m);
    setHour(h);
    setDay(d);
    setMonth(mo);
    setWeekday(w);
    onAddToast("Loaded schedule template", "info");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Schedule Intervals" subtitle="Select recurring times">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-main block mb-1 font-sans" htmlFor="advanced-developer-tools-minute-0-59">Minute (0-59)</label>
              <input
                type="text"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
              id="advanced-developer-tools-minute-0-59"/>
            </div>
            <div>
              <label className="text-xs font-bold text-text-main block mb-1 font-sans" htmlFor="advanced-developer-tools-hour-0-23">Hour (0-23)</label>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
              id="advanced-developer-tools-hour-0-23"/>
            </div>
            <div>
              <label className="text-xs font-bold text-text-main block mb-1 font-sans" htmlFor="advanced-developer-tools-day-of-month-1-31">Day of Month (1-31)</label>
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
              id="advanced-developer-tools-day-of-month-1-31"/>
            </div>
            <div>
              <label className="text-xs font-bold text-text-main block mb-1 font-sans" htmlFor="advanced-developer-tools-month-1-12">Month (1-12)</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
              id="advanced-developer-tools-month-1-12"/>
            </div>
            <div>
              <label className="text-xs font-bold text-text-main block mb-1 font-sans" htmlFor="advanced-developer-tools-weekday-0-6">Weekday (0-6)</label>
              <input
                type="text"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full bg-background border border-border-light rounded-xl px-4 py-2 text-sm font-mono text-text-main focus:border-brand-primary outline-none"
              id="advanced-developer-tools-weekday-0-6"/>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card title="Cron Result Payload" subtitle="Compiled expression, interpretation and upcoming runs">
          <div className="space-y-5">
            <div className="flex gap-2 items-center">
              <input aria-label="Cron expression result"
                type="text"
                readOnly
                value={buildExpression()}
                className="flex-1 bg-background border border-border-light rounded-xl px-5 py-4 text-xl font-mono text-brand-primary-dark font-black tracking-widest focus:border-brand-primary outline-none"
              />
              <button
                onClick={() => {
                  copyWithToast(buildExpression(), onAddToast, "Expression copied!");
                }}
                className="p-4 bg-surface-muted hover:bg-brand-primary-light text-text-sub hover:text-brand-primary rounded-xl border border-border-light transition-colors cursor-pointer"
                title="Copy Expression"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-background border border-border-light rounded-[16px] space-y-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block font-mono">Interval Interpretation</span>
              <p className="text-sm text-text-sub font-mono font-medium leading-relaxed">
                {getHumanReadable()}
              </p>
            </div>

            {/* Real next-run preview computed from the expression */}
            {(() => {
              const { runs, error } = getCronNextRuns(buildExpression(), 5);
              return (
                <div className="p-4 bg-background border border-border-light rounded-[16px] space-y-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block font-mono">Next 5 Runs (local time)</span>
                  {error ? (
                    <p className="text-sm text-status-error font-mono">{error}</p>
                  ) : runs.length === 0 ? (
                    <p className="text-sm text-text-sub font-mono">No matching time found within four years.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {runs.map((r, i) => (
                        <li key={i} className="text-sm text-text-main font-mono flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                          {r.toLocaleString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[11px] text-text-muted pt-1">Computed against your device's timezone and clock.</p>
                </div>
              );
            })()}


            {/* Presets */}
            <div className="space-y-2 border-t border-border-light pt-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block font-mono">Interval Presets</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Every Hour", args: ["0", "*", "*", "*", "*"] },
                  { label: "Every Midnight", args: ["0", "0", "*", "*", "*"] },
                  { label: "Every Sunday Midnight", args: ["0", "0", "*", "*", "0"] },
                  { label: "First Day of Month", args: ["0", "0", "1", "*", "*"] }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(p.args[0], p.args[1], p.args[2], p.args[3], p.args[4])}
                    className="text-left px-3.5 py-2.5 border border-border-light bg-surface-base rounded-xl text-xs font-bold text-text-sub hover:bg-brand-primary-light hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    {p.label} <span className="text-[10px] text-text-muted font-mono block font-normal mt-0.5">{p.args.join(" ")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 9. COMPARE TEXT (Text Diff Checker)
// ==========================================
type DiffRow =
  | { type: "unchanged"; orig: string; mod: string; line: number }
  | { type: "added"; mod: string; line: number }
  | { type: "removed"; orig: string; line: number };

/** LCS-based line diff (real longest-common-subsequence, capped for memory safety). */
const computeLcsLineDiff = (aLines: string[], bLines: string[]): DiffRow[] => {
  const MAX = 4000;
  const a = aLines.length > MAX ? aLines.slice(0, MAX) : aLines;
  const b = bLines.length > MAX ? bLines.slice(0, MAX) : bLines;
  const cols = b.length + 1;
  const dp = new Uint32Array((a.length + 1) * cols);
  const at = (i: number, j: number) => i * cols + j;
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[at(i, j)] = a[i] === b[j] ? dp[at(i + 1, j + 1)] + 1 : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);
    }
  }
  const out: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "unchanged", orig: a[i], mod: b[j], line: i + 1 });
      i++;
      j++;
    } else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) {
      out.push({ type: "removed", orig: a[i], line: i + 1 });
      i++;
    } else {
      out.push({ type: "added", mod: b[j], line: j + 1 });
      j++;
    }
  }
  while (i < a.length) out.push({ type: "removed", orig: a[i], line: ++i });
  while (j < b.length) out.push({ type: "added", mod: b[j], line: ++j });
  return out;
};

/** Split two strings into changed words for inline emphasis. */
const changedWords = (a: string, b: string): { removedWords: Set<string>; addedWords: Set<string> } => {
  const tok = (s: string) => s.split(/(\s+)/).filter((t) => t.trim());
  const aw = tok(a);
  const bw = tok(b);
  const cols = bw.length + 1;
  const dp = new Uint32Array((aw.length + 1) * cols);
  const at = (i: number, j: number) => i * cols + j;
  for (let i = aw.length - 1; i >= 0; i--) {
    for (let j = bw.length - 1; j >= 0; j--) {
      dp[at(i, j)] = aw[i] === bw[j] ? dp[at(i + 1, j + 1)] + 1 : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);
    }
  }
  const removedWords = new Set<string>();
  const addedWords = new Set<string>();
  let i = 0;
  let j = 0;
  while (i < aw.length && j < bw.length) {
    if (aw[i] === bw[j]) { i++; j++; }
    else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) { removedWords.add(aw[i++]); }
    else { addedWords.add(bw[j++]); }
  }
  while (i < aw.length) removedWords.add(aw[i++]);
  while (j < bw.length) addedWords.add(bw[j++]);
  return { removedWords, addedWords };
};

export const TextDiffChecker: React.FC<ToolProps> = ({ onAddToast }) => {
  const [original, setOriginal] = useState<string>("Hello, welcome to the GainUtility toolkit platform.\nEnsure your files are processed completely offline.\nHave a wonderful developer day!");
  const [modified, setModified] = useState<string>("Hello, welcome to the GainUtility Studio platforms.\nEnjoy private files processed entirely offline.\nHave a great day!");

  // Real LCS diff recomputed live.
  const diff: DiffRow[] = useMemo(
    () => computeLcsLineDiff(original.split("\n"), modified.split("\n")),
    [original, modified]
  );
  const addedCount = diff.filter((d) => d.type === "added").length;
  const removedCount = diff.filter((d) => d.type === "removed").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Original Text (Base)" subtitle="Original textual payload">
          <textarea aria-label="Original text"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full min-h-[160px] bg-background border border-border-light rounded-xl p-4 text-sm font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed"
          />
        </Card>

        <Card title="Modified Text" subtitle="Comparison string payload">
          <textarea aria-label="Modified text"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="w-full min-h-[160px] bg-background border border-border-light rounded-xl p-4 text-sm font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed"
          />
        </Card>
      </div>

      <Card title="Difference Output" subtitle={`True LCS line diff - ${addedCount} added, ${removedCount} removed`}>
        <div className="border border-border-light rounded-xl overflow-hidden font-mono text-xs text-text-main leading-normal bg-background">
          <div className="grid grid-cols-12 bg-surface-muted/50 p-2 border-b border-border-light text-text-muted font-bold">
            <div className="col-span-1">Line</div>
            <div className="col-span-5.5 pl-2 border-r border-border-light/40">Original Segment</div>
            <div className="col-span-5.5 pl-3">Modified Segment</div>
          </div>

          <div className="divide-y divide-border-light/30">
            {(() => {
              // Render rows; pair consecutive removed+added runs into one visual row.
              const rows: React.ReactNode[] = [];
              let k = 0;
              let rowKey = 0;
              while (k < diff.length) {
                const item = diff[k];
                if (item.type === "unchanged") {
                  rows.push(
                    <div key={rowKey++} className="grid grid-cols-12 min-h-[36px] items-center">
                      <div className="col-span-1 text-center text-text-disabled border-r border-border-light/30 select-none py-1">{item.line}</div>
                      <div className="col-span-5.5 pl-3 pr-2 py-2 border-r border-border-light/30 text-text-muted whitespace-pre-wrap">{item.orig}</div>
                      <div className="col-span-5.5 pl-3 pr-2 py-2 text-text-muted whitespace-pre-wrap">{item.mod}</div>
                    </div>
                  );
                  k++;
                } else {
                  const removedRows: DiffRow[] = [];
                  while (k < diff.length && diff[k].type === "removed") removedRows.push(diff[k++] as DiffRow);
                  const addedRows: DiffRow[] = [];
                  while (k < diff.length && diff[k].type === "added") addedRows.push(diff[k++] as DiffRow);
                  const paired = Math.min(removedRows.length, addedRows.length);
                  for (let p = 0; p < Math.max(removedRows.length, addedRows.length); p++) {
                    const rem = removedRows[p];
                    const add = addedRows[p];
                    const words =
                      rem && add
                        ? changedWords((rem as { orig: string }).orig, (add as { mod: string }).mod)
                        : null;
                    rows.push(
                      <div key={rowKey++} className="grid grid-cols-12 min-h-[36px] items-center">
                        <div className="col-span-1 text-center text-text-disabled border-r border-border-light/30 select-none py-1">
                          {rem ? rem.line : add ? add.line : ""}
                        </div>
                        {rem ? (
                          <div className="col-span-5.5 pl-3 pr-2 py-2 bg-status-error/10 border-r border-border-light/30 text-status-error whitespace-pre-wrap">
                            {words
                              ? (rem as { orig: string }).orig.split(/(\s+)/).map((w, wi) =>
                                  words.removedWords.has(w) ? (
                                    <span key={wi} className="font-bold underline decoration-red-400">{w}</span>
                                  ) : (
                                    <span key={wi}>{w}</span>
                                  )
                                )
                              : (rem as { orig: string }).orig || "(empty line)"}
                          </div>
                        ) : (
                          <div className="col-span-5.5 pl-3 pr-2 py-2 border-r border-border-light/30 text-text-disabled italic">(not present)</div>
                        )}
                        {add ? (
                          <div className="col-span-5.5 pl-3 pr-2 py-2 bg-[#4D7E2B]/10 text-[#4D7E2B] whitespace-pre-wrap">
                            {words
                              ? (add as { mod: string }).mod.split(/(\s+)/).map((w, wi) =>
                                  words.addedWords.has(w) ? (
                                    <span key={wi} className="font-bold underline decoration-green-500">{w}</span>
                                  ) : (
                                    <span key={wi}>{w}</span>
                                  )
                                )
                              : (add as { mod: string }).mod || "(empty line)"}
                          </div>
                        ) : (
                          <div className="col-span-5.5 pl-3 pr-2 py-2 text-text-disabled italic">(deleted)</div>
                        )}
                      </div>
                    );
                  }
                }
              }
              return rows;
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
};


// ==========================================
// 10. CHECK JSON STRUCTURE (JSON Schema Validator)
// ==========================================
/** Recursively validate a value against a subset of JSON Schema draft-07 keywords. */
export const validateAgainstSchema = (
  value: any,
  schema: any,
  path = "root"
): string[] => {
  const errors: string[] = [];
  if (!schema || typeof schema !== "object") return errors;

  // type keyword (string or array of strings)
  if (schema.type) {
    const expected: string[] = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual =
      value === null ? "null"
      : Array.isArray(value) ? "array"
      : typeof value;
    if (!expected.includes(actual)) {
      errors.push(`${path}: expected type ${expected.join(" | ")}, got ${actual}`);
      return errors; // further checks make no sense on wrong type
    }
  }

  if (schema.enum && !schema.enum.some((v: any) => v === value)) {
    errors.push(`${path}: must be one of ${JSON.stringify(schema.enum)} (got ${JSON.stringify(value)})`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum)
      errors.push(`${path}: ${value} is below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum)
      errors.push(`${path}: ${value} is above maximum ${schema.maximum}`);
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength)
      errors.push(`${path}: shorter than minLength ${schema.minLength} (length ${value.length})`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength)
      errors.push(`${path}: longer than maxLength ${schema.maxLength} (length ${value.length})`);
    if (schema.pattern) {
      try {
        if (!new RegExp(schema.pattern).test(value))
          errors.push(`${path}: does not match pattern "${schema.pattern}"`);
      } catch {
        errors.push(`${path}: schema contains an invalid pattern regex`);
      }
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems)
      errors.push(`${path}: fewer than minItems ${schema.minItems} (has ${value.length})`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems)
      errors.push(`${path}: more than maxItems ${schema.maxItems} (has ${value.length})`);
    if (schema.items) {
      value.forEach((item, i) => errors.push(...validateAgainstSchema(item, schema.items, `${path}[${i}]`)));
    }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const reqKey of schema.required ?? []) {
      if (!(reqKey in value)) errors.push(`${path}: missing required property "${reqKey}"`);
    }
    if (schema.properties) {
      Object.keys(schema.properties).forEach((propKey) => {
        if (propKey in value) {
          errors.push(...validateAgainstSchema(value[propKey], schema.properties[propKey], `${path}.${propKey}`));
        }
      });
    }
  }
  return errors;
};

export const JsonSchemaValidator: React.FC<ToolProps> = ({ onAddToast }) => {
  const [jsonInput, setJsonInput] = useState<string>('{\n  "id": 1,\n  "name": "Widget Tool",\n  "count": 50\n}');
  const [schemaInput, setSchemaInput] = useState<string>('{\n  "type": "object",\n  "properties": {\n    "id": { "type": "number" },\n    "name": { "type": "string" },\n    "count": { "type": "number" }\n  },\n  "required": ["id", "name"]\n}');
  const [status, setStatus] = useState<"idle" | "valid" | "error">("idle");
  const [feedback, setFeedback] = useState<string>("");

  const handleValidate = () => {
    try {
      const data = JSON.parse(jsonInput);
      const schema = JSON.parse(schemaInput);

      const errors = validateAgainstSchema(data, schema);

      if (errors.length > 0) {
        setStatus("error");
        setFeedback(errors.join("\n"));
        onAddToast(`JSON fails schema constraints (${errors.length} issue${errors.length === 1 ? "" : "s"})`, "error");
      } else {
        setStatus("valid");
        setFeedback("Success! JSON conforms to all supported schema constraints.");
        onAddToast("JSON successfully validated!", "success");
      }
    } catch (e: any) {
      setStatus("error");
      setFeedback("JSON syntax error: " + e.message);
      onAddToast("JSON syntax error detected", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="JSON Payload and Schema" subtitle="Input documents to audit constraints">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5 font-mono" htmlFor="advanced-developer-tools-json-document">JSON Document</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full min-h-[120px] bg-background border border-border-light rounded-xl p-3.5 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-normal"
            id="advanced-developer-tools-json-document"/>
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5 font-mono" htmlFor="advanced-developer-tools-json-schema">JSON Schema</label>
            <textarea
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              className="w-full min-h-[140px] bg-background border border-border-light rounded-xl p-3.5 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-normal"
            id="advanced-developer-tools-json-schema"/>
          </div>
          <button
            onClick={handleValidate}
            className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            Audit Document Structures
          </button>
        </div>
      </Card>

      <Card title="Validation Log" subtitle="Real-time compliance audit logging">
        {status === "idle" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted gap-3">
            <CheckSquare className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm font-medium">Click audit to examine JSON fields against schemas.</p>
          </div>
        ) : status === "valid" ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#4D7E2B]/10 flex items-center justify-center text-[#4D7E2B]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-[#4D7E2B] text-xl">Validation Success</h4>
              <p className="text-sm text-text-muted mt-1.5 font-mono">{feedback}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-status-error/10 border border-status-error/20 text-status-error rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed animate-fade-in">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Constraint Errors Detected</span>
            </div>
            {feedback}
          </div>
        )}
      </Card>
    </div>
  );
};


// ==========================================
// 11. SEARCH JSON DATA (JSONPath Tester)
// ==========================================
/**
 * Real JSONPath evaluator supporting the widely used subset:
 * $ root · .key / ['key'] · ..key recursive descent · [n] [-n] [n,m] union
 * [start:end:step] slices · [*] wildcards · [?(...)] filter expressions with
 * ==, !=, <, >, <=, >=, =~ and && / || over @ properties.
 */
export const evaluateJsonPath = (
  data: any,
  path: string
): { values: any[]; error?: string } => {
  try {
    if (!path.trim().startsWith("$")) {
      return { values: [], error: "Expression must start with '$' (the root object)" };
    }
    // Tokenize into segments.
    const tokens: Array<{ op: string; value?: any }> = [];
    let i = 1;
    while (i < path.length) {
      const c = path[i];
      if (c === "." && path[i + 1] === ".") {
        // recursive descent ..key or ..*
        i += 2;
        if (path[i] === "*") {
          tokens.push({ op: "recursiveAll" });
          i++;
        } else {
          const m = path.slice(i).match(/^[\w$-]+/);
          if (!m) return { values: [], error: "Expected property name after '..'" };
          tokens.push({ op: "recursive", value: m[0] });
          i += m[0].length;
        }
      } else if (c === ".") {
        i++;
        if (path[i] === "*") {
          tokens.push({ op: "allProps" });
          i++;
        } else {
          const m = path.slice(i).match(/^[\w$-]+/);
          if (!m) return { values: [], error: "Expected property name after '.'" };
          tokens.push({ op: "prop", value: m[0] });
          i += m[0].length;
        }
      } else if (c === "[") {
        const end = path.indexOf("]", i);
        if (end === -1) return { values: [], error: "Unclosed '[' in expression" };
        const inner = path.slice(i + 1, end).trim();
        i = end + 1;
        if (/^\*\s*$/.test(inner)) {
          tokens.push({ op: "allItems" });
        } else if (inner.startsWith("?")) {
          const expr = inner.replace(/^\?\s*/, "").replace(/^\(/, "").replace(/\)$/, "").trim();
          tokens.push({ op: "filter", value: expr });
        } else if (inner.startsWith("'") || inner.startsWith('"')) {
          const key = inner.slice(1, -1);
          tokens.push({ op: "prop", value: key });
        } else if (inner.includes(":")) {
          const parts = inner.split(":").map((p) => p.trim());
          tokens.push({
            op: "slice",
            value: {
              start: parts[0] ? parseInt(parts[0]) : undefined,
              end: parts[1] ? parseInt(parts[1]) : undefined,
              step: parts[2] ? parseInt(parts[2]) : 1,
            },
          });
        } else if (inner.includes(",")) {
          tokens.push({ op: "union", value: inner.split(",").map((p) => parseInt(p.trim())) });
        } else {
          const idx = parseInt(inner);
          if (!Number.isFinite(idx)) return { values: [], error: `Unsupported selector "[${inner}]"` };
          tokens.push({ op: "index", value: idx });
        }
      } else if (/\s/.test(c)) {
        i++;
      } else {
        return { values: [], error: `Unexpected character "${c}" at position ${i}` };
      }
    }

    const evalFilter = (obj: any, expr: string): boolean => {
      // Split on || then && at top level (no nested parens support beyond outer).
      return expr.split("||").some((orPart) =>
        orPart.split("&&").every((andPart) => {
          const t = andPart.trim();
          const cmp = t.match(/^@\.?([\w$-]*(?:\.[\w$-]+)*)\s*(==|!=|>=|<=|>|<|=~)\s*(.+)$/);
          if (!cmp) {
            // Truthiness test like [@.isActive]
            const prop = t.match(/^@\.?([\w$-.]+)$/);
            if (prop) {
              const v = prop[1].split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
              return Boolean(v);
            }
            return false;
          }
          const left = cmp[1]
            .split(".")
            .filter(Boolean)
            .reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
          const rawRight = cmp[3].trim();
          let right: any;
          if (/^'.*'$/.test(rawRight) || /^".*"$/.test(rawRight)) right = rawRight.slice(1, -1);
          else if (/^-?\d+(\.\d+)?$/.test(rawRight)) right = parseFloat(rawRight);
          else if (/^(true|false|null)$/i.test(rawRight)) right = rawRight.toLowerCase() === "null" ? null : rawRight.toLowerCase() === "true";
          switch (cmp[2]) {
            case "==": return left == right; // eslint-disable-line eqeqeq
            case "!=": return left != right; // eslint-disable-line eqeqeq
            case ">": return Number(left) > Number(right);
            case "<": return Number(left) < Number(right);
            case ">=": return Number(left) >= Number(right);
            case "<=": return Number(left) <= Number(right);
            case "=~":
              try {
                return new RegExp(rawRight).test(String(left));
              } catch {
                return false;
              }
            default: return false;
          }
        })
      );
    };

    const descend = (current: any, tokenIdx: number, out: any[]) => {
      if (tokenIdx >= tokens.length) {
        out.push(current);
        return;
      }
      const tok = tokens[tokenIdx];
      const next = (val: any) => descend(val, tokenIdx + 1, out);

      switch (tok.op) {
        case "prop":
          if (Array.isArray(current) || (current && typeof current === "object")) {
            if (current != null && tok.value in Object(current)) next(current[tok.value]);
          }
          break;
        case "recursive":
        case "recursiveAll": {
          const visit = (node: any) => {
            if (Array.isArray(node)) node.forEach(visit);
            else if (node && typeof node === "object") {
              if (tok.op === "recursive") {
                if (tok.value in node) next(node[tok.value]);
              } else {
                Object.values(node).forEach((v) => (Array.isArray(v) ? v.forEach(next) : next(v)));
              }
              Object.values(node).forEach(visit);
            }
          };
          visit(current);
          break;
        }
        case "allProps":
          if (current && typeof current === "object" && !Array.isArray(current)) {
            Object.values(current).forEach(next);
          }
          break;
        case "allItems":
          if (Array.isArray(current)) current.forEach(next);
          break;
        case "index": {
          const idx = tok.value as number;
          if (Array.isArray(current)) {
            const real = idx < 0 ? current.length + idx : idx;
            if (real >= 0 && real < current.length) next(current[real]);
          }
          break;
        }
        case "union":
          if (Array.isArray(current)) {
            (tok.value as number[]).forEach((n) => {
              const real = n < 0 ? current.length + n : n;
              if (real >= 0 && real < current.length) next(current[real]);
            });
          }
          break;
        case "slice": {
          if (Array.isArray(current)) {
            const { start, end, step } = tok.value as { start?: number; end?: number; step: number };
            const len = current.length;
            const s = start ?? (step! > 0 ? 0 : len - 1);
            const e = end ?? (step! > 0 ? len : -len - 1);
            const st = step || 1;
            if (st > 0) for (let k = Math.max(s, -len); k < Math.min(e, len); k += st) next(current[k]);
            else for (let k = Math.min(s, len - 1); k > e; k += st) if (k >= 0) next(current[k]);
          }
          break;
        }
        case "filter":
          if (Array.isArray(current)) {
            current.forEach((item) => {
              if (item != null && evalFilter(item, tok.value as string)) next(item);
            });
          } else if (current && typeof current === "object") {
            Object.values(current).forEach((item) => {
              if (item != null && evalFilter(item, tok.value as string)) next(item);
            });
          }
          break;
      }
    };

    const values: any[] = [];
    descend(data, 0, values);
    return { values };
  } catch (err: any) {
    return { values: [], error: err?.message || "Evaluation failed" };
  }
};

export const JsonpathTester: React.FC<ToolProps> = ({ onAddToast }) => {
  const [jsonStr, setJsonStr] = useState<string>('{\n  "store": {\n    "books": [\n      { "title": "GainUtility Code", "price": 10 },\n      { "title": "Visual Design Principles", "price": 15 }\n    ]\n  }\n}');
  const [query, setQuery] = useState<string>("$.store.books[*].title");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonStr);
      const { values, error } = evaluateJsonPath(parsed, query);
      if (error) {
        setResult(`Query error: ${error}`);
      } else {
        setResult(
          values.length === 0
            ? "No matches found."
            : JSON.stringify(values.length === 1 ? values[0] : values, null, 2)
        );
      }
    } catch (e: any) {
      setResult("Invalid JSON payload: " + e.message);
    }
  }, [jsonStr, query]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="JSON Base Payload" subtitle="Source data for structural queries">
        <textarea aria-label="JSON payload"
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          className="w-full min-h-[160px] bg-background border border-border-light rounded-xl p-4 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed h-44"
        />
        <div className="space-y-2 mt-4">
          <label className="text-xs font-bold text-text-muted block uppercase tracking-wider font-mono" htmlFor="advanced-developer-tools-jsonpath-expression">JSONPath Expression</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-background border border-border-light rounded-xl px-4 py-2.5 text-sm font-mono text-brand-primary-dark font-bold focus:border-brand-primary outline-none"
          id="advanced-developer-tools-jsonpath-expression"/>
        </div>
      </Card>

      <Card title="QueryResult" subtitle="Matched elements output">
        {result ? (
          <div className="space-y-4">
            <textarea aria-label="Query result"
              readOnly
              value={result}
              className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-base sm:text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed"
            />
            <button
              onClick={() => {
                copyWithToast(result, onAddToast, "Result copied");
              }}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Copy Query Result
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted gap-3">
            <Search className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm font-medium">QueryResult matches will compile here.</p>
          </div>
        )}
      </Card>
    </div>
  );
};


// ==========================================
// 12. CSV JSON CONVERTER
// ==========================================
export const CsvJsonConverter: React.FC<ToolProps> = ({ onAddToast }) => {
  const [activeMode, setActiveMode] = useState<"csv2json" | "json2csv">("csv2json");
  const [input, setInput] = useState<string>("id,name,role\n1,Alex Mercer,Lead Dev\n2,Jane Doe,UI Designer");
  const [output, setOutput] = useState<string>("");

  /** RFC 4180-style quoting for JSON->CSV output. */
  const csvEscape = (v: unknown): string => {
    const s =
      v === null || v === undefined ? ""
      : typeof v === "object" ? JSON.stringify(v)
      : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  useEffect(() => {
    try {
      if (activeMode === "csv2json") {
        import("./pdf/helpers").then(({ parseCsv }) => {
          try {
            const rows = parseCsv(input);
            if (rows.length < 1 || !rows[0].some((h) => h.trim())) {
              setOutput("[]");
              return;
            }
            const headers = rows[0];
            const result = rows.slice(1).map((row) => {
              const obj: Record<string, string> = {};
              headers.forEach((h, idx) => {
                obj[h.trim()] = row[idx] !== undefined ? row[idx] : "";
              });
              return obj;
            });
            setOutput(JSON.stringify(result, null, 2));
          } catch (e: any) {
            setOutput("Conversion Error: " + e.message);
          }
        });
      } else {
        const parsed = JSON.parse(input);
        if (!Array.isArray(parsed) || parsed.length === 0 || typeof parsed[0] !== "object") {
          throw new Error("JSON input must be a non-empty array of objects");
        }
        // Union of keys across all rows preserves columns missing from the first record.
        const headers: string[] = [];
        const seen = new Set<string>();
        parsed.forEach((obj: Record<string, unknown>) => {
          Object.keys(obj).forEach((k) => {
            if (!seen.has(k)) {
              seen.add(k);
              headers.push(k);
            }
          });
        });
        const csvRows = [headers.map(csvEscape).join(",")];
        parsed.forEach((obj: Record<string, unknown>) => {
          csvRows.push(headers.map((h) => csvEscape(obj[h])).join(","));
        });
        setOutput(csvRows.join("\n"));
      }
    } catch (e: any) {
      setOutput("Conversion Error: " + e.message);
    }
  }, [input, activeMode]);

  return (
    <div className="space-y-6">
      <div className="flex bg-surface-base border border-border-light p-1 rounded-2xl max-w-xs">
        <button
          onClick={() => {
            setActiveMode("csv2json");
            setInput("id,name,role\n1,Alex Mercer,Lead Dev\n2,Jane Doe,UI Designer");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === "csv2json" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          CSV to JSON
        </button>
        <button
          onClick={() => {
            setActiveMode("json2csv");
            setInput('[\n  { "id": 1, "name": "Alex Mercer", "role": "Lead Dev" },\n  { "id": 2, "name": "Jane Doe", "role": "UI Designer" }\n]');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === "json2csv" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          JSON to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Source Input Area" subtitle="Paste input values to convert">
          <textarea aria-label="Source input area"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
          />
        </Card>

        <Card title="Converted Output Area" subtitle="Formatted converted string results">
          <div className="space-y-4">
            <textarea aria-label="Converted output area"
              readOnly
              value={output}
              className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-base sm:text-xs font-mono text-brand-primary-dark font-bold focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
            />
            <button
              onClick={() => {
                copyWithToast(output, onAddToast, "Result copied to clipboard!");
              }}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Copy Outputs
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 13. XML JSON CONVERTER
// ==========================================
/** Convert an XML DOM node into plain JSON (attributes as @keys, repeated elements become arrays). */
const xmlNodeToJson = (node: Element): any => {
  const obj: Record<string, unknown> = {};
  Array.from(node.attributes).forEach((attr) => {
    obj[`@${attr.name}`] = attr.value;
  });
  const elementChildren = Array.from(node.children);
  if (elementChildren.length === 0) {
    const text = node.textContent?.trim() ?? "";
    if (Object.keys(obj).length === 0) return text === "" ? null : coerceXmlText(text);
    obj["#text"] = coerceXmlText(text);
    return obj;
  }
  elementChildren.forEach((child) => {
    const value = xmlNodeToJson(child);
    if (child.tagName in obj) {
      const existing = obj[child.tagName];
      if (Array.isArray(existing)) existing.push(value);
      else obj[child.tagName] = [existing, value];
    } else {
      obj[child.tagName] = value;
    }
  });
  return obj;
};

/** Numbers stay strings unless they cleanly parse; keeps leading zeros / IDs intact. */
const coerceXmlText = (text: string): string | number | boolean => {
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
};

const escapeXmlText = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeXmlAttribute = (value: string): string =>
  escapeXmlText(value).replace(/"/g, "&quot;");

/** Recursively build XML from JSON objects/arrays. */
const jsonToXmlString = (key: string, value: any, indent: string): string => {
  if (Array.isArray(value)) {
    return value.map((item) => jsonToXmlString(key, item, indent)).join("\n");
  }
  if (value !== null && typeof value === "object") {
    const attrs = Object.keys(value)
      .filter((k) => k.startsWith("@"))
      .map((k) => ` ${k.slice(1)}="${escapeXmlAttribute(String(value[k]))}"`)
      .join("");
    const children = Object.keys(value).filter((k) => !k.startsWith("@") && k !== "#text");
    const text = "#text" in value ? String(value["#text"]) : "";
    if (children.length === 0 && text === "") {
      return `${indent}<${key}${attrs}/>`;
    }
    if (children.length === 0) {
      return `${indent}<${key}${attrs}>${escapeXmlText(text)}</${key}>`;
    }
    const inner = children
      .map((childKey) => jsonToXmlString(childKey, value[childKey], indent + "  "))
      .join("\n");
    const textPart = text !== "" ? `\n${indent}  ${escapeXmlText(text)}` : "";
    return `${indent}<${key}${attrs}>${textPart}\n${inner}\n${indent}</${key}>`;
  }
  const strValue = value === null || value === undefined ? "" : String(value);
  return `${indent}<${key}>${escapeXmlText(strValue)}</${key}>`;
};

export const XmlJsonConverter: React.FC<ToolProps> = ({ onAddToast }) => {
  const [activeMode, setActiveMode] = useState<"xml2json" | "json2xml">("xml2json");
  const [input, setInput] = useState<string>("<user id=\"1\">\n  <name>Alex Mercer</name>\n  <roles>\n    <role>Lead Dev</role>\n    <role>Reviewer</role>\n  </roles>\n  <active>true</active>\n</user>");
  const [output, setOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    try {
      setErrorMsg("");
      if (activeMode === "xml2json") {
        const doc = new DOMParser().parseFromString(input, "application/xml");
        const parseError = doc.querySelector("parsererror");
        if (parseError) throw new Error("Invalid XML: " + (parseError.textContent ?? "").split("\n")[0]);
        const root = doc.documentElement;
        if (!root) throw new Error("No root element found");
        const converted = { [root.tagName]: xmlNodeToJson(root) };
        setOutput(JSON.stringify(converted, null, 2));
      } else {
        const parsed = JSON.parse(input);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("JSON input must be an object with a single root key");
        }
        const rootKey = Object.keys(parsed)[0];
        if (!rootKey) throw new Error("JSON object has no root key");
        setOutput('<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXmlString(rootKey, parsed[rootKey], ""));
      }
    } catch (e: any) {
      setOutput("");
      setErrorMsg(e.message);
    }
  }, [input, activeMode]);

  return (
    <div className="space-y-6">
      <div className="flex bg-surface-base border border-border-light p-1 rounded-2xl max-w-xs">
        <button
          onClick={() => {
            setActiveMode("xml2json");
            setInput('<user id="1">\n  <name>Alex Mercer</name>\n  <roles>\n    <role>Lead Dev</role>\n    <role>Reviewer</role>\n  </roles>\n  <active>true</active>\n</user>');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === "xml2json" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          XML to JSON
        </button>
        <button
          onClick={() => {
            setActiveMode("json2xml");
            setInput('{\n  "id": "1",\n  "name": "Alex Mercer"\n}');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === "json2xml" ? "bg-brand-primary text-[#FAF8F1]" : "text-text-sub hover:text-brand-primary"
          }`}
        >
          JSON to XML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Source Markup Input" subtitle="Enter source tags to cross-convert">
          <textarea aria-label="Source markup input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
          />
        </Card>

        <Card title="Markup Output" subtitle="Parsed conversion results">
          <div className="space-y-4">
            {errorMsg ? (
              <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs rounded-xl p-4 font-mono">
                {errorMsg}
              </div>
            ) : (
              <textarea aria-label="Markup output"
                readOnly
                value={output}
                className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-base sm:text-xs font-mono text-brand-primary-dark font-bold focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
              />
            )}
            <button
              onClick={() => {
                copyWithToast(output, onAddToast, "Markups copied");
              }}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Copy Output Result
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 14. SQL FORMATTER
// ==========================================
/** Reserved words upper-cased during formatting (only outside string/comment tokens). */
const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET",
  "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN", "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN", "FULL OUTER JOIN", "JOIN", "ON", "USING", "AND", "OR", "NOT",
  "IN", "AS", "ASC", "DESC", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
  "DISTINCT", "BETWEEN", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL", "CASE", "WHEN",
  "THEN", "ELSE", "END", "UNION ALL", "UNION", "EXISTS", "NULL", "TRUE", "FALSE",
  "COUNT", "SUM", "AVG", "MIN", "MAX"
];

const SQL_NEWLINE_CLAUSES = [
  "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET",
  "VALUES", "UNION ALL", "UNION",
  "INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN",
  "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN", "INSERT INTO", "UPDATE", "SET", "DELETE FROM"
];

/**
 * Real formatting pass: protects literals & comments, normalizes keywords,
 * lays out clauses across lines, then restores the original token text.
 */
export const formatSqlCommand = (raw: string): string => {
  // Pass 1: stash string literals, quoted identifiers, and comments so they are never touched.
  const stashed: string[] = [];
  const stash = (m: string) => {
    stashed.push(m);
    return `\u0000${stashed.length - 1}\u0000`;
  };
  let work = raw
    .replace(/'(?:[^']|'')*'/g, stash)
    .replace(/"(?:[^"]|"")*"/g, stash)
    .replace(/--[^\n]*/g, stash)
    .replace(/\/\*[\s\S]*?\*\//g, stash);

  // Collapse whitespace between words.
  work = work.replace(/\s+/g, " ").trim();

  // Pass 2: normalize keyword casing (longest phrases first so LEFT OUTER JOIN wins over LEFT/JOIN).
  const orderedKeywords = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const k of orderedKeywords) {
    work = work.replace(new RegExp(`\\b${k.replace(/ /g, "\\s+")}\\b`, "gi"), k);
  }

  // Pass 3: newline layout before major clauses; indent continuation keywords.
  for (const clause of [...SQL_NEWLINE_CLAUSES].sort((a, b) => b.length - a.length)) {
    work = work.replace(new RegExp(`\\s*\\b${clause.replace(/ /g, "\\s+")}\\b`, "g"), `\n${clause}`);
  }
  work = work
    .replace(/\s*\bAND\b/g, "\n  AND")
    .replace(/\s*\bOR\b/g, "\n   OR")
    .replace(/\s*\bON\b/g, "\n  ON")
    .replace(/,(?!\u0000)/g, ",")
    .trim();

  // Pass 4: restore original literal text.
  work = work.replace(/\u0000(\d+)\u0000/g, (_m, idx) => stashed[Number(idx)]);
  return work;
};

export const SqlFormatter: React.FC<ToolProps> = ({ onAddToast }) => {
  const [sql, setSql] = useState<string>("select id,name,created_at from users where active=1 and role='admin' order by created_at desc limit 20;");
  const formatted = useMemo(() => formatSqlCommand(sql), [sql]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Raw SQL Query" subtitle="Paste your unformatted SQL stream">
        <textarea aria-label="Raw SQL query"
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
        />
      </Card>

      <Card title="Formatted SQL Statement" subtitle="Clause layout with protected string literals">
        <div className="space-y-4">
          <textarea aria-label="Formatted SQL statement"
            readOnly
            value={formatted}
            className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-base sm:text-xs font-mono text-brand-primary-dark font-bold focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
          />
          <button
            onClick={() => {
              copyWithToast(formatted, onAddToast, "Formatted SQL copied");
            }}
            className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy Query Statement
          </button>
        </div>
      </Card>
    </div>
  );
};


// ==========================================
// 15. YAML FORMATTER
// ==========================================
export const YamlFormatter: React.FC<ToolProps> = ({ onAddToast }) => {
  const [yaml, setYaml] = useState<string>("server:\n  port: 3000\n  host: 0.0.0.0\ndatabase:\n  enabled: true\n  pool: 10");
  const [formatted, setFormatted] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [outputFormat, setOutputFormat] = useState<"yaml" | "json">("yaml");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const YAML = await import("js-yaml");
        if (cancelled) return;
        const parsed = YAML.load(yaml, { json: true });
        setError("");
        setFormatted(
          outputFormat === "yaml"
            ? YAML.dump(parsed, { indent, lineWidth: -1, noRefs: true })
            : JSON.stringify(parsed, null, indent)
        );
      } catch (err: any) {
        if (cancelled) return;
        const line = err?.mark?.line != null ? err.mark.line + 1 : "?";
        const col = err?.mark?.column != null ? err.mark.column + 1 : "?";
        setError(err?.reason ? `${err.reason} (line ${line}, column ${col})` : err?.message || "Invalid YAML");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [yaml, indent, outputFormat]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="YAML Document Input" subtitle="Parsed with a real YAML engine (js-yaml)">
        <textarea
          value={yaml}
          onChange={(e) => setYaml(e.target.value)}
          aria-label="YAML input"
          className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Indent</label>
          {([2, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                indent === n
                  ? "bg-brand-primary-light text-brand-primary border border-brand-primary"
                  : "bg-surface-base border border-border-light text-text-sub hover:bg-surface-muted"
              }`}
            >
              {n} spaces
            </button>
          ))}
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono ml-2">Output</label>
          {(["yaml", "json"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setOutputFormat(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                outputFormat === f
                  ? "bg-brand-primary-light text-brand-primary border border-brand-primary"
                  : "bg-surface-base border border-border-light text-text-sub hover:bg-surface-muted"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        {error && (
          <div className="mt-3 p-3 bg-status-error/10 border border-status-error/25 text-status-error rounded-xl text-xs font-mono" role="alert">
            {error}
          </div>
        )}
      </Card>

      <Card title="Formatted Output" subtitle="Re-serialized from the parsed document tree">
        <div className="space-y-4">
          <textarea
            readOnly
            value={formatted}
            aria-label="Formatted YAML output"
            className="w-full min-h-[180px] bg-background border border-border-light rounded-xl p-4 text-base sm:text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed h-52"
          />
          <button
            onClick={() => {
              copyWithToast(formatted, onAddToast, "Formatted output copied!");
            }}
            className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy Output
          </button>
        </div>
      </Card>
    </div>
  );
};


// ==========================================
// 16. HTTP STATUS CODE LOOKUP
// ==========================================
export const HttpStatusCodeLookup: React.FC<ToolProps> = ({ onAddToast }) => {
  const [query, setQuery] = useState<string>("");

  const codes = [
    { code: 200, name: "OK", type: "Success", desc: "The standard server response for successful HTTP requests." },
    { code: 201, name: "Created", type: "Success", desc: "The request has been fulfilled and has resulted in a new resource being created." },
    { code: 301, name: "Moved Permanently", type: "Redirection", desc: "This and all future requests should be directed to the given URI." },
    { code: 302, name: "Found", type: "Redirection", desc: "Temporary redirect to a different resource URI location." },
    { code: 400, name: "Bad Request", type: "Client Error", desc: "The server cannot or will not process the request due to an apparent client error." },
    { code: 401, name: "Unauthorized", type: "Client Error", desc: "Similar to 403 Forbidden, but specifically for use when authentication is required and has failed." },
    { code: 403, name: "Forbidden", type: "Client Error", desc: "The request was valid, but the server is refusing action. The user might not have the necessary permissions." },
    { code: 404, name: "Not Found", type: "Client Error", desc: "The requested resource could not be found but may be available in the future." },
    { code: 429, name: "Too Many Requests", type: "Client Error", desc: "The user has sent too many requests in a given amount of time. Rate limiting active." },
    { code: 500, name: "Internal Server Error", type: "Server Error", desc: "A generic error message, given when an unexpected condition was encountered." },
    { code: 502, name: "Bad Gateway", type: "Server Error", desc: "The server was acting as a gateway or proxy and received an invalid response from the upstream server." },
    { code: 503, name: "Service Unavailable", type: "Server Error", desc: "The server is currently unavailable (because it is overloaded or down for maintenance)." }
  ];

  const filtered = codes.filter((item) => {
    return (
      item.code.toString().includes(query) ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search HTTP status codes (e.g. 404, Unauthorized)..."
          className="w-full bg-surface-base border border-border-light rounded-xl pl-11 pr-4 py-3 text-sm text-text-main focus:border-brand-primary outline-none h-12"
        />
        <Search className="w-5 h-5 text-text-muted absolute left-4 top-3.5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.code} className="bg-surface-base border border-border-light rounded-[20px] p-6 shadow-premium-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono font-black text-brand-primary-dark">{item.code}</span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  item.type === "Success" 
                    ? "bg-[#4D7E2B]/10 border-[#4D7E2B]/20 text-[#4D7E2B]" 
                    : item.type === "Redirection" 
                      ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" 
                      : "bg-status-error/10 border-status-error/20 text-status-error"
                }`}>
                  {item.type}
                </span>
              </div>
              <h4 className="font-sans font-bold text-text-main text-lg">{item.name}</h4>
              <p className="text-xs text-text-sub leading-relaxed">{item.desc}</p>
            </div>
            <button
              onClick={() => {
                copyWithToast(`${item.code} ${item.name}: ${item.desc}`, onAddToast, `Copied ${item.code} details`);
              }}
              className="mt-4 text-xs font-bold text-brand-primary hover:text-brand-primary-dark font-sans flex items-center gap-1 cursor-pointer transition-colors"
            >
              Copy Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


// ==========================================
// 17. MIME TYPE LOOKUP (File Type Finder)
// ==========================================
export const MimeTypeLookup: React.FC<ToolProps> = ({ onAddToast }) => {
  const [query, setQuery] = useState<string>("");

  const types = [
    { ext: ".json", mime: "application/json", desc: "JSON (JavaScript Object Notation) format" },
    { ext: ".pdf", mime: "application/pdf", desc: "Portable Document Format" },
    { ext: ".png", mime: "image/png", desc: "Portable Network Graphics image" },
    { ext: ".jpg", mime: "image/jpeg", desc: "JPEG Joint Photographic Experts Group image" },
    { ext: ".html", mime: "text/html", desc: "HyperText Markup Language file" },
    { ext: ".css", mime: "text/css", desc: "Cascading Style Sheets" },
    { ext: ".js", mime: "text/javascript", desc: "JavaScript script payload" },
    { ext: ".xml", mime: "application/xml", desc: "XML Extensible Markup Language document" },
    { ext: ".csv", mime: "text/csv", desc: "Comma-Separated Values file" },
    { ext: ".zip", mime: "application/zip", desc: "ZIP Compressed Archive" }
  ];

  const filtered = types.filter((t) => {
    return (
      t.ext.toLowerCase().includes(query.toLowerCase()) ||
      t.mime.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search extensions or mime headers (e.g. .json, application/pdf)..."
          className="w-full bg-surface-base border border-border-light rounded-xl pl-11 pr-4 py-3 text-sm text-text-main focus:border-brand-primary outline-none h-12"
        />
        <Search className="w-5 h-5 text-text-muted absolute left-4 top-3.5" />
      </div>

      <div className="bg-surface-base border border-border-light rounded-[20px] shadow-premium-sm overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm border-collapse">
          <thead>
            <tr className="bg-surface-muted/50 border-b border-border-light font-sans font-bold text-text-muted text-xs uppercase tracking-wider">
              <th className="p-4 pl-6">Extension</th>
              <th className="p-4">MIME Header Type</th>
              <th className="p-4 pr-6">General Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light/40">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-brand-primary-light/5 transition-colors">
                <td className="p-4 pl-6 font-mono font-bold text-brand-primary-dark">{item.ext}</td>
                <td className="p-4 font-mono text-text-main">{item.mime}</td>
                <td className="p-4 pr-6 text-xs text-text-sub flex justify-between items-center">
                  <span>{item.desc}</span>
                  <button
                    onClick={() => {
                      copyWithToast(item.mime, onAddToast, `Copied ${item.mime}`);
                    }}
                    className="p-1.5 hover:bg-brand-primary-light text-text-muted hover:text-brand-primary rounded transition-colors cursor-pointer"
                    title="Copy MIME Type"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// ==========================================
// 18. URL PARSER (URL Breakdown)
// ==========================================
export const UrlParser: React.FC<ToolProps> = ({ onAddToast }) => {
  const [urlStr, setUrlStr] = useState<string>("https://subdomain.gainutility.com:3000/api/v1/users?active=true#section-hash");
  const [parsed, setParsed] = useState<any>(null);

  const handleParse = () => {
    try {
      const url = new URL(urlStr.trim());
      const queryParams: { key: string; value: string }[] = [];
      url.searchParams.forEach((val, key) => {
        queryParams.push({ key, value: val });
      });

      setParsed({
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port || "default",
        pathname: url.pathname,
        hash: url.hash || "none",
        query: queryParams
      });
      onAddToast("Parsed URL structures successfully", "success");
    } catch (e) {
      setParsed(null);
    }
  };

  useEffect(() => {
    handleParse();
  }, [urlStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Source URL Input" subtitle="Paste link string to parse">
          <textarea
            value={urlStr}
            onChange={(e) => setUrlStr(e.target.value)}
            placeholder="Paste your custom HTTPS URL link..."
            className="w-full min-h-[140px] bg-background border border-border-light rounded-xl p-4 text-xs font-mono text-text-main focus:border-brand-primary outline-none resize-none leading-relaxed"
          />
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card title="Structural Breakdown" subtitle="Parsed protocol, hostname, search queries and fragment hashes">
          {parsed ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {[
                  { label: "PROTOCOL", value: parsed.protocol },
                  { label: "HOST", value: parsed.host },
                  { label: "PORT", value: parsed.port },
                  { label: "PATHWAY", value: parsed.pathname },
                  { label: "HASH ANCHOR", value: parsed.hash }
                ].map((item, idx) => (
                  <div key={idx} className="bg-background border border-border-light p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="block text-text-muted text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
                      <span className="text-brand-primary-dark font-black mt-0.5 block">{item.value}</span>
                    </div>
                    <button
                      onClick={() => {
                        copyWithToast(item.value, onAddToast, `Copied ${item.label}`);
                      }}
                      aria-label={`Copy ${item.label}`}
                      className="p-1.5 min-w-8 min-h-8 inline-flex items-center justify-center bg-surface-muted hover:bg-brand-primary-light text-text-sub hover:text-brand-primary rounded transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              {parsed.query.length > 0 && (
                <div className="bg-background border border-border-light p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted font-mono block mb-2">QUERY PARAMS</span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {parsed.query.map((q: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-border-light/40 last:border-0">
                        <span className="text-brand-accent font-bold">{q.key}</span>
                        <span className="text-text-main">{q.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted gap-3">
              <Globe className="w-12 h-12 stroke-[1.5]" />
              <p className="text-sm font-medium">Please enter a valid URL in the left input panel.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 19. REMOVE EXIF METADATA
// ==========================================
export const ImageMetadataRemover: React.FC<ToolProps> = ({ onAddToast }) => {
  const [imageName, setImageName] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isStripped, setIsStripped] = useState<boolean>(false);
  // Real byte sizes + output mime, so the UI never shows estimates.
  const [originalBytes, setOriginalBytes] = useState<number>(0);
  const [strippedBytes, setStrippedBytes] = useState<number>(0);
  const [outputMime, setOutputMime] = useState<string>("");

  const dataUrlToBytes = (dataUrl: string): number => {
    const base64 = dataUrl.split(",")[1] ?? "";
    return Math.floor((base64.length * 3) / 4);
  };

  const handleFileLoaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageName(file.name);
      setOriginalBytes(file.size);
      setStrippedBytes(0);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
          setIsStripped(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStripMetadata = () => {
    if (!imagePreview) return;

    // Canvas re-encode drops EXIF/GPS/IPTC metadata blocks. Output keeps the
    // source format family: PNG/WebP stay lossless (transparency preserved),
    // JPEG is re-encoded at 92% quality. Note: ICC profiles and animation are
    // also removed by this process - stated honestly rather than hidden.
    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const wasJpeg = imagePreview.startsWith("data:image/jpeg");
      const mime = wasJpeg ? "image/jpeg" : "image/png";
      if (wasJpeg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const strippedDataUrl = canvas.toDataURL(mime, 0.92);
      setImagePreview(strippedDataUrl);
      setOutputMime(mime);
      setStrippedBytes(dataUrlToBytes(strippedDataUrl));
      setIsStripped(true);
      onAddToast("Metadata stripped - clean image ready to download", "success");
    };
    img.onerror = () => onAddToast("Could not decode image for cleaning", "error");
  };

  const handleDownload = () => {
    const ext = outputMime === "image/jpeg" ? "jpg" : "png";
    const link = document.createElement("a");
    link.href = imagePreview;
    link.download = `cleaned_${(imageName || "image").replace(/\.[^.]+$/, "")}.${ext}`;
    link.click();
    onAddToast("Downloaded stripped image file", "success");
  };

  const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Load Image Asset" subtitle="Load PNG/JPEG/WebP images to strip headers completely offline">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border-medium rounded-[20px] p-6 text-center hover:border-brand-primary hover:bg-surface-muted/30 transition-all cursor-pointer relative min-h-[140px] flex flex-col justify-center items-center">
              <input aria-label="Select image file"
                type="file"
                accept="image/*"
                onChange={handleFileLoaded}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-8 h-8 text-text-muted mb-2" />
              <span className="text-sm font-bold text-brand-primary block font-sans">Select Image File</span>
              <span className="text-xs text-text-muted block mt-1">PNG, JPEG, and WebP supported</span>
            </div>

            {imageName && (
              <div className="p-3 bg-surface-muted/50 border border-border-light rounded-xl font-mono text-xs flex justify-between items-center text-text-main">
                <span className="truncate">{imageName}</span>
                <button onClick={() => { setImageName(""); setImagePreview(""); setIsStripped(false); setOriginalBytes(0); setStrippedBytes(0); }} className="text-status-error hover:text-status-error/80 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Card>

        {isStripped && (
          <Card title="Cleaning Report" subtitle="Measured before and after sizes">
            <ul className="text-xs font-mono space-y-2 text-text-main">
              <li className="flex justify-between"><span className="text-text-muted">Original</span><span>{fmtSize(originalBytes)}</span></li>
              <li className="flex justify-between"><span className="text-text-muted">Cleaned ({outputMime === "image/jpeg" ? "JPEG q92" : "PNG"})</span><span>{fmtSize(strippedBytes)}</span></li>
            </ul>
            <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
              EXIF, GPS and IPTC blocks are removed. ICC color profiles and animation frames are also dropped by re-encoding.
            </p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card title="Image Sandbox" subtitle="Render preview stage">
          {imagePreview ? (
            <div className="flex flex-col items-center gap-5">
              <div className="border border-border-light rounded-xl overflow-hidden max-h-72 shadow-premium-sm bg-surface-muted p-1">
                <img src={imagePreview} alt="Preview" className="object-contain max-h-64 rounded-lg" />
              </div>

              <div className="w-full flex gap-3">
                {!isStripped ? (
                  <button
                    onClick={handleStripMetadata}
                    className="flex-1 h-12 bg-brand-primary hover:bg-brand-primary-dark text-[#FAF8F1] font-sans font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    Strip Metadata
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="flex-1 h-12 bg-[#4D7E2B] hover:bg-[#3D6422] text-[#FAF8F1] font-sans font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Clean Image
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted gap-3">
              <Palette className="w-12 h-12 stroke-[1.5]" />
              <p className="text-sm font-medium">Upload an image file to analyze and strip metadata.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};


// ==========================================
// 20. IMAGE COLOR PALETTE EXTRACTOR
// ==========================================
type PaletteRgb = { r: number; g: number; b: number };
type DominantColor = { hex: string; share: number };

/**
 * Median-cut color quantization: recursively split the pixel cloud along its
 * widest channel until `targetCount` buckets exist, then average each bucket.
 * Deterministic and representative - no random filler colors.
 */
const medianCutPalette = (pixels: PaletteRgb[], targetCount: number): DominantColor[] => {
  if (pixels.length === 0) return [];
  let buckets: PaletteRgb[][] = [pixels];

  const channelValue = (p: PaletteRgb, ch: number) => (ch === 0 ? p.r : ch === 1 ? p.g : p.b);
  const bucketRange = (bucket: PaletteRgb[]) => {
    let best = 0;
    for (let ch = 0; ch < 3; ch++) {
      let min = 255;
      let max = 0;
      for (const p of bucket) {
        const v = channelValue(p, ch);
        if (v < min) min = v;
        if (v > max) max = v;
      }
      if (max - min > best) best = max - min;
    }
    return best;
  };

  while (buckets.length < targetCount) {
    let splitIdx = -1;
    let widest = -1;
    buckets.forEach((bucket, idx) => {
      if (bucket.length < 2) return;
      const range = bucketRange(bucket);
      if (range > widest) {
        widest = range;
        splitIdx = idx;
      }
    });
    if (splitIdx === -1 || widest <= 0) break; // cannot split further

    const bucket = buckets[splitIdx];
    // Split on the channel with the largest range.
    let splitCh = 0;
    let bestRange = -1;
    for (let ch = 0; ch < 3; ch++) {
      let min = 255;
      let max = 0;
      for (const p of bucket) {
        const v = channelValue(p, ch);
        if (v < min) min = v;
        if (v > max) max = v;
      }
      if (max - min > bestRange) {
        bestRange = max - min;
        splitCh = ch;
      }
    }
    const sorted = [...bucket].sort((a, b) => channelValue(a, splitCh) - channelValue(b, splitCh));
    const mid = Math.floor(sorted.length / 2);
    buckets.splice(splitIdx, 1, sorted.slice(0, mid), sorted.slice(mid));
  }

  const totalPixels = pixels.length;
  const averaged = buckets.map((bucket) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const p of bucket) {
      r += p.r;
      g += p.g;
      b += p.b;
    }
    const n = bucket.length || 1;
    const avg = { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
    return {
      hex:
        "#" +
        [avg.r, avg.g, avg.b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase(),
      share: (bucket.length / totalPixels) * 100
    };
  });
  averaged.sort((a, b) => b.share - a.share);

  // Floor each share, then distribute the leftover points to the largest
  // buckets so the displayed percentages always sum to exactly 100%.
  const floored = averaged.map((c) => Math.floor(c.share));
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const final = floored.map((share, i) => {
    const bump = remainder > 0 ? 1 : 0;
    if (bump > 0) remainder -= 1;
    return { ...averaged[i], share: share + bump };
  });
  return final;
};

export const ImageColorPaletteExtractor: React.FC<ToolProps> = ({ onAddToast }) => {
  const [imageName, setImageName] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [palette, setPalette] = useState<DominantColor[]>([]);
  const [extractError, setExtractError] = useState<string>("");
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageName(file.name);
      setExtractError("");
      setPalette([]);
      setExtracting(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
          extractPalette(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      // Allow re-selecting the same file again later.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const extractPalette = (dataUrl: string) => {
    setExtractError("");
    setPalette([]);
    setExtracting(true);
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      try {
        // Downsample to a manageable grid for speed, then quantize for real.
        const SAMPLE = 96;
        const scale = Math.min(SAMPLE / img.naturalWidth, SAMPLE / img.naturalHeight, 1);
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas unavailable in this browser");
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        const pixels: PaletteRgb[] = [];
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue; // skip transparent pixels
          pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
        if (pixels.length === 0) {
          setExtracting(false);
          setExtractError("Image is fully transparent - no colors to extract.");
          return;
        }

        const dominant = medianCutPalette(pixels, 5);
        setPalette(dominant);
        onAddToast("Dominant palette extracted via median-cut quantization", "success");
      } catch (err: any) {
        setExtractError(err?.message ?? "Extraction failed");
      } finally {
        setExtracting(false);
      }
    };
    img.onerror = () => {
      setExtracting(false);
      setExtractError("Could not decode this image file.");
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Upload Image File" subtitle="Select any JPG or PNG asset to analyze dominant colors">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border-medium rounded-[20px] p-6 text-center hover:border-brand-primary hover:bg-surface-muted/30 transition-all cursor-pointer relative min-h-[140px] flex flex-col justify-center items-center">
              <input aria-label="Upload image file"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileLoaded}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-8 h-8 text-text-muted mb-2" />
              <span className="text-sm font-bold text-brand-primary block font-sans">Select Image</span>
              <span className="text-xs text-text-muted block mt-1">Pixel data analyzed locally</span>
            </div>

            {imageName && (
              <div className="p-3 bg-surface-muted/50 border border-border-light rounded-xl font-mono text-xs flex justify-between items-center text-text-main">
                <span className="truncate">{imageName}</span>
                <button onClick={() => { setImageName(""); setImagePreview(""); setPalette([]); }} className="text-status-error hover:text-status-error/80 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card title="Extracted Color Palette" subtitle={`${palette.length} dominant color${palette.length === 1 ? "" : "s"} via median-cut quantization`}>
          {extractError ? (
            <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs rounded-xl p-4 font-mono">
              {extractError}
            </div>
          ) : extracting ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <p className="text-sm font-medium">Analyzing pixels…</p>
            </div>
          ) : imagePreview ? (
            <div className="space-y-6 flex flex-col items-center">
              <div className="border border-border-light rounded-xl overflow-hidden max-h-56 bg-surface-muted p-1">
                <img src={imagePreview} alt="Source" className="object-contain max-h-48 rounded-lg" />
              </div>

              {palette.length > 0 && (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-5 gap-3">
                    {palette.map((color, ci) => (
                      <div key={`${color.hex}-${ci}`} className="flex flex-col gap-2">
                        <button
                          className="w-full h-16 rounded-xl border border-border-light shadow-premium-sm relative group cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => {
                            copyWithToast(color.hex, onAddToast, `Copied ${color.hex}!`);
                          }}
                          title={`Copy ${color.hex}`}
                        >
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FAF8F1] transition-opacity rounded-xl">
                            <Copy className="w-4 h-4" />
                          </div>
                        </button>
                        <span className="text-[10px] font-mono font-black text-center text-text-main select-all">{color.hex}</span>
                        <span className="text-[10px] font-mono text-center text-text-muted">{color.share}% of pixels</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between p-4 bg-background border border-border-light rounded-[16px] items-center">
                    <div>
                      <span className="text-xs font-bold text-text-muted block uppercase tracking-wider font-mono">Palette JSON</span>
                      <span className="text-xs font-mono text-text-sub mt-1 block truncate max-w-[240px]">
                        [{palette.map((c) => `"${c.hex}"`).join(", ")}]
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        copyWithToast(JSON.stringify(palette.map((c) => c.hex), null, 2), onAddToast, "JSON array copied");
                      }}
                      className="px-3.5 py-2 bg-brand-primary-light hover:bg-brand-primary hover:text-[#FAF8F1] text-brand-primary text-xs font-bold font-mono rounded-xl transition-all border border-brand-primary/10 cursor-pointer"
                    >
                      Export Palette JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted gap-3">
              <Palette className="w-12 h-12 stroke-[1.5]" />
              <p className="text-sm font-medium">Upload an image to compute its dominant color palette.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
