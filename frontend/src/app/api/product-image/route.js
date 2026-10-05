import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing product ID', { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store.vercel.app';
    const res = await fetch(`${baseUrl}/api/product`, { cache: 'no-store' });
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      return new NextResponse('Product fetch failed', { status: 404 });
    }

    const product = data.data.find(
      (p) => String(p._id) === String(id) || String(p.id) === String(id)
    );

    if (!product || !product.image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // ఒకవేళ ఆల్రెడీ ఆన్‌లైన్ https URL అయితే ఆ ఇమేజ్‌కే రీడైరెక్ట్ చేస్తాం
    if (product.image.startsWith('http')) {
      return NextResponse.redirect(product.image);
    }

    // Base64 ఫోటోను నిజమైన ఇమేజ్ బఫర్‌గా మార్చి వాట్సాప్‌కి ఇస్తాం
    if (product.image.startsWith('data:image/')) {
      const matches = product.image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      }
    }

    return new NextResponse('Invalid image format', { status: 400 });
  } catch (error) {
    console.error('Error serving product image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}