import ProductDetailClient from './ProductDetailClient';

async function getProduct(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-store.onrender.com';
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

// 🚀 ఈ ఫంక్షన్ ద్వారా సర్వర్‌లోనే వాట్సాప్ కోసం ప్రొడక్ట్ ఫోటో మరియు టైటిల్ జనరేట్ అవుతాయి
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'SPY ZONE | Product Not Found',
    };
  }

  const imageUrl = product.image || 'https://spyzone-store.onrender.com/logo.png';

  return {
    title: `${product.name} | SPY ZONE`,
    description: `Price: ₹${product.price} - Buy ${product.name} online on SPY ZONE Luxury Fashion.`,
    openGraph: {
      title: `${product.name} | SPY ZONE`,
      description: `Price: ₹${product.price}`,
      url: `https://spyzone-store.onrender.com/product/${id}`,
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
      title: `${product.name} | SPY ZONE`,
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