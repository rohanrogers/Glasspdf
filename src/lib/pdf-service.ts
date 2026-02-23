import { PDFDocument } from 'pdf-lib';

export interface PDFFileMetadata {
  file: File;
  id: string;
  name: string;
  size: number;
}

const SAVE_OPTS = { useObjectStreams: true, objectsPerStream: 50 } as const;

export const mergePDFDocuments = async (files: File[]): Promise<Uint8Array> => {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save(SAVE_OPTS);
};

export const splitPDFDocument = async (
  file: File,
  ranges: { start: number; end: number }[]
): Promise<Uint8Array[]> => {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const results: Uint8Array[] = [];
  const total = source.getPageCount();

  for (const range of ranges) {
    const doc = await PDFDocument.create();
    const indices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start - 1 + i
    ).filter((i) => i >= 0 && i < total);

    if (indices.length > 0) {
      const pages = await doc.copyPages(source, indices);
      pages.forEach((p) => doc.addPage(p));
      results.push(await doc.save(SAVE_OPTS));
    }
  }
  return results;
};

export const extractAndMergePDFRanges = async (
  file: File,
  ranges: { start: number; end: number }[]
): Promise<Uint8Array> => {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const doc = await PDFDocument.create();
  const total = source.getPageCount();

  for (const range of ranges) {
    const indices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start - 1 + i
    ).filter((i) => i >= 0 && i < total);
    const pages = await doc.copyPages(source, indices);
    pages.forEach((p) => doc.addPage(p));
  }
  return doc.save(SAVE_OPTS);
};

export const compressPDFDocument = async (
  file: File,
  level: 'low' | 'medium' | 'high'
): Promise<Uint8Array> => {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const compressed = await PDFDocument.create();

  if (level === 'high' || level === 'medium') {
    compressed.setProducer('GlassPDF');
    compressed.setCreator('GlassPDF Studio');
    compressed.setTitle('');
    compressed.setAuthor('');
    compressed.setSubject('');
    compressed.setKeywords([]);
  }

  const pages = await compressed.copyPages(source, source.getPageIndices());
  pages.forEach((p) => compressed.addPage(p));

  return compressed.save({
    ...SAVE_OPTS,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
};

export const protectPDF = async (file: File, password: string): Promise<Uint8Array> => {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  (pdf as any).encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: { printing: 'highResolution', modifying: true, copying: true },
  });
  return pdf.save(SAVE_OPTS);
};

export const unlockPDF = async (file: File, password: string): Promise<Uint8Array> => {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { password } as any);
  return pdf.save(SAVE_OPTS);
};

export const imagesToPDF = async (files: File[]): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const img = file.type.includes('jpeg') || file.type.includes('jpg')
      ? await doc.embedJpg(bytes)
      : file.type.includes('png')
        ? await doc.embedPng(bytes)
        : null;
    if (!img) continue;
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return doc.save(SAVE_OPTS);
};

export const triggerDownload = (data: Uint8Array, fileName: string, type = 'application/pdf') => {
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
