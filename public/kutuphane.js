document.addEventListener('DOMContentLoaded', () => {
  const oyunListesiDiv = document.getElementById('oyun-listesi');
  const userId = 1; // Şimdilik varsayılan kullanıcı ID'miz 1

  // Sunucudan kütüphane verisini çek
  fetch(`/api/library/${userId}`)
    .then(response => response.json())
    .then(libraryGames => {
      // Eğer kütüphanede oyun yoksa, mesajı yerinde bırak ve fonksiyondan çık
      if (libraryGames.length === 0) {
        oyunListesiDiv.innerHTML = '<p>Kütüphanenizde henüz oyun bulunmuyor.</p>';
        return;
      }

      // Kütüphane boş değilse, varsayılan mesajı temizle
      oyunListesiDiv.innerHTML = '';

      // Her bir oyun için HTML oluştur ve sayfaya ekle
      libraryGames.forEach(game => {
        const oyunElementi = document.createElement('div');
        oyunElementi.className = 'oyun-ogesi'; // CSS ile stil vermek için class ekliyoruz

        oyunElementi.innerHTML = `
          <img class="oyun-ogesi-resim" src="${game.image}" alt="${game.name}">
          <div class="oyun-ogesi-bilgi">
            <h3>${game.name}</h3>
            <button class="oyna-btn">Oyna</button>
          </div>
        `;
        oyunListesiDiv.appendChild(oyunElementi);
      });
    })
    .catch(error => {
      console.error('Kütüphane yüklenirken hata:', error);
      oyunListesiDiv.innerHTML = '<p>Kütüphane yüklenirken bir sorun oluştu.</p>';
    });
});