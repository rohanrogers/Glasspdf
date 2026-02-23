"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
}

function getQualityLevel(q: number): { label: string; color: string; tag: string } {
    if (q >= 80) return { label: 'High Quality', color: 'text-emerald-600 dark:text-emerald-400', tag: 'Best' };
    if (q >= 60) return { label: 'Optimized', color: 'text-blue-600 dark:text-blue-400', tag: 'Recommended' };
    if (q >= 30) return { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', tag: 'Visible quality loss' };
    if (q >= 10) return { label: 'Low', color: 'text-orange-600 dark:text-orange-400', tag: 'Strong degradation' };
    return { label: 'Very Low', color: 'text-red-600 dark:text-red-400', tag: 'Not recommended' };
}

async function decodeHEIC(file: File): Promise<Blob> {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({ blob: file, toType: 'image/png', quality: 1 });
    return Array.isArray(result) ? result[0] : result;
}

async function loadImageFromFile(file: File): Promise<{ bitmap: ImageBitmap; originalSize: number }> {
    const isHEIC = /\.(heic|heif)$/i.test(file.name);
    let blob: Blob = file;
    if (isHEIC) blob = await decodeHEIC(file);
    const bitmap = await createImageBitmap(blob);
    return { bitmap, originalSize: file.size };
}

export const ImageCompressorTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [quality, setQuality] = useState(80);
    const [estimatedSize, setEstimatedSize] = useState(0);
    const [decoding, setDecoding] = useState(false);
    const [exporting, setExporting] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const estimateTimer = useRef<ReturnType<typeof setTimeout>>(0 as any);
    const estimateGen = useRef(0);
    const { toast } = useToast();

    const drawPreview = useCallback((bmp: ImageBitmap) => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const containerW = container.clientWidth;
        const ratio = bmp.width / bmp.height;
        const displayW = Math.min(containerW, bmp.width);
        const displayH = displayW / ratio;

        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
        canvas.width = Math.round(displayW * (window.devicePixelRatio || 1));
        canvas.height = Math.round(displayH * (window.devicePixelRatio || 1));

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    }, []);

    const applyLossyCompression = useCallback(async (bmp: ImageBitmap, q: number): Promise<Blob> => {
        const src = document.createElement('canvas');
        src.width = bmp.width;
        src.height = bmp.height;
        const sctx = src.getContext('2d')!;
        sctx.drawImage(bmp, 0, 0);
        const jpegBlob = await new Promise<Blob>((res) =>
            src.toBlob((b) => res(b!), 'image/jpeg', q / 100)
        );
        return jpegBlob;
    }, []);

    const estimateSize = useCallback((bmp: ImageBitmap, q: number) => {
        clearTimeout(estimateTimer.current);
        const gen = ++estimateGen.current;
        estimateTimer.current = setTimeout(async () => {
            const blob = await applyLossyCompression(bmp, q);
            if (gen === estimateGen.current) {
                setEstimatedSize(blob.size);
            }
        }, 100);
    }, [applyLossyCompression]);

    const handleFileSelect = useCallback(async (files: File[]) => {
        const f = files[0];
        if (!f) return;
        setFile(f);
        setDecoding(true);
        try {
            const { bitmap: bmp, originalSize: origSize } = await loadImageFromFile(f);
            setBitmap(bmp);
            setOriginalSize(origSize);
            setQuality(80);
        } catch {
            toast({ variant: 'destructive', title: 'Decode Error', description: 'Could not decode the image.' });
            setFile(null);
        } finally {
            setDecoding(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!bitmap) return;
        drawPreview(bitmap);
        estimateSize(bitmap, quality);
    }, [bitmap, quality, drawPreview, estimateSize]);

    // Resize observer for responsive canvas
    useEffect(() => {
        if (!bitmap || !containerRef.current) return;
        const observer = new ResizeObserver(() => drawPreview(bitmap));
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [bitmap, drawPreview]);

    const handleExport = useCallback(async (fmt: 'png' | 'jpg') => {
        if (!bitmap) return;
        setExporting(true);
        try {
            const exportBlob = await applyLossyCompression(bitmap, quality);

            const baseName = file?.name.replace(/\.[^.]+$/, '') || 'compressed';
            const ext = fmt === 'png' ? 'png' : 'jpg';
            const url = URL.createObjectURL(exportBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}_compressed.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: 'Exported!', description: `Saved as ${fmt.toUpperCase()} — ${formatBytes(exportBlob.size)}` });
        } catch {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export the image.' });
        } finally {
            setExporting(false);
        }
    }, [bitmap, quality, file, toast, applyLossyCompression]);

    const reset = () => {
        setFile(null);
        setBitmap(null);
        setOriginalSize(0);
        setEstimatedSize(0);
        setQuality(80);
    };

    // ─── Upload ──────────────────────────
    if (!file) {
        return (
            <FileUpload
                onFilesSelected={handleFileSelect}
                accept=".png,.jpg,.jpeg,.webp,.heif,.heic"
                label="Select an image (PNG, JPG, WebP, HEIF, HEIC) to compress."
            />
        );
    }

    // ─── Decoding ──────────────────────────
    if (decoding) {
        return (
            <div className="flex flex-col items-center justify-center h-80 space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-primary" />
                <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                    {/\.(heic|heif)$/i.test(file.name) ? 'Decoding HEIC with WASM engine…' : 'Loading image…'}
                </p>
            </div>
        );
    }

    const reduction = originalSize > 0 && estimatedSize > 0
        ? Math.max(0, Math.round((1 - estimatedSize / originalSize) * 100))
        : 0;
    const qualityInfo = getQualityLevel(quality);
    const compressionRatio = originalSize > 0 && estimatedSize > 0
        ? (originalSize / estimatedSize).toFixed(1)
        : '—';

    // ─── Main UI ──────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-5xl mx-auto space-y-8 pb-10"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Image Compressor</h2>
                    <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">
                        {file.name} — {bitmap ? `${bitmap.width} × ${bitmap.height}` : ''}
                    </p>
                </div>
                <Button variant="outline" onClick={reset} className="glass-button rounded-2xl h-10 gap-2">
                    <RotateCcw className="w-4 h-4" />
                    New Image
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preview — edge-to-edge, no checkerboard */}
                <div className="lg:col-span-2">
                    <div
                        ref={containerRef}
                        className="glass-card rounded-[2rem] overflow-hidden flex items-center justify-center bg-white dark:bg-zinc-900"
                    >
                        <canvas
                            ref={canvasRef}
                            className="block max-w-full"
                            style={{ display: 'block' }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-5">
                    {/* Size & Stats Card */}
                    <div className="glass-card rounded-[2rem] p-6 space-y-4">
                        <h3 className="font-semibold text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Compression Stats</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Original</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{formatBytes(originalSize)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Estimated</span>
                                <span className={cn("text-sm font-bold", reduction > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-white")}>
                                    {estimatedSize > 0 ? formatBytes(estimatedSize) : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Ratio</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{compressionRatio}×</span>
                            </div>
                        </div>

                        {reduction > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-center pt-1"
                            >
                                <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                                    {reduction}% smaller
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Quality Slider */}
                    <div className="glass-card rounded-[2rem] p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Quality</h3>
                            <span className="text-xl font-bold text-slate-800 dark:text-white tabular-nums">{quality}%</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={100}
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-zinc-700 accent-blue-500 dark:accent-orange-500"
                        />
                        <div className="flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            <span>Smallest</span>
                            <span>Best Quality</span>
                        </div>

                        {/* Quality Level Indicator */}
                        <div className="flex items-center justify-between pt-1">
                            <span className={cn("text-xs font-bold", qualityInfo.color)}>{qualityInfo.label}</span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{qualityInfo.tag}</span>
                        </div>
                    </div>

                    {/* Low Quality Warning */}
                    <AnimatePresence>
                        {quality < 10 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-card rounded-[1.5rem] p-4 border-amber-300/50 dark:border-amber-600/30 bg-amber-50/50 dark:bg-amber-900/10">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
                                            Very low quality may cause severe visual degradation, artifacts, or broken image appearance. Recommended range is <strong>60%–85%</strong> for optimal balance between size and visual quality.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Export Buttons */}
                    <div className="space-y-3">
                        <button
                            className="liquid-button w-full h-14 rounded-[1.5rem] group"
                            onClick={() => handleExport('jpg')}
                            disabled={exporting || !bitmap}
                        >
                            <span className="liquid-button-text flex items-center font-semibold text-sm gap-2">
                                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Export JPG
                            </span>
                        </button>
                        <button
                            className="liquid-button w-full h-14 rounded-[1.5rem] group"
                            onClick={() => handleExport('png')}
                            disabled={exporting || !bitmap}
                        >
                            <span className="liquid-button-text flex items-center font-semibold text-sm gap-2">
                                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Export PNG
                            </span>
                        </button>
                    </div>


                </div>
            </div>
        </motion.div>
    );
};
