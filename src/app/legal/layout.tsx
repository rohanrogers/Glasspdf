"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[100dvh] bg-[#f5f0eb] dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-100 font-body">
            {/* Header */}
            <header className="sticky top-0 z-50 px-4 md:px-8 h-14 flex justify-between items-center backdrop-blur-3xl bg-white/60 dark:bg-black/20 border-b border-black/[0.04] dark:border-white/10"
                style={{ WebkitBackdropFilter: 'blur(48px) saturate(180%)' }}
            >
                <Link
                    href="/"
                    className="flex items-center space-x-3 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
                        <span className="text-white dark:text-black font-bold text-lg select-none">G</span>
                    </div>
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-orange-400 transition-all duration-300">GlassPDF</h1>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to App
                </Link>
            </header>

            {/* Page content */}
            <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                {children}
            </main>

            {/* Minimal footer */}
            <footer className="border-t border-black/[0.04] dark:border-white/5 py-8 text-center text-xs text-slate-400 dark:text-slate-600 font-medium">
                © {new Date().getFullYear()} GlassPDF — Privacy First, Always Local.
            </footer>
        </div>
    );
}
