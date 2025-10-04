"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DeveloperGuidePage() {
  return (
    <div className="h-screen w-screen">
      <main className="h-full w-full">
        <iframe
          src="/DEVELOPER_GUIDE.html"
          className="h-full w-full border-0"
          title="Konveyor AI Developer Guide"
        />
      </main>
    </div>
  );
}
