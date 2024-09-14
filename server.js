// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const ping = require('ping');
const sequelize = require('./database');
const User = require('./models/User');

const app = express();
const PORT = 3000;

// Middleware'ler
app.use(express.json());
app.use(cors());

// Statik dosyaları sunmak için
app.use(express.static(path.join(__dirname, 'public')));

// NVR ve Kamera Verileri
const nvrs = [
  {
    id: 1,
    name: 'NVR 1',
    ip: '192.168.11.97',
    cameras: [
      { id: 1, name: 'Kamera 1', ip: '192.168.11.101' },
      { id: 2, name: 'Kamera 2', ip: '192.168.11.102' },
      { id: 3, name: 'Kamera 3', ip: '192.168.11.103' },
    ],
  },
  // Başka NVR'ler ekleyebilirsiniz
];

// API Endpoint'leri

// NVR Listesini Döndüren Endpoint
app.get('/api/nvrs', (req, res) => {
  res.json(nvrs);
});

// Belirli bir NVR'ye bağlı kameraları döndüren Endpoint
app.get('/api/nvrs/:id/cameras', (req, res) => {
  const nvrId = parseInt(req.params.id);
  const nvr = nvrs.find((n) => n.id === nvrId);

  if (nvr) {
    res.json(nvr.cameras);
  } else {
    res.status(404).json({ message: 'NVR bulunamadı' });
  }
});

// NVR veya Kamera Durumunu Kontrol Eden Endpoint
app.get('/api/check-device', async (req, res) => {
  const ipAddress = req.query.ip;

  if (!ipAddress) {
    return res.status(400).json({ message: 'IP adresi belirtilmedi' });
  }

  try {
    const result = await ping.promise.probe(ipAddress);
    if (result.alive) {
      res.json({ status: 'online' });
    } else {
      res.json({ status: 'offline' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Sunucu hatası' });
  }
});

// Kullanıcı İşlemleri

// Tüm kullanıcıları getir
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Kullanıcıları getirirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni kullanıcı ekle
app.post('/api/users', async (req, res) => {
  const { username, password, role = 'user', active = true } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten mevcut' });
    }
    const user = await User.create({ username, password, role, active });
    res.status(201).json(user);
  } catch (error) {
    console.error('Kullanıcı eklerken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı şifresini güncelle
app.put('/api/users/:username/password', async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      user.password = password;
      await user.save();
      res.json({ message: 'Şifre başarıyla güncellendi' });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    console.error('Şifre güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcıyı pasif hale getir
app.put('/api/users/:username/deactivate', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      user.active = false;
      await user.save();
      res.json({ message: 'Kullanıcı pasif hale getirildi' });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    console.error('Kullanıcı pasif hale getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı girişi
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password, active: true } });
    if (user) {
      res.json({ username: user.username, role: user.role });
    } else {
      res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre ya da hesap pasif' });
    }
  } catch (error) {
    console.error('Giriş sırasında hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Veritabanını senkronize edin ve sunucuyu başlatın
sequelize.sync({ force: false }).then(async () => {
  // Admin kullanıcısının var olduğundan emin olun
  const adminUser = await User.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    await User.create({ username: 'admin', password: 'admin123', role: 'admin', active: true });
  }

  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  });
});

// server.js
const TopologyItem = require('./models/TopologyItem');

// ...

// Veritabanını senkronize edin ve sunucuyu başlatın
sequelize.sync({ force: false }).then(async () => {
  // Admin kullanıcısının var olduğundan emin olun
  const adminUser = await User.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    await User.create({ username: 'admin', password: 'admin123', role: 'admin', active: true });
  }

  // Topoloji verilerinin var olduğundan emin olun (ilk kez çalıştırılıyorsa oluşturun)
  const topologyItems = await TopologyItem.findAll();
  if (topologyItems.length === 0) {
    // Örnek veriler ekleyelim (10x10 tablo için)
    const topologyData = [];
    const rows = 10;
    const cols = 10;
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const cell = `${String.fromCharCode(64 + col)}${row}`; // Örneğin, A1, B2
        topologyData.push({ cell, value: '' });
      }
    }
    await TopologyItem.bulkCreate(topologyData);
  }

  // Topoloji verilerini alma
app.get('/api/topology', async (req, res) => {
    try {
      const topologyItems = await TopologyItem.findAll();
      res.json(topologyItems);
    } catch (error) {
      console.error('Topoloji verilerini alırken hata:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });
  
  // Topoloji verilerini güncelleme
app.put('/api/topology', async (req, res) => {
    const { updates } = req.body;
  
    // Basit yetkilendirme kontrolü
    const username = req.headers['x-username'];
    const role = req.headers['x-role'];
  
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
  
    try {
      for (const update of updates) {
        const { cell, value } = update;
        await TopologyItem.update({ value }, { where: { cell } });
      }
      res.json({ message: 'Topoloji verileri başarıyla güncellendi' });
    } catch (error) {
      console.error('Topoloji verilerini güncellerken hata:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });

  
  });


  