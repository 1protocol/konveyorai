# ConveyorAI - Yapay Zeka Destekli Konveyör Bandı Güvenlik Sistemi

ConveyorAI, endüstriyel üretim hatlarındaki konveyör bantlarını gerçek zamanlı olarak izleyen ve yapay zeka kullanarak olası sapmaları tespit eden modern bir web uygulamasıdır. Bu sistem, üretim hattı güvenliğini artırmak ve olası arızaları önceden tahmin etmek için geliştirilmiştir.

## ✨ Temel Özellikler

- **🤖 Yapay Zeka Destekli Analiz:** Canlı video akışını analiz ederek konveyör bandının kenarlarındaki hizalama bozukluklarını ve sapmaları milimetre cinsinden tespit eder.
- **📹 Gerçek Zamanlı İzleme:** Konveyör bandının anlık durumunu gösteren bir canlı izleme paneli sunar.
- **⚠️ Anomali Tespiti ve Uyarı:** Belirlenen eşik değeri aşıldığında (örneğin, 2mm'den fazla sapma) anında "Anomali" durumu oluşturur ve kullanıcıyı uyarır.
- **🔧 Ayarlanabilir Hassasiyet:** Kullanıcılar, anomali olarak kabul edilecek sapma eşiğini gelişmiş ayarlar menüsünden dinamik olarak değiştirebilir.
- **🔊 Sesli Uyarılar:** Anomali tespit edildiğinde, operatörleri bilgilendirmek için sesli bir uyarı sistemi bulunur. Bu özellik ayarlardan kapatılabilir.
- **📈 Anomali Kayıtları:** Tespit edilen tüm anormal sapmalar, zaman damgası ve sapma değeriyle birlikte bir kayıt defterine eklenir.
- **🔄 AI Kalibrasyonu:** Yapay zeka modelinin referans noktalarını yeniden ayarlamak için tek tıklamayla kalibrasyon işlemi başlatılabilir.
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
│   │   └── page.tsx        # Ana kontrol paneli sayfası
│   │
│   ├── components/         # Tekrar kullanılabilir React bileşenleri
│   │   ├── ui/             # Shadcn UI temel bileşenleri
│   │   ├── dashboard-client.tsx # Panelin ana istemci tarafı mantığı
│   │   ├── theme-toggle.tsx     # Açık/Koyu tema değiştirici
│   │   └── user-nav.tsx         # Kullanıcı menüsü
│   │
│   ├── ai/                 # Genkit ve yapay zeka ile ilgili kodlar
│   │   ├── flows/
│   │   │   └── analyze-conveyor-flow.ts # Görüntü analizi yapan AI akışı
│   │   └── genkit.ts       # Genkit yapılandırması
│   │
│   ├── hooks/              # Özel React hook'ları
│   │   ├── use-toast.ts    # Bildirim (toast) sistemi
│   │   └── use-mobile.ts   # Mobil cihaz tespiti
│   │
│   ├── lib/                # Yardımcı fonksiyonlar ve statik veriler
│   │   └── utils.ts        # Genel yardımcı fonksiyonlar (örn: cn)
│
├── public/                 # Statik varlıklar (resimler, videolar, sesler)
│   ├── conveyor-video.mp4  # Test için kullanılan konveyör videosu
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
