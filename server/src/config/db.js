const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) {
    return;
  }

  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.MONGO_URI_FALLBACK;
  let uri = primaryUri;
  if (!uri) {
    console.error('❌ MongoDB Error: MONGO_URI is not set');
    return;
  }

  isConnecting = true;
  const maxAttempts = process.env.VERCEL ? 3 : Infinity;
  let attempt = 0;

  try {
    while (attempt < maxAttempts) {
      try {
        attempt += 1;
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          maxPoolSize: 10,
          retryWrites: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        isConnecting = false;
        return conn;
      } catch (error) {
        if (fallbackUri && uri === primaryUri && String(error.message || '').includes('querySrv')) {
          console.error('⚠️ MongoDB SRV lookup failed; trying MONGO_URI_FALLBACK...');
          uri = fallbackUri;
          attempt = 0;
          continue;
        }
        if (attempt >= maxAttempts) {
          isConnecting = false;
          throw error;
        }
        const delay = Math.min(1000 + attempt * 1000, 5000);
        console.error(`❌ MongoDB Error: ${error.message} (retrying in ${Math.round(delay / 1000)}s)`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  } finally {
    isConnecting = false;
  }
};

module.exports = connectDB;
