
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
    { name: "Next.js", logo: "/tech/nextjs.svg" },
    { name: "Genkit", logo: "/tech/genkit.svg" },
    { name: "Tailwind CSS", logo: "/tech/tailwind.svg" },
    { name: "Shadcn UI", logo: "/tech/shadcn.svg" },
    { name: "TypeScript", logo: "/tech/typescript.svg" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">ConveyorAI</span>
          </div>
          <nav className="flex items-center gap-4">
             <Button asChild>
                <Link href="/dashboard">
                    Kontrol Paneli <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid place-items-center gap-8 py-20 text-center md:py-32">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">
              Proaktif Üretim Güvenliği
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ConveyorAI, yapay zeka ile konveyör bantlarınızdaki kayma sorunlarını anında tespit ederek üretim verimliliğinizi ve güvenliğinizi artırır.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Hemen Başlayın <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-12 py-16 md:py-24">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Temel Yetenekler</h2>
            <p className="mt-4 text-muted-foreground">
              ConveyorAI'ı endüstriyel izleme için güçlü bir çözüm yapan özellikler.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
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
        <section id="how-it-works" className="bg-muted py-16 md:py-24">
          <div className="container">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Nasıl Çalışır?</h2>
                <p className="mt-4 text-muted-foreground">
                    Sistemimiz, 3 basit adımda üretiminizi güvence altına alır.
                </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">1</div>
                <h3 className="mt-6 text-xl font-semibold">Otomatik Referans</h3>
                <p className="mt-2 text-muted-foreground">Yazılım başlatıldığında, ilk görüntüden otomatik olarak bir referans konumu çıkarır ve sistemi kalibre eder.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">2</div>
                <h3 className="mt-6 text-xl font-semibold">Sürekli Analiz</h3>
                <p className="mt-2 text-muted-foreground">Yapay zeka, bant kenarlarını sürekli takip eder ve mevcut konumu referansla milimetrik hassasiyetle karşılaştırır.</p>
              </div>
              <div className="flex flex-col items-center text-center">
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
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Teknoloji Yığını</h2>
                    <p className="mt-4 text-muted-foreground">
                        ConveyorAI'ı hayata geçiren modern ve güçlü teknolojiler.
                    </p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12">
                    {techStack.map((tech) => (
                        <div key={tech.name} className="flex flex-col items-center gap-2">
                             <img src={tech.logo} alt={tech.name} className="h-12 w-12 dark:invert" />
                             <span className="text-sm font-medium text-muted-foreground">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex h-16 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ConveyorAI. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
