import type { Metadata } from 'next';
import { Bai_Jamjuree } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"; // Added ThemeProvider
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';

const baiJamjuree = Bai_Jamjuree({ // Changed font
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-bai-jamjuree', // Added variable for Tailwind
});

export const metadata: Metadata = {
  title: 'CEVEC TimeLord',
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
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
