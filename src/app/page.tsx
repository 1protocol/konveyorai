
"use client";
import Link from 'next/link';
import { ArrowRight, Bot, Cpu, Layers, ShieldCheck, Video, BrainCircuit, Bell, FileText, Download, Github, User, Rocket } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Icons.logo className="size-9 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Konveyor AI</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            Kontrol Paneli <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        
         {/* Developer Profile Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 gap-8 items-center">
            <div>
                <div className="magic-card p-6 border-white/10">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <User className="text-accent"/>
                            <span>Mustafa USLU</span>
                        </CardTitle>
                        <CardDescription>
                            Full-Stack AI Developer
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="space-y-2">
                             <h4 className="font-semibold flex items-center gap-2"><Rocket className="text-accent/80 w-5 h-5"/>Proje Sunumu</h4>
                             <p className="text-muted-foreground text-base">
                                "Bu proje, endüstriyel verimliliği ve iş güvenliğini bir araya getiren bir mühendislik vizyonunun somut bir çıktısıdır. Konveyor AI ile amacım, reaktif bakımın getirdiği üretim kayıplarını ortadan kaldırmak ve yapay zeka destekli proaktif analizlerle 'sıfır duruş' hedefine bir adım daha yaklaşmaktır. Bu sistem, sadece bir anomali tespit aracı değil, aynı zamanda daha akıllı ve öngörülebilir bir üretim geleceğine yapılan bir yatırımdır."
                             </p>
                        </div>
                    </CardContent>
                </div>
            </div>
          </div>
        </section>


        {/* Main Presentation Card */}
        <section className="mb-16">
            <div className="card-3d group">
                <div className="card-3d-inner p-8 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 shadow-lg card-icon">
                        <Bot className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Konveyor AI: Endüstriyel Konveyör Analizi
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                        Yapay zeka destekli proaktif anomali tespiti ile üretim hatlarında verimlilik ve güvenlik.
                    </p>
                </div>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Problem Statement */}
            <div className="magic-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <FileText className="text-accent"/>
                        <span>Tanımı ve Amaç</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-muted-foreground">
                        Endüstriyel üretim hatlarındaki konveyör bantlarında meydana gelen hizalama sorunları, ani duruşlara, üretim kayıplarına ve yüksek bakım maliyetlerine yol açmaktadır. Geleneksel denetim yöntemleri bu tür sapmaları proaktif olarak tespit etmekte yetersiz kalmaktadır.
                    </p>
                    <Separator/>
                     <p className="text-foreground/90">
                        Bu projenin amacı, yapay zeka kullanarak konveyör bantlarındaki milimetrik sapmaları gerçek zamanlı olarak tespit eden, anormal durumları anında bildiren ve bu sayede üretim süreçlerinde sürdürülebilir verimlilik sağlayan proaktif bir izleme sistemi geliştirmektir.
                    </p>
                </CardContent>
            </div>
            {/* Solution */}
             <div className="magic-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <BrainCircuit className="text-accent"/>
                         <span>Çözüm: Konveyor AI</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Konveyor AI, canlı kamera görüntülerini veya video dosyalarını Genkit tabanlı bir yapay zeka modeli ile analiz eder. Sistem, konveyör bandının kenarındaki hizalama bozukluklarını ve sapmaları sürekli olarak ölçer.
                    </p>
                    <p className="text-muted-foreground">
                        Belirlenen eşik değerini (örneğin 2mm) aşan bir sapma tespit edildiğinde, sistem otomatik olarak bir "anomali" durumu tetikler, bu durumu kaydeder ve operatörleri sesli/görsel uyarılarla bilgilendirir.
                    </p>
                </CardContent>
            </div>
        </div>

        {/* Combined Technical Section */}
        <section className="mb-16">
             <div className="magic-card border-white/10">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold tracking-tight mb-2">Teknik ve İşlevsel Çerçeve</CardTitle>
                    <CardDescription className="text-center">Sistemin temelini oluşturan teknolojiler ve ana yetenekler.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Tech Stack */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-accent flex items-center gap-2"><Layers/> Teknoloji Mimarisi</h3>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            <li><strong>Next.js (App Router):</strong> Modern, sunucu-taraflı render edilmiş React arayüzü.</li>
                            <li><strong>Genkit (Gemini Modeli):</strong> Görüntü analizi ve sapma tespiti için yapay zeka altyapısı.</li>
                            <li><strong>Shadcn UI & Tailwind CSS:</strong> Esnek ve estetik kullanıcı arayüzü bileşenleri.</li>
                            <li><strong>TypeScript:</strong> Kod kalitesi ve güvenilirliği için statik tip denetimi.</li>
                            <li><strong>Recharts:</strong> Gerçek zamanlı veri görselleştirmeleri ve grafikler.</li>
                        </ul>
                    </div>

                    {/* Core Features */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-accent flex items-center gap-2"><ShieldCheck/> Temel Yetenekler</h3>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            <li><strong>Gerçek Zamanlı AI Analizi:</strong> Canlı video akışları üzerinden anlık sapma tespiti.</li>
                            <li><strong>Proaktif Anomali Tespiti:</strong> Eşik değerini aşan sapmaları anında yakalama.</li>
                            <li><strong>Merkezi Yönetim Paneli:</strong> Tüm istasyonları tek bir arayüzden izleme ve yönetme.</li>
                            <li><strong>Anlık Uyarı Mekanizması:</strong> Anomali durumunda sesli ve görsel bildirimler.</li>
                            <li><strong>Esnek Kaynak Desteği:</strong> IP kameralar ve video dosyaları ile uyumluluk.</li>
                        </ul>
                    </div>
                </CardContent>
            </div>
        </section>

        {/* Developer Guide */}
        <section className="mb-16">
            <div className="magic-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <Github className="text-accent"/>
                        <span>Geliştirici Kılavuzu</span>
                    </CardTitle>
                    <CardDescription>
                        Proje hakkında teknik bilgiler ve başlangıç adımları.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Başlangıç</h3>
                        <p className="text-muted-foreground">
                            Projeyi yerel makinenizde çalıştırmak için aşağıdaki komutları terminalde çalıştırın. Gerekli bağımlılıklar otomatik olarak yüklenecektir.
                        </p>
                        <code className="block bg-black/50 border border-white/10 rounded-md px-4 py-2 mt-2 font-mono text-sm">
                            npm install &amp;&amp; npm run dev
                        </code>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Teknik Notlar</h3>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            <li><strong>Genkit SDK:</strong> Yapay zeka akışı <code className="text-xs">src/ai/flows/analyze-conveyor-flow.ts</code> dosyasında tanımlanmıştır. Bu akış, bir görüntü alıp sapma değeri döndüren bir Gemini modelini kullanır.</li>
                            <li><strong>Arayüz (Frontend):</strong> Kontrol paneli <code className="text-xs">src/app/dashboard/page.tsx</code> ve ana bileşen <code className="text-xs">src/components/dashboard-client.tsx</code> dosyalarındadır.</li>
                             <li><strong>Yapılandırma:</strong> Anomali eşiği, sesli uyarılar ve istasyon ayarları gibi temel konfigürasyonlar, kontrol panelindeki "Gelişmiş Ayarlar" bölümünden yönetilir ve tarayıcının <code className="text-xs">localStorage</code>'ında saklanır.</li>
                        </ul>
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <Button variant="outline" asChild>
                        <Link href="/README.md" target="_blank">
                             <Download className="mr-2"/> Proje Raporunu İncele
                        </Link>
                    </Button>
                </CardFooter>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 text-center">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Sistemi Deneyimlemeye Hazır mısınız?
            </h2>
            <p className="max-w-xl mx-auto text-muted-foreground mb-8">
                Konveyor AI'nin üretim süreçlerinizi nasıl daha akıllı ve güvenli hale getirebileceğini görmek için kontrol paneline geçiş yapın.
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
        <p>©2025 Mustafa USLU - Proje Sunumu</p>
      </footer>
    </div>
  );
}
