import { readPsd, type Psd, type Layer } from 'ag-psd';
import { PDFDocument } from 'pdf-lib';

export type RenderStage = 'raw-data' | 'high-fidelity' | 'safe-mode' | 'composite';

export interface PSDRenderResult {
  canvas: HTMLCanvasElement;
  stage: RenderStage;
  layerCount: number;
  width: number;
  height: number;
}

const BLEND_MODE_MAP: Record<string, GlobalCompositeOperation> = {
  'normal': 'source-over', 'pass through': 'source-over', 'dissolve': 'source-over',
  'multiply': 'multiply', 'screen': 'screen', 'overlay': 'overlay',
  'darken': 'darken', 'lighten': 'lighten',
  'color dodge': 'color-dodge', 'linear dodge': 'color-dodge',
  'color burn': 'color-burn', 'linear burn': 'color-burn',
  'hard light': 'hard-light', 'soft light': 'soft-light',
  'vivid light': 'hard-light', 'linear light': 'hard-light',
  'pin light': 'hard-light', 'hard mix': 'hard-light',
  'difference': 'difference', 'exclusion': 'exclusion',
  'subtract': 'difference', 'divide': 'difference',
  'hue': 'hue', 'saturation': 'saturation', 'color': 'color', 'luminosity': 'luminosity',
  'darker color': 'darken', 'lighter color': 'lighten',
};

function countLayers(layers?: Layer[]): number {
  if (!layers) return 0;
  return layers.reduce((n, l) => n + 1 + countLayers(l.children), 0);
}

function pixelDataToCanvas(pd: { data: any; width: number; height: number }): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = pd.width;
  c.height = pd.height;
  const ctx = c.getContext('2d');
  if (ctx && pd.data.length > 0) {
    const src = new Uint8Array(pd.data.buffer || pd.data);
    const buf = new Uint8ClampedArray(pd.width * pd.height * 4);
    buf.set(src.length <= buf.length ? src : src.subarray(0, buf.length));
    ctx.putImageData(new ImageData(buf, pd.width, pd.height), 0, 0);
  }
  return c;
}

function buildResult(canvas: HTMLCanvasElement, stage: RenderStage, psd: Psd): PSDRenderResult {
  return {
    canvas, stage,
    layerCount: countLayers(psd.children),
    width: psd.width || canvas.width,
    height: psd.height || canvas.height,
  };
}

// 4-stage resilient PSD rendering pipeline
export const renderPSDToCanvas = async (file: File): Promise<PSDRenderResult> => {
  const buffer = await file.arrayBuffer();

  // Validate PSD magic number
  if (buffer.byteLength >= 4) {
    const sig = new DataView(buffer).getUint32(0);
    if (sig === 0x25504446) throw new Error('This is a PDF file. Use the PDF Viewer tool.');
    if (sig !== 0x38425053) throw new Error('Not a valid PSD file.');
  }

  // Stage 0: Raw pixel data (avoids alpha premultiplication)
  try {
    const psd = readPsd(buffer, { useImageData: true, skipThumbnail: true, logMissingFeatures: true });
    if (psd.imageData && psd.width && psd.height) return buildResult(pixelDataToCanvas(psd.imageData as any), 'raw-data', psd);
    const manual = compositeRawLayers(psd);
    if (manual) return buildResult(manual, 'raw-data', psd);
  } catch { /* Stage fallback */ }

  // Stage 1: Canvas-based high fidelity
  try {
    const psd = readPsd(buffer, { skipThumbnail: true, logMissingFeatures: true });
    if (psd.canvas) return buildResult(psd.canvas, 'high-fidelity', psd);
    const manual = compositeCanvasLayers(psd);
    if (manual) return buildResult(manual, 'high-fidelity', psd);
  } catch (e: any) { console.warn('[PSD] Stage 1 failed:', e.message); }

  // Stage 2: Safe mode (skip linked files)
  try {
    const psd = readPsd(buffer, { skipThumbnail: true, skipLinkedFilesData: true, logMissingFeatures: true });
    if (psd.canvas) return buildResult(psd.canvas, 'safe-mode', psd);
  } catch (e: any) { console.warn('[PSD] Stage 2 failed:', e.message); }

  // Stage 3: Composite-only fallback
  try {
    const psd = readPsd(buffer, { skipLayerImageData: true, skipThumbnail: true, skipLinkedFilesData: true });
    if (psd.canvas) return buildResult(psd.canvas, 'composite', psd);
  } catch (e: any) { console.warn('[PSD] Stage 3 failed:', e.message); }

  throw new Error('Unsupported PSD structure. Try saving with "Maximize Compatibility" in Photoshop.');
};

function compositeRawLayers(psd: Psd): HTMLCanvasElement | null {
  if (!psd.width || !psd.height || !psd.children?.length) return null;
  const c = document.createElement('canvas');
  c.width = psd.width; c.height = psd.height;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  renderLayersRaw(ctx, psd.children);
  return c;
}

function renderLayersRaw(ctx: CanvasRenderingContext2D, layers: Layer[]) {
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    if (l.hidden || l.adjustment) continue;
    if (l.children) { renderLayersRaw(ctx, l.children); continue; }
    if (l.imageData && l.imageData.width > 0 && l.imageData.height > 0) {
      const lc = pixelDataToCanvas(l.imageData);
      ctx.save();
      ctx.globalAlpha = (l.opacity ?? 255) / 255;
      ctx.globalCompositeOperation = BLEND_MODE_MAP[l.blendMode || 'normal'] || 'source-over';
      ctx.drawImage(lc, l.left || 0, l.top || 0);
      ctx.restore();
    }
  }
}

function compositeCanvasLayers(psd: Psd): HTMLCanvasElement | null {
  if (!psd.width || !psd.height || !psd.children?.length) return null;
  const c = document.createElement('canvas');
  c.width = psd.width; c.height = psd.height;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  renderLayersCanvas(ctx, psd.children);
  return c;
}

function renderLayersCanvas(ctx: CanvasRenderingContext2D, layers: Layer[]) {
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    if (l.hidden || l.adjustment) continue;
    if (l.children) { renderLayersCanvas(ctx, l.children); continue; }
    if (l.canvas) {
      ctx.save();
      ctx.globalAlpha = (l.opacity ?? 255) / 255;
      ctx.globalCompositeOperation = BLEND_MODE_MAP[l.blendMode || 'normal'] || 'source-over';
      ctx.drawImage(l.canvas, l.left || 0, l.top || 0);
      ctx.restore();
    }
  }
}

export const exportCanvasAsImage = (canvas: HTMLCanvasElement, format: 'png' | 'jpg', fileName: string) => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.split('.')[0]}.${format === 'png' ? 'png' : 'jpg'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
};

export const exportCanvasAsPDF = async (canvas: HTMLCanvasElement): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  const bytes = await fetch(canvas.toDataURL('image/jpeg', 0.92)).then(r => r.arrayBuffer());
  const img = await doc.embedJpg(bytes);
  doc.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  return doc.save({ useObjectStreams: true });
};
