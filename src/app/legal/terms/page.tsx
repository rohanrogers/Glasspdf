import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions | GlassPDF',
    description: 'Terms and Conditions governing the use of GlassPDF.',
    robots: {
        index: false,
        follow: true,
    }
};

export default function TermsPage() {
    return (
        <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Terms and Conditions</h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Last Updated: 2026</p>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-orange-400 dark:to-amber-500" />
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 space-y-6 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-3">
                <p>
                    These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and GlassPDF (&ldquo;GlassPDF,&rdquo; &ldquo;Service,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your access to and use of the GlassPDF website, application, software, tools, and related functionality, features, content, and services (collectively, the &ldquo;Service&rdquo;). By accessing, installing, loading, executing, or otherwise using the Service in any manner, you acknowledge and agree that you have read, understood, and accepted these Terms in their entirety. If you do not agree, you must immediately discontinue use of the Service.
                </p>

                <h2>Local Processing</h2>
                <p>
                    GlassPDF is designed and provided as a locally executed software utility intended to operate primarily within the user&rsquo;s own device environment, including but not limited to the user&rsquo;s browser, operating system, memory, storage, and processing hardware. Under normal and intended operation, files selected, opened, processed, converted, compressed, viewed, or otherwise interacted with using the Service—including but not limited to PDF files, PSD files, image files, and other supported document formats—are processed locally within the user&rsquo;s device environment and are not intentionally transmitted, uploaded, stored, retained, or otherwise transferred to external servers operated by GlassPDF. GlassPDF is designed with a privacy-first philosophy and is architected to minimize or eliminate external file transmission wherever technically feasible. GlassPDF does not intentionally collect, store, analyze, access, monitor, retain, or transmit the content of files processed by the user through the Service during normal use.
                </p>

                <h2>Security Disclaimer</h2>
                <p>
                    Notwithstanding the foregoing design philosophy and intended operation, the user acknowledges and agrees that GlassPDF does not and cannot guarantee absolute security, confidentiality, or integrity of user files or device environments. The security and privacy of user files depend on numerous factors beyond the control of GlassPDF, including but not limited to the user&rsquo;s operating system integrity, browser implementation, device hardware security, installed software, network environment, system vulnerabilities, third-party software interactions, malware presence, unauthorized system access, or other external factors. GlassPDF disclaims any and all responsibility for unauthorized access, data exposure, data loss, file corruption, or privacy incidents arising from factors outside its direct and intended software execution context.
                </p>

                <h2>Disclaimer of Warranties</h2>
                <p>
                    GlassPDF is provided on an &ldquo;as-is,&rdquo; &ldquo;as-available,&rdquo; and &ldquo;with all faults&rdquo; basis, without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted operation, accuracy, reliability, availability, compatibility, or security. To the maximum extent permitted by applicable law, GlassPDF and its developer shall not be liable for any direct, indirect, incidental, consequential, special, exemplary, punitive, or other damages, including but not limited to damages arising from loss of data, loss of privacy, data exposure, file corruption, system malfunction, software defects, third-party software interactions, browser vulnerabilities, operating system vulnerabilities, device failures, or any other technical or non-technical cause, regardless of foreseeability or prior notice.
                </p>

                <h2>Third-Party Components</h2>
                <p>
                    The Service incorporates, depends upon, and interacts with various third-party software libraries, open-source components, frameworks, engines, and related technologies licensed under their respective licenses, including but not limited to MIT, Apache-2.0, ISC, and similar permissive licenses. GlassPDF does not claim ownership of such third-party components. All ownership, intellectual property rights, and licensing rights remain with their respective authors and licensors. GlassPDF makes no representations, warranties, or guarantees regarding the behavior, reliability, security, or performance of such third-party components and shall not be held responsible for defects, vulnerabilities, limitations, malfunctions, or security issues arising from third-party software components.
                    The user expressly acknowledges that GlassPDF does not guarantee that the Service will be error-free, uninterrupted, secure, or free of defects. Software systems are inherently complex, and unforeseen errors, incompatibilities, or unexpected behaviors may occur. The user assumes full responsibility for maintaining backups of important files and ensuring the security of their device environment.
                </p>

                <h2>Privacy</h2>
                <p>
                    GlassPDF is designed with the intention of prioritizing user privacy and local processing. Under intended operation, files processed using GlassPDF remain on the user&rsquo;s device and do not leave the device environment through intentional action by GlassPDF. GlassPDF does not intentionally collect, store, or transmit user file contents, including PDF documents, PSD images, or other supported file formats. However, GlassPDF makes no absolute guarantee against events arising from factors outside the intended software design, including but not limited to device compromise, malicious software, browser vulnerabilities, or operating system vulnerabilities.
                </p>

                <h2>Modifications</h2>
                <p>
                    GlassPDF reserves the right to modify, update, suspend, or discontinue the Service, in whole or in part, at any time, with or without notice. GlassPDF shall not be liable for any modification, suspension, or discontinuation of the Service.
                </p>

                <h2>User Acknowledgment</h2>
                <p>
                    By using the Service, the user acknowledges and agrees that the Service is provided in good faith, with the intention of enabling local, privacy-focused document processing. The user further acknowledges that GlassPDF does not claim ownership over user files, user content, or user data, and that all file processing occurs under the user&rsquo;s control within the user&rsquo;s own device environment. GlassPDF does not claim ownership of third-party software components integrated into the Service.
                </p>

                <h2>Indemnification</h2>
                <p>
                    To the fullest extent permitted by law, the user agrees to indemnify, defend, and hold harmless GlassPDF and its developer from any and all claims, damages, liabilities, losses, costs, or expenses arising from or related to the user&rsquo;s use of the Service.
                </p>

                <h2>Acceptance</h2>
                <p>
                    By continuing to use the Service, the user acknowledges and accepts that GlassPDF is designed with privacy as a core principle and is intended to operate locally without intentionally transmitting user files externally, while also acknowledging that absolute guarantees cannot be provided due to factors beyond direct software control.
                </p>

                <p className="font-semibold text-slate-700 dark:text-slate-300 pt-4">
                    GlassPDF exists with the genuine intention of providing privacy-respecting tools that operate locally and prioritize user control over data.
                </p>
            </div>
        </article>
    );
}
