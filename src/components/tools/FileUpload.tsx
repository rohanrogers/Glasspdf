
"use client";

import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
  accept?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  multiple = false,
  className,
  accept,
  label
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    let files = Array.from(e.dataTransfer.files);
    if (accept) {
      const exts = accept.split(',').map(a => a.trim().toLowerCase());
      files = files.filter(f => exts.some(ext => f.name.toLowerCase().endsWith(ext)));
    }
    // Engine limit: block files >1GB (browser tab would crash regardless of server).
    // Warn (but allow) files 500MB–1GB so users know it may be slow on low-RAM devices.
    const GB = 1024 * 1024 * 1024;
    const MB500 = 500 * 1024 * 1024;
    const oversized = files.filter(f => f.size > GB);
    if (oversized.length > 0) {
      alert(`File too large: "${oversized[0].name}" exceeds 1GB. All processing is local, but your browser cannot handle files this large in memory.`);
      files = files.filter(f => f.size <= GB);
    }
    const large = files.filter(f => f.size > MB500);
    if (large.length > 0) {
      // Non-blocking advisory — processing still starts
      console.info(`Advisory: "${large[0].name}" is over 500MB. Processing is entirely local on your device — this may be slow on low-RAM machines.`);
    }
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  }, [multiple, onFilesSelected, accept]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files ? Array.from(e.target.files) : [];
    const GB = 1024 * 1024 * 1024;
    const oversized = files.filter(f => f.size > GB);
    if (oversized.length > 0) {
      alert(`File too large: "${oversized[0].name}" exceeds 1GB. All processing is local, but your browser cannot handle files this large in memory.`);
      files = files.filter(f => f.size <= GB);
    }
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[2.5rem] transition-all duration-500 ease-out",
        dragActive
          ? "border-blue-400 dark:border-primary bg-blue-50/50 dark:bg-primary/5 scale-[1.01] shadow-[0_0_60px_rgba(59,130,246,0.08)] dark:shadow-[0_0_60px_rgba(251,146,60,0.1)]"
          : "border-slate-200/80 dark:border-zinc-700 bg-white/30 dark:bg-zinc-900/10 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/20",
        "glass overflow-hidden",
        className
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        onChange={onInputChange}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={dragActive ? 'active' : 'idle'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col items-center space-y-6 pointer-events-none z-10"
        >
          <div className={cn(
            "p-6 rounded-[2rem] transition-all duration-400",
            dragActive
              ? "bg-blue-500 dark:bg-primary text-white dark:text-black scale-105"
              : "bg-white/60 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-400 shadow-sm"
          )}>
            {dragActive ? <CheckCircle2 className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
          </div>

          <div className="text-center space-y-2 px-8">
            <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {dragActive ? "Drop to Process" : "Start your Session"}
            </p>
            <p className="text-base text-slate-400 dark:text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
              {dragActive
                ? "Release files to begin instant local processing."
                : label || "Select files from your device to begin secure browser-native processing."
              }
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] bg-white/50 dark:bg-zinc-900/50 px-5 py-1.5 rounded-full border border-black/[0.04] dark:border-white/5">
            <span>Secure Sandbox</span>
            <span className="text-emerald-500">•</span>
            <span>Local Engine</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 dark:from-primary/5 to-transparent pointer-events-none -z-10"></div>
    </div>
  );
};
