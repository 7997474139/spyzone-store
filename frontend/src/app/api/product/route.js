import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Connection Logic
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing in .env.local');
  }
  return await mongoose.connect(MONGODB_URI);
}

// Product Schema Definition
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String },
    image: { type: String },
    description: { type: String },
    sizes: { type: Array, default: [] },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// 1. GET: మెయిన్ పేజీ కోసం MongoDB నుంచి ప్రొడక్ట్స్ తెప్పించడం
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: అడ్మిన్ ప్యానెల్ నుండి కొత్త ప్రొడక్ట్ యాడ్ చేయడం
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newProduct = await Product.create(body);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add product: ' + error.message },
      { status: 500 }
    );
  }
}