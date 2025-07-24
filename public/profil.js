document.addEventListener('DOMContentLoaded', () => {
    // Gerekli HTML elemanlarını seçiyoruz
    const usernameSpan = document.getElementById('profile-username');
    const gameCountSpan = document.getElementById('profile-game-count');
    const joinDateSpan = document.getElementById('profile-join-date');

    // Sunucudaki /api/profile endpoint'inden veriyi çekiyoruz
    fetch('/api/profile')
        .then(res => {
            // Eğer kullanıcı giriş yapmamışsa (sunucu yönlendirir ama önlem olarak)
            if (!res.ok) {
                window.location.href = '/login.html'; // Login sayfasına yönlendir
                throw new Error('Yetkilendirme Hatası');
            }
            return res.json();
        })
        .then(profileData => {
            // Gelen verilerle HTML'i güncelliyoruz
            usernameSpan.textContent = profileData.username;
            gameCountSpan.textContent = profileData.gameCount;
            joinDateSpan.textContent = profileData.joinDate;
        })
        .catch(error => {
            console.error('Profil bilgileri yüklenirken hata oluştu:', error);
            const profileInfoDiv = document.getElementById('profil-bilgileri');
            if (profileInfoDiv) {
                profileInfoDiv.innerHTML = '<p>Profil bilgileri yüklenemedi. Lütfen tekrar giriş yapmayı deneyin.</p>';
            }
        });
});