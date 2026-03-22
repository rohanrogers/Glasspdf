"use client";

import React from 'react';

export function CanvasPageSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-2 flex flex-col items-center space-y-2 animate-pulse">
      <div className="w-full aspect-[1/1.414] rounded-xl bg-slate-200/60 dark:bg-slate-700/40" />
      <div className="w-20 h-2.5 rounded-full bg-slate-200/50 dark:bg-slate-700/30" />
    </div>
  );
}
