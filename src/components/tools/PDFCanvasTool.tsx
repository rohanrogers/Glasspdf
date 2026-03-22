/**
 * @fileoverview PDF Canvas Tool Component
 * Visual page-management workspace: load up to 10 PDFs, drag-reorder, rotate, remove, export.
 * Author: GlassPDF Team
 * License: MIT
 */

"use client";

import React, { useState, useRef, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { buildCanvasPDF, triggerDownload } from '@/lib/pdf-service';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CanvasPageCard } from './pdf-canvas/CanvasPageCard';
import { CanvasPageSkeleton } from './pdf-canvas/CanvasPageSkeleton';
import { CanvasDropzone } from './pdf-canvas/CanvasDropzone';
import { CanvasExportPanel } from './pdf-canvas/CanvasExportPanel';
import { Button } from '@/components/ui/button';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
} from '@dnd-kit/sortable';

// No-op strategy: cards stay still mid-drag, only swap on drop
const noopStrategy = () => null;

// ── Types ──
interface CanvasPage {
  id: string;
  pdfIndex: number;
  originalPageIndex: number;
  rotation: number;
  thumbnailDataUrl: string;
  sourceFileName: string;
}

interface SourcePDF {
  id: string;
  fileName: string;
  pageCount: number;
}

// ── Component ──
export const PDFCanvasTool: React.FC = () => {
  const [sourcePDFs, setSourcePDFs] = useState<SourcePDF[]>([]);
  const [canvasPages, setCanvasPages] = useState<CanvasPage[]>([]);
  const [renderingCount, setRenderingCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Store ArrayBuffers outside React state to avoid re-renders
  const sourceBuffersRef = useRef<Map<number, ArrayBuffer>>(new Map());
  const nextPdfIndexRef = useRef(0);

  const { toast } = useToast();

  // dnd-kit sensor — require 5px movement before drag starts (prevents accidental drags on button clicks)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ── PDF Ingestion ──
  const ingestFiles = useCallback(async (files: File[]) => {
    const remaining = 10 - sourcePDFs.length;
    if (remaining <= 0) {
      toast({ variant: 'destructive', title: 'Limit Reached', description: 'Maximum 10 PDFs are allowed on the canvas.' });
      return;
    }

    const filesToProcess = files.slice(0, remaining);
    if (filesToProcess.length < files.length) {
      toast({ title: 'Note', description: `Only ${filesToProcess.length} of ${files.length} files added (10 PDF limit).` });
    }

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    for (const file of filesToProcess) {
      const pdfIndex = nextPdfIndexRef.current++;
      let arrayBuffer: ArrayBuffer;

      try {
        arrayBuffer = await file.arrayBuffer();
      } catch {
        toast({ variant: 'destructive', title: 'Read Error', description: `Could not read "${file.name}".` });
        continue;
      }

      sourceBuffersRef.current.set(pdfIndex, arrayBuffer);

      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('password') || msg.includes('encrypt')) {
          toast({ variant: 'destructive', title: 'Protected PDF', description: `"${file.name}" is password-protected. Unlock it first using Security Studio.` });
        } else {
          const sizeMB = Math.round(file.size / (1024 * 1024));
          toast({ variant: 'destructive', title: 'Load Error', description: sizeMB > 30 ? `Could not load "${file.name}" (${sizeMB}MB). The file may be too large or corrupted.` : `Could not load "${file.name}". The file may be corrupted.` });
        }
        sourceBuffersRef.current.delete(pdfIndex);
        continue;
      }

      const pageCount = pdf.numPages;
      setSourcePDFs(prev => [...prev, { id: crypto.randomUUID(), fileName: file.name, pageCount }]);

      setRenderingCount(prev => prev + pageCount);

      for (let i = 0; i < pageCount; i++) {
        try {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const scale = Math.min(200 / viewport.width, 283 / viewport.height);
          const scaledViewport = page.getViewport({ scale });
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
          const thumbnailDataUrl = canvas.toDataURL('image/png');

          const newPage: CanvasPage = {
            id: crypto.randomUUID(),
            pdfIndex,
            originalPageIndex: i,
            rotation: 0,
            thumbnailDataUrl,
            sourceFileName: file.name,
          };

          setCanvasPages(prev => [...prev, newPage]);
        } catch {
          // Skip unrenderable pages
        } finally {
          setRenderingCount(prev => prev - 1);
        }
      }
    }
  }, [sourcePDFs.length, toast]);

  // ── Page Actions ──
  const rotatePage = useCallback((id: string, delta: number) => {
    setCanvasPages(prev =>
      prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p)
    );
  }, []);

  const removePage = useCallback((id: string) => {
    setCanvasPages(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) {
        setSourcePDFs([]);
        sourceBuffersRef.current.clear();
        nextPdfIndexRef.current = 0;
      }
      return next;
    });
  }, []);

  // ── Drag-to-Reorder (dnd-kit) ──
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCanvasPages(pages => {
      const oldIndex = pages.findIndex(p => p.id === active.id);
      const newIndex = pages.findIndex(p => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return pages;

      const updated = [...pages];
      // Direct swap — only these two cards exchange positions
      [updated[oldIndex], updated[newIndex]] = [updated[newIndex], updated[oldIndex]];
      return updated;
    });
  }, []);

  // ── Export ──
  const handleExport = useCallback(async (pages: CanvasPage[]) => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    try {
      const data = await buildCanvasPDF(
        sourceBuffersRef.current,
        pages.map(p => ({ pdfIndex: p.pdfIndex, originalPageIndex: p.originalPageIndex, rotation: p.rotation }))
      );
      triggerDownload(data, `canvas_${pages.length}pages.pdf`);
      toast({ title: 'Success', description: `Exported ${pages.length} pages.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err?.message || 'Failed to build PDF.' });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleExportAll = useCallback(() => handleExport(canvasPages), [canvasPages, handleExport]);

  const handleExportRange = useCallback((from: number, to: number) => {
    handleExport(canvasPages.slice(from - 1, to));
  }, [canvasPages, handleExport]);

  // ── Render: Upload Zone ──
  if (sourcePDFs.length === 0 && canvasPages.length === 0) {
    return (
      <FileUpload
        onFilesSelected={ingestFiles}
        multiple
        accept=".pdf"
        label="Drop up to 10 PDF files to arrange pages on the canvas."
      />
    );
  }

  // ── Render: Canvas Workspace ──
  const pageIds = canvasPages.map(p => p.id);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">PDF Canvas</h2>
          <p className="text-slate-500 dark:text-slate-400 font-semibold flex items-center text-sm md:text-base">
            Drag to reorder, rotate, or remove.
            <ChevronRight className="w-4 h-4 mx-2 text-secondary dark:text-primary" />
            <span className="text-secondary dark:text-primary font-black">{canvasPages.length} PAGES</span>
            <span className="text-slate-300 dark:text-slate-600 mx-2">·</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">{sourcePDFs.length}/10 PDFs</span>
          </p>
        </div>
        <div className="flex space-x-3 w-full xl:w-auto">
          <Button
            variant="outline"
            onClick={() => { setSourcePDFs([]); setCanvasPages([]); sourceBuffersRef.current.clear(); nextPdfIndexRef.current = 0; }}
            className="glass-button rounded-xl h-12 px-6 text-xs font-black uppercase tracking-widest flex-1 xl:flex-none"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Grid */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <CanvasDropzone onAddFiles={ingestFiles} disabled={sourcePDFs.length >= 10} />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={pageIds} strategy={noopStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {canvasPages.map((page) => (
                  <motion.div
                    key={page.id}
                    layout
                    layoutId={page.id}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  >
                    <CanvasPageCard
                      id={page.id}
                      thumbnailDataUrl={page.thumbnailDataUrl}
                      rotation={page.rotation}
                      sourceFileName={page.sourceFileName}
                      originalPageIndex={page.originalPageIndex}
                      onRotateLeft={() => rotatePage(page.id, -90)}
                      onRotateRight={() => rotatePage(page.id, 90)}
                      onRemove={() => removePage(page.id)}
                    />
                  </motion.div>
                ))}

                {/* Skeleton placeholders for pages being rendered */}
                {renderingCount > 0 && Array.from({ length: renderingCount }).map((_, i) => (
                  <CanvasPageSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Export Panel */}
        <div className="lg:col-span-4 xl:col-span-3">
          <CanvasExportPanel
            totalPages={canvasPages.length}
            isProcessing={isProcessing}
            onExportAll={handleExportAll}
            onExportRange={handleExportRange}
          />
        </div>
      </div>
    </div>
  );
};
