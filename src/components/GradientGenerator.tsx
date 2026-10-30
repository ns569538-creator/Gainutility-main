/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Input } from "./Common";
import { 
  Copy, 
  RotateCcw, 
  Sparkles, 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Download, 
  Heart, 
  Palette, 
  Eye 
} from "lucide-react";
import { ColorPickerField } from "../colorStudio/colorUI";

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 to 100
}

interface GradientGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const GradientGenerator: React.FC<GradientGeneratorProps> = ({ onCopy, onAddToast }) => {
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: "1", color: "#606C38", position: 0 },
    { id: "2", color: "#BC6C25", position: 100 }
  ]);
  const [activeStopId, setActiveStopId] = useState<string>("1");
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("premium-gradient-favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        // Ignore parsing errors
      }
    }
  }, []);

  const saveFavorites = (updated: string[]) => {
    setFavorites(updated);
    localStorage.setItem("premium-gradient-favorites", JSON.stringify(updated));
  };

  // Generate CSS Gradient string
  const getGradientCSS = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopString = sortedStops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(", ");
    
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopString})`;
    } else {
      return `radial-gradient(circle, ${stopString})`;
    }
  };

  const getTailwindCode = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    if (sortedStops.length >= 2) {
      const from = sortedStops[0].color;
      const via = sortedStops.length > 2 ? sortedStops[1].color : "";
      const to = sortedStops[sortedStops.length - 1].color;
      
      const angleClasses: Record<number, string> = {
        0: "bg-gradient-to-t",
        45: "bg-gradient-to-tr",
        90: "bg-gradient-to-r",
        135: "bg-gradient-to-br",
        180: "bg-gradient-to-b",
        225: "bg-gradient-to-bl",
        270: "bg-gradient-to-l",
        315: "bg-gradient-to-tl"
      };

      // Match closest standard angle class
      const closestAngle = Object.keys(angleClasses).reduce((prev, curr) => {
        return Math.abs(Number(curr) - angle) < Math.abs(Number(prev) - angle) ? Number(curr) : prev;
      }, 135);

      const angleClass = angleClasses[closestAngle] || "bg-gradient-to-r";
      
      return `${angleClass} from-[${from}] ${via ? `via-[${via}] ` : ""}to-[${to}]`;
    }
    return "bg-gradient-to-r from-brand-primary to-brand-secondary";
  };

  const handleAddStop = () => {
    if (colorStops.length >= 6) {
      onAddToast("Maximum of 6 color stops supported for premium balance", "warning");
      return;
    }
    
    // Insert new stop at a position between existing ones
    const sorted = [...colorStops].sort((a, b) => a.position - b.position);
    let newPos = 50;
    if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      newPos = Math.min(last.position + 15, 100);
    }

    const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: randomColor,
      position: newPos
    };

    const updated = [...colorStops, newStop];
    setColorStops(updated);
    setActiveStopId(newStop.id);
    onAddToast("Added new color stop", "info");
  };

  const handleRemoveStop = (id: string) => {
    if (colorStops.length <= 2) {
      onAddToast("Gradients require a minimum of 2 color stops", "warning");
      return;
    }
    const updated = colorStops.filter(s => s.id !== id);
    setColorStops(updated);
    if (activeStopId === id) {
      setActiveStopId(updated[0].id);
    }
    onAddToast("Stop removed", "info");
  };

  const handleUpdateStopColor = (id: string, color: string) => {
    const updated = colorStops.map(s => s.id === id ? { ...s, color } : s);
    setColorStops(updated);
  };

  const handleUpdateStopPosition = (id: string, position: number) => {
    const updated = colorStops.map(s => s.id === id ? { ...s, position: Math.max(0, Math.min(100, position)) } : s);
    setColorStops(updated);
  };

  const handleReverse = () => {
    const reversed = colorStops.map(stop => ({
      ...stop,
      position: 100 - stop.position
    })).reverse();
    setColorStops(reversed);
    onAddToast("Gradient stops reversed", "info");
  };

  const handleRandom = () => {
    const presets = [
      ["#556B2F", "#D9B95B", "#E5E0D5"],
      ["#263124", "#556B2F", "#FAF8F1"],
      ["#03001e", "#7303c0", "#ec38bc"],
      ["#11998e", "#38ef7d"],
      ["#fc4a1a", "#f7b733"],
      ["#3a7bd5", "#3a6073"],
      ["#ee0979", "#ff6a00"],
      ["#1f4037", "#99f2c8"],
      ["#F3904F", "#3B4371"]
    ];
    
    const chosen = presets[Math.floor(Math.random() * presets.length)];
    const newStops = chosen.map((color, idx) => ({
      id: idx.toString(),
      color,
      position: Math.round((idx / (chosen.length - 1)) * 100)
    }));
    
    setColorStops(newStops);
    setActiveStopId("0");
    onAddToast("Loaded creative preset", "success");
  };

  const handleReset = () => {
    setColorStops([
      { id: "1", color: "#606C38", position: 0 },
      { id: "2", color: "#BC6C25", position: 100 }
    ]);
    setAngle(135);
    setGradientType("linear");
    setActiveStopId("1");
    onAddToast("Reset to brand defaults", "info");
  };

  const handleCopyCSS = () => {
    const css = `background: ${getGradientCSS()};`;
    onCopy(css);
  };

  const handleCopyTailwind = () => {
    onCopy(getTailwindCode());
  };

  const handleAddFavorite = () => {
    const current = getGradientCSS();
    if (favorites.includes(current)) {
      onAddToast("Gradient already exists in your favorites list", "info");
      return;
    }
    const updated = [...favorites, current];
    saveFavorites(updated);
    onAddToast("Added to favorites!", "success");
  };

  const handleRemoveFavorite = (fav: string) => {
    const updated = favorites.filter(f => f !== fav);
    saveFavorites(updated);
    onAddToast("Removed from favorites", "info");
  };

  const handleApplyFavorite = (fav: string) => {
    // Basic parser for saved CSS to restore UI state
    // We can parse linear vs radial
    const isRadial = fav.includes("radial-gradient");
    setGradientType(isRadial ? "radial" : "linear");
    
    // Parse angle if linear
    if (!isRadial) {
      const angleMatch = fav.match(/linear-gradient\((\d+)deg/);
      if (angleMatch) {
        setAngle(parseInt(angleMatch[1], 10));
      }
    }

    // Parse stops: color and position
    const stopsMatch = fav.match(/#([a-fA-F0-9]{6})\s+(\d+)%/g);
    if (stopsMatch) {
      const parsedStops = stopsMatch.map((match, idx) => {
        const parts = match.split(/\s+/);
        return {
          id: idx.toString(),
          color: parts[0],
          position: parseInt(parts[1], 10)
        };
      });
      setColorStops(parsedStops);
      setActiveStopId("0");
    } else {
      // Direct raw hex match if positions are omitted
      const hexMatch = fav.match(/#([a-fA-F0-9]{6})/g);
      if (hexMatch) {
        const parsedStops = hexMatch.map((color, idx) => ({
          id: idx.toString(),
          color,
          position: Math.round((idx / (hexMatch.length - 1)) * 100)
        }));
        setColorStops(parsedStops);
        setActiveStopId("0");
      }
    }
    onAddToast("Applied saved favorite", "success");
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High quality export bounds
    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    let gradientObj: CanvasGradient;

    if (gradientType === "linear") {
      // Match the CSS linear-gradient(<angle>deg) geometry exactly:
      // 0deg points up, angles increase clockwise. The gradient line runs
      // through the center with length |W·sinθ| + |H·cosθ| (CSS spec).
      const radians = (angle * Math.PI) / 180;
      const dx = Math.sin(radians);
      const dy = -Math.cos(radians);
      const lineLength = Math.abs(width * dx) + Math.abs(height * dy);
      const cx = width / 2;
      const cy = height / 2;
      gradientObj = ctx.createLinearGradient(
        cx - (dx * lineLength) / 2,
        cy - (dy * lineLength) / 2,
        cx + (dx * lineLength) / 2,
        cy + (dy * lineLength) / 2
      );
    } else {
      gradientObj = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
    }

    // Add color stops (skip any mid-edit invalid color so export never throws)
    [...colorStops]
      .sort((a, b) => a.position - b.position)
      .forEach(stop => {
        try {
          gradientObj.addColorStop(stop.position / 100, stop.color);
        } catch {
          /* ignore transiently-invalid hex while typing */
        }
      });

    // Draw
    ctx.fillStyle = gradientObj;
    ctx.fillRect(0, 0, width, height);

    // Save
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "premium_gradient.png";
    link.href = dataUrl;
    link.click();
    onAddToast("Exported premium PNG (1200x800px)", "success");
  };

  const activeStop = colorStops.find(s => s.id === activeStopId) || colorStops[0];

  return (
    <div className="flex flex-col gap-8" id="gradient-generator-tool">
      
      {/* Configuration presets */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm md:text-base font-bold uppercase tracking-wider text-text-muted">Quick tools:</span>
          <div className="flex gap-3">
            <button onClick={handleRandom} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold px-5 cursor-pointer transition-all bg-gradient-to-br from-[#ec38bc] via-[#7303c0] to-[#03001e] text-white border-0 hover:brightness-110 hover:scale-105 hover:shadow-lg shadow-premium-sm inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Randomize
            </button>
            <Button variant="outline" onClick={handleReverse} leftIcon={<ArrowLeftRight className="w-4 h-4" />} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
              Reverse Stops
            </Button>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="text-text-muted border-border-medium hover:bg-surface-hover h-12 md:h-[50px] rounded-[16px] text-base font-bold" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Interactive controls */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card id="gradient-controls-card" title="Design Controls" subtitle="Modify gradient dimensions, stops, hex color codes and directions in real-time.">
            <div className="flex flex-col gap-6">
              
              {/* Type toggle */}
              <div className="flex flex-col gap-3">
                <span className="text-sm md:text-base font-bold uppercase tracking-wider text-text-muted font-mono">Gradient Formula</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGradientType("linear")}
                    className={`py-3.5 px-6 rounded-[16px] text-base font-sans font-bold transition-all cursor-pointer h-12 md:h-[50px] border ${
                      gradientType === "linear" 
                        ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm" 
                        : "bg-surface-base border-border-light text-text-sub hover:bg-surface-muted"
                    }`}
                  >
                    Linear Angle
                  </button>
                  <button
                    onClick={() => setGradientType("radial")}
                    className={`py-3.5 px-6 rounded-[16px] text-base font-sans font-bold transition-all cursor-pointer h-12 md:h-[50px] border ${
                      gradientType === "radial" 
                        ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm" 
                        : "bg-surface-base border-border-light text-text-sub hover:bg-surface-muted"
                    }`}
                  >
                    Radial Concentric
                  </button>
                </div>
              </div>

              {/* Slider track for multi color stops */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-bold uppercase tracking-wider text-text-muted font-mono">Multi-Color Stop Track</span>
                  <button 
                    onClick={handleAddStop}
                    className="text-sm text-brand-primary hover:text-brand-primary-hover font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Stop
                  </button>
                </div>

                {/* Simulated slider gradient bar with draggable markers */}
                <div className="relative pt-6 pb-4 px-1">
                  <div 
                    className="w-full h-5 rounded-full shadow-inner border border-border-light relative"
                    style={{ background: `linear-gradient(to right, ${[...colorStops].sort((a,b)=>a.position-b.position).map(s=>`${s.color} ${s.position}%`).join(", ")})` }}
                  >
                    {colorStops.map(stop => (
                      <button
                        key={stop.id}
                        onClick={() => setActiveStopId(stop.id)}
                        className={`absolute top-1/2 -translate-y-1/2 -ml-3.5 w-7 h-7 rounded-full border-2 bg-white shadow-premium-md cursor-pointer transition-transform ${
                          activeStopId === stop.id 
                            ? "border-brand-primary scale-125 ring-4 ring-brand-primary-light" 
                            : "border-border-medium hover:scale-110"
                        }`}
                        style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
                        title={`Stop at ${stop.position}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Stop details editing card */}
              <div className="bg-background dark:bg-surface-muted p-5 rounded-[16px] border border-border-light flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-border-light pb-3">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-text-muted font-mono">Editing Color Stop</span>
                  <button
                    onClick={() => handleRemoveStop(activeStop.id)}
                    className="text-xs md:text-sm font-bold text-status-error hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Stop
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                  {/* Hex input */}
                  <div className="flex flex-col gap-2">
                    <ColorPickerField
                      value={activeStop.color}
                      onChange={(val) => handleUpdateStopColor(activeStop.id, val)}
                      label="Stop Color"
                      roleBadge={`${activeStop.position}%`}
                      onCopy={onCopy}
                    />
                  </div>

                  {/* Position input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-semibold text-text-muted">
                      <span>Stop Position</span>
                      <span className="font-mono font-bold text-brand-primary">{activeStop.position}%</span>
                    </div>
                    <input aria-label="Stop position"
                      type="range"
                      min="0"
                      max="100"
                      value={activeStop.position}
                      onChange={(e) => handleUpdateStopPosition(activeStop.id, parseInt(e.target.value, 10))}
                      className="w-full accent-brand-primary py-3 cursor-pointer h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Angle selector for linear gradient */}
              {gradientType === "linear" && (
                <div className="flex flex-col gap-3 border-t border-border-light pt-5">
                  <div className="flex justify-between text-sm md:text-base font-bold uppercase tracking-wider text-text-muted font-mono">
                    <span>Linear Angle direction</span>
                    <span className="text-brand-primary font-black">{angle}°</span>
                  </div>
                  <input aria-label="Linear angle"
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-primary cursor-pointer h-10 py-2"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                      <button
                        key={ang}
                        onClick={() => setAngle(ang)}
                        className={`px-3.5 py-2 text-sm font-mono font-bold rounded-lg border cursor-pointer transition-colors ${
                          angle === ang 
                            ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-sm" 
                            : "bg-surface-base border-border-light text-text-sub hover:bg-surface-muted"
                        }`}
                      >
                        {ang}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* Code Exporter card */}
          <Card id="gradient-code-card" title="Generated Styling Syntax">
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-sm font-mono font-bold uppercase tracking-wider text-text-muted">Standard CSS Spec</span>
                  <Button variant="outline" onClick={handleCopyCSS} leftIcon={<Copy className="w-4 h-4" />} className="h-10 px-4 rounded-[12px] text-sm">Copy CSS</Button>
                </div>
                <pre className="p-5 bg-[#1C2311]/95 text-[#FAF8F1] rounded-[16px] font-mono text-base sm:text-sm sm:leading-relaxed overflow-x-auto select-all border border-border-light shadow-inner">
                  <code>{`background: ${getGradientCSS()};`}</code>
                </pre>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-sm font-mono font-bold uppercase tracking-wider text-text-muted">Tailwind CSS Class Spec</span>
                  <Button variant="outline" onClick={handleCopyTailwind} leftIcon={<Copy className="w-4 h-4" />} className="h-10 px-4 rounded-[12px] text-sm">Copy classes</Button>
                </div>
                <pre className="p-5 bg-[#1C2311]/95 text-[#FAF8F1] rounded-[16px] font-mono text-base sm:text-sm sm:leading-relaxed overflow-x-auto select-all border border-border-light shadow-inner">
                  <code>{getTailwindCode()}</code>
                </pre>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Side: Live preview stage & favorites */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Main Visual Stage */}
          <Card 
            id="gradient-stage-card" 
            title="Live Visual Canvas" 
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportPNG} className="h-9 px-3 rounded-[12px] text-xs font-bold" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Export PNG
                </Button>
                <button 
                  onClick={handleAddFavorite}
                  className="text-text-muted hover:text-status-error transition-colors p-2 rounded-full hover:bg-surface-muted/50 cursor-pointer"
                  title="Add to Favorites"
                >
                  <Heart className="w-5 h-5 fill-current text-status-error" />
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-5">
              
              <div 
                className="w-full aspect-[4/3] rounded-[16px] shadow-premium-lg border border-border-medium/60 relative overflow-hidden"
                style={{ background: getGradientCSS() }}
              />

              {/* Hidden canvas for drawing exports */}
              <canvas ref={canvasRef} className="hidden" />

            </div>
          </Card>

          {/* Local Favorites panel */}
          <Card id="gradient-favorites-card" title="Saved Palette Gradients">
            <div className="flex flex-col gap-4">
              {favorites.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8 border border-dashed border-border-light rounded-[16px] leading-relaxed">
                  Palette is currently empty. Tap the Heart icon on the live preview stage above to save.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-56 overflow-y-auto pr-1">
                  {favorites.map((fav, index) => (
                    <div 
                      key={index} 
                      className="group border border-border-light rounded-[16px] p-2.5 flex flex-col gap-2 hover:border-brand-primary transition-all bg-surface-muted/20 relative"
                    >
                      <button 
                        onClick={() => handleApplyFavorite(fav)}
                        className="w-full h-16 rounded-[12px] shadow-sm border border-border-light cursor-pointer"
                        style={{ background: fav }}
                        title="Click to apply"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(fav)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/80 hover:bg-white text-status-error shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove Favorite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
