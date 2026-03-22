"use client";

import React, { useCallback, useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasDropzoneProps {
  onAddFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function CanvasDropzone({ onAddFiles, disabled }: CanvasDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) onAddFiles(files);
  }, [onAddFiles, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) onAddFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
        disabled
          ? "opacity-40 cursor-not-allowed border-slate-200/40 dark:border-zinc-700/40"
          : dragActive
            ? "border-blue-400 dark:border-orange-400 bg-blue-50/50 dark:bg-orange-500/5 scale-[1.01]"
            : "border-slate-200/60 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 bg-white/20 dark:bg-zinc-900/10"
      )}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className={cn(
        "p-2 rounded-xl transition-colors",
        dragActive ? "bg-blue-500 dark:bg-orange-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-400"
      )}>
        <Plus className="w-5 h-5" />
      </div>
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {disabled ? "Maximum 10 PDFs reached" : "Add more PDFs"}
      </span>
    </div>
  );
}
