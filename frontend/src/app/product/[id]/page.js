import ProductDetailClient from './ProductDetailClient';

async function getProduct(id) {
  try {
    // 🚀 Vercel Free Domain Link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store-git-main-spyzone.vercel.app';
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

// 🚀 వాట్సాప్ ప్రివ్యూ మరియు SEO కోసం Vercel డొమైన్ ఆధారంగా మెటాడేటా
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store-git-main-spyzone.vercel.app';

  if (!product) {
    return {
      title: 'SPY ZONE | Product Not Found',
    };
  }

  // 💡 ఇమేజ్ URL చెకింగ్ (Base64 ఉంటే వాట్సాప్ తీసుకోదు కాబట్టి ఫాల్‌బ్యాక్ ఇమేజ్ వాడతాం)
  let imageUrl = product.image || `${baseUrl}/logo.png`;
  if (imageUrl.startsWith('data:')) {
    // ఫోటో అప్‌లోడ్ చేసినది స్థానికంగా Base64 లో ఉంటే ఫాల్‌బ్యాక్ డొమైన్ లోగో వాడతాం
    imageUrl = `${baseUrl}/logo.png`;
  } else if (!imageUrl.startsWith('http')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return {
    title: `${product.name} | SPY ZONE`,
    description: `Price: ₹${product.price} - Buy ${product.name} online on SPY ZONE Luxury Fashion.`,
    openGraph: {
      title: `${product.name} - ₹${product.price}`,
      description: `Check out ${product.name} on SPY ZONE Luxury Fashion! Price: ₹${product.price}`,
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