const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables.');
    console.error('   Set it in backend/.env (local) or deployment env vars (Atlas).');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Gagal cepat jika Atlas tidak reachable (misal: IP belum di-whitelist atau URI salah)
      serverSelectionTimeoutMS: 8000,
    });

    const host = conn.connection.host;
    const isAtlas = host.includes('mongodb.net');
    console.log(`✅ MongoDB Connected: ${host} ${isAtlas ? '(Atlas ☁️)' : '(Local 🏠)'}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   → Local MongoDB tidak berjalan. Jalankan: cd backend && npm run db:local');
    } else if (error.message.includes('authentication')) {
      console.error('   → Username/password Atlas salah. Cek MONGODB_URI di .env');
    } else if (error.message.includes('IP')) {
      console.error('   → IP belum di-whitelist di Atlas Network Access. Tambahkan 0.0.0.0/0 untuk demo.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
