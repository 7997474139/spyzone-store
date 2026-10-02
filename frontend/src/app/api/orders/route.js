import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, orders },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const addr = body.shippingAddress || body;

    const newOrder = await Order.create({
      orderId: body.orderId || `SPY-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingAddress: {
        fullName: addr.fullName || addr.name || body.fullName || body.name || 'N/A',
        email: addr.email || body.email || 'N/A',
        phone: addr.phone || body.phone || 'N/A',
        address: addr.address || body.address || 'N/A',
        city: addr.city || body.city || 'N/A',
        pincode: addr.pincode || body.pincode || 'N/A',
        state: addr.state || body.state || 'N/A',
      },
      name: addr.fullName || addr.name || body.name || 'N/A',
      email: addr.email || body.email || 'N/A',
      phone: addr.phone || body.phone || 'N/A',
      address: addr.address || body.address || 'N/A',
      city: addr.city || body.city || 'N/A',
      pincode: addr.pincode || body.pincode || 'N/A',
      items: body.items || [],
      totalAmount: Number(body.totalAmount) || 0,
      paymentMethod: body.paymentMethod || 'PhonePe / UPI',
      paymentStatus: 'Paid',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("MongoDB Order Create Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await Order.deleteMany({});
    return NextResponse.json({ success: true, message: 'All orders deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}