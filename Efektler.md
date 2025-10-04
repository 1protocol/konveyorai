# Tasarım Felsefesi ve Teknik Detaylar: "VR Cam Çerçeve" Efekti

Bu bölümde, Geliştirici Kılavuzu arayüzünde kullanılan modern "VR Cam Çerçeve" kart efektinin arkasındaki HTML ve CSS yapısını detaylandıracağız. Bu efekt, NFT kartlarından ve fütüristik kullanıcı arayüzlerinden ilham alınarak tasarlanmıştır.

## 1. Katmanlı HTML Yapısı

Efektin temelini, iç içe geçmiş iki katmanlı bir HTML yapısı oluşturur. Bu yapı, bize derinlik ve görsel ayrım kazandırma esnekliği sunar.

```html
<div class="card"> <!-- Dış Katman (Hareketli Çerçeve) -->
  <div class="card-inner"> <!-- İç Katman (Cam Panel) -->
    <!-- İçerik buraya gelir -->
    <h2>Bölüm Başlığı</h2>
    <p>Açıklama metinleri...</p>
  </div>
</div>
```

- **`.card` (Dış Katman):** Bu katman, hareketli kenarlık animasyonu için bir taşıyıcı görevi görür. Kendisi şeffaftır ve animasyon, bir pseudo-element (`::after`) aracılığıyla oluşturulur.
- **`.card-inner` (İç Katman):** Bu katman, asıl içeriği barındıran "cam" paneldir. `backdrop-filter` ile bulanıklık efekti burada uygulanır.

---

## 2. CSS ile Hareketli "VR" Kenarlık

Kartın en dikkat çekici kısmı, etrafında dönen çok renkli ışıktır. Bu, CSS'in `conic-gradient` ve `@keyframes` özellikleri kullanılarak elde edilir.

```css
.card {
  position: relative;
  overflow: hidden;
  background: transparent;
  padding: 2px; /* Kenarlık kalınlığı için */
}

.card::after {
  content: '';
  position: absolute;
  top: -50%; 
  left: -50%;
  width: 200%; 
  height: 200%;
  /* Kırmızı, beyaz ve mavi tonlarında konik bir gradyan */
  background: conic-gradient(
    from 180deg at 50% 50%,
    hsla(0, 70%, 60%, 0.8), 
    transparent, 
    hsla(0, 0%, 100%, 0.8), 
    transparent, 
    hsla(220, 70%, 60%, 0.8)
  );
  /* Animasyonu uygulama */
  animation: border-glow 8s linear infinite;
  z-index: 1;
}

/* Animasyon tanımı */
@keyframes border-glow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

- **`::after` Pseudo-element'i:** Dış katmanın üzerine yayılan ve ondan daha büyük (`width: 200%`, `height: 200%`) bir katman oluştururuz.
- **`conic-gradient`:** Bir merkez etrafında dönen bir renk gradyanı oluşturur. Burada `transparent` bölgeler bırakarak kesik bir ışık hüzmesi efekti yaratıyoruz.
- **`@keyframes border-glow`:** Bu gradyan katmanını 8 saniyelik bir döngüde `360` derece döndürerek kenarlıkta sürekli hareket eden bir ışık yanılsaması elde ederiz.

---

## 3. "Glassmorphism" İç Panel

İçerik paneli, hareketli çerçevenin üzerinde yüzen bir cam parçası hissi verir.

```css
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  /* Yarı saydam ve koyu arka plan */
  background: rgba(20, 22, 36, 0.7);
  /* Arka planı bulanıklaştıran "buzlu cam" efekti */
  backdrop-filter: blur(15px);
  border-radius: 18px; /* Yumuşak kenarlar */
  overflow: hidden;
  z-index: 2; /* Hareketli kenarlığın üzerinde kalmasını sağlar */
  padding: 30px;
}
```

- **`background`:** `rgba` ile tanımlanan yarı saydam arka plan, altındaki animasyonun hafifçe görünmesine izin verir.
- **`backdrop-filter: blur(15px)`:** Bu, glassmorphism'in anahtarıdır. Arkasında kalan her şeyi bulanıklaştırarak o "buzlu cam" dokusunu yaratır.
- **`z-index: 2`:** İç panelin, `z-index: 1` olan hareketli kenarlık animasyonunun her zaman üzerinde kalmasını garantiler.
