/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Button, Card } from "./Common";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Maximize2, 
  Monitor, 
  Tablet, 
  Smartphone,
  Check,
  Info,
  Link,
  Link2Off
} from "lucide-react";

interface BorderRadiusGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const BorderRadiusGenerator: React.FC<BorderRadiusGeneratorProps> = ({ onCopy, onAddToast }) => {
  // Linked states
  const [linked, setLinked] = useState<boolean>(true);
  const [elliptical, setElliptical] = useState<boolean>(false);
  
  // Horizontal radii (standard values)
  const [hTl, setHTl] = useState<number>(16);
  const [hTr, setHTr] = useState<number>(16);
  const [hBr, setHBr] = useState<number>(16);
  const [hBl, setHBl] = useState<number>(16);

  // Vertical radii (elliptical values)
  const [vTl, setVTl] = useState<number>(16);
  const [vTr, setVTr] = useState<number>(16);
  const [vBr, setVBr] = useState<number>(16);
  const [vBl, setVBl] = useState<number>(16);

  const [previewBg, setPreviewBg] = useState<string>("#FAF8F1");
  const [boxBg, setBoxBg] = useState<string>("#556B2F");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState<boolean>(false);

  // Setters supporting Link-Unlink locks
  const updateHTl = (val: number) => {
    setHTl(val);
    if (linked) {
      setHTr(val);
      setHBr(val);
      setHBl(val);
      if (!elliptical) {
        setVTl(val);
        setVTr(val);
        setVBr(val);
        setVBl(val);
      }
    }
  };

  const updateHTr = (val: number) => {
    setHTr(val);
    if (linked) {
      setHTl(val);
      setHBr(val);
      setHBl(val);
    }
  };

  const updateHBr = (val: number) => {
    setHBr(val);
    if (linked) {
      setHTl(val);
      setHTr(val);
      setHBl(val);
    }
  };

  const updateHBl = (val: number) => {
    setHBl(val);
    if (linked) {
      setHTl(val);
      setHTr(val);
      setHBr(val);
    }
  };

  const updateVTl = (val: number) => {
    setVTl(val);
    if (linked) {
      setVTr(val);
      setVBr(val);
      setVBl(val);
    }
  };

  const updateVTr = (val: number) => {
    setVTr(val);
    if (linked) {
      setVTl(val);
      setVBr(val);
      setVBl(val);
    }
  };

  const updateVBr = (val: number) => {
    setVBr(val);
    if (linked) {
      setVTl(val);
      setVTr(val);
      setVBl(val);
    }
  };

  const updateVBl = (val: number) => {
    setVBl(val);
    if (linked) {
      setVTl(val);
      setVTr(val);
      setVBr(val);
    }
  };

  const handleReset = () => {
    setLinked(true);
    setElliptical(false);
    setHTl(16);
    setHTr(16);
    setHBr(16);
    setHBl(16);
    setVTl(16);
    setVTr(16);
    setVBr(16);
    setVBl(16);
    setPreviewBg("#FAF8F1");
    setBoxBg("#556B2F");
    onAddToast("Reset to default card corner radius", "info");
  };

  // Compile CSS rule value
  const generateBorderRadiusString = (): string => {
    if (elliptical) {
      return `${hTl}% ${hTr}% ${hBr}% ${hBl}% / ${vTl}% ${vTr}% ${vBr}% ${vBl}%`;
    }
    const unit = "%"; // Percent is best for organic shapes, but let's provide sliders that feel natural. Let's make standard unit pixels or percentages. Wait! If elliptical is checked we usually map percentages for liquid blobs, else pixels for traditional corners! Let's make elliptical utilize "%" and standard utilize "px" for highest usability.
    return `${hTl}px ${hTr}px ${hBr}px ${hBl}px`;
  };

  const borderRadiusCSS = generateBorderRadiusString();
  const fullCSSCode = `border-radius: ${borderRadiusCSS};\n-webkit-border-radius: ${borderRadiusCSS};`;

