import mongoose from 'mongoose';

// MongoDB Atlas లింక్ లేదా లోకల్ డెవలప్‌మెంట్ కోసం URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/avento_db';

let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}