<div align="center">
  <img src="public/konveyor-ai-logo.png" alt="Konveyor AI Logo" width="150">
  <h1>Konveyor AI</h1>
  <p>Yapay zeka destekli proaktif konveyör bandı izleme ve anomali tespit sistemi.</p>

  <p>
    <a href="#about">Proje Hakkında</a> •
    <a href="#features">Temel Özellikler</a> •
    <a href="#tech-stack">Teknoloji Mimarisi</a> •
    <a href="#setup">Kurulum ve Çalıştırma</a> •
    <a href="#file-structure">Dosya Yapısı</a> •
    <a href="#login">Giriş Bilgileri</a>
  </p>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Genkit](https://img.shields.io/badge/Genkit-2D30B2?style=for-the-badge&logo=googlecloud&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

</div>

---

## <a name="about"></a>📖 Proje Hakkında

**Konveyor AI**, endüstriyel üretim hatlarındaki verimliliği ve iş güvenliğini artırmak amacıyla geliştirilmiş, yapay zeka tabanlı bir anomali tespit sistemidir. Geleneksel reaktif bakım yöntemlerinin neden olduğu üretim kayıplarını ve güvenlik risklerini ortadan kaldırmayı hedefler. Sistem, canlı video akışlarını veya mevcut video dosyalarını **Google Gemini** modeliyle analiz ederek, konveyör bantlarındaki milimetrik sapmaları dahi gerçek zamanlı olarak tespit eder. Belirlenen kritik eşik aşıldığında operatörleri anında uyararak proaktif müdahaleye olanak tanır.

Bu proje, sadece bir hata tespit aracı olmanın ötesinde, üretim süreçlerini daha akıllı, öngörülebilir ve verimli hale getiren modern bir endüstriyel otomasyon çözümüdür.

## <a name="features"></a>✨ Temel Özellikler

- **Gerçek Zamanlı AI Analizi:** Canlı video akışları (webcam, IP kamera) veya video dosyaları üzerinden anlık sapma tespiti.
- **Proaktif Anomali Tespiti:** Kullanıcı tarafından ayarlanabilen hassasiyet eşiğini aşan sapmaları anında yakalama.
- **Merkezi Yönetim Paneli:** Tüm konveyör istasyonlarını tek bir modern ve duyarlı arayüzden izleme ve yönetme.
- **Anlık Uyarı Mekanizması:** Anomali durumunda operatörleri bilgilendirmek için sesli ve görsel bildirimler.
- **Kullanıcı Kimlik Doğrulama:** Kontrol paneline erişim için geliştirilmiş güvenli giriş sistemi.
- **Gelişmiş Operatör Yönetimi:** Sisteme operatör ekleme, düzenleme ve silme işlemleri için tam kapsamlı bir arayüz.
- **Esnek İstasyon Yönetimi:** Ağdaki kameraları tarayarak veya manuel olarak yeni izleme istasyonları ekleme imkanı.
- **Gerçek Zamanlı Veri Görselleştirme:** `Recharts` ile anlık sapma verilerini gösteren dinamik grafikler.
- **AI Kalibrasyon Modülü:** Sistem hassasiyetini bant üzerindeki fiziksel değişikliklere göre yeniden ayarlama yeteneği.
- **Duyarlı (Responsive) Tasarım:** Masaüstü, tablet ve mobil cihazlarda kusursuz bir kullanıcı deneyimi.

## <a name="tech-stack"></a>🛠️ Teknoloji Mimarisi

Konveyor AI, modern, performanslı ve ölçeklenebilir bir web uygulaması oluşturmak için en güncel teknolojilerden yararlanır:

- **Frontend:**
  - **Next.js (App Router):** Sunucu-taraflı render (SSR) ve statik site oluşturma (SSG) yetenekleriyle yüksek performanslı bir React arayüzü.
  - **React & TypeScript:** Güçlü, tip-güvenli ve bileşen tabanlı kullanıcı arayüzleri oluşturmak için.
  - **Tailwind CSS & Shadcn/ui:** Hızlı, estetik ve tamamen özelleştirilebilir bir tasarım sistemi.
  - **Recharts:** Etkileşimli ve gerçek zamanlı veri görselleştirme grafikleri için.

- **Backend & AI:**
  - **Genkit (Google AI):** Google Gemini modelini kullanarak görüntü analizi ve anomali tespiti yapan yapay zeka akışlarının (flows) yönetimi.
  - **Next.js Server Actions:** API endpoint'leri oluşturmadan form gönderimleri ve veri mutasyonları için sunucu tarafı mantığı.

- **Genel Yapı:**
  - **Merkezi Durum Yönetimi:** Tüm uygulama durumu (`stations`, `settings`, `operators`), `app/dashboard/page.tsx` bileşeninde merkezi olarak yönetilir ve `localStorage` ile senkronize edilir. Bu durum, alt bileşenlere `prop`'lar aracılığıyla dağıtılarak karmaşıklık azaltılır ve veri akışı tek yönlü hale getirilir.
  - **Kimlik Doğrulama:** `React Context` (`auth/context.tsx`) aracılığıyla yönetilen, istemci tarafı basit ve etkili bir oturum yönetimi.

## <a name="setup"></a>🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

- [Node.js](https://nodejs.org/en/) (v18 veya üstü)
- [npm](https://www.npmjs.com/) veya [yarn](https://yarnpkg.com/)

### Kurulum Adımları

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/KULLANICI_ADINIZ/konveyorai.git
    cd konveyorai
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **API Anahtarını Yapılandırın:**
    Projenin ana dizininde `.env` adında bir dosya oluşturun. İçerisine, [Google AI Studio](https://aistudio.google.com/app/apikey) adresinden alacağınız **Gemini API anahtarınızı** ekleyin.
    ```env
    GEMINI_API_KEY=YENI_API_ANAHTARINIZ_BURAYA_GELECEK
    ```

4.  **Geliştirme Sunucusunu Başlatın:**
    Uygulamayı ve Genkit geliştirme sunucusunu aynı anda başlatmak için:
    ```bash
    npm run dev
    ```
    Bu komut, Next.js uygulamasını `http://localhost:9002` adresinde başlatacaktır.

Uygulama artık tarayıcınızda çalışmaya hazır!

## <a name="login"></a>🔑 Giriş Bilgileri

Uygulama, temel bir kimlik doğrulama sistemi kullanır. Kontrol paneline erişmek için aşağıdaki demo kimlik bilgilerini kullanabilirsiniz:

- **Kullanıcı Adı:** `admin`
- **Şifre:** `gemini123`

## <a name="file-structure"></a>📂 Dosya Yapısı ve Mimarisi

Proje, modüler ve bakımı kolay bir dosya yapısı üzerine kurulmuştur.

```
konveyorai/
├── 📁 ai/                  # Genkit yapay zeka akışları ve yapılandırması
│   ├── 📁 flows/          # AI analiz mantığını içeren akışlar
│   │   └── analyze-conveyor-flow.ts
│   ├── dev.ts             # Geliştirme ortamı için Genkit akışlarını yükler
│   └── genkit.ts          # Genkit'i ve Gemini modelini yapılandırır
├── 📁 app/                 # Next.js App Router ana dizini
│   ├── 📁 dashboard/      # Kontrol paneli sayfası ve mantığı
│   │   └── page.tsx
│   ├── 📁 login/          # Giriş sayfası
│   │   └── page.tsx
│   ├── globals.css        # Global stiller ve Tailwind katmanları
│   ├── layout.tsx         # Ana layout bileşeni
│   └── page.tsx           # Ana karşılama sayfası (Landing Page)
├── 📁 auth/                # Kimlik doğrulama mantığı
│   └── context.tsx        # AuthContext ve oturum yönetimi
├── 📁 components/          # Paylaşılan React bileşenleri
│   ├── 📁 ui/              # Shadcn/ui tarafından oluşturulan bileşenler
│   └── dashboard-client.tsx # Dashboard'un ana istemci bileşeni
├── 📁 hooks/               # Özel React kancaları (use-toast, use-mobile)
├── 📁 lib/                 # Yardımcı fonksiyonlar ve kütüphane entegrasyonları
│   └── utils.ts           # Genel yardımcı fonksiyonlar (cn)
├── 📁 public/              # Statik dosyalar (video, resimler, ikonlar)
│   ├── conveyor-video.mp4 # Demo video
│   └── alert-sound.mp3    # Uyarı sesi
├── next.config.ts         # Next.js yapılandırma dosyası
├── package.json           # Proje bağımlılıkları ve script'leri
├── tailwind.config.ts     # Tailwind CSS yapılandırması
└── README.md              # Bu dosya
```

---
<div align="center">
  <p>© 2025 Mustafa USLU - Proje Sunumu</p>
</div>
