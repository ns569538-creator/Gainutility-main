import React, { useState, useRef } from "react";
import { 
  Upload, 
  Eye, 
  Grid3X3, 
  Compass, 
  Layers, 
  Tv, 
  Smartphone, 
  Info, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Youtube,
  Download,
  ArrowRight,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface ThumbnailSafeZoneProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

export const ThumbnailSafeZone: React.FC<ThumbnailSafeZoneProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState<boolean>(true);
  const [showDurationBadge, setShowDurationBadge] = useState<boolean>(true);
  const [showDiagonalGuides, setShowDiagonalGuides] = useState<boolean>(false);
  const [activeDeviceCrop, setActiveDeviceCrop] = useState<"none" | "mobile" | "tv">("none");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        setImageSrc((prev: string | null) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      onAddToast("Thumbnail uploaded to analyzer!", "success");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
        const url = URL.createObjectURL(file);
        setImageSrc((prev: string | null) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      onAddToast("Thumbnail dropped to analyzer!", "success");
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setImageSrc(DEFAULT_IMAGE);
    setShowRuleOfThirds(true);
    setShowDurationBadge(true);
    setShowDiagonalGuides(false);
    setActiveDeviceCrop("none");
    setZoomLevel(100);
    onAddToast("Safe zones reset.", "info");
  };

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Control Panel */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-5" aria-labelledby="upload-heading">
          <h3 id="upload-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            1. Upload Thumbnail Image
          </h3>
          
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={triggerUpload}
            className="border-2 border-dashed border-border-light hover:border-brand-primary rounded-xl p-6 text-center cursor-pointer transition-all duration-150 bg-surface-muted/50 hover:bg-brand-primary-light/5 flex flex-col items-center justify-center gap-3 min-h-[140px]"
          >
            <Upload className="w-5 h-5 text-text-sub" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-text-main">Click or drop file here</p>
              <p className="text-[10px] text-text-disabled font-mono">JPG, PNG, WEBP (16:9)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="overlays-heading">
          <h3 id="overlays-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            2. Diagnostics Overlays
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-border-light/60 bg-surface-muted/30 cursor-pointer">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-text-main">Rule of Thirds Grid</span>
              </div>
              <input
                type="checkbox"
                checked={showRuleOfThirds}
                onChange={(e) => setShowRuleOfThirds(e.target.checked)}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-border-light/60 bg-surface-muted/30 cursor-pointer">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-text-main">Diagonal Dynamic Balance</span>
              </div>
              <input
                type="checkbox"
                checked={showDiagonalGuides}
                onChange={(e) => setShowDiagonalGuides(e.target.checked)}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-border-light/60 bg-surface-muted/30 cursor-pointer">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-text-main">Red Timestamp Pill (Bottom Right)</span>
              </div>
              <input
                type="checkbox"
                checked={showDurationBadge}
                onChange={(e) => setShowDurationBadge(e.target.checked)}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
            </label>
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="crops-heading">
          <h3 id="crops-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            3. Device Viewport Crops
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "none", label: "Full 16:9" },
              { id: "mobile", label: "Mobile Crop" },
              { id: "tv", label: "TV Border" }
            ].map((crop) => (
              <button
                key={crop.id}
                onClick={() => setActiveDeviceCrop(crop.id as any)}
                className={`py-2 px-2.5 rounded-lg text-xs font-sans font-bold border transition-all ${
                  activeDeviceCrop === crop.id
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-surface-muted border-border-light/60 text-text-sub hover:text-text-main"
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-surface-muted hover:bg-border-light text-text-sub py-2 px-3 rounded-lg text-xs font-sans font-bold border border-border-light flex items-center justify-center gap-1.5 transition-colors pt-2.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Checks
          </button>
        </section>
      </div>

      {/* Right Active Diagnostic Canvas */}
      <div className="lg:col-span-8 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-5" aria-labelledby="analyzer-heading">
          <div className="flex items-center justify-between">
            <h3 id="analyzer-heading" className="text-xs font-mono font-bold uppercase tracking-widest text-text-disabled">
              Interactive Analyzer Frame
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              Live Preview Map
            </span>
          </div>

          <div className="w-full aspect-video rounded-xl border border-border-light bg-[#111111] overflow-hidden relative shadow-inner">
            <img
              src={imageSrc}
              alt="Safe Zone Analyzer Target"
              className={`w-full h-full object-cover transition-all duration-300 ${
                activeDeviceCrop === "mobile" ? "scale-x-95 scale-y-105 filter saturate-75" : ""
              }`}
              referrerPolicy="no-referrer"
            />

            {showRuleOfThirds && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none select-none">
                <div className="border-r border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-b border-white/25"></div>
                <div className="border-r border-white/25"></div>
                <div className="border-r border-white/25"></div>
                <div></div>
              </div>
            )}

            {showDiagonalGuides && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-40" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3">
                <line x1="0" y1="0" x2="100%" y2="100%" />
                <line x1="0" y1="100%" x2="100%" y2="0" />
              </svg>
            )}

            {activeDeviceCrop === "mobile" && (
              <div className="absolute inset-x-8 inset-y-4 border-2 border-red-500/60 pointer-events-none select-none">
                <span className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Mobile View Crop Border (90% width)
                </span>
              </div>
            )}

            {activeDeviceCrop === "tv" && (
              <div className="absolute inset-12 border-2 border-dashed border-blue-500/60 pointer-events-none select-none">
                <span className="absolute top-2 left-2 bg-blue-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                  TV Safe Action border (80% inside)
                </span>
              </div>
            )}

            {showDurationBadge && (
              <div className="absolute bottom-3 right-3 bg-black/90 border border-white/10 text-white font-mono text-[10px] font-black px-2 py-1 rounded shadow-lg select-none flex items-center gap-1">
                <span>10:45</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              </div>
            )}

            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="text-[9px] font-mono font-bold bg-black/80 text-white px-2 py-0.5 rounded border border-white/10">
                Diag Checker Active
              </span>
            </div>
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="checklist-heading">
          <h3 id="checklist-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
            <Info className="w-4.5 h-4.5 text-brand-primary" />
            Creator Safe-Zone Guidance Checklist
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-normal">
            <div className="p-3 rounded-lg border border-border-light/60 bg-surface-muted/20 space-y-1">
              <p className="font-bold text-text-main flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Bottom-Right Dead Zone
              </p>
              <p className="text-text-muted">YouTube places the duration badge (approx. 15% width of your card) in the bottom-right corner. Never place text or essential logos here.</p>
            </div>

            <div className="p-3 rounded-lg border border-border-light/60 bg-surface-muted/20 space-y-1">
              <p className="font-bold text-text-main flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Visual Rule of Thirds
              </p>
              <p className="text-text-muted">Keep faces, prominent text emphasis, or main focal points on the grid intersection lines to attract biological eye tracking.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Upload your thumbnail design (1280×720 recommended) or use the default example.</li>
      <li>Toggle overlay guides: Rule of Thirds grid, diagonal dynamic balance, and timestamp badge obstruction.</li>
      <li>Switch device viewport crops: Full 16:9, Mobile crop (90% width), or TV safe border (80% inside).</li>
      <li>Reposition critical text/logos outside blocked zones shown by the overlays.</li>
      <li>Use the checklist to verify your design avoids common pitfalls.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Rule of Thirds grid overlay for composition guidance</li>
      <li>Diagonal dynamic balance lines for visual flow</li>
      <li>Bottom-right timestamp badge obstruction zone</li>
      <li>Mobile crop simulation (90% width)</li>
      <li>TV safe action border simulation (80% inside)</li>
      <li>Guidance checklist with actionable tips</li>
      <li>Zero uploads — all processing in your browser</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Overlay positions are based on publicly observable YouTube UI — YouTube does not publish official pixel specifications.</li>
      <li>Mobile crop simulation uses a fixed 90% width approximation; actual crop varies by device aspect ratio.</li>
      <li>TV safe border uses a fixed 80% inset approximation; actual safe area varies by TV app version.</li>
      <li>Timestamp badge size and position may vary by YouTube UI updates and device.</li>
      <li>No connection to your YouTube account — this tool only simulates overlays on the image you provide.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="thumbnail-safe-zone"
      toolName="Thumbnail Safe Zone Checker"
      toolDescription="Overlay safe-zone guides so YouTube's badges never cover your design. Check rule of thirds, diagonal balance, and device crops."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No images are sent to any server."
      trustNote="Overlay positions are approximations based on observable YouTube UI. Actual rendering may vary by device and YouTube updates."
    >
      {toolContent}
    </ToolPageLayout>
  );
};