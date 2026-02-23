import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | GlassPDF',
    description: 'GlassPDF is a privacy-first document tool that runs entirely on your device.',
};

export default function AboutPage() {
    return (
        <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">About Us</h1>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-orange-400 dark:to-amber-500" />
            </div>

            <div className="space-y-6 text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                    GlassPDF is a privacy-first document tool created by an independent developer with a simple goal: to give users full control over their files.
                </p>

                <p>
                    Unlike traditional online tools, GlassPDF runs entirely on your device. Your files are never uploaded, never stored, and never leave your computer. This ensures maximum privacy, faster performance, and complete security.
                </p>

                <p>
                    GlassPDF is designed to be lightweight, fast, and reliable. By using local processing, it eliminates waiting times and protects sensitive documents from external access.
                </p>

                <p>
                    GlassPDF is completely free to use and works directly in your browser, providing a seamless and modern experience.
                </p>

                <p>
                    This is just the beginning. More applications are planned, all built on the same core principle: local-first processing and privacy-focused design in the AI era.
                </p>

                <p className="font-semibold text-slate-700 dark:text-slate-200">
                    GlassPDF exists to prove that powerful tools do not need access to your data to be useful.
                </p>
            </div>
        </article>
    );
}
