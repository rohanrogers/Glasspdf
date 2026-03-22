"use client";

import React from 'react';
import { RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CanvasPageCardProps {
  id: string;
  thumbnailDataUrl: string;
  rotation: number;
  sourceFileName: string;
  originalPageIndex: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onRemove: () => void;
}

export function CanvasPageCard({
  id,
  thumbnailDataUrl,
  rotation,
  sourceFileName,
  originalPageIndex,
  onRotateLeft,
  onRotateRight,
  onRemove,
}: CanvasPageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 50 : isOver ? 40 : 'auto',
    willChange: isDragging ? 'transform' : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card rounded-2xl p-2 cursor-grab active:cursor-grabbing group relative flex flex-col items-center select-none touch-none transition-shadow duration-200
        hover:shadow-[0_0_16px_rgba(99,102,241,0.1)] dark:hover:shadow-[0_0_16px_rgba(251,146,60,0.12)]
        ${isOver ? 'ring-2 ring-indigo-400/70 dark:ring-orange-400/70' : ''}
      `}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-[1/1.414] rounded-xl overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
        <img
          src={thumbnailDataUrl}
          alt={`${sourceFileName} page ${originalPageIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
          draggable={false}
        />
      </div>

      {/* Source label */}
      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5 truncate max-w-full px-1 text-center leading-tight">
        {sourceFileName} — p.{originalPageIndex + 1}
      </p>

      {/* Hover action overlay */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-1 pt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRotateLeft(); }}
          className="w-7 h-7 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-orange-900/30 transition-colors shadow-sm"
          title="Rotate left"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRotateRight(); }}
          className="w-7 h-7 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-white/50 dark:border-white/10 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-orange-900/30 transition-colors shadow-sm"
          title="Rotate right"
        >
          <RotateCw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="w-7 h-7 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-red-200/50 dark:border-red-500/20 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
          title="Remove page"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}
