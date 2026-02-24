import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Open Source Licenses | GlassPDF',
    description: 'Licenses and attributions for all third-party components used.',
    robots: {
        index: false,
        follow: true,
    }
};

export default function LicensesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
