/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for Media Studio tools. Everything here describes genuinely
 * implemented, browser-local behavior — no fabricated encoders or uploads.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const LOCAL =
  "Everything runs locally in your browser. Your video and audio files are decoded, processed, and re-encoded on your device and are never uploaded to a server.";

export const MEDIA_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "video-audio-extractor": {
    title: "Video Audio Extractor — Split Audio from Video",
    description:
      "Pull the audio track out of a video and keep it as a high-quality WAV file. Fast, free, and 100% local — no uploads, no account.",
    intro:
      "Extract the soundtrack from an MP4, WebM, or any browser-supported video and save it as a lossless WAV file — decoded straight from the video element in your browser.",
    whatText:
      "The extractor decodes the video with an audio element, renders the full track through the Web Audio API, and writes a 16-bit PCM WAV file you can keep or re-encode.",
    whyText:
      "You often need the audio of a clip without the video footprint: sound effects, transcriptions, podcasts, ringtones, or archival. This keeps the job private and local.",
    features: [
      "Lossless 16-bit PCM WAV output from any playable video",
      "Real duration and track metadata shown before export",
      "No uploads — decoding happens on your device",
      "Works with MP4, WebM, and other browser-supported containers"
    ],
    steps: [
      "Drop a video file into the workspace.",
      "Select the Extract audio goal.",
      "Confirm the detected track details, then process.",
      "Download the WAV file and verify the duration in the result summary."
    ],
    useCases: [
      "Saving sound effects from short clips",
      "Creating ringtones or audio samples",
      "Getting a transcript-ready audio file",
      "Archiving audio from old recordings"
    ],
    limitations: [
      "Output is WAV (uncompressed) — the file is large by design; re-encode with a compressor for smaller sizes",
      "Copy-protected (DRM) streams cannot be decoded in the browser",
      "Some containers with unusual audio codecs may not decode in every browser"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Expecting compression — WAV is intentionally uncompressed",
      "Using unsupported or DRM-protected input"
    ],
    troubleshooting: [
      "No audio found? Check the source video actually contains an audio track.",
      "Export stuck? Size is rendered in real time; large files can take a moment."
    ],
    faqs: [
      {
        question: "What format does the extracted audio use?",
        answer:
          "Audio is exported as a 16-bit PCM WAV file, decoded locally from the video's own audio track."
      },
      {
        question: "Is my video uploaded anywhere?",
        answer:
          "No. Decoding and encoding happen entirely in your browser; the file never leaves your device."
      }
    ],
    related: ["video-compressor", "video-to-gif", "video-trimmer", "video-converter"]
  },

  "video-compressor": {
    title: "Free Video Compressor — Reduce File Size Locally",
    description:
      "Shrink video file size by re-encoding with a lower bitrate. Processed entirely in your browser and verified before you download.",
    intro:
      "Shrink a video before emailing, uploading, or archiving. Re-encode the clip with a lower bitrate using your browser's own encoder and keep the result local.",
    whatText:
      "The compressor re-encodes video frames captured from the source into a lower-bitrate stream with the browser's MediaRecorder, so the resulting file is smaller without touching the original.",
    whyText:
      "Bandwidth and storage are limited. A dropped bitrate makes a clip shareable without external upload servers, and keeping processing local protects your content.",
    features: [
      "Bitrate slider with an estimated output size",
      "Target container (WebM, and MP4 where the browser supports it)",
      "Real decoded duration pulled from the source metadata",
      "Detected size savings shown in the verified result"
    ],
    steps: [
      "Drop a video into the workspace.",
      "Choose the Make it smaller goal.",
      "Set the bitrate and output format.",
      "Process, then compare the input and output sizes in the result."
    ],
    useCases: [
      "Preparing a clip for email or messaging",
      "Cutting storage size of archived footage",
      "Pre-compressing uploads for slow connections"
    ],
    limitations: [
      "Compression is re-encoding, so quality naturally drops as bitrate falls",
      "Audio is re-encoded alongside video via the browser's audio pipeline",
      "Very high-resolution sources above ~60fps may be re-timed by the recorder"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Cranking bitrate down so far the result is unwatchable — aim for a visible preview before processing",
      "Expecting a fixed output size — actual savings depend on the source"
    ],
    troubleshooting: [
      "File not smaller? The source may already be highly compressed.",
      "Process complete but stuck on verify? Large encodes take time; the progress strip updates in real time."
    ],
    faqs: [
      {
        question: "Will compressing reduce the quality?",
        answer:
          "Lowering the bitrate reduces detail, so quality drops as the file shrinks. The result is verified locally so you can check the size savings before keeping it."
      },
      {
        question: "Which formats does the compressor output?",
        answer:
          "Output is WebM by default, and MP4 when your browser's MediaRecorder reports support for it."
      }
    ],
    related: ["video-resizer", "video-trimmer", "video-converter", "video-to-gif"]
  },

  "video-resizer": {
    title: "Video Resizer — Reframe to Social Sizes Locally",
    description:
      "Resize and reframe video to 9:16, 1:1, 16:9, or a custom size — processed in your browser with no file uploads.",
    intro:
      "Reframe a video for Instagram Reels, TikTok, YouTube, square posts, or a custom size. Picked dimensions render onto a canvas and re-encode locally in your browser.",
    whatText:
      "The resizer draws each frame onto a canvas at the target width (height derived to preserve aspect ratio) and records the result, giving you an exact-size output file.",
    whyText:
      "Every platform crops and centers differently. Sending an already-correct frame avoids ugly auto-cropping and keeps your subject framed the way you intended.",
    features: [
      "Width-first control with automatic height from the source ratio",
      "Common social sizes selectable from the presets",
      "Keeps basic frame integrity through canvas re-encoding"
    ],
    steps: [
      "Drop a video into the workspace.",
      "Pick the Resize to social goal.",
      "Choose a preset or enter a custom width.",
      "Process and download the resized file."
    ],
    useCases: [
      "Pre-framing content for vertical and square feeds",
      "Normalizing mixed footage to one size for a montage",
      "Reducing resolution for compatibility"
    ],
    limitations: [
      "The resizer scales, it does not crop — letterboxing or loose framing may appear when ratios differ",
      "MP4 output depends on browser MediaRecorder support",
      "Audio is preserved when the source carries a decodable track"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Expecting cropping where the tool scales the whole frame",
      "Choosing tiny widths that crush fine detail"
    ],
    troubleshooting: [
      "Letterboxed output? The source ratio differs from your target; choose a preset closer to the source or use your own crop."
    ],
    faqs: [
      {
        question: "Does resizing crop my video?",
        answer:
          "No. The tool scales the full frame to the target dimensions, so the entire picture is kept — matching presets to your source ratio avoids empty bars."
      }
    ],
    related: ["video-compressor", "video-trimmer", "video-converter", "video-to-gif"]
  },

  "video-trimmer": {
    title: "Video Trimmer — Cut Clips Locally in Your Browser",
    description:
      "Trim a video by start and end time, then download the exact segment. Runs entirely in your browser — free, private, no uploads.",
    intro:
      "Cut a video down to the part you actually need. Pick start and end times with a range control, and the trimmer records exactly that segment to a new local file.",
    whatText:
      "The trimmer seeks the source to your chosen start point, then records frames through the end point with the browser's MediaRecorder — a true segment, not a fake crop.",
    whyText:
      "Long clips are hard to share. Trimming locally keeps the source private while producing an exact segment without pulling a heavyweight editor into the loop.",
    features: [
      "Start and end range sliders over the real decoded duration",
      "Segments recorded frame-accurately from the source",
      "Output kept on-device; verified duration shown on success"
    ],
    steps: [
      "Drop a video into the workspace.",
      "Choose the Trim clip goal.",
      "Drag the start and end markers to the segment you want.",
      "Process, then confirm the trimmed duration in the result."
    ],
    useCases: [
      "Cutting out the first or last few seconds of a clip",
      "Isolating a highlight for social sharing",
      "Removing chatter before and after the useful content"
    ],
    limitations: [
      "Trim ranges are whole-second ticks, not frame-exact",
      "Output is re-encoded (not a stream copy), so the segment's visual quality follows the encoder settings"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Selecting an inverted range (start after end)",
      "Expecting stream-copy speed — re-encoding takes the length of the clip"
    ],
    troubleshooting: [
      "Wrong segment? Re-run with corrected markers; the source file is never modified."
    ],
    faqs: [
      {
        question: "Is the original video modified?",
        answer:
          "No. Trimming creates a new local file for the selected segment; the original is left untouched."
      }
    ],
    related: ["video-compressor", "video-converter", "video-to-gif", "video-audio-extractor"]
  },

  "video-converter": {
    title: "Video Converter — Convert Format Locally",
    description:
      "Convert video to WebM or MP4 (where supported) using your browser's encoders. Free, private, and fully processed on your device.",
    intro:
      "Convert a video between the containers your browser can actually encode — WebM and MP4 where supported — without uploading the file anywhere.",
    whatText:
      "The converter decodes your clip and re-encodes the frames and audio into the target container using the browser's native MediaRecorder support.",
    whyText:
      "Players and platforms accept different containers. A local converter gets your clip into the right shape without exposing it to an upload pipeline.",
    features: [
      "Output choice limited to what the browser truly supports",
      "Real codec detection and capability probing before processing",
      "Result verified with reported container and duration"
    ],
    steps: [
      "Drop a video into the workspace.",
      "Pick the Convert format goal.",
      "Select WebM or MP4 (if available in your browser).",
      "Process and download the converted file."
    ],
    useCases: [
      "Converting a WebM export for players that want MP4",
      "Normalizing files to one container for upload workflows"
    ],
    limitations: [
      "The tool converts to containers the browser can encode; MP4 is offered only where MediaRecorder reports support",
      "It is a re-encode, not a remux — quality/size follow the encoder, matching the compress and resize pipeline"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Expecting an MP4 option where the browser lacks MP4 recording support",
      "Treating conversion as lossless — it is a real re-encode"
    ],
    troubleshooting: [
      "MP4 not listed? Your browser's MediaRecorder doesn't support it; WebM remains available."
    ],
    faqs: [
      {
        question: "Why might MP4 not be available?",
        answer:
          "The browser must support MP4 recording for that option to appear. WebM is always available since it is the baseline recording format."
      }
    ],
    related: ["video-compressor", "video-trimmer", "video-to-gif", "video-audio-extractor"]
  },

  "video-to-gif": {
    title: "Video to GIF — Create Animated GIFs Locally",
    description:
      "Turn a short clip into an animated GIF with your own frame rate, width, and range. Encoded locally in your browser — free and private.",
    intro:
      "Make an animated GIF from a video clip. Choose width, frame rate, and the segment you want, and the tool encodes a real GIF89a file entirely in your browser.",
    whatText:
      "The tool samples frames from the selected range, quantizes each frame to a palette, and encodes a GIF89a file with a custom LZW compressor written for this project.",
    whyText:
      "GIFs embed anywhere — Markdown, email, chat, old CMSs. A local encoder produces a real animated file without sending footage to a third-party service.",
    features: [
      "Controls for width, FPS, and start/end range",
      "Real GIF89a output encoded on-device",
      "Palette quantization keeps file size in check"
    ],
    steps: [
      "Drop a video into the workspace.",
      "Pick the Create GIF goal.",
      "Set width, FPS, and the clip range.",
      "Process and download the .gif file."
    ],
    useCases: [
      "Making reaction or highlight GIFs from short clips",
      "Creating animated marketing snippets",
      "Producing lightweight previews that play anywhere"
    ],
    limitations: [
      "GIF uses a 256-color palette — gradients and film footage show banding",
      "Frame count is bounded by FPS × range; very long clips produce large files",
      "Transparent pixels are flattened to the palette (no alpha channel)"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Setting a huge FPS on a long range and getting an enormous file",
      "Expecting smooth film-quality color from a format designed for graphics"
    ],
    troubleshooting: [
      "GIF too big? Lower FPS, reduce width, or shorten the range."
    ],
    faqs: [
      {
        question: "Why does the GIF look less smooth than the video?",
        answer:
          "GIF stores at most 256 colors per frame and is a limited format. Lower frame rates and shorter segments produce the best quality-to-size balance."
      }
    ],
    related: ["video-trimmer", "video-compressor", "video-resizer", "video-converter"]
  },

  "photos-to-video": {
    title: "Photos to Video — Make a Slideshow Locally",
    description:
      "Combine photos into a slideshow video with adjustable duration per image and output size. Built entirely in your browser — no uploads.",
    intro:
      "Stitch several images into a slideshow video. Set the time each photo stays on screen and the output size, then let the browser encode the sequence locally.",
    whatText:
      "Each selected photo is drawn in order onto a canvas at the target size for the chosen duration, and the whole sequence is recorded to a video file on your device.",
    whyText:
      "Slideshows are a quick way to share batches of photos as a single file — for posts, backups, or previews — without signing up for a clip-maker service.",
    features: [
      "Multi-file upload with thumbnail list and remove controls",
      "Seconds-per-image and output size settings",
      "Real per-image previews before processing"
    ],
    steps: [
      "Add the photos to the shelf.",
      "Set seconds per image and output size.",
      "Start, watch each image render in sequence with progress.",
      "Download the finished slideshow."
    ],
    useCases: [
      "Turning a photo set into a shareable clip",
      "Building simple rotating menu or kiosk content",
      "Previewing batches of images as a single file"
    ],
    limitations: [
      "Photos are scaled to fit (not cropped) — aspect ratios may letterbox",
      "Very large image counts at high resolutions are slower to encode",
      "Audio is not added in this version"
    ],
    privacyExplanation: LOCAL,
    mistakes: [
      "Expecting a soundtrack — this version produces silent slideshows",
      "Mixing extreme aspect ratios and wondering about the bars"
    ],
    troubleshooting: [
      "Encoding slow? Reduce output size or seconds per image."
    ],
    faqs: [
      {
        question: "Can I add music to the slideshow?",
        answer:
          "Not yet. The current version produces a silent video; audio mixing is a possible future addition."
      }
    ],
    related: ["video-to-gif", "video-compressor", "video-resizer", "video-trimmer"]
  },

  "video-downloader": {
    title: "Download a Video from a Link — Local Media Downloader",
    description:
      "Paste a direct media link or drop a file, then save the original, extract audio, compress, convert, trim or resize. Honest checking, local processing.",
    intro:
      "Paste a direct link to a video, audio, or image file and we'll check it honestly before doing anything. Once it clears, the file lands in the same goal workspace as our other media tools: save the original untouched, pull out the audio track, shrink the file, convert, trim, resize, or fit a 9:16, 1:1, or 16:9 preset.",
    whatText:
      "The tool classifies the pasted link, then fetches the exact file directly from the host in your browser. The response is streamed with a hard 256 MB cap, and the bytes are verified by content-type, extension signal, and a magic-number sniff before anything is shown. Streaming platforms are recognised and refused openly.",
    whyText:
      "A file you can see as a direct link is often easier to work with once it is actually saved. This tool brings the link in, confirms it is real media, and hands it to real local operations — never a fake progress bar and never a reassembled third-party download.",
    features: [
      "Direct-link fetch with honest CORS-aware failure messages",
      "Save the original file exactly as-is (no re-encoding)",
      "Extract audio, compress, convert, trim, resize, or fit a social preset",
      "Streaming platforms recognised and refused openly"
    ],
    steps: [
      "Paste a direct media link or drop a file.",
      "The link is checked and the media is verified.",
      "Pick a goal: save original, get the audio, make it smaller, trim it, resize it, or make a GIF.",
      "Download the verified result."
    ],
    useCases: [
      "Keeping a copy of a video hosted on your own CDN",
      "Pulling the audio out of a linked clip without re-downloading the whole thing",
      "Shrinking or reframing a direct-link video for a platform upload"
    ],
    limitations: [
      "Only direct file links can be fetched; YouTube, Instagram, Facebook, X, and TikTok are not supported from a browser",
      "Fetches require the host to allow cross-origin access (CORS)",
      "256 MB cap, enforced while the file streams"
    ],
    privacyExplanation:
      "A direct link is fetched by your browser straight from the host — no GainUtility server is involved, and no cookies or credentials are ever attached. Everything after the fetch is processed locally on your device. We never request or attempt to bypass streaming platforms.",
    mistakes: [
      "Expecting to download from YouTube or Instagram — not possible from a browser, and stated honestly",
      "Pasting a page URL (HTML) instead of the direct file link"
    ],
    troubleshooting: [
      "Link refused? The host is blocking cross-origin access; upload the file instead or use the site's own download.",
      "File too large? Keep under 256 MB for in-browser processing."
    ],
    faqs: [
      {
        question: "Why can't I download YouTube or Instagram videos?",
        answer:
          "Those platforms don't serve their media to third-party browsers and don't allow downloads without their consent. We recognise those links and refuse them openly instead of routing around their restrictions."
      },
      {
        question: "Why does a direct link sometimes fail?",
        answer:
          "The browser can only read a cross-origin file when the host sends the correct CORS headers. When that header is missing we report it honestly — we don't proxy or work around it."
      }
    ],
    related: ["video-compressor", "video-trimmer", "video-converter", "video-resizer", "video-audio-extractor", "video-to-gif"]
  },
  "add-music-to-photo": {
    title: "Add Music to Photo — Create Videos from Images & Audio",
    description:
      "Turn a photo and an audio file into a share-ready video. Choose social presets, trim audio, adjust volume — all free and processed in your browser.",
    intro:
      "Combine a single image with an audio track to create a video for WhatsApp Status, Instagram Stories, Reels, YouTube Shorts, or any custom size. Trim the audio, set the volume, choose how the image fits, and export a real MP4 — all locally.",
    whatText:
      "The tool draws your image onto a canvas at the target dimensions, plays the selected audio segment through the Web Audio API, and records the combined stream using MediaRecorder. The result is a verified video file with your exact settings.",
    whyText:
      "Social platforms expect video uploads — even for static images with music. This tool bridges that gap without uploading your files to a server, keeping your media private and the workflow fast.",
    features: [
      "Social presets: WhatsApp Status, Instagram Story/Reel, YouTube Shorts, TikTok (9:16), Instagram Post (1:1), Landscape (16:9)",
      "Custom dimensions up to 3840×3840",
      "Audio trim with start/end points and live preview",
      "Volume control and mute toggle",
      "Image fit: cover (fill) or contain (letterbox)",
      "Custom background color for letterboxing",
      "Real MP4/WebM output verified before download",
      "100% local processing — no uploads"
    ],
    steps: [
      "Upload a photo (JPG, PNG, WebP).",
      "Upload an audio file (MP3, WAV, M4A, AAC).",
      "Choose a social preset or enter custom dimensions.",
      "Trim the audio to the section you want, adjust volume.",
      "Choose image fit and background color.",
      "Click Create video and download the result."
    ],
    useCases: [
      "WhatsApp Status videos from a single photo and song",
      "Instagram Story/Reel backgrounds with music",
      "YouTube Shorts with static imagery and audio",
      "TikTok videos using a photo and trending sound",
      "Social media announcements with background music"
    ],
    limitations: [
      "Output format depends on browser MediaRecorder support (WebM always, MP4 where available)",
      "Single image only — for multi-photo slideshows use Photos to Video",
      "Audio trim is second-accurate, not frame-exact",
      "Large files may take longer to encode on mobile devices"
    ],
    privacyExplanation:
      "Everything runs locally in your browser. Your image and audio files are decoded, combined, and re-encoded on your device and are never uploaded to a server.",
    mistakes: [
      "Uploading a very long audio file and expecting instant processing — duration equals encoding time",
      "Choosing cover fit and having important image content cropped — use contain to keep the full image visible"
    ],
    troubleshooting: [
      "Video not downloading? Check browser download permissions and try again.",
      "Audio out of sync? The tool records in real-time; ensure the browser isn't throttled.",
      "MP4 not available? Your browser doesn't support MP4 recording; WebM is the fallback."
    ],
    faqs: [
      {
        question: "What image formats are supported?",
        answer:
          "JPG, JPEG, PNG, and WebP. The image is rendered to a canvas, so any format your browser can display works."
      },
      {
        question: "What audio formats are supported?",
        answer:
          "MP3, WAV, M4A, AAC, OGG, and FLAC — any format your browser's <audio> element can decode."
      },
      {
        question: "Can I use this for WhatsApp Status?",
        answer:
          "Yes. The WhatsApp Status preset (1080×1920, 9:16) matches WhatsApp's recommended dimensions exactly."
      },
      {
        question: "Is the output a real MP4 file?",
        answer:
          "The tool outputs a real video file using the browser's MediaRecorder. The container is WebM (VP8/VP9) by default, and MP4 when your browser supports it. Both are standard video formats."
      },
      {
        question: "Does the tool support multiple photos?",
        answer:
          "No — this tool combines one image with one audio track. For multiple photos, use the Photos to Video tool (silent slideshow) then add audio with this tool if needed."
      },
      {
        question: "Are my files uploaded anywhere?",
        answer:
          "No. All processing happens in your browser using the Canvas API, Web Audio API, and MediaRecorder. Your files never leave your device."
      }
    ],
    related: ["photos-to-video", "video-resizer", "video-compressor", "video-trimmer", "video-converter", "social-resizer"]
  }
};