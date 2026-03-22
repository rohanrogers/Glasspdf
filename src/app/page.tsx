
/**
 * @fileoverview Main Landing Page for GlassPDF
 */

"use client";

import React, { useState, useEffect, lazy, Suspense, startTransition } from 'react';
import { ArrowLeft, Layers, Scissors, Minimize2, Github, Image as ImageIcon, Eye, Lock, FileImage, Shrink, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { useTheme } from '@/lib/theme-provider';
import { ToolLoader } from '@/components/ToolLoader';

// Lazy-loaded tool components — each becomes its own code-split chunk
const MergeTool = lazy(() => import('@/components/tools/MergeTool').then(m => ({ default: m.MergeTool })));
const SplitTool = lazy(() => import('@/components/tools/SplitTool').then(m => ({ default: m.SplitTool })));
const CompressTool = lazy(() => import('@/components/tools/CompressTool').then(m => ({ default: m.CompressTool })));
const ImageConverterTool = lazy(() => import('@/components/tools/ImageConverterTool').then(m => ({ default: m.ImageConverterTool })));
const PDFViewerTool = lazy(() => import('@/components/tools/PDFViewerTool').then(m => ({ default: m.PDFViewerTool })));
const PSDViewerTool = lazy(() => import('@/components/tools/PSDViewerTool').then(m => ({ default: m.PSDViewerTool })));
const ProtectTool = lazy(() => import('@/components/tools/ProtectTool').then(m => ({ default: m.ProtectTool })));
const ImageCompressorTool = lazy(() => import('@/components/tools/ImageCompressorTool').then(m => ({ default: m.ImageCompressorTool })));
const PDFCanvasTool = lazy(() => import('@/components/tools/PDFCanvasTool').then(m => ({ default: m.PDFCanvasTool })));

// Preload all tool chunks in the background after page mount
const preloadTools = () => {
  import('@/components/tools/MergeTool');
  import('@/components/tools/SplitTool');
  import('@/components/tools/CompressTool');
  import('@/components/tools/ImageConverterTool');
  import('@/components/tools/PDFViewerTool');
  import('@/components/tools/PSDViewerTool');
  import('@/components/tools/ProtectTool');
  import('@/components/tools/ImageCompressorTool');
  import('@/components/tools/PDFCanvasTool');
};

// Per-tool preload map for hover-triggered loading
const PRELOAD_MAP: Record<string, () => void> = {
  merge: () => import('@/components/tools/MergeTool'),
  split: () => import('@/components/tools/SplitTool'),
  compress: () => import('@/components/tools/CompressTool'),
  'image-converter': () => import('@/components/tools/ImageConverterTool'),
  'pdf-viewer': () => import('@/components/tools/PDFViewerTool'),
  'psd-viewer': () => import('@/components/tools/PSDViewerTool'),
  protect: () => import('@/components/tools/ProtectTool'),
  'image-compressor': () => import('@/components/tools/ImageCompressorTool'),
  'pdf-canvas': () => import('@/components/tools/PDFCanvasTool'),
};

type ActiveTool = 'merge' | 'split' | 'compress' | 'image-compressor' | 'image-converter' | 'pdf-viewer' | 'psd-viewer' | 'protect' | 'pdf-canvas' | null;

export default function PDFWorkspace() {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [preloadedFile, setPreloadedFile] = useState<File | null>(null);
  const { theme, setTheme } = useTheme();

  // Preload all tool bundles 50ms after mount (during hero animation)
  useEffect(() => {
    const t = setTimeout(preloadTools, 50);
    return () => clearTimeout(t);
  }, []);

  const availableTools = [
    {
      id: 'merge' as const,
      name: 'Merge PDF',
      description: 'Combine multiple files into one seamless document',
      icon: Layers,
      themeColor: 'bg-blue-500 dark:bg-orange-500'
    },
    {
      id: 'split' as const,
      name: 'Split PDF',
      description: 'Extract ranges or separate pages with visual precision',
      icon: Scissors,
      themeColor: 'bg-indigo-500 dark:bg-amber-600'
    },
    {
      id: 'pdf-canvas' as const,
      name: 'PDF Canvas',
      description: 'Drag, reorder, and combine pages from multiple PDFs',
      icon: LayoutGrid,
      themeColor: 'bg-violet-500 dark:bg-amber-500'
    },
    {
      id: 'psd-viewer' as const,
      name: 'PSD Studio',
      description: 'Preview Photoshop files and export to PNG, JPG, or PDF',
      icon: FileImage,
      themeColor: 'bg-blue-600 dark:bg-orange-500'
    },
    {
      id: 'image-converter' as const,
      name: 'Image Converter',
      description: 'Convert images to PDF or between formats instantly',
      icon: ImageIcon,
      themeColor: 'bg-emerald-500 dark:bg-amber-600'
    },
    {
      id: 'pdf-viewer' as const,
      name: 'PDF Viewer',
      description: 'Instant local preview with fast navigation and zoom',
      icon: Eye,
      themeColor: 'bg-purple-500 dark:bg-orange-400'
    },
    {
      id: 'image-compressor' as const,
      name: 'Image Compressor',
      description: 'Compress PNG, JPG, WebP, and HEIC with live preview',
      icon: Shrink,
      themeColor: 'bg-teal-500 dark:bg-amber-500'
    },
    {
      id: 'protect' as const,
      name: 'Security Studio',
      description: 'Add password protection or unlock restricted files',
      icon: Lock,
      themeColor: 'bg-rose-500 dark:bg-amber-500'
    },
    {
      id: 'compress' as const,
      name: 'Compress PDF',
      description: 'Reduce size while keeping crystal clear quality',
      icon: Minimize2,
      themeColor: 'bg-cyan-500 dark:bg-orange-500'
    },
  ];

  const handleToolSwitch = (toolId: ActiveTool, file?: File) => {
    setPreloadedFile(file || null);
    setActiveTool(toolId);
  };

  const renderActiveWorkspace = () => {
    switch (activeTool) {
      case 'merge': return <MergeTool initialFile={preloadedFile} />;
      case 'split': return <SplitTool initialFile={preloadedFile} />;
      case 'compress': return <CompressTool initialFile={preloadedFile} />;
      case 'image-converter': return <ImageConverterTool />;
      case 'image-compressor': return <ImageCompressorTool />;
      case 'psd-viewer': return <PSDViewerTool />;
      case 'pdf-viewer': return (
        <PDFViewerTool
          onExit={() => setActiveTool(null)}
          onSwitchTool={handleToolSwitch}
        />
      );
      case 'protect': return <ProtectTool initialFile={preloadedFile} />;
      case 'pdf-canvas': return <PDFCanvasTool />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col font-body overflow-hidden text-slate-800 dark:text-slate-100 selection:bg-secondary/20 relative bg-transparent">
      <AnimatePresence>
        {activeTool !== 'pdf-viewer' && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="z-50 px-4 md:px-8 h-14 flex justify-between items-center backdrop-blur-3xl bg-white/60 dark:bg-black/20 border-b border-black/[0.04] dark:border-white/10 shrink-0"
            style={{ WebkitBackdropFilter: 'blur(48px) saturate(180%)', boxShadow: '0 1px 0 rgba(99, 102, 241, 0.06)' }}
          >
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTool(null)}
            >
              <div className="Btn scale-75 md:scale-90">
                <div className="svgContainer">
                  <span className="text-white font-black text-xl select-none">G</span>
                </div>
                <div className="BG"></div>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-secondary transition-all duration-300">GlassPDF</h1>
            </div>

            <nav className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="theme-checkbox"
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                  aria-label="Toggle theme"
                />
              </div>
              <a href="https://github.com/rohanrogers/Glasspdf" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/[0.04] dark:hover:bg-white/10">
                  <Github className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </Button>
              </a>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>

      <main className={cn(
        "flex-1 relative flex flex-col overflow-hidden",
        !activeTool && "items-center justify-start overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8"
      )}>
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], exit: { duration: 0.25 } }}
              className="max-w-6xl w-full text-center space-y-14 py-20"
            >
              <div className="space-y-5">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="text-4xl sm:text-6xl md:text-8xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight"
                >
                  The liquid <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-orange-400 dark:to-amber-600">PDF Studio.</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-4"
                >
                  Local First. Privacy Always. Movement. <br className="hidden md:block" /> No uploads, no servers, just pure client-side magic.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 px-4">
                {availableTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + (index * 0.05), duration: 0.4 }}
                    className="glass-card p-8 md:p-10 rounded-[2rem] cursor-pointer group flex flex-col items-center text-center space-y-5"
                    onMouseEnter={() => PRELOAD_MAP[tool.id]?.()}
                    onClick={() => startTransition(() => setActiveTool(tool.id))}
                  >
                    <div className={cn(tool.themeColor, "p-5 rounded-2xl shadow-lg shadow-current/10 group-hover:shadow-current/25 dark:shadow-2xl dark:shadow-current/20 dark:group-hover:shadow-current/35 group-hover:-translate-y-1 group-hover:scale-105 transition-all duration-500 ease-out")}>
                      <tool.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{tool.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-snug">{tool.description}</p>
                    </div>
                    <Button variant="outline" className="rounded-full px-7 h-9 glass-button text-sm font-semibold">
                      Open Tool
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Footer — visible when scrolled to bottom */}
              <Footer />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], exit: { duration: 0.25 } }}
              className={cn(
                "w-full h-full flex flex-col min-h-0",
                (activeTool !== 'pdf-viewer') && "max-w-7xl mx-auto p-4 md:p-6 lg:p-8"
              )}
            >
              {(activeTool !== 'pdf-viewer') && (
                <div className="mb-4 flex items-center shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setActiveTool(null);
                      setPreloadedFile(null);
                    }}
                    className="rounded-2xl w-10 h-10 p-0 glass-button shadow-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-4"></div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 text-xs">Workspace / {availableTools.find(t => t.id === activeTool)?.name}</span>
                  </div>
                </div>
              )}

              <div className={cn(
                "flex-1 relative flex flex-col min-h-0",
                (activeTool !== 'pdf-viewer') ? "glass p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg overflow-hidden" : "w-full"
              )}>
                <div className={cn(
                  "flex-1 flex flex-col min-h-0",
                  (activeTool !== 'pdf-viewer') && "overflow-y-auto custom-scrollbar"
                )}>
                  <Suspense fallback={<ToolLoader />}>
                    {renderActiveWorkspace()}
                  </Suspense>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
