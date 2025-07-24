const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'bu-cok-gizli-bir-anahtar-olmalı',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Rotalar ve API'lar...

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    if (users.find(u => u.username === username)) {
        return res.status(400).send('Bu kullanıcı adı zaten alınmış.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username: username,
        password: hashedPassword,
        library: [],
        kayitTarihi: new Date().toLocaleDateString('tr-TR')
    };
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    res.redirect('/login.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const user = users.find(u => u.username === username);
    if (!user) { return res.status(400).send('Kullanıcı adı veya parola hatalı.'); }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/kutuphane.html');
    } else {
        res.status(400).send('Kullanıcı adı veya parola hatalı.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) { return res.redirect('/kutuphane.html'); }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

const isAuthenticated = (req, res, next) => {
    if (req.session.user) { next(); } 
    else { res.redirect('/login.html'); }
};


// --- API Endpoints ---

// '/api/games' ENDPOINT'İNİN GÜNCELLENMİŞ HALİ
app.get('/api/games', (req, res) => {
    // Arama sorgusunu URL'den alıyoruz (örn: /api/games?search=Oyun)
    const searchTerm = req.query.search || '';

    let allGames = JSON.parse(fs.readFileSync('games.json', 'utf8'));

    // Eğer bir arama terimi varsa, oyunları filtrele
    if (searchTerm) {
        allGames = allGames.filter(game => 
            game.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    res.json(allGames);
});

app.get('/api/library', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json([]);
    const libraryGames = games.filter(game => user.library.includes(game.id));
    res.json(libraryGames);
});

app.post('/api/buy', isAuthenticated, (req, res) => {
    const { gameId } = req.body;
    const userId = req.session.user.id;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const user = users.find(u => u.id === userId);
    if (!user.library.includes(parseInt(gameId))) {
        user.library.push(parseInt(gameId));
    } else {
        return res.status(400).json({ message: 'Bu oyun zaten kütüphanenizde.' });
    }
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    res.json({ success: true, message: 'Oyun başarıyla kütüphanenize eklendi!' });
});

app.get('/api/session-status', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/profile', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const user = users.find(u => u.id === userId);
    if (!user) { return res.status(404).json({ message: 'Kullanıcı bulunamadı' });}
    const profileData = {
        username: user.username,
        gameCount: user.library.length,
        joinDate: user.kayitTarihi || 'Bilgi Yok'
    };
    res.json(profileData);
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});