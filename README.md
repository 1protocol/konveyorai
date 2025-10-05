# Konveyor AI - Yapay Zeka Destekli Konveyör Analiz Sistemi

**Proje Geliştirici:** Mustafa USLU

---

## 1. Proje Tanımı ve Amacı

**Konveyor AI**, endüstriyel üretim hatlarındaki konveyör bantlarının verimliliğini ve güvenliğini artırmak amacıyla geliştirilmiş, yapay zeka tabanlı proaktif bir izleme ve anomali tespit sistemidir.

### Problem

Endüstriyel tesislerdeki konveyör bantlarında meydana gelen hizalama sorunları ve beklenmedik sapmalar;
- Ani üretim duruşlarına,
- Ciddi üretim kayıplarına,
- Yüksek bakım maliyetlerine,
- İş güvenliği risklerine yol açmaktadır.

Geleneksel denetim yöntemleri (gözle kontrol, periyodik bakım vb.), bu tür milimetrik ve anlık sapmaları proaktif olarak tespit etmekte genellikle yetersiz kalır.

### Çözüm ve Amaç

Bu projenin temel amacı, bu soruna modern bir çözüm sunmaktır. **Konveyor AI**, kamera görüntülerini (canlı IP kamera, video dosyası vb.) gerçek zamanlı olarak analiz ederek konveyör bantlarındaki hizalama bozukluklarını ve sapmaları milimetrik düzeyde tespit eder.

**Sistemin ana hedefleri:**
- Üretim süreçlerinde **öngörülebilir bakım** altyapısı oluşturmak.
- Ani duruşları ve arızaları önleyerek **üretim sürekliliğini** sağlamak.
- Bakım maliyetlerini düşürmek ve operasyonel verimliliği en üst düzeye çıkarmak.
- Anormal durumları anında tespit edip sesli/görsel uyarılarla operatörleri bilgilendirerek iş güvenliğini artırmak.

## 2. Teknik ve İşlevsel Çerçeve

### Teknoloji Mimarisi

Proje, modern ve ölçeklenebilir teknolojiler kullanılarak inşa edilmiştir:

- **Frontend:** Next.js (App Router) & React
- **Yapay Zeka:** Google Genkit (Gemini Modeli)
- **UI/UX:** Shadcn UI, Tailwind CSS, Recharts (Veri Görselleştirme)
- **Dil:** TypeScript
- **Platform:** Firebase App Hosting

### Temel Yetenekler

- **Gerçek Zamanlı AI Analizi:** Canlı video akışları veya video dosyaları üzerinden anlık görüntü işleme ve sapma tespiti.
- **Proaktif Anomali Tespiti:** Önceden belirlenmiş bir eşik değerini (örn: 2mm) aşan sapmaları "anomali" olarak sınıflandırma.
- **Merkezi Yönetim Paneli:** Tüm konveyör istasyonlarını tek bir arayüzden izleme, yapılandırma ve yönetme imkanı.
- **Anlık Uyarı Mekanizması:** Anomali durumunda operatörleri bilgilendirmek için sesli ve görsel bildirimler.
- **Esnek Kaynak Desteği:** IP kameralar ve video dosyaları gibi farklı video kaynaklarıyla uyumluluk.

## 3. Geliştirici Kılavuzu

### Projeyi Yerel Makinede Çalıştırma

Projeyi yerel geliştirme ortamınızda başlatmak için aşağıdaki adımları izleyebilirsiniz:

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

Bu komutlardan sonra uygulama `http://localhost:9002` adresinde çalışmaya başlayacaktır.

### Teknik Notlar

- **Yapay Zeka Akışı:** Görüntü analizi yapan Genkit akışı `src/ai/flows/analyze-conveyor-flow.ts` dosyasında tanımlanmıştır. Bu akış, bir görüntü verisini (data URI) alıp, içerisindeki konveyör sapma miktarını milimetre cinsinden döndüren bir Gemini modelini kullanır.
- **Arayüz (Frontend):** Kontrol paneli `src/app/dashboard/page.tsx` dosyasında yer alır ve ana mantığı yöneten istemci bileşeni `src/components/dashboard-client.tsx` dosyasıdır.
- **Yapılandırma:** Anomali eşiği, sesli uyarı durumu ve istasyon (kamera/video) ayarları gibi temel konfigürasyonlar, kontrol panelindeki "Gelişmiş Ayarlar" bölümünden yönetilir. Bu ayarlar, tarayıcının `localStorage`'ında saklanarak kalıcılık sağlanır.
