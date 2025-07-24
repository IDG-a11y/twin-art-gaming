document.addEventListener('DOMContentLoaded', () => {
    // Header'daki navigasyonun olduğu listeyi seçiyoruz
    const navUl = document.querySelector('header nav ul');

    // Sunucudan mevcut oturum durumunu öğrenmek için istek atıyoruz
    fetch('/api/session-status')
        .then(res => res.json())
        .then(data => {
            // Eğer sayfada bir navigasyon listesi varsa (her ihtimale karşı)
            if (navUl) {
                // Her seferinde menüyü temizliyoruz ki mükerrer kayıt olmasın
                navUl.innerHTML = '';

                if (data.loggedIn) {
                    // KULLANICI GİRİŞ YAPMIŞ İSE BU MENÜYÜ OLUŞTUR
                    navUl.innerHTML = `
                        <li><a href="index.html">Mağaza</a></li>
                        <li><a href="kutuphane.html">Kütüphane</a></li>
                        <li><a href="topluluk.html">Topluluk</a></li>
                        <li><a href="profil.html">Profil (${data.user.username})</a></li>
                        <li><a href="/logout">Çıkış Yap</a></li>
                    `;
                } else {
                    // KULLANICI GİRİŞ YAPMAMIŞ İSE BU MENÜYÜ OLUŞTUR
                    navUl.innerHTML = `
                        <li><a href="index.html">Mağaza</a></li>
                        <li><a href="topluluk.html">Topluluk</a></li>
                        <li><a href="login.html">Giriş Yap</a></li>
                        <li><a href="register.html">Kayıt Ol</a></li>
                    `;
                }
            }
        })
        .catch(error => {
            // Bir ağ hatası veya sunucu hatası olursa diye önlem
            console.error('Oturum durumu alınırken hata oluştu:', error);
            if (navUl) {
                navUl.innerHTML = '<li><a href="/login.html">Menü yüklenemedi. Giriş yapmayı deneyin.</a></li>';
            }
        });
});