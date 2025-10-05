
"use client";
import Link from 'next/link';
import { ArrowRight, Bot, Cpu, Layers, ShieldCheck, Video, BrainCircuit, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Icons.logo className="size-9 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Konveyor AI</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            Kontrol Paneli <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-12 w-12 text-primary" />
            </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Üretim Hattınızın Akıllı Gözü
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Endüstriyel konveyör bantlarındaki sapmaları yapay zeka ile anında tespit edin, üretimi güvence altına alın ve verimliliği en üst düzeye çıkarın.
          </p>
          <Button size="lg" asChild className="h-14 text-lg font-semibold group">
            <Link href="/dashboard">
              Hemen Başla
              <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Temel Yetenekler</h2>
            <p className="text-muted-foreground mt-2">Konveyor AI'ın sunduğu güçlü özellikleri keşfedin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BrainCircuit className="h-8 w-8 text-accent" />}
              title="Gerçek Zamanlı AI Analizi"
              description="Canlı video akışları üzerinden konveyör bandı durumunu saniyeler içinde analiz eder ve anlık geri bildirim sağlar."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-accent" />}
              title="Proaktif Anomali Tespiti"
              description="Belirlenen eşiği aşan en küçük sapmaları bile anında tespit ederek arızalar büyümeden önlem almanızı sağlar."
            />
            <FeatureCard
              icon={<Bell className="h-8 w-8 text-accent" />}
              title="Anlık Uyarı Mekanizması"
              description="Anomali durumunda sesli ve görsel uyarılar üreterek operatörlerin anında müdahale etmesine olanak tanır."
            />
            <FeatureCard
              icon={<Cpu className="h-8 w-8 text-accent" />}
              title="Esnek Donanım Desteği"
              description="Edge cihazlardan (NVIDIA Jetson, Raspberry Pi) bulut tabanlı GPU'lara kadar geniş bir donanım yelpazesiyle uyumludur."
            />
            <FeatureCard
              icon={<Layers className="h-8 w-8 text-accent" />}
              title="Merkezi Yönetim Paneli"
              description="Tüm istasyonları tek bir arayüzden izleyin, anomali kayıtlarını inceleyin ve sistem ayarlarını kolayca yönetin."
            />
            <FeatureCard
              icon={<Video className="h-8 w-8 text-accent" />}
              title="Çoklu Kaynak Desteği"
              description="IP kameralar, yerel video dosyaları veya standart web kameraları gibi farklı video kaynaklarını sisteme entegre edin."
            />
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16">
           <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Nasıl Çalışır?</h2>
            <p className="text-muted-foreground mt-2">Sadece üç basit adımda üretim hattınızı güvence altına alın.</p>
          </div>
          <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="absolute top-1/2 left-0 hidden h-0.5 w-full bg-border md:block"></div>
             <HowItWorksStep
                step="1"
                title="Görüntü Aktarımı"
                description="İstasyon kameralarından gelen canlı video akışı veya video dosyası sisteme aktarılır."
              />
              <HowItWorksStep
                step="2"
                title="Yapay Zeka Analizi"
                description="Genkit destekli AI modeli, her bir kareyi analiz ederek milimetrik sapmaları tespit eder."
              />
              <HowItWorksStep
                step="3"
                title="Tespit ve Bildirim"
                description="Anormal bir durum algılandığında, sistem anında görsel ve sesli uyarılar oluşturur."
              />
          </div>
        </section>


        {/* Tech Stack Section */}
        <section className="py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Teknoloji Mimarisi</h2>
                <p className="text-muted-foreground mt-2">Modern ve güçlü teknolojilerle geliştirildi.</p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <TechItem name="Next.js" />
                <TechItem name="Genkit" />
                <TechItem name="Tailwind CSS" />
                <TechItem name="TypeScript" />
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Verimliliği Artırmaya Hazır mısınız?
            </h2>
            <p className="max-w-xl mx-auto text-muted-foreground mb-8">
                Konveyor AI ile üretim süreçlerinizi daha akıllı, daha güvenli ve daha verimli hale getirin.
            </p>
             <Button size="lg" asChild className="h-14 text-lg font-semibold group">
                <Link href="/dashboard">
                    Kontrol Panelini Keşfet
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Konveyor AI. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-card/50 p-6 rounded-lg border border-border/50 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const TechItem = ({ name }: { name: string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card border border-border/50">
           <p className="text-sm font-bold">{name}</p>
        </div>
    </div>
);

const HowItWorksStep = ({ step, title, description }: { step: string, title: string, description: string }) => (
    <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-background text-2xl font-bold text-accent">
            {step}
        </div>
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);
