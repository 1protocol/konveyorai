# Konveyor AI Projesi

**Proje Adı:** Konveyor AI
**Proje Amacı:** Endüstriyel konveyör bant sapmalarını yapay zeka ile proaktif olarak tespit ederek, anormal durumları anında bildirmek, riskleri yönetmek ve üretim süreçlerinde sürdürülebilir verimlilik sağlamak.
**Geliştirici:** Mustafa USLU

---

## 🚀 Projeye Genel Bakış

Konveyor AI, endüstriyel üretim hatlarındaki konveyör bantlarının hizalama durumunu gerçek zamanlı olarak izleyen, yapay zeka tabanlı bir anomali tespit sistemidir. Sistem, kamera görüntülerinden aldığı verileri işleyerek bant üzerindeki milimetrik sapmaları dahi tespit eder ve belirlenen eşik değerleri aşıldığında anında uyarılar oluşturur.

Bu proaktif yaklaşım sayesinde, üretimde yaşanabilecek aksaklıkların, ürün kalitesi sorunlarının ve iş güvenliği risklerinin önüne geçilmesi hedeflenmektedir.

## 🛠️ Teknik Altyapı ve Mimarisi

Proje, modern ve ölçeklenebilir teknolojiler kullanılarak geliştirilmiştir:

-   **Frontend:** Next.js (App Router), React, TypeScript, Shadcn UI, Tailwind CSS
-   **AI & Görüntü İşleme:** Google Genkit (Gemini 2.5 Flash)
-   **UI/UX:** Duyarlı (Responsive) tasarım, gerçek zamanlı veri görselleştirme (Recharts), karanlık mod desteği.

### Dosya Yapısı

Projenin modüler ve anlaşılır bir dosya yapısı vardır:

-   `src/app/dashboard`: Kontrol panelinin ana bileşenlerini ve mantığını içerir.
-   `src/components`: Arayüzde kullanılan tekrar edilebilir UI bileşenlerini barındırır.
-   `src/ai/flows`: Görüntü analizi yapan yapay zeka akışlarının (Genkit flows) tanımlandığı yerdir.
-   `public`: Test videoları, uyarı sesleri gibi statik varlıklar burada tutulur.

## ✨ Öne Çıkan Özellikler

-   **Gerçek Zamanlı Anomali Tespiti:** Kamera görüntülerinden konveyör bandındaki sapmaları anlık olarak analiz eder.
-   **Dinamik Eşik Değeri:** Kullanıcı tarafından ayarlanabilen sapma eşiği ile anomali hassasiyeti yönetilebilir.
-   **Çoklu İstasyon Desteği:** Birden fazla konveyör bandı (istasyon) tanımlanabilir ve izlenebilir.
-   **Görsel ve Sesli Uyarılar:** Anomali durumunda hem ekranda belirgin bir uyarı hem de sesli bir ikaz verir.
-   **Veri Görselleştirme:** Sapma verilerini zaman serisi grafiği ile anlık olarak görselleştirir.
-   **Anomali Kayıtları:** Tespit edilen her anomali, zaman damgası ve sapma değeri ile birlikte kaydedilir.
-   **Esnek Video Kaynağı:** Hem önceden kaydedilmiş video dosyaları hem de canlı webcam görüntüleri ile çalışabilir.
-   **Gelişmiş Ayarlar:** Kalibrasyon, istasyon yönetimi ve bildirim tercihleri gibi birçok ayar kullanıcı tarafından yapılandırılabilir.

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/path/to/your/repo.git
    cd konveyor-ai
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Geliştirme Sunucusunu Başlatın:**
    Uygulamayı ve Genkit sunucusunu aynı anda başlatmak için:
    ```bash
    npm run dev
    ```

4.  **Uygulamaya Erişin:**
    Tarayıcınızda `http://localhost:9002` adresini ziyaret edin.

## 🔮 Gelecek Planları

-   [ ] **Operatör Yönetimi:** Kullanıcı rolleri ve yetkilendirme.
-   [ ] **Gelişmiş Raporlama:** Periyodik anomali raporları (PDF, Excel).
-   [ ] **Bildirim Entegrasyonları:** E-posta, SMS ve anlık mesajlaşma uygulamaları (WhatsApp, Telegram) ile entegrasyon.
-   [ ] **Bulut Tabanlı Veri Depolama:** Anomali loglarının ve ayarların bulutta saklanması (örn: Firebase Firestore).
-   [ ] **Otomatik Ağ Taraması:** Ağdaki IP kameralarını otomatik olarak bularak istasyon eklemeyi kolaylaştırma.
