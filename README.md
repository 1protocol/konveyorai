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

Bu projenin temel amacı, bu soruna modern bir çözüm sunmaktır. **Konveyor AI**, kamera görüntülerini (canlı IP kamera, video dosyası, USB kamera vb.) gerçek zamanlı olarak analiz ederek konveyör bantlarındaki hizalama bozukluklarını ve sapmaları milimetrik düzeyde tespit eder.

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

- **Bağlama Duyarlı Kontrol Paneli:** Her istasyon, kendi özel kontrol merkezine sahiptir. Canlı izleme ekranının altındaki sekmeli yapı sayesinde, o istasyona özel **Canlı Veri**, **İstasyon Ayarları** ve **AI Yapılandırması** gibi tüm kritik araçlara anında erişim sağlanır.
- **Gerçek Zamanlı AI Analizi:** Canlı video akışları veya video dosyaları üzerinden anlık görüntü işleme ve sapma tespiti.
- **Proaktif Anomali Tespiti:** Her istasyon için ayrı ayrı yapılandırılabilen bir eşik değerini aşan sapmaları "anomali" olarak sınıflandırma.
- **Akıllı İstasyon Yönetimi:** Ağdaki kameraları otomatik olarak "tarama" ve sisteme tek tıkla ekleme yeteneği. Ayrıca, farklı kaynak türleri (IP Kamera, Webcam, Video Dosyası) için gelişmiş manuel ekleme seçenekleri.
- **Anlık Uyarı Mekanizması:** Anomali durumunda operatörleri bilgilendirmek için sesli bildirimler.
- **Esnek Kaynak Desteği:** IP kameralar (RTSP/HTTP), USB/Dahili web kameraları ve video dosyaları gibi çok çeşitli video kaynaklarıyla tam uyumluluk.

## 3. Geliştirici Kılavuzu

### Projeyi Yerel Makinede Çalıştırma

Projeyi yerel geliştirme ortamınızda başlatmak için aşağıdaki adımları izleyebilirsiniz:

1.  **API Anahtarını Yapılandırın:**
    Projenin ana dizininde `.env` adında bir dosya oluşturun. İçine, [Google AI Studio](https://aistudio.google.com/app/apikey) adresinden alacağınız Gemini API anahtarınızı aşağıdaki formatta ekleyin:
    ```
    GEMINI_API_KEY=YENI_API_ANAHTARINIZ
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

Bu komutlardan sonra uygulama `http://localhost:9002` adresinde çalışmaya başlayacaktır.

### Teknik Notlar

- **Merkezi Bileşen Mimarisi:** Kontrol panelinin tüm mantığı `src/components/dashboard-client.tsx` dosyasındaki `DashboardClient` bileşeni tarafından yönetilir. Bu bileşen, istasyon ve ayar durumlarını yönetir, video analizini tetikler ve kullanıcı arayüzünü günceller.
- **Yapay Zeka Akışı:** Görüntü analizi yapan Genkit akışı `src/ai/flows/analyze-conveyor-flow.ts` dosyasında tanımlanmıştır. Bu akış, bir görüntü verisini (data URI) alıp, içerisindeki konveyör sapma miktarını milimetre cinsinden döndüren bir Gemini modelini kullanır.
- **Bağlama Duyarlı Yapılandırma:** Tüm ayarlar (anomali eşiği, istasyon kaynakları, sesli uyarı durumu vb.), artık her istasyonun kendi panelindeki sekmeler (`İstasyon Ayarları`, `AI Yapılandırması`) üzerinden yönetilir. Bu, global bir ayarlar sayfasını ortadan kaldırarak daha modüler ve sezgisel bir yönetim sağlar. Tüm yapılandırmalar, tarayıcının `localStorage`'ında saklanarak kalıcılık sağlanır.
- **Akıllı İstasyon Yönetimi:** Ağ tarama ve manuel istasyon ekleme özellikleri, `Dialog` bileşenleri kullanılarak modern ve etkileşimli bir kullanıcı deneyimi sunar. Bu mantık da `DashboardClient` içerisinde yönetilmektedir.
