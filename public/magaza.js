document.addEventListener('DOMContentLoaded', () => {
  const oneCikanlarBolumu = document.querySelector('#one-cikanlar');
  
  oneCikanlarBolumu.innerHTML = '<h2>Öne Çıkan ve Popüler</h2>';

  // Sunucudan oyunları çek ve ekrana çiz
  fetch('/api/games')
    .then(response => response.json())
    .then(games => {
      games.forEach(oyun => {
        const oyunKarti = document.createElement('div');
        oyunKarti.className = 'oyun-karti';

        oyunKarti.innerHTML = `
          <img src="${oyun.image}" alt="${oyun.name} Kapak">
          <h3>${oyun.name}</h3>
          <p>${oyun.price}</p>
          <button class="satin-al-btn" data-game-id="${oyun.id}">Satın Al</button>
        `;

        oneCikanlarBolumu.appendChild(oyunKarti);
      });
    });

  // YENİ: Satın alma butonlarına tıklamayı dinle
  // Not: Bu olayı direkt butonlara değil, kapsayıcıya ekliyoruz (Event Delegation)
  // Bu sayede sonradan eklenen butonlar için de çalışır.
  oneCikanlarBolumu.addEventListener('click', (event) => {
    // Tıklanan eleman bir satın alma butonu mu?
    if (event.target.classList.contains('satin-al-btn')) {
      const gameId = parseInt(event.target.dataset.gameId); // Butonun data-game-id'sini al

      // Sunucuya satın alma isteği gönder
      fetch('/api/buy', {
        method: 'POST', // Metodumuz POST
        headers: {
          'Content-Type': 'application/json', // Gönderdiğimiz verinin tipini belirtiyoruz
        },
        body: JSON.stringify({ gameId: gameId }), // Göndereceğimiz veri
      })
      .then(response => response.json())
      .then(data => {
        // Sunucudan gelen yanıtı kullanıcıya göster
        alert(data.message); 
      })
      .catch(error => {
        console.error('Satın alma sırasında hata:', error);
        alert('Bir hata oluştu, lütfen tekrar deneyin.');
      });
    }
  });
});