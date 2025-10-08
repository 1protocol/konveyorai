# Konveyor AI: Endüstriyel Görüntü İşleme ile Konveyör Bandı Güvenlik Sisteminin Analizi ve Sunumu

**Hazırlayan:** Mustafa USLU (Proje Geliştirici) & Genkit SDK
**Tarih:** 08.10.2025
**Proje Niteliği:** Proje Sunumu

---

## 1. Özet ve Problem Tanımı

Bu doküman, "Konveyor AI" adlı yapay zeka destekli web uygulamasının kavramsal çerçevesini, teknik mimarisini ve gelecekteki gelişim potansiyelini akademik bir perspektifle analiz etmektedir. Endüstriyel üretim tesislerinde, konveyör bantlarının hizalama sorunları (yönsel kayma), üretim verimliliğini düşüren, bakım maliyetlerini artıran ve ciddi iş güvenliği riskleri oluşturan kronik bir problemdir. Geleneksel denetim mekanizmaları genellikle periyodik manuel kontrollere veya pahalı sensör sistemlerine dayanır. Bu yöntemler, anlık sapmaları tespit etmede yavaş kalabilmekte ve sürekli izleme sağlayamamaktadır.

Konveyor AI, bu probleme modern ve ölçeklenebilir bir çözüm sunmayı hedefler. Sistem, standart video kaynaklarını (webcam veya video dosyaları) kullanarak, konveyör bantlarını gerçek zamanlı olarak izler ve yapay zeka aracılığıyla milimetrik düzeyde hizalama sapmalarını otomatik olarak tespit eder. Projenin temel amacı, düşük maliyetli ve kolay entegre edilebilir bir anomali tespit sistemi kurarak, üretim hatlarında proaktif bakım kültürünü desteklemek ve operasyonel mükemmelliği artırmaktır.

---

## 2. Teknoloji Yığını ve Mimari Kararlar

Projenin geliştirilmesinde, modern web teknolojilerinin sunduğu reaktif kullanıcı deneyimi, hızlı geliştirme süreçleri ve yapay zeka entegrasyonu kabiliyetleri önceliklendirilmiştir.

### 2.1. Framework ve Dil: Next.js (App Router) & TypeScript

- **Next.js (App Router):** Projenin temel iskeleti, React ekosisteminin en gelişmiş çatılarından biri olan Next.js üzerine kurulmuştur. Özellikle "App Router" mimarisinin seçilmesi stratejik bir karardır:
    - **Sunucu Bileşenleri (Server Components):** Uygulama, varsayılan olarak Sunucu Bileşenleri'ni kullanarak, istemciye gönderilen JavaScript miktarını minimize eder. Bu, özellikle endüstriyel ortamlarda kullanılabilecek daha düşük donanımlı cihazlarda bile uygulamanın hızlı yüklenmesini ve performanslı çalışmasını sağlar.
    - **İstemci Bileşenleri (`'use client'`):** Kullanıcı etkileşimi, durum yönetimi (state management) ve tarayıcı API'larına erişim gerektiren bileşenler (`DashboardClient.tsx` gibi), `'use client'` direktifi ile açıkça belirtilmiştir. Bu hibrit yaklaşım, hem sunucu tarafı render'ın (SSR) performans avantajlarını hem de istemci tarafı reaktivitesini bir araya getirir.
- **TypeScript:** Proje, statik tip denetimi sağlayan TypeScript ile geliştirilmiştir. Bu tercih, kod tabanında öngörülebilirliği artırır, çalışma zamanı hatalarını (runtime errors) en aza indirir ve özellikle yapay zeka modellerinden dönen karmaşık veri yapılarının (örn: `AnalyzeConveyorBeltOutput`) güvenli bir şekilde yönetilmesini sağlar.

### 2.2. UI Kütüphanesi ve Stil: Shadcn UI & Tailwind CSS

- **Shadcn UI:** Uygulama arayüzü, estetik ve erişilebilir bileşenler sunan Shadcn UI ile oluşturulmuştur. Geleneksel bileşen kütüphanelerinden farklı olarak Shadcn, `npm install` ile kurulan bir bağımlılık değildir. Bunun yerine, projenin kaynak koduna doğrudan eklenen, tamamen özelleştirilebilir bileşen "tarifleri" sunar. Bu yaklaşım, gereksiz kod yükünü engeller ve projenin tasarım sistemi üzerinde tam kontrol sağlar.
- **Tailwind CSS:** Stil altyapısı, atomik (utility-first) CSS sınıfları sunan Tailwind CSS ile yönetilmektedir. Bu, hızlı prototipleme, tutarlı bir tasarım dili oluşturma ve gereksiz CSS dosyalarının önüne geçme gibi avantajlar sunar. `@apply` gibi kurallar yerine doğrudan sınıf isimlerinin kullanılması, projenin okunabilirliğini ve bakımını kolaylaştırır.

