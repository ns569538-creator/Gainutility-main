/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const dataUrlToBytes = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/**
 * Build a genuine multi-image .ico container that embeds PNG-compressed frames
 * (standard format supported by Windows Vista+, Chromium, Safari, Firefox).
 * Header (6 bytes) + Directory Entries (16 bytes each) + concatenated PNG payloads.
 */
export const buildIcoFile = (pngFrames: { size: number; dataUrl: string }[]): Uint8Array => {
  const images = pngFrames.map(({ size, dataUrl }) => ({ size, bytes: dataUrlToBytes(dataUrl) }));
  const headerSize = 6;
  const entrySize = 16;
  const totalSize = headerSize + entrySize * images.length + images.reduce((sum, img) => sum + img.bytes.length, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const out = new Uint8Array(buffer);

  view.setUint16(0, 0, true);            // reserved
  view.setUint16(2, 1, true);            // type: 1 = icon (.ico)
  view.setUint16(4, images.length, true); // image count

  let offset = headerSize + entrySize * images.length;
  images.forEach((img, i) => {
    const entry = headerSize + i * entrySize;
    view.setUint8(entry, img.size >= 256 ? 0 : img.size);   // width (0 means 256)
    view.setUint8(entry + 1, img.size >= 256 ? 0 : img.size); // height
    view.setUint8(entry + 2, 0);           // color palette count
    view.setUint8(entry + 3, 0);           // reserved
    view.setUint16(entry + 4, 1, true);    // color planes
    view.setUint16(entry + 6, 32, true);   // bits per pixel
    view.setUint32(entry + 8, img.bytes.length, true); // size of image in bytes
    view.setUint32(entry + 12, offset, true);          // file offset to image data
    out.set(img.bytes, offset);
    offset += img.bytes.length;
  });
  return out;
};

export interface ManifestOptions {
  name: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
}

export const generateWebManifest = (opts: ManifestOptions): string => {
  const manifest = {
    name: opts.name || "My Website",
    short_name: opts.shortName || "Website",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    theme_color: opts.themeColor || "#ffffff",
    background_color: opts.backgroundColor || "#ffffff",
    display: "standalone",
  };
  return JSON.stringify(manifest, null, 2);
};

export const generateHtmlSnippet = (hasSvg: boolean = false): string => {
  return `<!-- Standard Favicons -->
<link rel="icon" href="/favicon.ico" sizes="any">
${hasSvg ? `<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n` : ""}<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon (iOS Web Bookmark) -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Web App Manifest (PWA & Android) -->
<link rel="manifest" href="/site.webmanifest">`;
};
