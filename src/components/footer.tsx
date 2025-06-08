"use client";

import { Github, Heart, Sheet, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { toast } = useToast();

  return (
    <footer className="py-3 text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-center gap-1">
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
        <div className="flex items-center gap-2">
          <a
            href="https://docs.google.com/spreadsheets/d/1nttZ7yp3lVnIxNagFxPLp9HkIb-Rq3tO_1FmibAJPy8/edit?gid=1644704473#gid=1644704473"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Sheet className="h-4 w-4" />
            <span>Time Tracker Spreadsheet</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span>•</span>
          <a
            href="https://github.com/vnt87/cevectime"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>Source Code</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
