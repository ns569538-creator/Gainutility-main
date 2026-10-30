import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  Copy, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  QrCode as QrIcon, 
  Link as LinkIcon, 
  Type, 
  Mail, 
  Phone, 
  MessageSquare, 
  Wifi, 
  User, 
  Upload,
  AlertCircle,
  FileImage
} from "lucide-react";

import {
  SectionHeader,
  Field,
  SegmentedSelector,
  OptionSelector,
  InfoStrip,
  ActionGroup,
} from "./ToolPage";
import { contrastRatio } from "../colorStudio/color";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

/** WhatsApp-style icon (lucide-react does not ship a WhatsApp brand icon). */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm0 0a5 5 0 0 0 5 5m0 0a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1h1z" />
  </svg>
);

type QrMode = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "whatsapp" | "vcard";

interface QrCodeGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ 
  onCopy, 
  onAddToast,
  onChangeView 
}) => {
  const postDownload = usePostDownload();

  // Simple vs Advanced Mode
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [activeMode, setActiveMode] = useState<QrMode>("url");
  
  // Input fields
  const [url, setUrl] = useState("https://ai.studio/build");
  const [text, setText] = useState("Hello from Premium Tool Suite!");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phone, setPhone] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  
  // vCard Info
  const [vFirstName, setVFirstName] = useState("");
  const [vLastName, setVLastName] = useState("");
  const [vOrg, setVOrg] = useState("");
  const [vCell, setVCell] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vUrl, setVUrl] = useState("");
  const [vAddress, setVAddress] = useState("");

  // Styling & Customization (Advanced)
  const [fgColor, setFgColor] = useState("#283618");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [transparentBg, setTransparentBg] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
  const [margin, setMargin] = useState(4);
  const [qrSize, setQrSize] = useState(400);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);

  // Simple Mode Presets
  const [simplePreset, setSimplePreset] = useState<"standard" | "highContrast" | "brandFriendly">("standard");

  // Output generated formats
  const [svgString, setSvgString] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** Escape special characters in WIFI: payload fields (\ ; , : "). */
  const escapeWifiField = (value: string): string =>
    value.replace(/([\\;,:"])/g, "\\$1");

  /** Escape vCard text values (backslash, semicolon, comma). */
  const escapeVCardField = (value: string): string =>
    value.replace(/([\\;,])/g, "\\$1");

  /** Apply simple mode preset values */
  useEffect(() => {
    if (!isAdvanced) {
      if (simplePreset === "standard") {
        setFgColor("#283618");
        setBgColor("#FFFFFF");
        setTransparentBg(false);
        setErrorCorrection("M");
        setMargin(4);
        setQrSize(400);
      } else if (simplePreset === "highContrast") {
        setFgColor("#000000");
        setBgColor("#FFFFFF");
        setTransparentBg(false);
        setErrorCorrection("H");
        setMargin(2);
        setQrSize(400);
      } else if (simplePreset === "brandFriendly") {
        setFgColor("#1E3A8A"); // Brand blue
        setBgColor("#FFFFFF");
        setTransparentBg(false);
        setErrorCorrection("H"); // Highest for logos
        setMargin(6);
        setQrSize(400);
      }
    }
  }, [simplePreset, isAdvanced]);

  // Compile final raw payload string
  const getPayload = (): string => {
    switch (activeMode) {
      case "url":
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
      case "text":
        return text;
      case "email":
        if (!emailTo) return "";
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        if (!phone) return "";
        return `tel:${phone}`;
      case "sms":
        if (!smsPhone) return "";
        return `smsto:${smsPhone}:${smsMessage}`;
      case "wifi":
        if (!wifiSsid) return "";
        return `WIFI:S:${escapeWifiField(wifiSsid)};T:${wifiSecurity};P:${escapeWifiField(wifiPassword)};${wifiHidden ? "H:true;" : ""};;`;
      case "whatsapp":
        if (!waPhone) return "";
        const cleanedPhone = waPhone.replace(/\D/g, "");
        return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(waMessage)}`;
      case "vcard":
        if (!vFirstName && !vLastName) return "";
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${escapeVCardField(vLastName)};${escapeVCardField(vFirstName)};;;`,
          `FN:${escapeVCardField(`${vFirstName} ${vLastName}`.trim())}`,
          vOrg ? `ORG:${escapeVCardField(vOrg)}` : "",
          vCell ? `TEL;TYPE=CELL:${vCell}` : "",
          vEmail ? `EMAIL;TYPE=INTERNET:${vEmail}` : "",
          vUrl ? `URL:${vUrl}` : "",
          vAddress ? `ADR;TYPE=WORK:;;${escapeVCardField(vAddress)};;;;` : "",
          "END:VCARD"
        ].filter(Boolean).join("\n");
      default:
        return "";
    }
  };

  const payloadString = getPayload();

  // Only pass well-formed hex colors to the renderer; mid-edit values
  // (e.g. "#283") would otherwise make the library throw.
  const resolveHex = (value: string, fallback: string): string =>
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()) ? value.trim() : fallback;

  const safeFgColor = resolveHex(fgColor, "#000000");
  const safeBgColor = resolveHex(bgColor, "#FFFFFF");

  // WCAG contrast warning
  const ratio = contrastRatio(safeFgColor, transparentBg ? "#FFFFFF" : safeBgColor);
  const contrastWarning = ratio < 3.0;

  /** Draw a rounded rect with a fallback for browsers without ctx.roundRect. */
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === "function") {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  };

  /** Compose the final SVG text, embedding the center logo when present so
   *  the downloaded vector matches the canvas preview. */
  const buildSvgWithLogo = (baseSvg: string): string => {
    if (!logoDataUrl) return baseSvg;
    const viewBoxMatch = baseSvg.match(/viewBox="0 0 (\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/);
    const size = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : qrSize;
    const logoSize = size * 0.18;
    const logoPos = (size - logoSize) / 2;
    const pad = Math.max(4, size * 0.012);
    const logoLayer =
      `<rect x="${logoPos - pad}" y="${logoPos - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="8" fill="${transparentBg ? "#FFFFFF" : safeBgColor}"/>` +
      `<image x="${logoPos}" y="${logoPos}" width="${logoSize}" height="${logoSize}" href="${logoDataUrl}"/>`;
    return baseSvg.replace(/<\/svg>\s*$/, `${logoLayer}</svg>`);
  };

  // Draw QR code to canvas and generate SVG format
  const generateQR = async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);

    try {
      setRenderError(null);
      const activeBgColor = transparentBg ? "#00000000" : safeBgColor;

      if (payloadString) {
        const options: QRCode.QRCodeRenderersOptions = {
          errorCorrectionLevel: errorCorrection,
          margin: margin,
          width: qrSize,
          color: {
            dark: safeFgColor,
            light: activeBgColor
          }
        };

        // Generate base QR onto ref canvas
        await QRCode.toCanvas(canvasRef.current, payloadString, options);

        // Draw center logo on the canvas if present (awaited so downloads
        // always capture the finished artwork).
        if (logoDataUrl) {
          await new Promise<void>((resolve) => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(); return; }
            const img = new Image();
            img.onload = () => {
              const logoPercent = 0.18; // Safe scan-ability ratio
              const logoSize = canvas.width * logoPercent;
              const logoPos = (canvas.width - logoSize) / 2;

              ctx.save();
              ctx.fillStyle = transparentBg ? "#FFFFFF" : safeBgColor;
              drawRoundedRect(ctx, logoPos - 4, logoPos - 4, logoSize + 8, logoSize + 8, 8);
              ctx.fill();
              ctx.restore();

              ctx.drawImage(img, logoPos, logoPos, logoSize, logoSize);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = logoDataUrl;
          });
        }
      }

      // Generate base vector SVG string
      if (payloadString) {
        const svgOptions: QRCode.QRCodeToStringOptions = {
          type: "svg",
          errorCorrectionLevel: errorCorrection,
          margin: margin,
          width: qrSize,
          color: {
            dark: safeFgColor,
            light: activeBgColor
          }
        };
        const svgText = await QRCode.toString(payloadString, svgOptions);
        setSvgString(buildSvgWithLogo(svgText));
      } else {
        setSvgString("");
      }
    } catch (err) {
      console.error("QR Code Generation Error:", err);
      setRenderError(
        "Couldn't render this QR code. Check that colors are valid and the content isn't too long."
      );
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [
    activeMode, 
    url, 
    text, 
    emailTo, 
    emailSubject, 
    emailBody, 
    phone, 
    smsPhone, 
    smsMessage, 
    wifiSsid, 
    wifiPassword, 
    wifiSecurity, 
    wifiHidden, 
    waPhone, 
    waMessage, 
    vFirstName, 
    vLastName, 
    vOrg, 
    vCell, 
    vEmail, 
    vUrl, 
    vAddress,
    fgColor,
    bgColor,
    transparentBg,
    errorCorrection,
    margin,
    qrSize,
    logoDataUrl,
    isAdvanced
  ]);

  const handleReset = () => {
    setUrl("https://ai.studio/build");
    setText("Hello from Premium Tool Suite!");
    setEmailTo(""); setEmailSubject(""); setEmailBody("");
    setPhone(""); smsPhone && setSmsPhone(""); setSmsMessage("");
    setWifiSsid(""); setWifiPassword(""); setWifiSecurity("WPA"); setWifiHidden(false);
    setWaPhone(""); setWaMessage("");
    setVFirstName(""); setVLastName(""); setVOrg(""); setVCell(""); setVEmail(""); setVUrl(""); setVAddress("");
    setFgColor("#283618");
    setBgColor("#FFFFFF");
    setTransparentBg(false);
    setErrorCorrection("H");
    setMargin(4);
    setQrSize(400);
    setLogoDataUrl(null);
    setLogoName(null);
    setSimplePreset("standard");
    onAddToast("Cleared QR workspace settings", "info");
  };

  const handleCopyPayload = () => {
    if (!payloadString) {
      onAddToast("Enter content above to generate a QR code first.", "warning");
      return;
    }
    onCopy(payloadString);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    if (!payloadString) {
      onAddToast("Enter content above before downloading the QR code.", "warning");
      return;
    }
    const link = document.createElement("a");
    link.download = `qrcode_${activeMode}_${qrSize}px.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("PNG downloaded successfully!", "success");
    postDownload.show("QR Code Generator");
  };

  const handleDownloadSvg = () => {
    if (!payloadString || !svgString) {
      onAddToast("Enter content above before downloading the QR code.", "warning");
      return;
    }
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `qrcode_${activeMode}.svg`;
    link.href = urlBlob;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
    onAddToast("SVG downloaded successfully!", "success");
    postDownload.show("QR Code Generator");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoDataUrl(event.target.result as string);
          onAddToast(`Loaded custom logo overlay: ${file.name}`, "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    setLogoName(null);
    onAddToast("Removed logo overlay", "info");
  };

  const modeOptions: { id: QrMode; name: string; icon: React.ReactNode }[] = [
    { id: "url", name: "URL", icon: <LinkIcon /> },
    { id: "text", name: "Text", icon: <Type /> },
    { id: "email", name: "Email", icon: <Mail /> },
    { id: "phone", name: "Phone", icon: <Phone /> },
    { id: "sms", name: "SMS", icon: <MessageSquare /> },
    { id: "wifi", name: "Wi-Fi", icon: <Wifi /> },
    { id: "whatsapp", name: "WhatsApp", icon: <WhatsAppIcon /> },
    { id: "vcard", name: "Contact", icon: <User /> },
  ];

  const stylePresets: { id: string; name: string; desc: string }[] = [
    { id: "standard", name: "Standard", desc: "Dark charcoal on white with balanced error correction." },
    { id: "highContrast", name: "High contrast", desc: "Pure black on white for the highest scan reliability." },
    { id: "brandFriendly", name: "Brand", desc: "Brand blue on white with the highest error correction, best for center logos." },
  ];

  const inputClassName =
    "w-full px-3.5 py-2.5 rounded-[10px] bg-surface-base border border-border-light text-text-main text-base sm:text-sm focus:border-border-focus outline-none transition-colors";
  const monoInputClassName =
    "w-full px-3.5 py-2.5 rounded-[10px] bg-surface-base border border-border-light text-text-main font-mono text-base sm:text-sm focus:border-border-focus outline-none transition-colors";

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full max-w-6xl mx-auto" id="qr-code-generator-tool">

      {/* MODE CONTROL BAR: simple/advanced + reset */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface-base p-1 rounded-lg border border-border-light">
          <button
            type="button"
            onClick={() => setIsAdvanced(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              !isAdvanced ? "bg-brand-primary text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            Simple
          </button>
          <button
            type="button"
            onClick={() => setIsAdvanced(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              isAdvanced ? "bg-brand-primary text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            Advanced
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 min-h-[34px] px-2.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* WORKSPACE: CONFIGURATION + PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

        {/* LEFT: CONFIGURATION */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* 1. CHOOSE A FORMAT */}
          <section className="flex flex-col gap-2.5 bg-surface-base border border-border-light rounded-xl p-4 sm:p-5">
            <SectionHeader title="Choose a format" />
            <SegmentedSelector
              options={modeOptions}
              value={activeMode}
              onChange={(id) => setActiveMode(id)}
              columns={4}
            />
          </section>

          {/* 2. CONTENT */}
          <section className="flex flex-col gap-3 bg-surface-base border border-border-light rounded-xl p-4 sm:p-5">
            <SectionHeader title="Content" description="Enter the details your QR code should contain." />

            {activeMode === "url" && (
              <Field label="Link" htmlFor="qr-url">
                <input
                  id="qr-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={monoInputClassName}
                  placeholder="e.g. www.google.com"
                />
              </Field>
            )}

            {activeMode === "text" && (
              <Field label="Text" htmlFor="qr-text">
                <textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={`${inputClassName} min-h-[100px] resize-y`}
                  placeholder="Type anything here..."
                />
              </Field>
            )}

            {activeMode === "email" && (
              <div className="grid grid-cols-1 gap-3">
                <Field label="To" htmlFor="qr-email-to">
                  <input
                    id="qr-email-to"
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className={monoInputClassName}
                    placeholder="e.g. helper@domain.com"
                  />
                </Field>
                <Field label="Subject" htmlFor="qr-email-subject">
                  <input
                    id="qr-email-subject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className={inputClassName}
                    placeholder="Inquiry topic"
                  />
                </Field>
                <Field label="Message" htmlFor="qr-email-body">
                  <textarea
                    id="qr-email-body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className={`${inputClassName} min-h-[80px] resize-y`}
                    placeholder="Email content…"
                  />
                </Field>
              </div>
            )}

            {activeMode === "phone" && (
              <Field label="Phone number" htmlFor="qr-phone">
                <input
                  id="qr-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={monoInputClassName}
                  placeholder="e.g. +14155552671"
                />
              </Field>
            )}

            {activeMode === "sms" && (
              <div className="grid grid-cols-1 gap-3">
                <Field label="Phone number" htmlFor="qr-sms-phone">
                  <input
                    id="qr-sms-phone"
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className={monoInputClassName}
                    placeholder="e.g. +14155552671"
                  />
                </Field>
                <Field label="Message" htmlFor="qr-sms-message">
                  <textarea
                    id="qr-sms-message"
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className={`${inputClassName} min-h-[80px] resize-y`}
                    placeholder="Prefilled SMS text…"
                  />
                </Field>
              </div>
            )}

            {activeMode === "wifi" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Network name (SSID)" htmlFor="qr-wifi-ssid">
                  <input
                    id="qr-wifi-ssid"
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className={inputClassName}
                    placeholder="e.g. Home_Network"
                  />
                </Field>
                <Field label="Password" htmlFor="qr-wifi-password">
                  <input
                    id="qr-wifi-password"
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className={inputClassName}
                    placeholder="Network password"
                  />
                </Field>
                <Field label="Security" htmlFor="qr-wifi-security">
                  <select
                    id="qr-wifi-security"
                    value={wifiSecurity}
                    onChange={(e) => setWifiSecurity(e.target.value as any)}
                    className={`${inputClassName} cursor-pointer`}
                  >
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (open)</option>
                  </select>
                </Field>
                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 text-[13px] font-medium text-text-sub cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-4 h-4 accent-brand-primary rounded"
                    />
                    Hidden network
                  </label>
                </div>
              </div>
            )}

            {activeMode === "whatsapp" && (
              <div className="grid grid-cols-1 gap-3">
                <Field label="Phone number with country code" htmlFor="qr-wa-phone">
                  <input
                    id="qr-wa-phone"
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    className={monoInputClassName}
                    placeholder="e.g. 14155552671 (no + sign)"
                  />
                </Field>
                <Field label="Message" htmlFor="qr-wa-message">
                  <textarea
                    id="qr-wa-message"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className={`${inputClassName} min-h-[80px] resize-y`}
                    placeholder="Pre-filled message…"
                  />
                </Field>
              </div>
            )}

            {activeMode === "vcard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="First name" htmlFor="qr-v-first">
                  <input id="qr-v-first" type="text" value={vFirstName} onChange={(e) => setVFirstName(e.target.value)} className={inputClassName} placeholder="John" />
                </Field>
                <Field label="Last name" htmlFor="qr-v-last">
                  <input id="qr-v-last" type="text" value={vLastName} onChange={(e) => setVLastName(e.target.value)} className={inputClassName} placeholder="Doe" />
                </Field>
                <Field label="Organization" htmlFor="qr-v-org">
                  <input id="qr-v-org" type="text" value={vOrg} onChange={(e) => setVOrg(e.target.value)} className={inputClassName} placeholder="Company Corp" />
                </Field>
                <Field label="Cell number" htmlFor="qr-v-cell">
                  <input id="qr-v-cell" type="tel" value={vCell} onChange={(e) => setVCell(e.target.value)} className={monoInputClassName} placeholder="+14155550199" />
                </Field>
                <Field label="Email" htmlFor="qr-v-email">
                  <input id="qr-v-email" type="email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} className={monoInputClassName} placeholder="john@doe.com" />
                </Field>
                <Field label="Website" htmlFor="qr-v-url">
                  <input id="qr-v-url" type="url" value={vUrl} onChange={(e) => setVUrl(e.target.value)} className={monoInputClassName} placeholder="www.doe.com" />
                </Field>
                <Field label="Address" htmlFor="qr-v-address" className="md:col-span-2">
                  <input id="qr-v-address" type="text" value={vAddress} onChange={(e) => setVAddress(e.target.value)} className={inputClassName} placeholder="City, State, Zip, Country" />
                </Field>
              </div>
            )}
          </section>

          {/* 3. STYLE (optional) */}
          <section className="flex flex-col gap-3 bg-surface-base border border-border-light rounded-xl p-4 sm:p-5">
            <SectionHeader title="Style" description="Optional appearance and export settings." />

            {!isAdvanced ? (
              <OptionSelector
                options={stylePresets}
                value={simplePreset}
                onChange={(id) => setSimplePreset(id as "standard" | "highContrast" | "brandFriendly")}
                columns={3}
              />
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label={`Quiet zone: ${margin} modules`} htmlFor="qr-margin">
                    <input
                      id="qr-margin"
                      type="range"
                      min="0"
                      max="10"
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </Field>
                  <Field label={`Resolution: ${qrSize} × ${qrSize} px`} htmlFor="qr-size">
                    <input
                      id="qr-size"
                      type="range"
                      min="200"
                      max="1000"
                      step="50"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Error correction" htmlFor="qr-error">
                    <select
                      id="qr-error"
                      value={errorCorrection}
                      onChange={(e) => setErrorCorrection(e.target.value as any)}
                      className={`${inputClassName} cursor-pointer`}
                    >
                      <option value="L">L · 7% recovery</option>
                      <option value="M">M · 15% recovery</option>
                      <option value="Q">Q · 25% recovery</option>
                      <option value="H">H · 30% recovery</option>
                    </select>
                  </Field>
                  <Field label="Center logo">
                    {logoDataUrl ? (
                      <div className="flex items-center justify-between px-3 py-2 rounded-[10px] border border-brand-primary bg-brand-primary-light/10">
                        <span className="text-xs font-mono font-semibold truncate max-w-[140px]">{logoName}</span>
                        <button type="button" onClick={handleRemoveLogo} className="text-xs font-semibold text-status-error hover:underline cursor-pointer">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 h-10 border border-dashed border-border-medium rounded-[10px] hover:border-brand-primary bg-surface-muted/10 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-xs font-semibold text-brand-primary">Upload logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    )}
                  </Field>
                </div>

                <div className="h-px bg-border-light" />

                <div className="flex flex-wrap gap-6 items-end justify-between">
                  <Field label="Modules color">
                    <div className="flex items-center gap-2">
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                      <input type="text" value={fgColor.toUpperCase()} onChange={(e) => setFgColor(e.target.value)} className="w-24 px-2 py-1 text-xs bg-surface-base border border-border-light rounded font-mono outline-none" maxLength={7} />
                    </div>
                  </Field>
                  <Field label="Background color">
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} disabled={transparentBg} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer disabled:opacity-40" />
                      <input type="text" value={bgColor.toUpperCase()} disabled={transparentBg} onChange={(e) => setBgColor(e.target.value)} className="w-24 px-2 py-1 text-xs bg-surface-base border border-border-light rounded font-mono outline-none disabled:opacity-40" maxLength={7} />
                    </div>
                  </Field>
                  <label className="flex items-center gap-2.5 pb-1 text-[13px] font-medium text-text-sub cursor-pointer select-none">
                    <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="w-4 h-4 accent-brand-primary rounded cursor-pointer" />
                    Transparent background
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* 4. DETAILS (quiet info strip) */}
          <InfoStrip
            title="Details"
            rows={[
              { label: "Type", value: activeMode },
              { label: "Length", value: `${payloadString.length} chars`, mono: true },
              { label: "Format", value: "PNG / SVG" },
              {
                label: "Margin",
                value:
                  errorCorrection === "L" ? "7%" :
                  errorCorrection === "M" ? "15%" :
                  errorCorrection === "Q" ? "25%" : "30%",
                mono: true,
              },
            ]}
          />
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <section className="flex flex-col gap-3 bg-surface-base border border-border-light rounded-xl p-4 sm:p-5">
            <SectionHeader title="QR preview" description="Updates as you change the settings." />

            <div className="relative rounded-xl overflow-hidden flex flex-col items-center justify-center border border-border-light bg-[#121410] py-10 px-4 min-h-[240px]">
              {isRendering && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#121410]/80">
                  <RefreshCw className="w-7 h-7 text-brand-primary animate-spin" />
                  <span className="text-xs font-mono text-text-muted">Generating…</span>
                </div>
              )}
              {renderError && !isRendering && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <AlertCircle className="w-7 h-7 text-red-400 shrink-0" />
                  <span className="text-xs font-mono text-red-400 max-w-[220px]">{renderError}</span>
                </div>
              )}
              {contrastWarning && !isRendering && !renderError && payloadString && (
                <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[10px] text-amber-300">
                    Low contrast ({ratio?.toFixed(1)}:1). This may be harder to scan.
                  </span>
                </div>
              )}
              {!payloadString && !isRendering && !renderError && (
                <div className="text-center text-text-muted">
                  <QrIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <span className="text-sm">Enter content to generate a QR code.</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                style={{ width: "190px", height: "190px" }}
                className={`max-w-full h-auto aspect-square rounded-xl border border-border-light sm:w-[220px] sm:h-[220px] ${!payloadString ? "hidden" : ""}`}
                aria-label="Generated QR code preview"
              />
            </div>

            {/* Codestring */}
            <div className="rounded-lg border border-border-light bg-surface-muted/20 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border-light bg-surface-muted/30">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Encoded content</span>
              </div>
              <p className="text-xs font-mono text-text-main p-3 break-all max-h-[72px] overflow-y-auto leading-relaxed whitespace-pre-wrap bg-background">
                {payloadString || "Enter content above to preview."}
              </p>
            </div>
          </section>

          {/* EXPORT ACTIONS */}
          <ActionGroup
            items={[
              { label: "Download PNG", icon: <Download />, onClick: handleDownloadPng, disabled: !payloadString, primary: true },
              { label: "Download SVG", icon: <FileImage />, onClick: handleDownloadSvg, disabled: !payloadString },
            ]}
            tertiary={[
              { label: "Copy", icon: <Copy />, onClick: handleCopyPayload, disabled: !payloadString },
            ]}
          />
        </div>

      </div>

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />

    </div>
  );
};
