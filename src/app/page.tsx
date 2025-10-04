
"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, ScanLine, SlidersHorizontal, PanelLeft } from "lucide-react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: "Otomatik Referans ve AI Analizi",
      description: "Sistem, ilk çalıştırıldığında bandın konumunu otomatik olarak referans alır ve bu referanstan sapmaları yapay zeka ile tespit eder.",
    },
    {
      icon: <ScanLine className="h-8 w-8 text-primary" />,
      title: "Gerçek Zamanlı Görselleştirme",
      description: "Canlı video akışı üzerine eklenen dinamik algılama çizgileri ile referans noktasını ve anlık sapmayı görsel olarak gösterir.",
    },
    {
      icon: <SlidersHorizontal className="h-8 w-8 text-primary" />,
      title: "Dinamik Yapılandırma",
      description: "Anomali hassasiyetini, istasyonları ve uyarı ayarlarını 'Gelişmiş Ayarlar' menüsünden kolayca yönetin.",
    },
     {
      icon: <PanelLeft className="h-8 w-8 text-primary" />,
      title: "Çoklu İstasyon Desteği",
      description: "Birden fazla konveyör bandını (istasyon) ayrı ayrı ekleyin, isimlendirin ve her birini tek bir arayüzden izleyin.",
    },
  ];

  const techStack = [
    "Next.js",
    "Google Genkit",
    "Tailwind CSS",
    "Shadcn UI",
    "TypeScript",
    "Lucide React"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/30 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
             <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg">ConveyorAI</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
             <Button asChild variant="ghost" className="hover:bg-primary/20 hover:text-white">
                <Link href="/dashboard">
                    Kontrol Paneli
                </Link>
             </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
         {/* Background Glows */}
        <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/50 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/50 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Hero Section */}
        <section className="container grid place-items-center gap-8 py-20 text-center md:py-32">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">
              Proaktif Üretim Yönetimi
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Bu proje, endüstriyel konveyör bantlarındaki yönsel kayma sorunlarını, harici bir veri seti olmadan, kendi kendine referanslama yaparak tespit eden bir yapay zeka yazılımıdır.
            </p>
          </div>
          <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              Kontrol Panelini Görüntüle <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-12 py-16 md:py-24">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Projenin Temel Yetenekleri</h2>
            <p className="mt-4 text-muted-foreground">
              Sistemin fonksiyonel gereksinimleri karşılayan temel özellikleri.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: '1200px' }}>
            {features.map((feature) => (
              <Card key={feature.title} className="card-3d magic-card text-center bg-background/30 backdrop-blur-xl border-transparent shadow-lg">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 card-icon">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-white/5 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Sistemin Çalışma Mimarisi</h2>
                <p className="mt-4 text-muted-foreground">
                    Sistem, 3 temel adımda analiz ve tespit gerçekleştirir.
                </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/20 border border-white/10 transition-all hover:border-white/20 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">1</div>
                <h3 className="mt-6 text-xl font-semibold">Otomatik Referans</h3>
                <p className="mt-2 text-muted-foreground">Yazılım başlatıldığında, ilk görüntüden otomatik olarak bir referans konumu çıkarır ve sistemi kalibre eder.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/20 border border-white/10 transition-all hover:border-white/20 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">2</div>
                <h3 className="mt-6 text-xl font-semibold">Sürekli Analiz</h3>
                <p className="mt-2 text-muted-foreground">Yapay zeka, bant kenarlarını sürekli takip eder ve mevcut konumu referansla milimetrik hassasiyetle karşılaştırır.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/20 border border-white/10 transition-all hover:border-white/20 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">3</div>
                <h3 className="mt-6 text-xl font-semibold">Anomali Tespiti ve Uyarı</h3>
                <p className="mt-2 text-muted-foreground">Sapma, belirlenen eşiği aşarsa sistem anında görsel/sesli uyarı üretir ve olayı kaydeder.</p>
              </div>
            </div>
          </div>
        </section>
        
         {/* Tech Stack Section */}
        <section id="tech-stack" className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Kullanılan Teknolojiler</h2>
                    <p className="mt-4 text-muted-foreground">
                        Projenin geliştirilmesinde kullanılan teknolojiler ve kütüphaneler.
                    </p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-x-8">
                    {techStack.map((tech) => (
                        <div key={tech} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 transition-colors hover:bg-white/10">
                             <span className="text-sm font-medium text-muted-foreground">{tech}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container flex h-16 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} &copy; ConveyorAI Projesi
          </p>
        </div>
      </footer>
    </div>
  );
}
