import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; // మీ DB connection file
import Order from '@/models/Order';   // మీ Order Model

export const dynamic = 'force-dynamic';

// GET: అడ్మిన్ పేజీ కోసం ఆర్డర్లు డేటాబేస్ నుండి తెచ్చుకోవడం
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, orders },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: చెక్‌అవుట్ పేజీ నుండి ఆర్డర్ డేటాను డేటాబేస్‌లో సేవ్ చేయడం
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const newOrder = await Order.create({
      orderId: `SPY-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingAddress: {
        fullName: body.name || 'N/A',
        email: body.email || 'N/A',
        phone: body.phone || 'N/A',
        address: body.address || 'N/A',
        city: body.city || 'N/A',
        pincode: body.pincode || 'N/A',
      },
      items: body.items || [],
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || 'cod',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}