
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DeveloperGuidePage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="font-semibold text-primary transition-colors hover:text-foreground"
            >
              Geliştirici Kılavuzu
            </Link>
            <Link
              href="/DEVELOPER_GUIDE.html#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Kullanım Özellikleri
            </Link>
          </nav>
          <Button asChild variant="default">
            <Link href="/dashboard">
              Operasyon Paneli
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <iframe
          src="/DEVELOPER_GUIDE.html"
          className="w-full h-full border-0"
          title="Konveyor AI Developer Guide"
        />
      </main>
    </div>
  );
}
