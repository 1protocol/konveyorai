"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeveloperGuidePage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Geliştirici Kılavuzu
          </h1>
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kontrol Paneline Dön
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <iframe
          src="/DEVELOPER_GUIDE.html"
          className="w-full h-full border-0"
          title="ConveyorAI Developer Guide"
        />
      </main>
    </div>
  );
}
