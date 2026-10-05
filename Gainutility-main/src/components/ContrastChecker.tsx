/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "./Common";
import { tt, ttf } from "../i18n/toolUi";
import { t } from "../i18n/ui";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/contrastChecker";
import {
  ArrowLeftRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  Heart,
  Info,
  Sparkles,
  RefreshCw
} from "lucide-react";

import {
  contrastRatio,
  getLuminance,
  hexToRgb,
  rgbToHex,
  checkWCAG,
  simulateColorBlindness,
  type ColorBlindnessMode,
} from "../colorStudio/color";
import { ColorPickerField } from "../colorStudio/colorUI";

interface ContrastCheckerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ onCopy, onAddToast }) => {
  const locale = useLocale();
  const [fgColor, setFgColor] = useState("#263124"); // Brand primary dark
  const [bgColor, setBgColor] = useState("#FAF8F1"); // Brand background
  const [ratio, setRatio] = useState(4.5);
  const [passes, setPasses] = useState({
    aaNormal: true,
    aaLarge: true,
    aaaNormal: false,
    aaaLarge: true,
    uiGraphic: true
  });
  const [blindnessMode, setBlindnessMode] = useState<ColorBlindnessMode>("normal");

  const [suggestedFg, setSuggestedFg] = useState<string | null>(null);