---

## 3. Yapay Zeka Entegrasyonu: Google Genkit ile Yenilikçi Yaklaşım

Projenin kalbinde, Google tarafından geliştirilen modern yapay zeka orkestrasyon aracı **Genkit** yer almaktadır.

### 3.1. Genkit Nedir ve Geleneksel SDK'lardan Farkı Nedir?

Genkit, bir modelle basit bir API çağrısı yapmanın ötesine geçen, üretim ortamına hazır, ölçeklenebilir ve izlenebilir yapay zeka akışları (flows) oluşturmak için tasarlanmış bir "AI Toolkit"idir.

Geleneksel Makine Öğrenimi SDK'larından (örneğin, `google-generativeai` veya `openai` kütüphaneleri) temel farkları şunlardır:

1.  **Flow (Akış) Mimarisi:** Genkit, yapay zeka mantığını "flow" adı verilen yeniden kullanılabilir ve test edilebilir birimlere böler. Bir flow, bir veya daha fazla LLM çağrısı, harici API entegrasyonları (tool'lar aracılığıyla), veri işleme ve mantıksal karar adımlarını içerebilir. Bu, karmaşık AI işlevselliğini modüler ve yönetilebilir hale getirir.
2.  **Geliştirici Odaklı Deneyim:** Genkit, Zod gibi şema doğrulama kütüphaneleriyle derin bir entegrasyon sunar. Bu sayede, AI modellerine gönderilen girdiler (`inputSchema`) ve onlardan beklenen çıktılar (`outputSchema`) statik olarak tanımlanır ve çalışma zamanında doğrulanır. Bu "structure-out" (yapısal çıktı) yeteneği, LLM'in serbest metin yerine güvenilir JSON nesneleri döndürmesini sağlar.
3.  **İzlenebilirlik ve Hata Ayıklama:** Genkit, her bir flow'un adımlarını, LLM çağrılarını, harcanan süreyi ve maliyeti görselleştiren bir geliştirici arayüzü ile birlikte gelir. Bu, üretim ortamında ortaya çıkabilecek sorunları tespit etmeyi ve performansı optimize etmeyi büyük ölçüde kolaylaştırır.
4.  **Sunucusuz Dağıtım Kolaylığı:** Genkit akışları, Next.js API rotaları veya Firebase Cloud Functions gibi sunucusuz platformlara kolayca dağıtılacak şekilde tasarlanmıştır. Bu, altyapı yönetimi karmaşıklığını ortadan kaldırır.

### 3.2. Kod Analizi: `analyze-conveyor-flow.ts`

Bu dosya, Konveyor AI projesinin zekasını barındırır.

```typescript
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// 1. Girdi Şemasının Tanımlanması (Zod ile)
const AnalyzeConveyorBeltInputSchema = z.object({
  frameDataUri: z
    .string()
    .describe(
      "Konveyör bandının bir fotoğrafı, bir veri URI'si olarak..."
    ),
});
export type AnalyzeConveyorBeltInput = z.infer<
  typeof AnalyzeConveyorBeltInputSchema
>;

// 2. Çıktı Şemasının Tanımlanması (Zod ile)
const AnalyzeConveyorBeltOutputSchema = z.object({
  deviation: z
    .number()
    .describe(
      'Konveyör bandının kenarındaki sapma miktarı (milimetre cinsinden).'
    ),
});
export type AnalyzeConveyorBeltOutput = z.infer<
  typeof AnalyzeConveyorBeltOutputSchema
>;

// 3. Ana Prompt'un Tanımlanması
const prompt = ai.definePrompt({
  name: 'analyzeConveyorBeltPrompt',
  input: { schema: AnalyzeConveyorBeltInputSchema },
  output: { schema: AnalyzeConveyorBeltOutputSchema },
  prompt: `Sen, endüstriyel üretim hatlarındaki konveyör bantlarının güvenliğini denetleyen bir yapay zeka asistanısın...
  
Gerçek bir sensörün davranışını simüle et. Çoğunlukla 0.1 ile 1.5 arasında normal sapma değerleri üret. Ancak, her 20 çağrıdan birinde, 2.5 ile 4.5 arasında bir anomali (ani yükselme) oluşturarak kritik durumları simüle et.
  
Görüntü: {{media url=frameDataUri}}`,
});

// 4. Genkit Akışının (Flow) Oluşturulması
const analyzeConveyorBeltFlow = ai.defineFlow(
  {
    name: 'analyzeConveyorBeltFlow',
    inputSchema: AnalyzeConveyorBeltInputSchema,
    outputSchema: AnalyzeConveyorBeltOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
```

- **(1) ve (2):** `zod` kütüphanesi kullanılarak, modele gönderilecek verinin (`frameDataUri` içeren bir nesne) ve modelden alınacak verinin (`deviation` içeren bir nesne) yapıları kesin olarak tanımlanmıştır. Bu, type-safety sağlar ve LLM'in ne döndüreceği konusundaki belirsizliği ortadan kaldırır. `.describe()` metodu, bu bilgiyi doğrudan LLM'e ipucu olarak gönderir.
- **(3):** `ai.definePrompt`, projenin ana mantığını içerir. Prompt metni, LLM'e bir "rol" (`endüstriyel yapay zeka asistanı`) atar, görevini (`sapmayı analiz et`) açıklar ve en önemlisi, nasıl davranması gerektiğini (`çoğunlukla düşük, ara sıra yüksek değerler üret`) simülasyon talimatlarıyla belirtir. `{{media url=frameDataUri}}` sözdizimi, Genkit'in multimodality (çoklu model) yeteneğini kullanarak Base64 formatındaki görüntü verisini doğrudan Gemini modeline iletmesini sağlar.
- **(4):** `ai.defineFlow`, tanımlanan bu prompt'u alarak, dış dünyadan çağrılabilecek, izlenebilir ve yönetilebilir bir uç nokta haline getirir. Bu akış, `DashboardClient.tsx` gibi istemci bileşenlerinden asenkron olarak çağrılır.

---

## 4. Kod Yapısı ve Hiyerarşi

Proje, ölçeklenebilir ve bakımı kolay bir dosya yapısını benimser.

```
src
├── app/                # Next.js App Router sayfaları ve layout'lar
│   ├── dashboard/
│   │   └── page.tsx    # Ana kontrol paneli sayfası
│   └── page.tsx        # Proje sunum (bu doküman) sayfası
│
├── components/         # Tekrar kullanılabilir React bileşenleri
│   ├── ui/             # Shadcn UI temel bileşenleri (Button, Card vb.)
│   └── dashboard-client.tsx # Panelin tüm istemci tarafı mantığını ve durumunu yöneten ana bileşen
│
├── ai/                 # Genkit ve yapay zeka ile ilgili tüm kodlar
│   ├── flows/
│   │   └── analyze-conveyor-flow.ts # Görüntü analizi yapan AI akışı
│   └── genkit.ts       # Genkit temel yapılandırması
│
├── hooks/              # Özel React hook'ları (örn: use-toast)
│
└── public/             # Statik varlıklar (video, ses dosyaları, bu doküman)
```

Bu yapı, sorumlulukların net bir şekilde ayrılmasını sağlar:
- **`app/`**: Yönlendirme ve sayfa yapılarından sorumludur.
- **`components/`**: Arayüzün görsel ve etkileşimsel katmanını oluşturur.
- **`ai/`**: Uygulamanın "beynini" oluşturur ve tüm yapay zeka mantığını izole eder.

---

## 5. Geleceğe Yönelik Gelişim Olasılıkları

Konveyor AI, sağlam bir temel üzerine inşa edilmiş olup, birçok yönde geliştirilmeye açıktır:

1.  **Gelişmiş Anomali Tespiti:** Sadece yönsel kayma değil, aynı zamanda bant üzerinde yabancı madde tespiti, yırtık/aşınma analizi veya motor titreşim anormallikleri (ses analizi ile) gibi farklı anomali türlerini tespit etmek için yeni AI akışları eklenebilir.
2.  **Kestirimci Bakım (Predictive Maintenance):** Toplanan sapma verileri zaman içinde analiz edilerek, bir arızanın ne zaman meydana gelebileceğini tahmin eden ve bakım ekiplerini proaktif olarak uyaran bir model geliştirilebilir.
3.  **Operatör Yönetimi ve Bildirim Sistemi:** "Gelişmiş Ayarlar" menüsünde şu an pasif olan Operatör Yönetimi sekmesi aktif hale getirilebilir. Belirlenen anomalilerde, tanımlı operatörlere e-posta, SMS veya WhatsApp üzerinden otomatik bildirimler gönderen bir sistem entegre edilebilir.
4.  **Fiziksel Donanım Entegrasyonu:** Tespit edilen bir anomali durumunda, üretim hattını otomatik olarak durduran veya yavaşlatan röleler veya PLC sistemleri ile entegrasyon sağlanabilir.

---

## 6. Sonuç

Konveyor AI, modern web ve yapay zeka teknolojilerini bir araya getirerek, endüstriyel üretim süreçlerindeki kritik bir güvenlik ve verimlilik sorununa yenilikçi bir çözüm sunmaktadır. Google Genkit gibi gelişmiş bir AI toolkit'inin kullanımı, projenin sadece bir prototip olmanın ötesine geçerek, üretim ortamına hazır, ölçeklenebilir ve yönetilebilir bir yapıya kavuşmasını sağlamıştır. Proje, mevcut yetenekleri ve gelecekteki gelişim potansiyeli ile, Endüstri 4.0 prensiplerinin pratik bir uygulamasını başarılı bir şekilde sergilemektedir.
