# ConveyorAI - Yapay Zeka Destekli Konveyör Bandı Güvenlik Sistemi

ConveyorAI, endüstriyel üretim hatlarındaki konveyör bantlarını gerçek zamanlı olarak izleyen ve yapay zeka kullanarak olası yönsel kayma (kayıklık) sorunlarını otomatik olarak tespit eden modern bir web uygulamasıdır. Bu sistem, harici bir veri seti olmaksızın, çalışmaya başladığında kendi referansını oluşturarak üretim hattı güvenliğini artırmak ve olası arızaları önceden tahmin etmek için geliştirilmiştir.

## ✨ Temel Özellikler

- **🤖 Otomatik Referans ve AI Destekli Analiz:** Sistem ilk çalıştırıldığında, bantın mevcut konumunu otomatik olarak bir başlangıç referansı olarak kaydeder. Canlı video akışını sürekli analiz ederek konveyör bandının bu referanstan sapmalarını milimetre cinsinden tespit eder.
- **📹 Gerçek Zamanlı Görselleştirme:** Canlı video akışı üzerine eklenen dinamik çizgilerle, yapay zekanın referans noktasını ve anlık sapmayı nasıl ölçtüğünü görsel olarak gösterir.
- **⚙️ Çoklu İstasyon Yönetimi:** Birden fazla konveyör bandını (istasyon) ayrı ayrı izleme ve yönetme imkanı sunar. Her istasyonun anlık durumu, ana panelden veya kenar çubuğundan kolayca seçilebilir.
- **⚠️ Anomali Tespiti ve Uyarı:** Kullanıcı tarafından belirlenen sapma eşik değeri (örn: 2mm) aşıldığında anında "Anomali" durumu oluşturur ve sesli/görsel uyarılar verir.
- **🔧 Dinamik Yapılandırma:** Kullanıcılar, "Gelişmiş Ayarlar" menüsünden aşağıdaki parametreleri dinamik olarak yönetebilir:
    - **İstasyon Yönetimi:** Yeni konveyör bantları (istasyonlar) ekleme, isimlendirme ve video kaynağını (webcam veya dosya yolu) atama.
    - **Hassasiyet Ayarı:** Anomali olarak kabul edilecek sapma eşiğini (mm cinsinden) ayarlama.
    - **AI Kalibrasyonu:** Tek tıklamayla yapay zeka modelinin başlangıç referans noktasını yeniden oluşturma.
    - **Sesli Uyarılar:** Anomali uyarı sesini açıp kapatma.
- **📈 Anomali Kayıtları:** Tespit edilen tüm anormal sapmalar, istasyon bilgisi, zaman damgası ve sapma değeriyle birlikte bir kayıt defterine eklenir.
- **🌓 Açık ve Koyu Tema:** Kullanıcı tercihine göre aydınlık ve karanlık mod arasında geçiş yapılabilir.

## 🚀 Kullanılan Teknolojiler

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Dil:** [TypeScript](https://www.typescriptlang.org/)
- **Yapay Zeka:** [Google Genkit](https://firebase.google.com/docs/genkit) (Gemini modeli ile)
- **UI Kütüphanesi:** [Shadcn UI](https://ui.shadcn.com/)
- **Stil:** [Tailwind CSS](https://tailwindcss.com/)
- **İkonlar:** [Lucide React](https://lucide.dev/)

## 📂 Proje Yapısı

Projenin temel dosya ve klasör yapısı aşağıda açıklanmıştır:

```
.
├── src
│   ├── app/                # Next.js App Router sayfaları ve ana layout
│   │   ├── layout.tsx
│   │   └── page.tsx        # Ana kontrol paneli ve kenar çubuğu yerleşimi
│   │
│   ├── components/         # Tekrar kullanılabilir React bileşenleri
│   │   ├── ui/             # Shadcn UI temel bileşenleri
│   │   ├── dashboard-client.tsx # Panelin ana istemci tarafı mantığı
│   │   └── theme-toggle.tsx     # Açık/Koyu tema değiştirici
│   │
│   ├── ai/                 # Genkit ve yapay zeka ile ilgili kodlar
│   │   ├── flows/
│   │   │   └── analyze-conveyor-flow.ts # Görüntü analizi yapan AI akışı
│   │   └── genkit.ts       # Genkit yapılandırması
│   │
│   ├── hooks/              # Özel React hook'ları (örn: use-toast)
│   │
│   ├── lib/                # Yardımcı fonksiyonlar (örn: cn)
│
├── public/                 # Statik varlıklar (video, ses dosyaları)
│   ├── conveyor-video.mp4  # Varsayılan test videosu
│   └── alert-sound.mp3     # Anomali uyarı sesi
│
├── package.json            # Proje bağımlılıkları ve script'ler
└── tailwind.config.ts      # Tailwind CSS yapılandırması
```

## 🏁 Başlangıç

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

Uygulama varsayılan olarak `http://localhost:9002` adresinde çalışmaya başlayacaktır.
