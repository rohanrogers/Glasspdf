import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'GlassPDF | Privacy First PDF Tools  Merge, Split, Compress and psd preview',
  description: 'Privacy first PDF tools that run entirely in your browser. Merge, split, compress, view, and convert PDFs locally. No uploads. No servers. Fully secure.',
  openGraph: {
    title: 'GlassPDF | Privacy First PDF Tools  Merge, Split, Compress and psd preview',
    description: 'Privacy first PDF tools that run entirely in your browser. Merge, split, compress, view, and convert PDFs locally. No uploads. No servers. Fully secure.',
    url: 'https://glasspdf.pages.dev/',
    siteName: 'GlassPDF',
    images: [
      {
        url: 'https://glasspdf.pages.dev/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GlassPDF - Privacy-First Document Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlassPDF | Privacy First PDF Tools  Merge, Split, Compress and psd preview',
    description: 'Privacy first PDF tools that run entirely in your browser. Merge, split, compress, view, and convert PDFs locally. No uploads. No servers. Fully secure.',
    images: ['https://glasspdf.pages.dev/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body text-slate-900 overflow-hidden bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
