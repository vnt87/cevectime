"use client";

import { Github, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { toast } = useToast();

  return (
    <footer className="py-4 text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <span>Made with</span>
          <Heart className="h-4 w-4 fill-primary text-primary" />
          <span>by</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText("vu.nam@sun-asterisk.com");
              toast({
                description: "Email copied to clipboard!",
              });
            }}
            className="text-primary hover:underline"
          >
            vu.nam@sun-asterisk.com
          </button>
        </div>
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
  );
}
