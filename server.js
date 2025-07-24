const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Parola hashlemek için
const session = require('express-session'); // Oturum yönetimi için

const app = express();
const port = 3000;

// --- Middleware'ler ---
app.use(express.static('public')); // Statik dosyalar
app.use(express.json()); // Gelen JSON verilerini okumak için
app.use(express.urlencoded({ extended: true })); // Form verilerini okumak için

// Oturum (Session) Ayarları
app.use(session({
    secret: 'bu-cok-gizli-bir-anahtar-olmalı', // Oturum ID'sini imzalamak için gizli anahtar
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // HTTPS kullanmıyorsak 'false' olmalı
}));

// --- API ve Rotalar ---

// KAYIT OLMA (REGISTER)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

    // Kullanıcı adı zaten var mı?
    if (users.find(u => u.username === username)) {
        return res.status(400).send('Bu kullanıcı adı zaten alınmış.');
    }

    // Parolayı hash'le (asenkron)
    const hashedPassword = await bcrypt.hash(password, 10); // 10, hash'leme gücüdür

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, // Yeni ID oluştur
        username: username,
        password: hashedPassword, // Hash'lenmiş parolayı kaydet
        library: []
    };

    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));

    res.redirect('/login.html');
});

// GİRİŞ YAPMA (LOGIN)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).send('Kullanıcı adı veya parola hatalı.');
    }

    // Gelen parolayla hash'lenmiş parolayı karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        // Parola doğruysa, oturum başlat
        req.session.user = {
            id: user.id,
            username: user.username
        };
        res.redirect('/kutuphane.html'); // Kütüphaneye yönlendir
    } else {
        res.status(400).send('Kullanıcı adı veya parola hatalı.');
    }
});

// ÇIKIŞ YAPMA (LOGOUT)
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/kutuphane.html');
        }
        res.clearCookie('connect.sid'); // Oturum çerezini temizle
        res.redirect('/'); // Ana sayfaya yönlendir
    });
});

// Kütüphane gibi korunması gereken sayfalar için middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next(); // Kullanıcı giriş yapmış, devam et
    } else {
        res.redirect('/login.html'); // Giriş yapmamış, login sayfasına yönlendir
    }
};


// Mevcut API'ları korumalı hale getirelim
app.get('/api/games', (req, res) => {
    const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
    res.json(games);
});

// Kütüphane API'ı artık giriş yapmış olmayı gerektiriyor
app.get('/api/library', isAuthenticated, (req, res) => {
    const userId = req.session.user.id; // ID'yi URL'den değil, oturumdan al
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json([]);
    
    const libraryGames = games.filter(game => user.library.includes(game.id));
    res.json(libraryGames);
});

// Satın alma API'ı da giriş yapmış olmayı gerektiriyor
app.post('/api/buy', isAuthenticated, (req, res) => {
    const { gameId } = req.body;
    const userId = req.session.user.id; // ID'yi oturumdan al
    // ... (satın alma kodunun geri kalanı aynı)
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const user = users.find(u => u.id === userId);
    if (!user.library.includes(gameId)) {
      user.library.push(gameId);
    } else {
      return res.status(400).json({ message: 'Bu oyun zaten kütüphanenizde.' });
    }
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    res.json({ success: true, message: 'Oyun başarıyla kütüphanenize eklendi!' });
});


// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});