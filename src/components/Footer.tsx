"use client";

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <div className="w-full pt-10 pb-2 shrink-0">
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400/50 dark:text-slate-600/50 font-medium tracking-wide">
                <span>© {new Date().getFullYear()} GlassPDF</span>
                <span className="text-slate-300/40 dark:text-slate-700/40">·</span>
                <Link href="/legal/about" className="hover:text-slate-500 dark:hover:text-slate-400 transition-colors">About</Link>
                <span className="text-slate-300/40 dark:text-slate-700/40">·</span>
                <Link href="/legal/terms" className="hover:text-slate-500 dark:hover:text-slate-400 transition-colors">Terms</Link>
                <span className="text-slate-300/40 dark:text-slate-700/40">·</span>
                <Link href="/legal/licenses" className="hover:text-slate-500 dark:hover:text-slate-400 transition-colors">Licenses</Link>
            </div>
        </div>
    );
};
