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

// Product Schema Definition (images array ని యాడ్ చేశాం)
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String },
    image: { type: String },
    images: { type: Array, default: [] }, // 👈 4 యాంగిల్స్ ఫోటోల కోసం యాడ్ చేసిన ఫీల్డ్
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

// 2. POST: అడ్మిన్ ప్యానెల్ నుండి కొత్త ప్రొడక్ట్ యాడ్ చేయడం (మల్టిపుల్ ఇమేజెస్ హ్యాండ్లింగ్‌తో)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // 💡 4 ఇమేజెస్ ఉంటే సేకరించడం, లేకపోతే మెయిన్ ఇమేజ్‌ని Array గా మార్చడం
    const activeImages = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter((img) => img && typeof img === 'string' && img.trim() !== '')
      : (body.image ? [body.image] : []);

    const productData = {
      ...body,
      image: activeImages[0] || body.image || '',
      images: activeImages.length > 0 ? activeImages : (body.image ? [body.image] : []),
    };

    const newProduct = await Product.create(productData);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add product: ' + error.message },
      { status: 500 }
    );
  }
}

// 3. DELETE: అడ్మిన్ ప్యానెల్ నుండి ప్రొడక్ట్‌ను డేటాబేస్ నుండి శాశ్వతంగా డిలీట్ చేయడం
export async function DELETE(req) {
  try {
    await connectDB();

    // Request ద్వారా పంపిన Product ID ని తీసుకోవడం
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id || body._id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // MongoDB Atlas డేటాబేస్ నుండి డిలీట్ చేయడం
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found in Database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted from MongoDB successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete product: ' + error.message },
      { status: 500 }
    );
  }
}