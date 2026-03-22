"use client";

import React, { useState } from 'react';
import { Download, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CanvasExportPanelProps {
  totalPages: number;
  isProcessing: boolean;
  onExportAll: () => void;
  onExportRange: (from: number, to: number) => void;
}

export function CanvasExportPanel({
  totalPages,
  isProcessing,
  onExportAll,
  onExportRange,
}: CanvasExportPanelProps) {
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [rangeError, setRangeError] = useState('');

  const handleRangeExport = () => {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);

    if (isNaN(from) || isNaN(to)) {
      setRangeError('Enter valid page numbers.');
      return;
    }
    if (from < 1) {
      setRangeError('From must be at least 1.');
      return;
    }
    if (to > totalPages) {
      setRangeError(`To cannot exceed ${totalPages}.`);
      return;
    }
    if (from > to) {
      setRangeError('From cannot be greater than To.');
      return;
    }

    setRangeError('');
    onExportRange(from, to);
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 md:p-8 space-y-6 border-white/50 dark:border-white/5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Export</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center mt-0.5">
            Canvas order
            <ChevronRight className="w-3 h-3 mx-1 text-secondary dark:text-primary" />
            <span className="text-secondary dark:text-primary font-black">{totalPages} PAGES</span>
          </p>
        </div>
      </div>

      {/* Full export */}
      <button
        className="liquid-button h-12 w-full rounded-xl group"
        onClick={onExportAll}
        disabled={isProcessing || totalPages === 0}
      >
        <span className="liquid-button-text flex items-center font-black uppercase tracking-widest text-xs">
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
          {isProcessing ? "Processing..." : "Export Full PDF"}
        </span>
      </button>

      {/* Range export */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Page Range</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="number"
              min={1}
              max={totalPages}
              placeholder="From"
              value={rangeFrom}
              onChange={(e) => { setRangeFrom(e.target.value); setRangeError(''); }}
              className="glass-button rounded-xl h-10 text-center text-sm font-bold"
            />
          </div>
          <span className="text-xs font-bold text-slate-300 dark:text-slate-600">→</span>
          <div className="flex-1">
            <Input
              type="number"
              min={1}
              max={totalPages}
              placeholder="To"
              value={rangeTo}
              onChange={(e) => { setRangeTo(e.target.value); setRangeError(''); }}
              className="glass-button rounded-xl h-10 text-center text-sm font-bold"
            />
          </div>
        </div>
        {rangeError && (
          <p className="text-xs font-semibold text-destructive">{rangeError}</p>
        )}
        <Button
          variant="outline"
          onClick={handleRangeExport}
          disabled={isProcessing || totalPages === 0 || !rangeFrom || !rangeTo}
          className="w-full glass-button rounded-xl h-10 text-xs font-black uppercase tracking-widest"
        >
          Save Page Range
        </Button>
      </div>
    </div>
  );
}
