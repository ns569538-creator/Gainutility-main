import React, { useState, useRef } from "react";
import { 
  Upload, 
  Tv, 
  Smartphone, 
  Laptop, 
  Search, 
  Layers, 
  Eye, 
  Download, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Check,
  Youtube
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface YoutubeThumbnailPreviewProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

export const YoutubeThumbnailPreview: React.FC<YoutubeThumbnailPreviewProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [videoTitle, setVideoTitle] = useState<string>("My Awesome Video Title That Hook Creators Instantly!");
  const [channelName, setChannelName] = useState<string>("Creator Studio");
  const [channelAvatar, setChannelAvatar] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80");
  const [views, setViews] = useState<string>("124K views");
  const [publishedTime, setPublishedTime] = useState<string>("2 days ago");
  const [videoDuration, setVideoDuration] = useState<string>("12:34");
  
  const [activePlatform, setActivePlatform] = useState<"all" | "desktop" | "mobile" | "tv" | "search" | "sidebar">("all");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showSafeOverlay, setShowSafeOverlay] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        setImageSrc((prev: string | null) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      onAddToast("Thumbnail uploaded successfully!", "success");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
      onAddToast("Thumbnail uploaded via drag & drop!", "success");
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setImageSrc(DEFAULT_IMAGE);
    setVideoTitle("My Awesome Video Title That Hook Creators Instantly!");
    setChannelName("Creator Studio");
    setViews("124K views");
    setPublishedTime("2 days ago");
    setVideoDuration("12:34");
    setZoomLevel(100);
    setShowSafeOverlay(false);
    onAddToast("Previews reset to default settings.", "info");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "youtube_thumbnail_preview.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("Downloaded thumbnail source image!", "success");
  };

  const SafeZoneOverlay = () => {
    if (!showSafeOverlay) return null;
    return (
      <div className="absolute inset-0 border-2 border-brand-accent/50 pointer-events-none select-none">
        <div className="absolute inset-4 border border-dashed border-white/30 flex items-center justify-center">
          <span className="bg-black/80 text-[10px] font-mono text-white px-2 py-0.5 rounded-md">10% Safe Border</span>
        </div>
        <div className="absolute bottom-2 right-2 w-20 h-8 bg-red-500/40 border border-red-500 flex items-center justify-center text-[9px] font-bold text-white rounded">
          TS Badge
        </div>
        <div className="absolute top-2 left-2 bg-brand-primary/85 text-white text-[9px] font-bold px-2 py-0.5 rounded">
          Safe Zone Active
        </div>
      </div>
    );
  };

  const TimeBadge = () => (
    <span className="absolute bottom-1.5 right-1.5 bg-black/80 font-mono text-white text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-wide">
      {videoDuration}
    </span>
  );

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Upload & Config */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-6" aria-labelledby="upload-heading">
          <div className="space-y-2">
            <h3 id="upload-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
              1. Upload Thumbnail Image
            </h3>
            <p className="text-xs text-text-muted">Supports PNG, JPG, JPEG, and WEBP formats.</p>
          </div>

          <div
            ref={dragRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerUpload}
            className="border-2 border-dashed border-border-light hover:border-brand-primary rounded-xl p-6 text-center cursor-pointer transition-all duration-150 bg-surface-muted/50 hover:bg-brand-primary-light/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden group min-h-[160px]"
          >
            {imageSrc !== DEFAULT_IMAGE ? (
              <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-all" style={{ backgroundImage: `url(${imageSrc})` }}></div>
            ) : null}
            <div className="w-10 h-10 rounded-full bg-surface-base border border-border-light flex items-center justify-center group-hover:scale-110 transition-transform relative">
              <Upload className="w-5 h-5 text-text-sub" />
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs font-bold text-text-main">
                Drag and drop image here or <span className="text-brand-primary underline">browse</span>
              </p>
              <p className="text-[10px] text-text-disabled font-mono">1280x720 recommended (16:9)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-4 border-t border-border-light/40 pt-5">
            <h3 className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
              2. Customize Metadata Preview
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="video-title" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider">Video Title</label>
                <input
                  id="video-title"
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  maxLength={100}
                  className="w-full text-xs font-sans p-2.5 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
                  placeholder="Enter preview video title"
                />
                <div className="flex justify-between text-[10px] font-mono text-text-disabled">
                  <span>Title length suggestion</span>
                  <span className={videoTitle.length > 70 ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>
                    {videoTitle.length}/100 chars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="channel-name" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider">Channel Name</label>
                  <input
                    id="channel-name"
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="duration-badge" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider">Duration Badge</label>
                  <input
                    id="duration-badge"
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="12:34"
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="views-mockup" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider">Views Mockup</label>
                  <input
                    id="views-mockup"
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="time-offset" className="text-[11px] font-mono font-bold text-text-sub uppercase tracking-wider">Time Offset</label>
                  <input
                    id="time-offset"
                    type="text"
                    value={publishedTime}
                    onChange={(e) => setPublishedTime(e.target.value)}
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-border-light/40">
            <button
              onClick={handleReset}
              className="flex-1 bg-surface-muted hover:bg-border-light text-text-sub hover:text-text-main py-2 px-3 rounded-lg text-xs font-sans font-bold border border-border-light flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Mock
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white py-2 px-3 rounded-lg text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Original
            </button>
          </div>
        </section>
      </div>

      {/* Right: Live Simulation */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-6" aria-labelledby="simulation-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-light/40 pb-5">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "Show All", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "desktop", label: "Desktop", icon: <Laptop className="w-3.5 h-3.5" /> },
                { id: "mobile", label: "Mobile", icon: <Smartphone className="w-3.5 h-3.5" /> },
                { id: "tv", label: "TV Card", icon: <Tv className="w-3.5 h-3.5" /> },
                { id: "search", label: "Search", icon: <Search className="w-3.5 h-3.5" /> },
                { id: "sidebar", label: "Sidebar", icon: <Layers className="w-3.5 h-3.5" /> }
              ].map((plat) => (
                <button
                  key={plat.id}
                  onClick={() => setActivePlatform(plat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-all ${
                    activePlatform === plat.id
                      ? "bg-brand-primary text-white"
                      : "bg-surface-muted hover:bg-border-light text-text-sub hover:text-text-main border border-border-light/60"
                  }`}
                >
                  {plat.icon}
                  {plat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-muted hover:bg-border-light text-text-sub font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
                {isDarkMode ? "Dark Theme" : "Light Theme"}
              </button>

              <button
                onClick={() => setShowSafeOverlay(!showSafeOverlay)}
                className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  showSafeOverlay
                    ? "bg-brand-accent/20 border-brand-accent/40 text-brand-accent"
                    : "border-border-light bg-surface-muted hover:bg-border-light text-text-sub"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Safe Zone
              </button>

              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 rounded-lg border border-border-light bg-surface-muted hover:bg-border-light text-text-sub"
                title="Fullscreen View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div 
            className={`p-6 rounded-xl border transition-all duration-300 ${
              isDarkMode 
                ? "bg-[#0f0f0f] text-[#f1f1f1] border-[#272727]" 
                : "bg-[#f9f9f9] text-[#0f0f0f] border-[#e5e5e5]"
            }`}
          >
            <div className="flex items-center gap-2 mb-6 opacity-85">
              <Youtube className="w-6 h-6 text-red-600" />
              <span className="text-xs font-sans font-black uppercase tracking-widest font-mono">
                Youtube Interface Emulator ({isDarkMode ? "Dark Mode" : "Light Mode"})
              </span>
            </div>

            <div className="space-y-12">
              {(activePlatform === "all" || activePlatform === "desktop") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Desktop Home Feed Card</span>
                    <span className="text-[10px] font-mono">Approx. 360px width grid</span>
                  </div>
                  <div className="max-w-[360px] rounded-xl overflow-hidden group">
                    <div className="relative aspect-video bg-black/40 overflow-hidden rounded-xl border border-border-light/20">
                      <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <TimeBadge />
                      <SafeZoneOverlay />
                    </div>
                    <div className="flex gap-3 mt-3 px-1">
                      <img src={channelAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold leading-snug line-clamp-2">{videoTitle}</h4>
                        <div className="text-xs text-[#606060] dark:text-[#aaaaaa] font-sans">
                          <p className="hover:text-white transition-colors cursor-pointer">{channelName}</p>
                          <p>{views} • {publishedTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activePlatform === "all" || activePlatform === "mobile") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Mobile Feed Card</span>
                    <span className="text-[10px] font-mono">Full-width display</span>
                  </div>
                  <div className="w-full max-w-[420px] mx-auto border border-border-light/20 dark:border-border-light/10 rounded-2xl overflow-hidden p-2 bg-white dark:bg-[#121212] shadow-lg">
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <TimeBadge />
                      <SafeZoneOverlay />
                    </div>
                    <div className="flex gap-3 mt-3 px-1">
                      <img src={channelAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold leading-snug line-clamp-2 text-black dark:text-white">{videoTitle}</h4>
                        <div className="text-[10px] text-[#606060] dark:text-[#aaaaaa] font-sans">
                          <span>{channelName} • {views} • {publishedTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activePlatform === "all" || activePlatform === "tv") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">YouTube TV App Display</span>
                    <span className="text-[10px] font-mono">Wide scale banner</span>
                  </div>
                  <div className="w-full max-w-[580px] bg-black/60 rounded-xl overflow-hidden p-4 border border-[#2d2d2d] relative group">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-7">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={imageSrc} alt="TV Display" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <TimeBadge />
                          <SafeZoneOverlay />
                        </div>
                      </div>
                      <div className="col-span-5 space-y-2">
                        <span className="text-[9px] font-bold bg-[#333333] text-[#f1f1f1] px-2 py-0.5 rounded font-mono">TV RECOMMENDED</span>
                        <h4 className="text-sm font-black tracking-tight leading-snug line-clamp-3">{videoTitle}</h4>
                        <p className="text-[11px] text-[#aaaaaa]">{channelName}</p>
                        <div className="text-[10px] text-[#888888] font-mono">{views}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activePlatform === "all" || activePlatform === "search") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Search Results Feed List</span>
                    <span className="text-[10px] font-mono">Horizontal card listing</span>
                  </div>
                  <div className="w-full max-w-[640px] flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-[240px] shrink-0">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border-light/10">
                        <img src={imageSrc} alt="Search Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <TimeBadge />
                        <SafeZoneOverlay />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      <h4 className="text-sm sm:text-base font-bold leading-snug line-clamp-2">{videoTitle}</h4>
                      <div className="text-xs text-[#606060] dark:text-[#aaaaaa] flex items-center gap-1.5 font-sans">
                        <span>{views}</span>
                        <span>•</span>
                        <span>{publishedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 py-1">
                        <img src={channelAvatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                        <span className="text-xs font-semibold text-black dark:text-[#f1f1f1]">{channelName}</span>
                      </div>
                      <p className="text-xs text-[#606060] dark:text-[#aaaaaa] line-clamp-1">
                        Discover the proven strategies for maximizing click-through rates (CTR) and visual retention using simple, beautiful templates...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(activePlatform === "all" || activePlatform === "sidebar") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Sidebar Recommended (Up Next)</span>
                    <span className="text-[10px] font-mono">Compact layout</span>
                  </div>
                  <div className="w-full max-w-[320px] flex gap-3 items-start">
                    <div className="w-[140px] shrink-0">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-border-light/10">
                        <img src={imageSrc} alt="Sidebar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <TimeBadge />
                        <SafeZoneOverlay />
                      </div>
                    </div>
                    <div className="space-y-1 py-0.5">
                      <h4 className="text-xs font-bold leading-snug line-clamp-2">{videoTitle}</h4>
                      <p className="text-[11px] text-[#606060] dark:text-[#aaaaaa] font-sans truncate">{channelName}</p>
                      <p className="text-[10px] text-[#606060] dark:text-[#aaaaaa] font-sans font-mono">{views} • {publishedTime}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Upload your thumbnail image (1280×720 recommended) or use the default example.</li>
      <li>Customize the video title, channel name, duration, views, and time offset to match your metadata.</li>
      <li>Toggle between desktop, mobile, TV, search, and sidebar preview modes to see how your thumbnail appears in each context.</li>
      <li>Enable the Safe Zone overlay to see where YouTube's UI elements (duration badge, progress bar) will cover your design.</li>
      <li>Switch between dark and light themes to test readability in both YouTube themes.</li>
      <li>Use fullscreen mode for detailed inspection, then download the original image when satisfied.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Live preview across 5 YouTube surfaces: desktop feed, mobile feed, TV app, search results, sidebar</li>
      <li>Safe zone overlay showing 10% border and duration badge obstruction area</li>
      <li>Dark/light theme toggle matching YouTube's actual themes</li>
      <li>Customizable metadata (title, channel, views, duration, timestamp)</li>
      <li>Fullscreen inspection mode</li>
      <li>Download original thumbnail image</li>
      <li>Zero uploads — all processing happens in your browser</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Previews are simulations based on publicly observable YouTube UI — actual rendering may vary slightly by device, browser, and YouTube updates.</li>
      <li>Safe zone measurements are approximations; YouTube does not publish official pixel specifications.</li>
      <li>Mobile preview shows a representative crop; actual crop varies by phone aspect ratio and YouTube app version.</li>
      <li>No connection to your YouTube account — this tool only simulates display using the image and metadata you provide.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-thumbnail-preview"
      toolName="YouTube Thumbnail Preview"
      toolDescription="Preview a thumbnail across YouTube's desktop, mobile, and TV layouts. Check safe zones and metadata before publishing."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No images or metadata are sent to any server."
      trustNote="Previews are simulations based on observable YouTube UI. Actual rendering may vary by device and YouTube updates."
    >
      {toolContent}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
          
          <div className="max-w-4xl w-full text-center space-y-6">
            <h3 className="text-lg font-sans font-black text-white/80">Fullscreen Interactive Simulation</h3>
            <div className="relative aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[80vh] mx-auto">
              <img src={imageSrc} alt="Fullscreen View" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              <TimeBadge />
              <SafeZoneOverlay />
            </div>
            <div className="bg-white/5 backdrop-blur px-6 py-4 rounded-xl inline-flex flex-col items-center gap-1.5 max-w-lg border border-white/10">
              <span className="text-sm font-bold text-white leading-snug">{videoTitle}</span>
              <span className="text-xs text-white/60 font-mono">{channelName} • {views} • {videoDuration}</span>
            </div>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};