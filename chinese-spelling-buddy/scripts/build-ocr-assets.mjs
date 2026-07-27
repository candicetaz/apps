// Copies the OCR model files (from @gutenye/ocr-models) and the ONNX
// Runtime Web WASM backend (from onnxruntime-web) into public/, so the
// camera-scan feature (src/lib/ocr.ts, src/components/CameraScan.tsx) runs
// entirely offline against our own origin instead of a third-party CDN.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const modelsSrc = join(root, 'node_modules', '@gutenye', 'ocr-models', 'assets');
const modelsOut = join(root, 'public', 'ocr');
mkdirSync(modelsOut, { recursive: true });
const modelFiles = ['ch_PP-OCRv4_det_infer.onnx', 'ch_PP-OCRv4_rec_infer.onnx', 'ppocr_keys_v1.txt'];
for (const name of modelFiles) {
  copyFileSync(join(modelsSrc, name), join(modelsOut, name));
}
console.log(`Copied ${modelFiles.length} OCR model files to ${modelsOut}`);

// onnxruntime-web picks one WASM variant at runtime based on what the
// browser actually supports (SIMD+threads, JSEP, JSPI, or the asyncify
// fallback) — so all four backend/loader pairs are made available; only
// the one the current browser needs ever actually gets fetched.
const ortSrc = join(root, 'node_modules', 'onnxruntime-web', 'dist');
const ortOut = join(root, 'public', 'ort');
mkdirSync(ortOut, { recursive: true });
let ortCount = 0;
for (const name of readdirSync(ortSrc)) {
  if (!/^ort-wasm-simd-threaded(\.\w+)?\.(wasm|mjs)$/.test(name)) continue;
  copyFileSync(join(ortSrc, name), join(ortOut, name));
  ortCount += 1;
}
console.log(`Copied ${ortCount} onnxruntime-web WASM backend files to ${ortOut}`);
