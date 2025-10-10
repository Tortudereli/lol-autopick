# ⚔️ LoL AutoPick

<div align="center">

**🇹🇷 Türkçe | [🇬🇧 English](README.md)**

  <img src="screenshot.png" alt="LoL AutoPick Ekran Görüntüsü" width="800px" />
  
  <p><strong>League of Legends için Otomatik Şampiyon Seçim ve Maç Kabul Uygulaması</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Tortudereli/lol-autopick/releases)
  [![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](https://github.com/Tortudereli/lol-autopick)
</div>

## 📥 İndirme

**[LoL AutoPick Setup - İndir](https://github.com/Tortudereli/lol-autopick/releases/download/1.0.0/LoL-AutoPick-Setup.exe)**

## ✨ Özellikler

- **🎯 Otomatik Şampiyon Seçimi**: Belirlediğiniz şampiyonu otomatik olarak seçer
- **🚫 Otomatik Şampiyon Yasaklama**: Belirlediğiniz şampiyonu otomatik olarak yasaklar
- **✅ Otomatik Maç Kabul**: Maç bulunduğunda otomatik olarak kabul eder
- **🔍 Şampiyon Arama**: Hızlı şampiyon seçimi için arama özelliği
- **🎨 Modern Arayüz**: Kullanıcı dostu ve şık bir tasarım
- **🔄 Otomatik League Client Algılama**: Oyun açıldığında otomatik olarak bağlanır

## 🚀 Nasıl Kullanılır?

1. **Uygulamayı İndirin ve Kurun**: Yukarıdaki indirme bağlantısından setup dosyasını indirip çalıştırın
2. **League of Legends'ı Başlatın**: Uygulamayı çalıştırdıktan sonra LoL client'ı açın
3. **Şampiyonlarınızı Seçin**: 
   - Seçmek istediğiniz şampiyonu "Auto Champion Pick" bölümünden seçin
   - Yasaklamak istediğiniz şampiyonu "Auto Champion Ban" bölümünden seçin
4. **Özellikleri Aktif Edin**:
   - "Auto Pick" - Otomatik şampiyon seçimini aktif eder
   - "Auto Ban" - Otomatik şampiyon yasaklamayı aktif eder
   - "Auto Accept" - Otomatik maç kabulünü aktif eder
5. **Maç Aramaya Başlayın**: Uygulama arka planda çalışacak ve seçimlerinizi otomatik olarak yapacaktır

## 🛠️ Geliştirici Kurulumu

Projeyi geliştirmek veya kaynak kodundan derlemek istiyorsanız:

### Gereksinimler

- [Bun](https://bun.sh/) (JavaScript runtime ve paket yöneticisi)
- [Node.js](https://nodejs.org/) (Electron için)
- Windows İşletim Sistemi

### Kurulum

```powershell
# Depoyu klonlayın
git clone https://github.com/Tortudereli/lol-autopick.git
cd lol-autopick

# Bağımlılıkları yükleyin
bun install
```

### Geliştirme Modu

```powershell
# Uygulamayı geliştirme modunda başlatın
bun start
```

### Uygulama Derleme

```powershell
# Uygulama paketleme
bun run package

# Kurulum dosyası oluşturma
bun run make
```

Derlenmiş dosyalar `out/make/squirrel.windows/x64/` klasöründe oluşturulacaktır.

## 🏗️ Teknolojiler

- **Electron** - Çapraz platform masaüstü uygulaması
- **TypeScript** - Tip güvenli kod
- **Vite** - Hızlı build aracı
- **LCU API** - League Client güncelleme API'si

## 📋 Proje Yapısı

```
lol-autopick/
├── src/
│   ├── main.ts          # Ana Electron süreci
│   ├── preload.ts       # Preload script
│   ├── renderer.ts      # Renderer süreci (UI)
│   └── index.css        # Stiller
├── public/
│   ├── app.ico          # Uygulama ikonu
│   ├── app.png          # Uygulama resmi
│   └── waiting-lol.html # Bekleme ekranı
├── forge.config.ts      # Electron Forge yapılandırması
└── package.json         # Proje bağımlılıkları
```

## 🔒 Güvenlik

Bu uygulama, League of Legends Client Update (LCU) API'sini kullanarak oyununuzla etkileşime girer. Uygulama:
- Yalnızca local (127.0.0.1) üzerinde çalışır
- Oyun verilerinizi dışarı göndermez
- Açık kaynak kodludur ve incelenebilir

## ⚠️ Sorumluluk Reddi

Bu uygulama resmi bir Riot Games ürünü değildir. Kendi sorumluluğunuzda kullanın. Riot Games'in Kullanım Şartları'nı ihlal etmediğinden emin olun.

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Geliştirici

**Tortudereli**
- Email: tortudereli@outlook.com
- GitHub: [@Tortudereli](https://github.com/Tortudereli)

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull request'lerinizi göndermekten çekinmeyin.

1. Projeyi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 Destek

Sorun bildirmek veya öneride bulunmak için [GitHub Issues](https://github.com/Tortudereli/lol-autopick/issues) sayfasını kullanabilirsiniz.

---

<div align="center">
  Made with ❤️ by Tortudereli
</div>

