import tailwindcss from '@tailwindcss/vite';
import {cloudflare} from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

/**
 * onnxruntime-web statically emits its WebGPU kernel image
 * (ort-wasm-simd-threaded.jsep.wasm, ~27 MB) into the client bundle as an
 * asset. That file is never fetched at runtime — the background remover loads
 * WASM via `ort.env.wasm.wasmPaths` from /api/br-assets/* with a CDN fallback —
 * and it exceeds Cloudflare Pages' 25 MB per-file upload limit, which breaks
 * deployments. Strip it from the build output.
 */
const stripOrtWasm: Plugin = {
  name: 'strip-ort-wasm',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const name of Object.keys(bundle)) {
      const entry = bundle[name];
      if (entry.type === 'asset' && entry.fileName.endsWith('.wasm') && entry.fileName.includes('ort-wasm')) {
        delete bundle[name];
      }
    }
  },
};

export default defineConfig(() => {
  return {
    plugins: [cloudflare(), react(), tailwindcss(), stripOrtWasm],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: false,
      strictPort: false,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/scratch/**', '**/.wrangler/**', '**/dist/**', '**/.git/**']
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'motion'],
            'vendor-lucide': ['lucide-react'],
            'vendor-pdf': ['@cantoo/pdf-lib', '@pdf-lib/fontkit'],
            'vendor-utils': ['jszip', 'js-yaml', 'qrcode', 'xlsx', 'dompurify', 'css-tree'],
            'vendor-onnx': ['onnxruntime-web'],
            'vendor-tesseract': ['tesseract.js'],
            'tools-heavy-font': ['src/components/FontDetector.tsx'],
            'tools-heavy-pdf': ['src/components/AdvancedPdfTools.tsx'],
            'tools-heavy-bg': ['src/components/BackgroundRemover.tsx'],
            'tools-heavy-linkedin': ['src/components/LinkedInCarouselMaker.tsx'],
            'tools-heavy-youtube': ['src/components/YoutubeKeywordExplorer.tsx'],
            'tools-heavy-stylish': ['src/components/StylishNameGenerator.tsx'],
            'tools-heavy-boxshadow': ['src/components/BoxShadowGenerator.tsx'],
          },
        },
      },
    },
  };
});
