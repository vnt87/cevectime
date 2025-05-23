import type { Metadata } from 'next';
import { Bai_Jamjuree } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"; // Added ThemeProvider
import { cn } from '@/lib/utils';
import { Github } from 'lucide-react';

const baiJamjuree = Bai_Jamjuree({ // Changed font
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-bai-jamjuree', // Added variable for Tailwind
});

export const metadata: Metadata = {
  title: 'TimeSage',
  description: 'Timesheet Web App by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(baiJamjuree.variable, "font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <footer className="py-4 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <span>©2025 vu.nam@sun-asterisk.com</span>
                <a
                  href="https://github.com/vnt87/cevectime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>Source Code</span>
                </a>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
