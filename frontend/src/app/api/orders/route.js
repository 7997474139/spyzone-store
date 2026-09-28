import { NextResponse } from 'next/server';

// Dev Server లో డేటా రీసెట్ అవ్వకుండా globalThis ఉపయోగిస్తున్నాం
if (!globalThis.orders) {
  globalThis.orders = [];
}

export const dynamic = 'force-dynamic';

// GET: అడ్మిన్ పేజీ కోసం ఆర్డర్లు పంపడం
export async function GET() {
  return NextResponse.json(
    { success: true, orders: globalThis.orders },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

// POST: చెక్‌అవుట్ పేజీ నుండి ఆర్డర్ డేటాను సేవ్ చేయడం
export async function POST(req) {
  try {
    const body = await req.json();
    
    const newOrder = {
      _id: Date.now().toString(),
      name: body.name || 'N/A',
      email: body.email || 'N/A',
      phone: body.phone || 'N/A',
      address: body.address || 'N/A',
      city: body.city || 'N/A',
      pincode: body.pincode || 'N/A',
      items: body.items || [],
      totalAmount: body.totalAmount || 0,
      createdAt: new Date().toISOString(),
    };

    globalThis.orders.unshift(newOrder); // కొత్త ఆర్డర్ పైన చేరుతుంది

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}