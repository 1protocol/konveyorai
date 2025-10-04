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

## 4. Gelişmiş 3D İç İçe Küp Animasyonu

Geliştirici Sorumlusu kartı, saf CSS kullanılarak oluşturulmuş, iç içe geçmiş iki küpten oluşan gelişmiş bir 3D animasyona sahiptir. Bu efekt, karta teknolojik, dinamik ve çok katmanlı bir kimlik kazandırır.

### HTML Yapısı

Efekt, dış ve iç küpleri barındıran iç içe geçmiş bir yapı kullanır. Her küp, 6 adet `div` (yüz) elemanından oluşur.

```html
<div class="signature-card-content">
  <div class="cube-container">
    <!-- Dış Küp -->
    <div class="face front"></div>
    <div class="face back"></div>
    <div class="face right"></div>
    <div class="face left"></div>
    <div class="face top"></div>
    <div class="face bottom"></div>

    <!-- İç Küp -->
    <div class="inner-cube">
      <div class="face front"></div>
      <div class8"face back"></div>
      <div class="face right"></div>
      <div class="face left"></div>
      <div class="face top"></div>
      <div class="face bottom"></div>
    </div>
  </div>
  <div class="text-content">
    <h4>Hazırlayan:</h4>
    <h3>Mustafa USLU</h3>
    <p>Proje Geliştirici</p>
  </div>
</div>
```

### CSS ile 3D Sahne ve Küpler

Efektin sırrı, `transform-style: preserve-3d` ve her bir küp için ayrı ayrı tanımlanmış, çok eksenli `@keyframes` animasyonlarında yatar.

```css
/* Ana kartta 3D sahneyi oluşturur ve etkileşim ekler */
.signature-card {
  perspective: 1000px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}
.signature-card:hover {
  transform: translateY(-10px) rotateY(-8deg) rotateX(8deg);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}

/* Dış küp için taşıyıcı ve animasyon */
.cube-container {
  width: 60px;
  height: 60px;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate-cube 15s linear infinite;
}

/* İç küp için taşıyıcı ve animasyon */
.inner-cube {
  width: 30px;
  height: 30px;
  position: absolute;
  top: 15px; /* (60-30)/2 */
  left: 15px; /* (60-30)/2 */
  transform-style: preserve-3d;
  animation: rotate-inner-cube 10s linear infinite;
}

/* Tüm yüzler için ortak stiller (Tel Kafes Görünümü) */
.face {
  position: absolute;
  background: transparent; /* Arka plan yok */
}

/* Dış küpün yüzeyleri */
.cube-container > .face {
  width: 60px;
  height: 60px;
  border: 1.5px solid hsla(190, 100%, 75%, 0.8);
}
.cube-container > .front  { transform: translateZ(30px); }
.cube-container > .back   { transform: rotateY(180deg) translateZ(30px); }
/* ... diğer yüzler */

/* İç küpün yüzeyleri */
.inner-cube > .face {
  width: 30px;
  height: 30px;
  border: 1px solid hsla(300, 100%, 80%, 0.7);
}
.inner-cube > .front  { transform: translateZ(15px); }
.inner-cube > .back   { transform: rotateY(180deg) translateZ(15px); }
/* ... diğer yüzler */
```

### Çok Eksenli Animasyonlar

İki küp, farklı hızlarda ve farklı eksen kombinasyonlarında dönerek sürekli değişen, hipnotik bir görsel oluşturur.

```css
/* Dış küp için 3 eksenli dönüş animasyonu */
@keyframes rotate-cube {
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  100% { transform: rotateX(360deg) rotateY(480deg) rotateZ(240deg); }
}

/* İç küp için zıt yönlü ve farklı hızda dönüş animasyonu */
@keyframes rotate-inner-cube {
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  100% { transform: rotateX(480deg) rotateY(-360deg) rotateZ(360deg); }
}
```

- **`perspective`:** Sahneye derinlik hissi katar.
- **`transform-style: preserve-3d`:** Küp elemanlarının 3D uzayda konumlandırılmasına izin verir.
- **`@keyframes` (Çok Eksenli):** Her iki küp de X, Y ve Z eksenlerinde, farklı hızlarda ve bitiş açılarında (`480deg`, `-360deg` vb.) dönerek karmaşık ve senkronize olmayan bir hareket deseni oluşturur. Bu, animasyonun daha organik ve daha az mekanik görünmesini sağlar.
- **Tel Kafes (Wireframe) Tasarımı:** Küp yüzeylerinin arka planlarının şeffaf olması ve sadece kenarlıklarının görünür olması, animasyonun netliğini artırır ve karmaşıklığını zarif bir şekilde sergiler.
