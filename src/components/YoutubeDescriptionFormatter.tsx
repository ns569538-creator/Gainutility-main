import React, { useState, useMemo } from "react";
import { 
  Layers, 
  Copy, 
  Download, 
  RotateCcw, 
  Sliders, 
  Check, 
  Info, 
  Plus, 
  Sparkles, 
  Youtube,
  Link,
  Tag,
  ArrowRight,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface YoutubeDescriptionFormatterProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

export const YoutubeDescriptionFormatter: React.FC<YoutubeDescriptionFormatterProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [videoSummary, setVideoSummary] = useState<string>("Discover the step-by-step framework for designing responsive, high-converting YouTube thumbnails that increase organic Click-Through-Rates (CTR). We analyze eye-tracking blueprints and core layouts.");
  const [chaptersText, setChaptersText] = useState<string>("00:00 Introduction & Hook\n01:30 Psychological Blueprints\n04:50 Live Safe-Zone Checks\n10:30 Final Call-To-Actions");
  
  const [socials, setSocials] = useState<{ label: string; url: string }[]>([
    { label: "Twitter", url: "https://twitter.com/myhandle" },
    { label: "Instagram", url: "https://instagram.com/myhandle" },
    { label: "Website", url: "https://mycreatorwebsite.com" }
  ]);

  const [credits, setCredits] = useState<string>("Music by Artlist (License #123456)\nFootage sourced via Storyblocks.");
  const [hashtags, setHashtags] = useState<string>("#creators #youtube #growth #thumbnail");
  const [ctaBlock, setCtaBlock] = useState<string>("If you enjoyed this content, make sure to SUBSCRIBE to the channel for weekly tactical creator insights!");
  
  const [dividerStyle, setDividerStyle] = useState<"dashes" | "equals" | "minimal" | "stars">("dashes");
  const [includeAutoSpacing, setIncludeAutoSpacing] = useState<boolean>(true);

  const addSocialRow = () => {
    setSocials([...socials, { label: "Discord", url: "https://discord.gg/mychannel" }]);
    onAddToast("Social link input row added.", "success");
  };

  const removeSocialRow = (idx: number) => {
    setSocials(socials.filter((_, i) => i !== idx));
    onAddToast("Social link row deleted.", "info");
  };

  const updateSocialRow = (idx: number, field: "label" | "url", val: string) => {
    setSocials(socials.map((soc, i) => i === idx ? { ...soc, [field]: val } : soc));
  };

  const compiledDescription = useMemo(() => {
    const parts: string[] = [];
    
    let div = "----------------------------------------";
    if (dividerStyle === "equals") div = "========================================";
    if (dividerStyle === "stars") div = "****************************************";
    if (dividerStyle === "minimal") div = "";

    if (videoSummary.trim()) {
      parts.push(videoSummary.trim());
    }

    if (chaptersText.trim()) {
      if (div) parts.push(div);
      parts.push("TIMESTAMPS / CHAPTERS:");
      parts.push(chaptersText.trim());
    }

    if (ctaBlock.trim()) {
      if (div) parts.push(div);
      parts.push(ctaBlock.trim());
    }

    const validSocials = socials.filter(s => s.label.trim() && s.url.trim());
    if (validSocials.length > 0) {
      if (div) parts.push(div);
      parts.push("CONNECT WITH ME:");
      validSocials.forEach(s => {
        parts.push(`${s.label}: ${s.url}`);
      });
    }

    if (credits.trim()) {
      if (div) parts.push(div);
      parts.push("RESOURCES / CREDITS:");
      parts.push(credits.trim());
    }

    if (hashtags.trim()) {
      if (div) parts.push(div);
      parts.push(hashtags.trim());
    }

    const spacingChar = includeAutoSpacing ? "\n\n" : "\n";
    return parts.join(spacingChar);
  }, [videoSummary, chaptersText, socials, credits, hashtags, ctaBlock, dividerStyle, includeAutoSpacing]);

  const handleCopy = () => {
    onCopy(compiledDescription);
  };

  const handleDownload = () => {
    const blob = new Blob([compiledDescription], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "video_description_upload.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    onAddToast("Downloaded formatted description file!", "success");
  };

  const handleReset = () => {
    setVideoSummary("");
    setChaptersText("");
    setSocials([]);
    setCredits("");
    setHashtags("");
    setCtaBlock("");
    onAddToast("All template blocks wiped clean.", "info");
  };

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Modular Section Fields */}
      <div className="lg:col-span-7 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-5" aria-labelledby="modules-heading">
          <h3 id="modules-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider pb-2 border-b border-border-light/40">
            Description Content Modules
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="video-summary" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider block">
              Above the fold Video Hook / SEO Summary (First 3 Lines)
            </label>
            <textarea
              id="video-summary"
              value={videoSummary}
              onChange={(e) => setVideoSummary(e.target.value)}
              rows={3}
              className="w-full text-xs font-sans p-3 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
              placeholder="Give a brief summary of the video topic for human/bot indexing..."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="chapters-text" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider block">
              Chapter Timestamps
            </label>
            <textarea
              id="chapters-text"
              value={chaptersText}
              onChange={(e) => setChaptersText(e.target.value)}
              rows={3}
              className="w-full text-xs font-mono p-3 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
              placeholder="00:00 Title&#10;01:30 Topic Two"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cta-block" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider block">
              Subscribe Call-To-Action (CTA) Block
            </label>
            <input
              id="cta-block"
              type="text"
              value={ctaBlock}
              onChange={(e) => setCtaBlock(e.target.value)}
              className="w-full text-xs font-sans p-3 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
              placeholder="Subscribe to the channel for more weekly blueprints..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider flex justify-between items-center">
              <span>Social Links / Handles</span>
              <button
                onClick={addSocialRow}
                className="text-[10px] font-sans font-bold text-brand-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                Add Row
              </button>
            </label>
            
            <div className="space-y-2">
              {socials.map((soc, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={soc.label}
                    onChange={(e) => updateSocialRow(idx, "label", e.target.value)}
                    placeholder="Label (e.g. Website)"
                    className="w-28 p-2 rounded-lg border border-border-light text-xs font-medium text-text-main"
                    aria-label={`Social link ${idx + 1} label`}
                  />
                  <input
                    type="text"
                    value={soc.url}
                    onChange={(e) => updateSocialRow(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 p-2 rounded-lg border border-border-light text-xs font-mono text-text-main"
                    aria-label={`Social link ${idx + 1} URL`}
                  />
                  <button
                    onClick={() => removeSocialRow(idx)}
                    className="text-text-disabled hover:text-red-500 text-xs font-bold"
                    aria-label={`Remove social link ${idx + 1}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="credits" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider block">Credits / Attributions</label>
              <textarea
                id="credits"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-lg border border-border-light bg-background text-text-main focus:outline-none"
                placeholder="Music, assets, and footages licenses..."
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hashtags" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider block">Hashtags</label>
              <textarea
                id="hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-lg border border-border-light bg-background text-text-main focus:outline-none font-mono"
                placeholder="#tags #creators"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right: Output Area */}
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="formatting-heading">
          <h3 id="formatting-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            Dividers & Auto-Spacing
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="divider-style" className="text-[10px] font-mono font-bold text-text-sub uppercase tracking-wider block">Divider Style</label>
              <select
                id="divider-style"
                value={dividerStyle}
                onChange={(e) => setDividerStyle(e.target.value as any)}
                className="w-full p-2 text-base sm:text-xs rounded-lg border border-border-light bg-background text-text-main focus:outline-none"
              >
                <option value="dashes">Dashes (---)</option>
                <option value="equals">Equals (===)</option>
                <option value="stars">Stars (***)</option>
                <option value="minimal">Minimalist (None)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="line-spacing" className="text-[10px] font-mono font-bold text-text-sub uppercase tracking-wider block">Line Spacing</label>
              <select
                id="line-spacing"
                value={includeAutoSpacing ? "double" : "single"}
                onChange={(e) => setIncludeAutoSpacing(e.target.value === "double")}
                className="w-full p-2 text-base sm:text-xs rounded-lg border border-border-light bg-background text-text-main focus:outline-none"
              >
                <option value="double">Double Spacing</option>
                <option value="single">Single Spacing</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-surface-muted hover:bg-border-light text-text-sub py-2 px-3 rounded-lg text-xs font-sans font-bold border border-border-light flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Fields
          </button>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="output-heading">
          <div className="flex justify-between items-center">
            <h3 id="output-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-primary" />
              Compiled Description
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-surface-base border border-border-light text-text-sub hover:text-brand-primary shadow-sm transition-colors cursor-pointer"
                title="Download .txt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm transition-colors flex items-center gap-1 text-xs px-2.5 font-bold cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          <textarea
            value={compiledDescription}
            readOnly
            rows={12}
            className="w-full font-mono text-base sm:text-xs p-4 rounded-xl border border-border-light bg-surface-muted/40 text-text-main leading-relaxed resize-none focus:outline-none"
            placeholder="Configure elements on the left to compile YouTube description..."
          />
        </section>
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Fill in each content module on the left: video hook/summary, chapter timestamps, CTA block, social links, credits, and hashtags.</li>
      <li>Choose your divider style (dashes, equals, stars, or minimal) and line spacing (double or single).</li>
      <li>The compiled description updates in real-time on the right.</li>
      <li>Copy the formatted output or download as a .txt file for your video description.</li>
      <li>Use the reset button to clear all fields and start fresh.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Structured description with clear section divisions</li>
      <li>Above-the-fold hook optimized for the first 3 lines (before "Show more")</li>
      <li>Chapter timestamps section ready for YouTube chapters</li>
      <li>CTA block for subscribe/follow prompts</li>
      <li>Social links with labels and URLs</li>
      <li>Credits/attributions section</li>
      <li>Hashtags at the bottom</li>
      <li>Configurable dividers and spacing</li>
      <li>Copy to clipboard and download as .txt</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>YouTube descriptions cap at 5,000 characters; very long sections may need trimming.</li>
      <li>This tool only formats text — it does not upload or publish to YouTube.</li>
      <li>Social link formatting uses plain text; YouTube does not auto-link plain URLs in descriptions (viewers must copy-paste).</li>
      <li>Hashtags are limited to 15 by YouTube; excess tags are ignored by the platform.</li>
      <li>No connection to your YouTube account — this tool only generates the text you copy.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-description-formatter"
      toolName="YouTube Description Formatter"
      toolDescription="Structure a description with sections, links, and chapters. Build professional descriptions with clean divisions and formatting."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No description content is sent to any server."
      trustNote="Formatting only — does not guarantee SEO performance. YouTube's 5,000 character limit applies."
    >
      {toolContent}
    </ToolPageLayout>
  );
};