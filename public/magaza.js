document.addEventListener('DOMContentLoaded', () => {
    const oneCikanlarBolumu = document.querySelector('#one-cikanlar');
    const searchBox = document.getElementById('search-box');
    const userId = 1; // Bu ID'yi oturumdan almak daha doğru olur ama şimdilik böyle kalabilir

    // OYUNLARI ÇEKEN VE EKRANA ÇİZEN FONKSİYON
    function fetchAndRenderGames(searchTerm = '') {
        // Arama terimini URL'ye ekliyoruz
        const gamesUrl = `/api/games?search=${encodeURIComponent(searchTerm)}`;
        const libraryUrl = `/api/library`; // Bu endpoint userId'yi oturumdan alıyor

        oneCikanlarBolumu.innerHTML = '<h2>Öne Çıkan ve Popüler</h2>';

        Promise.all([
            fetch(gamesUrl),
            fetch(libraryUrl).then(res => res.ok ? res.json() : []) // Giriş yapılmamışsa boş dizi döner
        ])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([allGames, libraryGames]) => {
            const ownedGameIds = new Set(libraryGames.map(game => game.id));

            if (allGames.length === 0) {
                 oneCikanlarBolumu.innerHTML += '<p>Aradığınız kriterlere uygun oyun bulunamadı.</p>';
            }

            allGames.forEach(game => {
                const oyunKarti = document.createElement('div');
                oyunKarti.className = 'oyun-karti';
                const isOwned = ownedGameIds.has(game.id);
                const buttonHtml = isOwned 
                    ? `<button class="in-library-btn" disabled>Kütüphanede</button>`
                    : `<button class="satin-al-btn" data-game-id="${game.id}">Satın Al</button>`;

                oyunKarti.innerHTML = `
                    <img src="${game.image}" alt="${game.name} Kapak">
                    <h3>${game.name}</h3>
                    <p>${game.price}</p>
                    ${buttonHtml} 
                `;
                oneCikanlarBolumu.appendChild(oyunKarti);
            });
        })
        .catch(error => console.error('Oyunlar yüklenirken hata:', error));
    }

    // ARAMA KUTUSUNU DİNLEME
    searchBox.addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        fetchAndRenderGames(searchTerm);
    });

    // SATIN ALMA OLAYINI DİNLEME
    oneCikanlarBolumu.addEventListener('click', (event) => {
        if (event.target.classList.contains('satin-al-btn')) {
            const gameId = parseInt(event.target.dataset.gameId);
            fetch('/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: gameId }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Butonu anında güncellemek için arama kutusundaki terimle listeyi yenile
                    fetchAndRenderGames(searchBox.value);
                } else {
                    alert(data.message);
                }
            });
        }
    });

    // Sayfa ilk yüklendiğinde tüm oyunları getir
    fetchAndRenderGames();
});