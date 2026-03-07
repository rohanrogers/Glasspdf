"use client";

import React from 'react';

export function ToolLoader() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="glass-card rounded-3xl p-10 flex flex-col items-center space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-slate-700/40" />
                <div className="w-32 h-3 rounded-full bg-slate-200/60 dark:bg-slate-700/40" />
                <div className="w-20 h-3 rounded-full bg-slate-200/40 dark:bg-slate-700/30" />
            </div>
        </div>
    );
}
