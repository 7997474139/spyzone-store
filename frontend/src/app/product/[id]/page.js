import ProductDetailClient from './ProductDetailClient';

async function getProduct(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store.vercel.app';
    const res = await fetch(`${baseUrl}/api/product`, { cache: 'no-store' });
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data.find(
        (p) => String(p._id) === String(id) || String(p.id) === String(id)
      );
    }
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store.vercel.app';

  if (!product) {
    return {
      title: 'SPY ZONE | Product Not Found',
    };
  }

  // 💡 ఇమేజ్ చెకింగ్: ఇమేజ్ గనక Base64 కాకుండా ఆన్‌లైన్ https URL అయితేనే వాట్సాప్‌కి ఇస్తాం
  let imageUrl = product.image;
  
  if (!imageUrl || imageUrl.startsWith('data:')) {
    // ఫోటో Base64 లో ఉంటే లేదా లేకపోతే ఫాల్‌బ్యాక్ డొమైన్ లోగో
    imageUrl = `${baseUrl}/logo.png`;
  } else if (!imageUrl.startsWith('http')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return {
    title: `${product.name} - ₹${product.price} | SPY ZONE`,
    description: `Check out ${product.name} on SPY ZONE Luxury Fashion! Price: ₹${product.price}`,
    openGraph: {
      title: `${product.name} - ₹${product.price}`,
      description: `Price: ₹${product.price} - Buy ${product.name} online on SPY ZONE.`,
      url: `${baseUrl}/product/${id}`,
      siteName: 'SPY ZONE',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ₹${product.price}`,
      description: `Price: ₹${product.price}`,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  return <ProductDetailClient product={product} />;
}