  const handleCopy = () => {
    onCopy(fullCSSCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`.rounded-element {\n  ${fullCSSCode}\n}`], { type: "text/css" });
    element.href = URL.createObjectURL(file);
    element.download = "border-radius.css";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("CSS file downloaded!", "success");
  };

  // Preset Shapes
  const applyShapePreset = (shape: "pill" | "circle" | "leaf" | "blob" | "bento" | "card") => {
    setLinked(false);
    if (shape === "pill") {
      setElliptical(false);
      setHTl(9999); setHTr(9999); setHBr(9999); setHBl(9999);
    } else if (shape === "circle") {
      setElliptical(false);
      setHTl(150); setHTr(150); setHBr(150); setHBl(150); // will render circular if box is square
    } else if (shape === "leaf") {
      setElliptical(false);
      setHTl(80); setHTr(0); setHBr(80); setHBl(0);
    } else if (shape === "blob") {
      setElliptical(true);
      setHTl(30); setHTr(70); setHBr(70); setHBl(30);
      setVTl(30); setVTr(30); setVBr(70); setVBl(70);
    } else if (shape === "bento") {
      setElliptical(false);
      setHTl(24); setHTr(24); setHBr(24); setHBl(24);
    } else if (shape === "card") {
      setElliptical(false);
      setHTl(12); setHTr(12); setHBr(12); setHBl(12);
    }
    onAddToast(`Applied ${shape} preset`, "success");
  };

  return (
    <div className="flex flex-col gap-8" id="border-radius-generator-tool">
      
      {/* HEADER PRES_ETS BAR */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm md:text-base font-bold uppercase tracking-wider text-text-muted font-mono">Shapes:</span>
          <Button variant="outline" onClick={() => applyShapePreset("card")} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            Standard Card
          </Button>
          <Button variant="outline" onClick={() => applyShapePreset("bento")} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            Rounded Bento
          </Button>
          <Button variant="outline" onClick={() => applyShapePreset("pill")} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            Pill
          </Button>
          <Button variant="outline" onClick={() => applyShapePreset("leaf")} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            Leaf
          </Button>
          <Button variant="outline" onClick={() => applyShapePreset("blob")} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            Organic Blob
          </Button>
        </div>
        <div>
          <Button variant="outline" onClick={handleReset} className="text-status-error border-status-error/30 hover:bg-status-error/5 h-12 md:h-[50px] rounded-[16px] text-base font-bold" leftIcon={<Trash2 className="w-4 h-4" />}>
            Reset Tool
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: RADIUS SLIDERS (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* RADIUS OPTIONS & LINK TOGGLE */}
          <Card 
            title="Geometry Settings" 
            subtitle="Link corners to lock parameters or unlink them to design asymmetry."
          >
            <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-2xl bg-surface-muted/30 border border-border-light">
              <div className="flex items-center gap-6">
                <Button
                  variant={linked ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setLinked(!linked);
                    if (!linked) {
                      // Lock all values to match current top left
                      setHTr(hTl); setHBr(hTl); setHBl(hTl);
                      setVTr(vTl); setVBr(vTl); setVBl(vTl);
                    }
                  }}
                  leftIcon={linked ? <Link className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
                  className="h-11 px-4 rounded-[12px] text-sm font-bold"
                >
                  {linked ? "Linked (Symmetric)" : "Unlinked (Asymmetric)"}
                </Button>

                <Button
                  variant={elliptical ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setElliptical(!elliptical);
                    if (!elliptical) {
                      // Normalize sizes to percentages for responsive blobs, or cap values
                      setHTl(prev => Math.min(prev, 100));
                      setHTr(prev => Math.min(prev, 100));
                      setHBr(prev => Math.min(prev, 100));
                      setHBl(prev => Math.min(prev, 100));
                    } else {
                      setHTl(50); setHTr(50); setHBr(50); setHBl(50);
                      setVTl(50); setVTr(50); setVBr(50); setVBl(50);
                    }
                  }}
                  leftIcon={<Maximize2 className="w-4 h-4" />}
                  className="h-11 px-4 rounded-[12px] text-sm font-bold"
                >
                  {elliptical ? "Elliptical Radius (%)" : "Standard Radius (px)"}
                </Button>
              </div>

              <div className="text-xs text-text-muted font-mono font-bold uppercase">
                Mode: {elliptical ? "Slash-Syntax (Blob)" : "Four-Value (Card)"}
              </div>
            </div>

            {/* HORIZONTAL / STANDARD SLIDERS */}
            <div className="flex flex-col gap-6 mt-2">
              <h4 className="text-sm font-bold text-text-main uppercase tracking-wider font-mono">
                {elliptical ? "Horizontal Radii Values (%)" : "Corner Values (px)"}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Top Left */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-text-main font-sans">Top Left</span>
                    <span className="font-mono text-brand-primary">{hTl}{elliptical ? "%" : "px"}</span>
                  </div>
                  <input aria-label="Top left radius"
                    type="range"
                    min="0"
                    max={elliptical ? "100" : "150"}
                    value={hTl}
                    onChange={(e) => updateHTl(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                </div>

                {/* Top Right */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-text-main font-sans">Top Right</span>
                    <span className="font-mono text-brand-primary">{hTr}{elliptical ? "%" : "px"}</span>
                  </div>
                  <input aria-label="Top right radius"
                    type="range"
                    min="0"
                    max={elliptical ? "100" : "150"}
                    value={hTr}
                    disabled={linked}
                    onChange={(e) => updateHTr(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-40"
                  />
                </div>

                {/* Bottom Right */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-text-main font-sans">Bottom Right</span>
                    <span className="font-mono text-brand-primary">{hBr}{elliptical ? "%" : "px"}</span>
                  </div>
                  <input aria-label="Bottom right radius"
                    type="range"
                    min="0"
                    max={elliptical ? "100" : "150"}
                    value={hBr}
                    disabled={linked}
                    onChange={(e) => updateHBr(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-40"
                  />
                </div>

                {/* Bottom Left */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-text-main font-sans">Bottom Left</span>
                    <span className="font-mono text-brand-primary">{hBl}{elliptical ? "%" : "px"}</span>
                  </div>
                  <input aria-label="Bottom left radius"
                    type="range"
                    min="0"
                    max={elliptical ? "100" : "150"}
                    value={hBl}
                    disabled={linked}
                    onChange={(e) => updateHBl(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-40"
                  />
                </div>

              </div>
            </div>

            {/* VERTICAL SLIDERS (Only visible if elliptical) */}
            {elliptical && (
              <div className="flex flex-col gap-6 mt-6 pt-6 border-t border-border-light">
                <h4 className="text-sm font-bold text-text-main uppercase tracking-wider font-mono">
                  Vertical Radii Values (%)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Top Left Vertical */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-main font-sans">Top Left (Vertical)</span>
                      <span className="font-mono text-brand-primary">{vTl}%</span>
                    </div>
                    <input aria-label="Top left vertical radius"
                      type="range"
                      min="0"
                      max="100"
                      value={vTl}
                      onChange={(e) => updateVTl(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </div>

                  {/* Top Right Vertical */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-main font-sans">Top Right (Vertical)</span>
                      <span className="font-mono text-brand-primary">{vTr}%</span>
                    </div>
                    <input aria-label="Top right vertical radius"
                      type="range"
                      min="0"
                      max="100"
                      value={vTr}
                      disabled={linked}
                      onChange={(e) => updateVTr(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-40"
                    />
                  </div>

                  {/* Bottom Right Vertical */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-main font-sans">Bottom Right (Vertical)</span>
                      <span className="font-mono text-brand-primary">{vBr}%</span>
                    </div>
                    <input aria-label="Bottom right vertical radius"
                      type="range"
                      min="0"
                      max="100"
                      value={vBr}
                      disabled={linked}
                      onChange={(e) => updateVBr(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-40"
                    />
                  </div>

                  {/* Bottom Left Vertical */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-main font-sans">Bottom Left (Vertical)</span>
                      <span className="font-mono text-brand-primary">{vBl}%</span>
                    </div>
                    <input aria-label="Bottom left vertical radius"
                      type="range"
                      min="0"
                      max="100"
                      value={vBl}
                      disabled={linked}
                      onChange={(e) => updateVBl(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-border-medium rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-40"
                    />
                  </div>

                </div>
              </div>
            )}
          </Card>

          {/* EXPORT CSS PANEL */}
          <Card 
            title="Generated CSS Rules" 
            subtitle="Secure compliant border configuration rule matching major modern devices."
            actions={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  {copied ? "Copied!" : "Copy CSS"}
                </Button>
                <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Download CSS
                </Button>
              </div>
            }
          >
            <div className="bg-surface-base border border-border-light rounded-[16px] p-5 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-text-main shadow-inner select-all whitespace-pre">
{`.rounded-element {
  width: 250px;
  height: 250px;
  background-color: ${boxBg};
  ${fullCSSCode}
}`}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: PREVIEW SCREEN (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* LIVE GRAPHICS PREVIEW */}
          <Card 
            title="Live Graphic Studio" 
            subtitle="Device viewport container tracing the custom curves."
            actions={
              <div className="flex border border-border-light rounded-xl overflow-hidden p-0.5 bg-surface-muted/30">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-2 transition-all ${deviceMode === "desktop" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary rounded-[10px]" : "text-text-muted hover:text-text-main"}`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`p-2 transition-all ${deviceMode === "tablet" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary rounded-[10px]" : "text-text-muted hover:text-text-main"}`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-2 transition-all ${deviceMode === "mobile" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary rounded-[10px]" : "text-text-muted hover:text-text-main"}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-5 flex-grow">
              
              {/* CANVAS SANDBOX */}
              <div 
                className="relative rounded-[20px] overflow-hidden flex items-center justify-center border border-border-light transition-all duration-300 min-h-[360px] flex-grow shadow-inner"
                style={{ 
                  backgroundColor: previewBg,
                  maxWidth: deviceMode === "mobile" ? "320px" : deviceMode === "tablet" ? "480px" : "100%",
                  margin: "0 auto",
                  width: "100%"
                }}
              >
                {/* PREVIEW TARGET BOX */}
                <div
                  className="w-40 h-40 md:w-52 md:h-52 transition-all duration-150 shadow-premium-sm"
                  style={{
                    backgroundColor: boxBg,
                    borderRadius: borderRadiusCSS
                  }}
                />
              </div>

              {/* BACKGROUND STYLE CONFIGURATION */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Background color config */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Sandbox Backdrop</span>
                  <div className="flex items-center gap-2">
                    <input aria-label="Sandbox backdrop color"
                      type="color"
                      value={previewBg}
                      onChange={(e) => setPreviewBg(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input aria-label="Sandbox backdrop color hex"
                      type="text"
                      value={previewBg.toUpperCase()}
                      onChange={(e) => setPreviewBg(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-background border border-border-light rounded font-mono outline-none"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Box element background color */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Shape Color</span>
                  <div className="flex items-center gap-2">
                    <input aria-label="Shape color"
                      type="color"
                      value={boxBg}
                      onChange={(e) => setBoxBg(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input aria-label="Shape color hex"
                      type="text"
                      value={boxBg.toUpperCase()}
                      onChange={(e) => setBoxBg(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-background border border-border-light rounded font-mono outline-none"
                      maxLength={7}
                    />
                  </div>
                </div>

              </div>

            </div>
          </Card>

          {/* USER INFO PANEL */}
          <div className="p-5 rounded-[16px] bg-brand-primary-light/10 border border-brand-primary/20 text-text-main text-sm leading-relaxed flex gap-3">
            <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Elliptical Radius Tip:</span>
              <p className="text-xs text-text-sub mt-1 leading-relaxed">
                Using elliptical border radius (the <code>/</code> slash syntax) lets you specify different horizontal and vertical radius limits on each corner. This makes it easy to generate organic, liquid shapes and fluid illustrations.
              </p>
            </div>
          </div>

          {/* PRACTICAL EXAMPLES */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-text-main uppercase tracking-wider font-mono">Practical Examples</h4>
            <p className="text-xs text-text-muted">Click any example to apply it to the generator.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { 
                  name: "Card", 
                  radius: "12px", 
                  preview: "12px",
                  apply: () => { setElliptical(false); setLinked(true); setHTl(12); },
                  desc: "Standard UI card"
                },
                { 
                  name: "Button", 
                  radius: "8px", 
                  preview: "8px",
                  apply: () => { setElliptical(false); setLinked(true); setHTl(8); },
                  desc: "Action button"
                },
                { 
                  name: "Pill", 
                  radius: "9999px", 
                  preview: "9999px",
                  apply: () => { setElliptical(false); setLinked(true); setHTl(9999); },
                  desc: "Fully rounded pill"
                },
                { 
                  name: "Image", 
                  radius: "16px", 
                  preview: "16px",
                  apply: () => { setElliptical(false); setLinked(true); setHTl(16); },
                  desc: "Rounded image"
                },
                { 
                  name: "Input", 
                  radius: "6px", 
                  preview: "6px",
                  apply: () => { setElliptical(false); setLinked(true); setHTl(6); },
                  desc: "Form input field"
                },
                { 
                  name: "Badge", 
                  radius: "9999px", 
                  preview: "9999px",
                  apply: () => { setElliptical(false); setLinked(true); setHTl(9999); },
                  desc: "Small badge/tag"
                },
                { 
                  name: "Blob", 
                  radius: "30% 70% 70% 30% / 30% 30% 70% 70%", 
                  preview: "elliptical",
                  apply: () => { setElliptical(true); setLinked(false); setHTl(30); setHTr(70); setHBr(70); setHBl(30); setVTl(30); setVTr(30); setVBr(70); setVBl(70); },
                  desc: "Organic blob shape"
                },
                { 
                  name: "Leaf", 
                  radius: "80px 0 80px 0", 
                  preview: "asymmetric",
                  apply: () => { setElliptical(false); setLinked(false); setHTl(80); setHTr(0); setHBr(80); setHBl(0); },
                  desc: "Asymmetric leaf"
                },
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={ex.apply}
                  className="p-4 rounded-xl border border-border-light bg-surface-base hover:border-brand-primary hover:shadow-sm cursor-pointer transition-all text-left group"
                >
                  <div className="font-mono text-sm font-bold text-brand-primary mb-1">{ex.preview}</div>
                  <div className="font-sans font-semibold text-sm text-text-main">{ex.name}</div>
                  <div className="text-[10px] text-text-muted mt-1">{ex.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
