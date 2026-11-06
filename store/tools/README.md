# Mağaza görsellerini yeniden üretme

Görseller, uygulamanın örnek verilerle (sahte Firebase) derlenmiş bir kopyasından alınır.

```bash
# 1) Repoyu geçici bir klasöre kopyala ve sahte Firebase'i yerleştir
git archive HEAD | tar -x -C /tmp/demo && ln -s "$PWD/node_modules" /tmp/demo/node_modules
cp store/tools/demo-firebase.js /tmp/demo/src/services/firebase.js
(cd /tmp/demo && REACT_APP_ADS_ENABLED=false npx react-scripts build)

# 2) Ekran görüntüleri (390×844 @3x) → /tmp/shots
mkdir -p /tmp/shots && node store/tools/shoot.js /tmp/demo/build /tmp/shots

# 3) PDF sayfaları (örnek tarif kitabı PDF'inden) → /tmp/shots/pdfpage-1.png, pdfpage-3.png
pdftoppm -png -r 150 -f 1 -l 3 ornek-tarif-kitabi.pdf /tmp/shots/pdfpage

# 4) Mağaza görselleri → store/graphics
node store/tools/compose.js /tmp/shots store/graphics public
```

Playwright ve Chromium gerekir. Play görselleri alfa kanalı içermemeli (24-bit PNG/JPEG).
