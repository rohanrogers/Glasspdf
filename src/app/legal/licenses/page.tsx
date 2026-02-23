"use client";

import React, { useState, useEffect } from 'react';
import type { Metadata } from 'next';

export default function LicensesPage() {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/THIRD-PARTY-NOTICES.txt')
            .then((res) => res.text())
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch(() => {
                setContent('Failed to load license information.');
                setLoading(false);
            });
    }, []);

    return (
        <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Open Source Licenses</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    GlassPDF is built with open-source software. Below are the licenses and attributions for all third-party components used.
                </p>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-orange-400 dark:to-amber-500" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 dark:border-t-orange-400 rounded-full animate-spin" />
                </div>
            ) : (
                <pre className="bg-white/50 dark:bg-zinc-900/50 border border-black/[0.04] dark:border-white/5 rounded-2xl p-6 md:p-8 text-xs md:text-sm font-mono text-slate-700 dark:text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {content}
                </pre>
            )}

            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                The full notices file is also available at{' '}
                <a href="/THIRD-PARTY-NOTICES.txt" className="underline hover:text-blue-500 dark:hover:text-orange-400 transition-colors" target="_blank" rel="noopener noreferrer">
                    /THIRD-PARTY-NOTICES.txt
                </a>
            </p>
        </article>
    );
}
