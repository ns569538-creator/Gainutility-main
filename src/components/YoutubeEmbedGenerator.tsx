import React, { useState, useMemo } from "react";
import { 
  Sliders, 
  Copy, 
  Code, 
  Info, 
  ShieldAlert, 
  RotateCcw, 
  Check, 
  Laptop, 
  HelpCircle,
  Video,
  ExternalLink,
  Youtube,
  ArrowRight,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface YoutubeEmbedGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

export const YoutubeEmbedGenerator: React.FC<YoutubeEmbedGeneratorProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [videoUrl, setVideoUrl] = useState<string>("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  
  const [usePrivacyMode, setUsePrivacyMode] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loopVideo, setLoopVideo] = useState<boolean>(false);
  const [muteVideo, setMuteVideo] = useState<boolean>(false);
  const [autoplayVideo, setAutoplayVideo] = useState<boolean>(false);
  const [lazyLoad, setLazyLoad] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<"16-9" | "4-3" | "1-1">("16-9");

  const videoId = useMemo(() => {
    const trimmed = videoUrl.trim();
    if (!trimmed) return "dQw4w9WgXcQ";

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    try {
      if (trimmed.includes("youtu.be/")) {
        const parts = trimmed.split("youtu.be/");
        const afterBe = parts[1]?.split("?")[0];
        if (afterBe) return afterBe;
      }
      
      const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname.includes("/watch")) {
          return urlObj.searchParams.get("v") || "dQw4w9WgXcQ";
        }
        if (urlObj.pathname.includes("/shorts/")) {
          const parts = urlObj.pathname.split("/shorts/");
          return parts[1]?.split("/")[0] || "dQw4w9WgXcQ";
        }
        if (urlObj.pathname.includes("/embed/")) {
          const parts = urlObj.pathname.split("/embed/");
          return parts[1]?.split("?")[0] || "dQw4w9WgXcQ";
        }
      }
    } catch {}

    return "dQw4w9WgXcQ";
  }, [videoUrl]);

  const parseTimeToSeconds = (val: string): number => {
    if (!val.trim()) return 0;
    if (val.includes(":")) {
      const parts = val.split(":").map(p => parseInt(p, 10));
      if (parts.some(isNaN)) return 0;
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const generatedHtmlCode = useMemo(() => {
    const domain = usePrivacyMode ? "youtube-nocookie.com" : "youtube.com";
    
    const params: string[] = [];
    
    if (startTime) {
      const startSecs = parseTimeToSeconds(startTime);
      if (startSecs > 0) params.push(`start=${startSecs}`);
    }
    if (endTime) {
      const endSecs = parseTimeToSeconds(endTime);
      if (endSecs > 0) params.push(`end=${endSecs}`);
    }
    if (autoplayVideo) params.push("autoplay=1");
    if (muteVideo) params.push("mute=1");
    if (!showControls) params.push("controls=0");
    if (loopVideo) params.push(`loop=1&playlist=${videoId}`);

    const queryStr = params.length > 0 ? `?${params.join("&")}` : "";
    const embedUrl = `https://www.${domain}/embed/${videoId}${queryStr}`;

    let aspectClass = "aspect-video";
    let styleStr = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;";
    if (aspectRatio === "4-3") aspectClass = "aspect-[4/3]";
    if (aspectRatio === "1-1") aspectClass = "aspect-square";

    return `<!-- Responsive YouTube Embed Wrapper -->
<div class="youtube-embed-container" style="position: relative; width: 100%; height: 0; padding-bottom: ${
  aspectRatio === "16-9" ? "56.25%" : aspectRatio === "4-3" ? "75%" : "100%"
}; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  <iframe 
    src="${embedUrl}" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen
    ${lazyLoad ? 'loading="lazy"' : ''}
    style="${styleStr}"
  ></iframe>
</div>`;
  }, [videoId, usePrivacyMode, startTime, endTime, loopVideo, muteVideo, autoplayVideo, lazyLoad, showControls, aspectRatio]);

  const handleCopyCode = () => {
    onCopy(generatedHtmlCode);
  };

  const handleReset = () => {
    setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    setUsePrivacyMode(true);
    setStartTime("");
    setEndTime("");
    setLoopVideo(false);
    setMuteVideo(false);
    setAutoplayVideo(false);
    setLazyLoad(true);
    setShowControls(true);
    setAspectRatio("16-9");
    onAddToast("Reset configurations to clean default presets.", "info");
  };

  const activePreviewUrl = useMemo(() => {
    const domain = usePrivacyMode ? "youtube-nocookie.com" : "youtube.com";
    const params: string[] = ["rel=0"];
    
    if (startTime) {
      const s = parseTimeToSeconds(startTime);
      if (s > 0) params.push(`start=${s}`);
    }
    if (endTime) {
      const e = parseTimeToSeconds(endTime);
      if (e > 0) params.push(`end=${e}`);
    }
    if (autoplayVideo) params.push("autoplay=1");
    if (muteVideo) params.push("mute=1");
    if (!showControls) params.push("controls=0");
    if (loopVideo) params.push(`loop=1&playlist=${videoId}`);

    return `https://www.${domain}/embed/${videoId}?${params.join("&")}`;
  }, [videoId, usePrivacyMode, startTime, endTime, autoplayVideo, muteVideo, showControls, loopVideo]);

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Settings */}
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-5" aria-labelledby="input-heading">
          <h3 id="input-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            1. Input Source Video URL
          </h3>
          
          <div className="space-y-2">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full text-xs md:text-sm font-sans p-3 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
              placeholder="Paste YouTube watch URL, Shorts, share links, or 11-char ID..."
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-text-disabled px-1">
              <span>Extracted ID: <strong className="text-brand-primary">{videoId}</strong></span>
              <span className="flex items-center gap-0.5 text-emerald-500 font-bold">Active</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-5" aria-labelledby="config-heading">
          <h3 id="config-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            2. Player Attributes Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-brand-primary-light/10 border border-brand-primary/10">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main flex items-center gap-1">
                  Privacy-Enhanced Mode
                </p>
                <p className="text-[10px] text-text-disabled">Uses secure nocookie domain</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePrivacyMode}
                  onChange={(e) => setUsePrivacyMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-text-sub uppercase tracking-wider">Start point (e.g. 01:25)</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="s or mm:ss"
                  className="w-full text-xs font-mono p-2 rounded-lg border border-border-light bg-background text-text-main focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-text-sub uppercase tracking-wider">End point (e.g. 120)</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Seconds count"
                  className="w-full text-xs font-mono p-2 rounded-lg border border-border-light bg-background text-text-main focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: "Autoplay Video", val: autoplayVideo, set: setAutoplayVideo },
                { label: "Mute Volume", val: muteVideo, set: setMuteVideo },
                { label: "Loop Continuously", val: loopVideo, set: setLoopVideo },
                { label: "Show Controls", val: showControls, set: setShowControls },
                { label: "Lazy Load Script", val: lazyLoad, set: setLazyLoad }
              ].map((toggle, i) => (
                <label key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border-light/60 bg-surface-muted/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={toggle.val}
                    onChange={(e) => toggle.set(e.target.checked)}
                    className="rounded border-border-light text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-medium text-text-sub">{toggle.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-mono font-bold text-text-sub uppercase tracking-wider block">Aspect Ratio Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "16-9", label: "Wide (16:9)" },
                  { id: "4-3", label: "Classic (4:3)" },
                  { id: "1-1", label: "Square (1:1)" }
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-sans font-bold border transition-all ${
                      aspectRatio === ratio.id
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-surface-muted border-border-light/60 text-text-sub hover:text-text-main"
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-surface-muted hover:bg-border-light text-text-sub py-2 px-3 rounded-lg text-xs font-sans font-bold border border-border-light flex items-center justify-center gap-1.5 transition-colors pt-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Configs
            </button>
          </div>
        </section>
      </div>

      {/* Right: Preview & Code */}
      <div className="lg:col-span-7 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="preview-heading">
          <h3 id="preview-heading" className="text-xs font-mono font-bold uppercase tracking-widest text-text-disabled">
            Live Mock Frame Preview
          </h3>

          <div className={`w-full overflow-hidden rounded-xl border border-border-light bg-[#121212] relative ${
            aspectRatio === "16-9" ? "aspect-video" : aspectRatio === "4-3" ? "aspect-[4/3]" : "aspect-square"
          }`}>
            <iframe
              src={activePreviewUrl}
              title="YouTube Player Live Preview"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="code-heading">
          <div className="flex justify-between items-center">
            <h3 id="code-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-brand-primary" />
              Embed HTML Code Output
            </h3>
            <button
              onClick={handleCopyCode}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy HTML
            </button>
          </div>

          <pre className="p-4 rounded-xl border border-border-light bg-surface-muted/60 text-[11px] font-mono text-text-main overflow-x-auto leading-relaxed max-h-[160px]">
            {generatedHtmlCode}
          </pre>
        </section>
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Paste any YouTube URL (watch, shorts, embed, youtu.be) or just the 11-character video ID.</li>
      <li>The tool extracts the video ID automatically and shows it for confirmation.</li>
      <li>Configure player options: privacy mode (nocookie domain), start/end times, autoplay, mute, loop, controls, lazy loading.</li>
      <li>Select aspect ratio: 16:9 (default), 4:3, or 1:1 square.</li>
      <li>The live preview updates instantly with your settings.</li>
      <li>Copy the generated responsive iframe HTML code.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Responsive iframe wrapper with aspect-ratio CSS (16:9, 4:3, or 1:1)</li>
      <li>Privacy-enhanced mode using youtube-nocookie.com by default</li>
      <li>All standard player parameters: start, end, autoplay, mute, loop, controls</li>
      <li>Lazy loading attribute for performance</li>
      <li>Live preview pane to verify settings before copying</li>
      <li>One-click copy of complete HTML snippet</li>
      <li>Accepts all YouTube URL formats automatically</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Autoplay only works when combined with mute (browser policy).</li>
      <li>Loop requires the playlist parameter (automatically added when loop is enabled).</li>
      <li>Privacy mode (nocookie) sets cookies only when the visitor plays the video.</li>
      <li>Live preview may be blocked by browser extensions or network restrictions.</li>
      <li>Generated code uses standard YouTube embed parameters; some advanced features (like custom colors) are not supported.</li>
      <li>No connection to your YouTube account — this tool only generates embed code from the URL you provide.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-embed-generator"
      toolName="YouTube Embed Code Generator"
      toolDescription="Configure fully custom YouTube player configurations. Auto-extract video references, adjust start times, and build compliant, responsive iframe code snippets."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No URLs are sent to any server."
      trustNote="Generated code uses standard YouTube embed parameters. Autoplay/loop behavior depends on browser policies."
    >
      {toolContent}
    </ToolPageLayout>
  );
};