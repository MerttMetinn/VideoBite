# VideoBite API

VideoBite uygulamasının backend API servisi. Bu API, YouTube videolarından transkript çıkarma ve yapay zeka ile özet oluşturma işlemlerini gerçekleştirir.

## Teknolojiler

- **Node.js**: Sunucu tarafı JavaScript çalışma ortamı
- **Express**: Web uygulama çerçevesi
- **TypeScript**: Statik tip kontrolü
- **MongoDB**: Veritabanı
- **Mongoose**: MongoDB ODM
- **JWT**: Kimlik doğrulama
- **Python**: Transkript çıkarma ve GPT özeti oluşturma
- **OpenAI API**: Yapay zeka destekli video özetleme

## Başlangıç

### Gereksinimler

- Node.js (v16 veya üzeri)
- MongoDB
- Python 3.8 veya üzeri

### Kurulum

1. Depoyu klonlayın ve proje klasörüne girin:

```bash
git clone <repo-url>
cd videobite/server
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Python bağımlılıklarını yükleyin:

```bash
pip install -r src/python/requirements.txt
```

4. `.env` dosyasını oluşturun:

```bash
cp .env.example .env
```

5. `.env` dosyasını düzenleyerek gerekli API anahtarlarını ve yapılandırmaları ekleyin.

6. Python için `.env` dosyasını oluşturun:

```bash
cp src/python/.env.example src/python/.env
```

7. Python `.env` dosyasını düzenleyerek OpenAI API anahtarını ekleyin.

### Kullanım

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5000` adresinde çalışacaktır.

## API Endpoint'leri

### Kimlik Doğrulama

- **POST /api/auth/register**: Yeni kullanıcı kaydı oluşturur
- **POST /api/auth/login**: Kullanıcı girişi yapar ve JWT token döndürür
- **GET /api/auth/me**: Mevcut kullanıcının bilgilerini döndürür (kimlik doğrulama gerektirir)

### Video İşlemleri

- **POST /api/videos/summary**: Verilen YouTube video URL'sinden özet oluşturur
- **GET /api/videos/my-summaries**: Kullanıcının kaydettiği özetleri listeler (kimlik doğrulama gerektirir)
- **GET /api/videos/summary/:id**: Belirli bir özetin detaylarını döndürür
- **DELETE /api/videos/summary/:id**: Bir özeti siler (kimlik doğrulama gerektirir)

## Mimari

API, aşağıdaki katmanlardan oluşur:

- **Kontrolcüler**: HTTP isteklerini işler ve yanıtlar döndürür
- **Servisler**: İş mantığını içerir
- **Modeller**: Veritabanı şemalarını ve veri yapılarını tanımlar
- **Middleware'ler**: Kimlik doğrulama, hata yakalama gibi ara işlemleri gerçekleştirir
- **Yardımcı Fonksiyonlar**: Çeşitli yardımcı işlevleri sağlar
- **Python Betikleri**: YouTube transkript çıkarma ve GPT özeti oluşturma

## Lisans

Bu proje [ISC lisansı](LICENSE) altında lisanslanmıştır. 