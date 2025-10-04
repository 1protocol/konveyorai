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

---

## 4. 3D Dönen Küp İmza Kartı Efekti

Geliştirici Sorumlusu kartı, saf CSS kullanılarak oluşturulmuş gelişmiş bir 3D animasyona sahiptir. Bu efekt, karta teknolojik ve modern bir kimlik kazandırır.

### HTML Yapısı

Küpün her bir yüzü ayrı bir `div` elemanıdır ve hepsi bir `container` içinde yer alır.

```html
<div class="signature-card-content">
  <div class="cube-container">
    <div class="face front"></div>
    <div class="face back"></div>
    <div class="face right"></div>
    <div class="face left"></div>
    <div class="face top"></div>
    <div class="face bottom"></div>
  </div>
  <div class="text-content">
    <h3>Mustafa USLU</h3>
    <p>Geliştirme Sorumlusu</p>
  </div>
</div>
```

### CSS ile 3D Sahne ve Küp Oluşturma

Bu efektin sırrı, `transform-style: preserve-3d` ve 3D `transform` özelliklerinin doğru kullanımında yatar.

```css
/* Ana kartta 3D sahneyi oluşturur */
.signature-card {
  perspective: 1000px;
}

.cube-container {
  width: 50px;
  height: 50px;
  position: relative;
  transform-style: preserve-3d;
  /* Animasyonu uygulama */
  animation: rotate-cube 12s linear infinite;
}

.face {
  position: absolute;
  width: 50px;
  height: 50px;
  border: 1px solid rgba(0, 180, 255, 0.5);
  background: rgba(0, 180, 255, 0.1);
}

/* Her yüzü 3D uzayda doğru konuma döndürme ve taşıma */
.front  { transform: translateZ(25px); }
.back   { transform: rotateY(180deg) translateZ(25px); }
.right  { transform: rotateY(90deg) translateZ(25px); }
.left   { transform: rotateY(-90deg) translateZ(25px); }
.top    { transform: rotateX(90deg) translateZ(25px); }
.bottom { transform: rotateX(-90deg) translateZ(25px); }
```

- **`perspective`:** Sahneye derinlik hissi katar.
- **`transform-style: preserve-3d`:** `.cube-container` içindeki elemanların 3D uzayda konumlandırılmasına izin verir.
- **`transform`:** Her bir `face` (yüz), `rotate` (döndürme) ve `translateZ` (Z ekseninde taşıma) fonksiyonları kullanılarak bir küp oluşturacak şekilde doğru pozisyonlarına yerleştirilir.

### Animasyon ve İnteraktiflik

Küpün sürekli dönmesi ve kartın fare etkileşimine tepki vermesi için `@keyframes` ve `:hover` kullanılır.

```css
/* Küpü X ve Y eksenlerinde sürekli döndüren animasyon */
@keyframes rotate-cube {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

/* Fare üzerine gelince karta 3D eğim verme */
.signature-card:hover {
  transform: rotateY(-10deg) rotateX(10deg);
  box-shadow: 0 25px 50px rgba(0,0,0,0.4);
}
```

- **`@keyframes rotate-cube`:** Küpü 12 saniyelik bir döngüde hem X hem de Y ekseninde tam bir tur döndürerek akıcı ve sürekli bir hareket sağlar.
- **`:hover` Etkileşimi:** Fare kartın üzerine geldiğinde, kartın kendisi hafifçe 3D olarak eğilir ve gölgesi belirginleşir. Bu, kullanıcıya tatmin edici bir interaktif geri bildirim sunar.