  // Calculate contrast metrics on color changes
  useEffect(() => {
    const fgRgb = hexToRgb(fgColor);
    const bgRgb = hexToRgb(bgColor);

    if (fgRgb && bgRgb) {
      const roundedRatio = Math.round(contrastRatio(fgColor, bgColor) * 100) / 100;
      setRatio(roundedRatio);

      // WCAG standards thresholds:
      // AA Normal Text: 4.5:1
      // AA Large Text (>=18pt or >=14pt bold): 3:1
      // AAA Normal Text: 7:1
      // AAA Large Text: 4.5:1
      // UI Elements / Graphical Objects: 3:1
      setPasses(checkWCAG(roundedRatio));

      // Suggest alternatives if contrast fails normal AA limit
      if (roundedRatio < 4.5) {
        // Find a darker version of foreground if background is light, or vice-versa
        const isBgLight = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b) > 0.5;
        let factor = isBgLight ? 0.85 : 1.15;
        let sfR = fgRgb.r;
        let sfG = fgRgb.g;
        let sfB = fgRgb.b;
        
        let attempts = 0;
        let testRatio = roundedRatio;

        while (testRatio < 4.5 && attempts < 20) {
          sfR = Math.max(0, Math.min(255, sfR * factor));
          sfG = Math.max(0, Math.min(255, sfG * factor));
          sfB = Math.max(0, Math.min(255, sfB * factor));

          const newL1 = getLuminance(sfR, sfG, sfB);
          const newL2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
          const newBrightest = Math.max(newL1, newL2);
          const newDarkest = Math.min(newL1, newL2);
          testRatio = (newBrightest + 0.05) / (newDarkest + 0.05);
          attempts++;
        }

        if (testRatio >= 4.5) {
          setSuggestedFg(rgbToHex(sfR, sfG, sfB));
        } else {
          setSuggestedFg(isBgLight ? "#000000" : "#FFFFFF");
        }
      } else {
        setSuggestedFg(null);
      }
    }
  }, [fgColor, bgColor]);

  const handleSwap = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
    onAddToast(tt("contrast-checker", "colorsSwapped", locale, "Colors swapped"), "info");
  };

  const handleReset = () => {
    setFgColor("#263124");
    setBgColor("#FAF8F1");
    setBlindnessMode("normal");
    onAddToast(tt("contrast-checker", "colorsReset", locale, "Colors reset to brand slate guidelines"), "info");
  };

  const applySuggested = () => {
    if (suggestedFg) {
      setFgColor(suggestedFg);
      onAddToast(tt("contrast-checker", "appliedFix", locale, "Applied accessible alternative color"), "success");
    }
  };

  const handleCopyFg = () => {
    onCopy(fgColor);
  };

  const handleCopyBg = () => {
    onCopy(bgColor);
  };

  const handleCopyBoth = () => {
    onCopy(ttf("contrast-checker", "copyBothFormat", locale, { fg: fgColor, bg: bgColor }, `FG: ${fgColor} / BG: ${bgColor}`));
  };

  // Map a color blindness mode to its localizable dict key.
  const modeKeyFor = (mode: string): string => {
    const map: Record<string, string> = { normal: "modeNormal", protan: "modeProtan", deutan: "modeDeutan", tritan: "modeTritan", achroma: "modeAchroma" };
    return map[mode] || "modeNormal";
  };

  // Simulate output style properties
  const simulatedFg = simulateColorBlindness(fgColor, blindnessMode);
  const simulatedBg = simulateColorBlindness(bgColor, blindnessMode);

  return (
    <div className="flex flex-col gap-8" id="contrast-checker-tool">
      
      {/* Control Presets */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm md:text-base font-bold uppercase tracking-wider text-text-muted">{tt("contrast-checker", "simFilterLabel", locale, "Color Simulation Filter:")}</span>
          <div className="flex flex-wrap gap-1.5 border border-border-light rounded-[16px] p-1.5 bg-background shadow-sm">
            {(["normal", "protan", "deutan", "tritan", "achroma"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBlindnessMode(mode)}
                className={`px-4 py-2 text-sm font-sans font-bold rounded-[12px] capitalize cursor-pointer transition-all duration-200 ${
                  blindnessMode === mode 
                    ? "bg-brand-primary text-[#FAF8F1] shadow-sm" 
                    : "text-text-sub hover:bg-surface-hover"
                }`}
              >
                {tt("contrast-checker", modeKeyFor(mode), locale, mode === "achroma" ? "Monochrome" : mode)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSwap} leftIcon={<ArrowLeftRight className="w-4 h-4" />} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            {t("swap", locale)}
          </Button>
          <Button variant="outline" onClick={handleReset} className="text-text-muted border-border-medium hover:bg-surface-hover h-12 md:h-[50px] rounded-[16px] text-base font-bold" leftIcon={<RotateCcw className="w-4 h-4" />}>
            {t("reset", locale)}
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Left Side: Dynamic inputs & sliders */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card id="contrast-inputs-card" title={tt("contrast-checker", "specColorsTitle", locale, "Design Spec Colors")} subtitle={tt("contrast-checker", "specColorsSubtitle", locale, "Modify hex codes and choose eye-safe background & text values.")}>
            <div className="flex flex-col gap-6">
              
              {/* Foreground Input */}
              <ColorPickerField
                value={fgColor}
                onChange={(val) => setFgColor(val)}
                label={tt("contrast-checker", "fgLabel", locale, "Foreground / Text Color")}
                roleBadge="Text / Foreground"
                onCopy={onCopy}
                showSliders
              />

              {/* Background Input */}
              <ColorPickerField
                value={bgColor}
                onChange={(val) => setBgColor(val)}
                label={tt("contrast-checker", "bgLabel", locale, "Background Canvas Color")}
                roleBadge="Canvas / Background"
                onCopy={onCopy}
                showSliders
              />

              {/* Quick Contrast presets */}
              <div className="flex flex-col gap-3 pt-5 border-t border-border-light">
                <button onClick={handleCopyBoth} className="w-full flex items-center justify-center gap-2 text-xs font-bold cursor-pointer px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-all duration-200 shadow-sm">
                  <Copy className="w-4 h-4" /> {tt("contrast-checker", "copyBoth", locale, "Copy both colors")}
                </button>
                <span className="text-sm font-bold uppercase tracking-wider text-text-muted font-mono">{tt("contrast-checker", "brandPairings", locale, "Brand Palette Pairings")}</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setFgColor("#263124"); setBgColor("#FAF8F1"); }}
                    className="p-3.5 rounded-[16px] border border-border-light text-sm text-[#263124] bg-[#FAF8F1] font-mono hover:border-brand-primary hover:shadow-sm cursor-pointer text-center font-bold transition-all"
                  >
                    {tt("contrast-checker", "pairForestCream", locale, "Forest on Cream")}
                  </button>
                  <button
                    onClick={() => { setFgColor("#FAF8F1"); setBgColor("#556B2F"); }}
                    className="p-3.5 rounded-[16px] border border-border-light text-sm text-[#FAF8F1] bg-[#556B2F] font-mono hover:border-brand-primary hover:shadow-sm cursor-pointer text-center font-bold transition-all"
                  >
                    {tt("contrast-checker", "pairCreamForest", locale, "Cream on Forest")}
                  </button>
                  <button
                    onClick={() => { setFgColor("#D9B95B"); setBgColor("#FFFFFF"); }}
                    className="p-3.5 rounded-[16px] border border-border-light text-sm text-[#D9B95B] bg-[#FFFFFF] font-mono hover:border-brand-primary hover:shadow-sm cursor-pointer text-center font-bold transition-all"
                  >
                    {tt("contrast-checker", "pairBronzeWhite", locale, "Bronze on White")}
                  </button>
                  <button
                    onClick={() => { setFgColor("#FFFFFF"); setBgColor("#263124"); }}
                    className="p-3.5 rounded-[16px] border border-border-light text-sm text-white bg-[#263124] font-mono hover:border-brand-primary hover:shadow-sm cursor-pointer text-center font-bold transition-all"
                  >
                    {tt("contrast-checker", "pairWhiteForest", locale, "White on Deep Forest")}
                  </button>
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Center: Live Contrast Preview Stage */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card id="contrast-stage-card" title={tt("contrast-checker", "previewTitle", locale, "Design Accessibility Preview")} subtitle={tt("contrast-checker", "previewSubtitle", locale, "Simulated in real-time. Mode is set to normal visual acuity by default.")}>
            <div className="flex flex-col gap-5 flex-1">
              
              {/* Dynamic Simulated Preview Window */}
              <div 
                className="w-full rounded-[20px] p-7 md:p-8 border border-border-medium/60 shadow-premium-lg flex flex-col gap-5 relative overflow-hidden transition-colors flex-1 min-h-[320px]"
                style={{ backgroundColor: simulatedBg, color: simulatedFg }}
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/20 text-white text-[11px] font-mono rounded-lg font-bold uppercase tracking-wider">
                  {blindnessMode === "normal"
                    ? tt("contrast-checker", "sRGBBadge", locale, "Standard sRGB")
                    : ttf("contrast-checker", "simBadge", locale, { mode: tt("contrast-checker", modeKeyFor(blindnessMode), locale, blindnessMode) }, `${blindnessMode} Sim`)}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-sans font-bold text-xl md:text-2xl mb-2.5 leading-tight">{tt("contrast-checker", "titleSample", locale, "Display Title Heading (Space Grotesk)")}</h4>
                    <p className="text-base md:text-lg font-medium leading-relaxed">
                      {tt("contrast-checker", "bodySample", locale, "This is body text rendered in Lato font. Clean contrast ratios ensure maximum micro-readability for users in extreme daylight or low accessibility environments.")}
                    </p>
                  </div>

                  {/* WCAG Text Size Reference */}
                  <div className="border-t border-white/20 pt-4 space-y-3">
                    <h5 className="font-sans font-semibold text-sm text-text-main">WCAG Text Size Reference</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-white/20 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-text-muted">AA Normal Text</span>
                          <span className="text-xs font-mono text-brand-primary">≥ 4.5:1</span>
                        </div>
                        <p className="text-base leading-relaxed" style={{ fontSize: "16px" }}>
                          Standard body text (16px / 12pt)
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-white/20 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-text-muted">AA Large Text</span>
                          <span className="text-xs font-mono text-brand-primary">≥ 3.0:1</span>
                        </div>
                        <p className="text-lg font-medium leading-relaxed" style={{ fontSize: "18px", fontWeight: 500 }}>
                          Large text (18px / 14pt bold or 24px / 18pt)
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-white/20 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-text-muted">AAA Normal Text</span>
                          <span className="text-xs font-mono text-brand-primary">≥ 7.0:1</span>
                        </div>
                        <p className="text-base leading-relaxed" style={{ fontSize: "16px" }}>
                          Standard body text (16px / 12pt)
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-white/20 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-text-muted">AAA Large Text</span>
                          <span className="text-xs font-mono text-brand-primary">≥ 4.5:1</span>
                        </div>
                        <p className="text-lg font-medium leading-relaxed" style={{ fontSize: "18px", fontWeight: 500 }}>
                          Large text (18px / 14pt bold or 24px / 18pt)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3 flex-wrap">
                    <div className="px-4 py-2 rounded-xl text-sm font-bold border font-sans" style={{ borderColor: simulatedFg }}>
                      {tt("contrast-checker", "bentoButton", locale, "Bento Button")}
                    </div>
                    <div className="px-4 py-2 rounded-xl text-sm font-mono bg-black/10">
                      # {simulatedFg}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggester Alert */}
              {suggestedFg && (
                <div className="p-5 rounded-[16px] border border-brand-secondary/30 bg-[#FBF9EF] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-brand-primary font-sans font-bold text-sm">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{tt("contrast-checker", "calcFix", locale, "Calculated AAA Contrast Fix")}</span>
                  </div>
                  <p className="text-sm text-text-sub leading-normal">
                    {tt("contrast-checker", "calcFixBody", locale, "The current pairing fails standard normal-text ratios. Try this mathematically recommended alternative text hex:")}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-mono text-sm font-bold bg-white px-3 py-1.5 border border-border-light rounded-lg">{suggestedFg}</span>
                    <Button variant="secondary" onClick={applySuggested} className="h-10 px-4 text-xs font-bold rounded-lg">
                      {tt("contrast-checker", "applyFix", locale, "Apply Fix")}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>

        {/* Right Side: WCAG AA/AAA Pass Fail Matrices */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card id="contrast-eval-card" title={tt("contrast-checker", "wcagTitle", locale, "WCAG Compliance Matrix")} subtitle={tt("contrast-checker", "wcagSubtitle", locale, "Contrast ratio evaluations computed strictly following the W3C standards guidelines.")}>
            <div className="flex flex-col gap-6 flex-1 justify-between">
              
              {/* Ratio Gauge */}
              <div className={`rounded-[20px] p-7 border shadow-premium-md text-center flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                ratio >= 4.5
                  ? "bg-status-success/5 border-status-success/20"
                  : "bg-status-error/5 border-status-error/20"
              }`}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">{tt("contrast-checker", "contrastRatio", locale, "Contrast Ratio")}</span>
                <span className={`text-6xl md:text-7xl font-sans font-black leading-none my-2 ${
                  ratio >= 7 ? "text-status-success" : ratio >= 4.5 ? "text-brand-primary" : "text-status-error"
                }`}>{ratio}<span className="text-3xl md:text-4xl"> : 1</span></span>
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full mt-1 font-mono uppercase tracking-wide ${
                  ratio >= 4.5 ? "bg-status-success text-white" : "bg-status-error text-white"
                }`}>
                  {ratio >= 4.5 ? tt("contrast-checker", "passAANormal", locale, "Passes AA Normal") : tt("contrast-checker", "failAANormal", locale, "Fails AA Normal")}
                </span>
              </div>

              {/* Specific evaluations */}
              <div className="flex flex-col gap-4">
                
                <div className="flex justify-between items-center border-b border-border-light pb-3 text-base font-bold">
                  <span className="text-text-sub">{tt("contrast-checker", "aaNormalLabel", locale, "AA Normal Text")} (<span className="font-mono text-sm">4.5:1</span>)</span>
                  {passes.aaNormal ? (
                    <span className="text-status-success flex items-center gap-1.5 font-bold"><CheckCircle className="w-5 h-5" /> {tt("contrast-checker", "passStatus", locale, "Pass").toUpperCase()}</span>
                  ) : (
                    <span className="text-status-error flex items-center gap-1.5 font-bold"><XCircle className="w-5 h-5" /> {tt("contrast-checker", "failStatus", locale, "Fail").toUpperCase()}</span>
                  )}
                </div>

                <div className="flex justify-between items-center border-b border-border-light pb-3 text-base font-bold">
                  <span className="text-text-sub">{tt("contrast-checker", "aaLargeLabel", locale, "AA Large Text")} (<span className="font-mono text-sm">3.0:1</span>)</span>
                  {passes.aaLarge ? (
                    <span className="text-status-success flex items-center gap-1.5 font-bold"><CheckCircle className="w-5 h-5" /> {tt("contrast-checker", "passStatus", locale, "Pass").toUpperCase()}</span>
                  ) : (
                    <span className="text-status-error flex items-center gap-1.5 font-bold"><XCircle className="w-5 h-5" /> {tt("contrast-checker", "failStatus", locale, "Fail").toUpperCase()}</span>
                  )}
                </div>

                <div className="flex justify-between items-center border-b border-border-light pb-3 text-base font-bold">
                  <span className="text-text-sub">{tt("contrast-checker", "aaaNormalLabel", locale, "AAA Normal Text")} (<span className="font-mono text-sm">7.0:1</span>)</span>
                  {passes.aaaNormal ? (
                    <span className="text-status-success flex items-center gap-1.5 font-bold"><CheckCircle className="w-5 h-5" /> {tt("contrast-checker", "passStatus", locale, "Pass").toUpperCase()}</span>
                  ) : (
                    <span className="text-status-error flex items-center gap-1.5 font-bold"><XCircle className="w-5 h-5" /> {tt("contrast-checker", "failStatus", locale, "Fail").toUpperCase()}</span>
                  )}
                </div>

                <div className="flex justify-between items-center border-b border-border-light pb-3 text-base font-bold">
                  <span className="text-text-sub">{tt("contrast-checker", "aaaLargeLabel", locale, "AAA Large Text")} (<span className="font-mono text-sm">4.5:1</span>)</span>
                  {passes.aaaLarge ? (
                    <span className="text-status-success flex items-center gap-1.5 font-bold"><CheckCircle className="w-5 h-5" /> {tt("contrast-checker", "passStatus", locale, "Pass").toUpperCase()}</span>
                  ) : (
                    <span className="text-status-error flex items-center gap-1.5 font-bold"><XCircle className="w-5 h-5" /> {tt("contrast-checker", "failStatus", locale, "Fail").toUpperCase()}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-base font-bold">
                  <span className="text-text-sub">{tt("contrast-checker", "uiGraphicLabel", locale, "Graphical Elements")} (<span className="font-mono text-sm">3.0:1</span>)</span>
                  {passes.uiGraphic ? (
                    <span className="text-status-success flex items-center gap-1.5 font-bold"><CheckCircle className="w-5 h-5" /> {tt("contrast-checker", "passStatus", locale, "Pass").toUpperCase()}</span>
                  ) : (
                    <span className="text-status-error flex items-center gap-1.5 font-bold"><XCircle className="w-5 h-5" /> {tt("contrast-checker", "failStatus", locale, "Fail").toUpperCase()}</span>
                  )}
                </div>

              </div>

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
