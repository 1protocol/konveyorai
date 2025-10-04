"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { marked } from 'marked';
import { Loader, Map, Cpu, Layers, ShieldCheck, LayoutDashboard, Bot, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Asenkron olarak markdown içeriğini getiren fonksiyon
async function getMarkdownContent() {
  try {
    const res = await fetch('/README.md');
    if (!res.ok) {
        // We will just return an empty string if the file is not found
        return '';
    }
    const markdown = await res.text();
    return marked(markdown);
  } catch (e) {
    // Also return empty string on network error etc.
    return '';
  }
}

export default function DocumentationPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMarkdownContent()
      .then(html => {
        setHtmlContent(html);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <main className="container mx-auto px-4 pt-12 pb-12">
        
        <Card className="mb-12 bg-card/50 border-border/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Bot className="h-12 w-12 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Konveyor AI</CardTitle>
                        <CardDescription>Proaktif Üretim Kontrol Ünitesi / Konveyör Bant Hıza dedektörü Teknik İstasyon Süreç Analizi ve Eylem İstatistik Raporlama</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex">
                    <strong className="w-32 shrink-0 text-muted-foreground">Proje Adı:</strong>
                    <span>Konveyor AI</span>
                </div>
                <div className="flex">
                    <strong className="w-32 shrink-0 text-muted-foreground">Proje Amacı:</strong>
                    <span>Endüstriyel konveyör bant sapmalarını yapay zeka ile proaktif olarak tespit etmek, anormal durumları anında bildirerek riskleri yönetmek ve üretim süreçlerinde sürdürülebilir verimlilik sağlamak.</span>
                </div>
                <div className="flex">
                    <strong className="w-32 shrink-0 text-muted-foreground">Geliştirici:</strong>
                    <span>Adınız Soyadınız</span>
                </div>
            </CardContent>
        </Card>

        <Card className="mb-8 bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <Cpu className="h-7 w-7 text-accent"/>
                    Donanım Opsiyonları ve Operasyonel Etki
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Konveyor AI, farklı donanım konfigürasyonlarına esnek bir şekilde uyum sağlar. Sistem, standart bir web kamerasından endüstriyel IP kameralara kadar geniş bir yelpazede görüntü kaynaklarıyla çalışabilir. Benzer şekilde, analiz işlemleri bulut tabanlı güçlü GPU'larda veya Edge cihazlarda (örn: NVIDIA Jetson, Raspberry Pi) yerel olarak çalıştırılabilir. Bu esneklik, projenin bütçe, gecikme süresi (latency) ve mevcut altyapı gibi operasyonel gereksinimlere göre optimize edilmesine olanak tanır.
                </p>
            </CardContent>
        </Card>

        <Card className="mb-8 bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <Layers className="h-7 w-7 text-accent"/>
                    Endüstri 4.0 Standartlarına Uyum
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Konveyor AI, Endüstri 4.0'ın temel taşları olan siber-fiziksel sistemler konseptiyle tam uyum içinde çalışır. Gerçek zamanlı veri toplama, yapay zeka ile bu veriyi anlık olarak işleme ve otonom uyarı mekanizmaları oluşturma yeteneği, onu akıllı fabrikaların modüler bir bileşeni haline getirir. Sistem, üretim hattından topladığı verilerle şeffaflık sağlar ve merkezi olmayan karar alma süreçlerini destekleyerek operasyonel verimliliği artırır.
                </p>
            </CardContent>
        </Card>

        <Card className="mb-8 bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <ShieldCheck className="h-7 w-7 text-accent"/>
                    Kalite ve Risk Yönetimi
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Konveyor AI, üretim sürecindeki anomalileri anında tespit ederek proaktif bir risk yönetimi sağlar. Hatalı hizalanmış bir bant, ürün kalitesinin düşmesine, ham madde israfına ve hatta üretim hattının tamamen durmasına neden olabilir. Sistemimiz, bu tür riskleri erken aşamada belirleyerek operasyonel verimliliği artırır, plansız duruş sürelerini azaltır ve nihai ürün kalitesini güvence altına alır. Bu sayede, olası büyük maliyetli arızaların ve üretim kayıplarının önüne geçilir.
                </p>
            </CardContent>
        </Card>

        <Card className="mb-8 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <LayoutDashboard className="h-7 w-7 text-accent" />
              İstasyon Tespit, Modelleme ve Raporlama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sistem, tüm konveyör bant istasyonlarını merkezi bir "Teknik Kontrol Merkezi" üzerinden yönetme imkanı sunar. Bu merkez, her bir istasyondan gelen canlı verileri anlık olarak izler, zaman içindeki sapma verilerini modeller ve bu verilerden yönetimsel raporlar oluşturur. Bu sayede, hangi istasyonun ne sıklıkla bakıma ihtiyaç duyduğu, en verimli çalışma parametrelerinin ne olduğu gibi stratejik kararlar, somut verilere dayandırılarak alınabilir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="h-7 w-7 text-accent" />
              Geliştirici Kılavuzu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Teknik Dokümantasyon</h4>
              <p className="text-muted-foreground">
                Proje, modern ve ölçeklenebilir web teknolojileri üzerine inşa edilmiştir. Temel yapı taşları şunlardır:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><strong>Next.js (App Router):</strong> Performanslı ve SEO dostu bir React framework'ü.</li>
                <li><strong>Google Genkit (Gemini):</strong> Görüntü analizi için kullanılan güçlü yapay zeka altyapısı.</li>
                <li><strong>Shadcn UI & Tailwind CSS:</strong> Hızlı ve estetik arayüz geliştirmesi için modern bir UI kütüphanesi ve stil çerçevesi.</li>
                <li><strong>TypeScript:</strong> Kod kalitesini ve sürdürülebilirliği artıran statik tip denetimi.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Dosya Yapısı</h4>
              <p className="text-muted-foreground">
                Projenin modüler yapısı, geliştirmeyi ve bakımı kolaylaştırır. Ana dizinler ve işlevleri:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><code className="text-xs bg-secondary px-1 py-0.5 rounded">src/app/dashboard:</code> Ana kontrol panelinin yer aldığı ana sayfa.</li>
                <li><code className="text-xs bg-secondary px-1 py-0.5 rounded">src/components:</code> Tekrar kullanılabilir React bileşenleri. Özellikle <code className="text-xs bg-secondary px-1 py-0.5 rounded">dashboard-client.tsx</code> tüm istemci tarafı mantığını içerir.</li>
                <li><code className="text-xs bg-secondary px-1 py-0.5 rounded">src/ai/flows:</code> Görüntü analizi yapan Genkit AI akışlarının bulunduğu yer.</li>
                <li><code className="text-xs bg-secondary px-1 py-0.5 rounded">public:</code> Test videosu ve uyarı sesleri gibi statik dosyaların saklandığı dizin.</li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-lg mb-2">İşlevsel Özellikler</h4>
              <p className="text-muted-foreground">
                Sistemin çekirdek işlevleri, belirli dosyalar tarafından yönetilir:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><strong>Yapay Zeka Analizi:</strong> <code className="text-xs bg-secondary px-1 py-0.5 rounded">analyze-conveyor-flow.ts</code> dosyası, bir görüntüdeki sapmayı analiz etmek için Gemini modelini kullanan Genkit akışını tanımlar.</li>
                <li><strong>Kontrol Paneli Mantığı:</strong> <code className="text-xs bg-secondary px-1 py-0.5 rounded">dashboard-client.tsx</code>, video akışını yönetir, periyodik olarak AI analizini tetikler, sonuçları görselleştirir ve anomali durumunda uyarılar oluşturur.</li>
                <li><strong>Dinamik Ayarlar:</strong> Gelişmiş ayarlar menüsü, kullanıcıların anomali eşiği, istasyon yönetimi ve bildirim tercihleri gibi parametreleri <code className="text-xs bg-secondary px-1 py-0.5 rounded">localStorage</code> kullanarak dinamik olarak yapılandırmasına olanak tanır.</li>
              </ul>
            </div>
          </CardContent>
        </Card>


        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center mt-20">
            <Loader className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Proje dokümanı yükleniyor...</p>
          </div>
        )}
        {!isLoading && htmlContent && (
          <article
            className="prose prose-invert prose-lg max-w-none 
                       prose-h1:font-heading prose-h2:font-heading prose-h3:font-heading
                       prose-headings:text-primary prose-headings:font-bold prose-headings:border-b prose-headings:border-border/50 prose-headings:pb-2
                       prose-a:text-accent prose-a:transition-colors hover:prose-a:text-accent/80
                       prose-strong:text-foreground
                       prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground
                       prose-code:bg-secondary prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:text-sm
                       prose-pre:bg-secondary prose-pre:p-4 prose-pre:rounded-lg
                       prose-img:rounded-lg prose-img:border prose-img:border-border
                       prose-table:border prose-table:border-border/50
                       prose-th:border prose-th:border-border/50 prose-th:p-2
                       prose-td:border prose-td:border-border/50 prose-td:p-2"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </main>
    </div>
  );
}

    

    