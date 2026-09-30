'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import Link from 'next/link';

// కేటగిరీ ఆధారంగా డిఫాల్ట్ సైజులు
const getCategorySizes = (category, productSizes) => {
  if (Array.isArray(productSizes) && productSizes.length > 0) {
    return productSizes;
  }
  const cat = (category || '').toLowerCase();
  if (['shoes', 'crocs', 'slippers'].includes(cat)) {
    return ['6', '7', '8', '9', '10'];
  }
  if (['pants', 'shorts'].includes(cat)) {
    return ['28', '30', '32', '34', '36'];
  }
  if (['watches', 'caps', 'perfumes'].includes(cat)) {
    return ['FREE SIZE'];
  }
  return ['S', 'M', 'L', 'XL', 'XXL'];
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [copied, setCopied] = useState(false);

  // 1. Fetch products from database and find matching product by _id or id
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await fetch('/api/product', { cache: 'no-store' });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          // MongoDB _id లేదా సాధారణ id రెంటినీ మ్యాచ్ చేస్తుందీ లాజిక్
          const found = data.data.find(
            (p) => String(p._id) === String(productId) || String(p.id) === String(productId)
          );
          if (found) {
            setProduct(found);
            // ఒకవేళ FREE SIZE మాత్రమే ఉంటే ఆటో-సెలెక్ట్ అవుతుంది
            const sizes = getCategorySizes(found.category, found.sizes);
            if (sizes.length === 1) {
              setSelectedSize(sizes[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // 2. Add to Bag Handler
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('దయచేసి సైజ్ (Size) సెలెక్ట్ చేసుకోండి!');
      return;
    }

    addToCart({
      ...product,
      id: product._id || product.id,
      selectedSize,
      cartId: `${product._id || product.id}-${selectedSize}-${Date.now()}`,
    });

    setIsCartOpen(true);
  };

  // 3. Share Product Link Handler (WhatsApp & Direct Link)
  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareData = {
      title: product ? `SPY ZONE - ${product.name}` : 'SPY ZONE Product',
      text: `Check out this product on SPY ZONE: ${product?.name}`,
      url: currentUrl,
    };

    // మొబైల్ ప్రొవైడర్లలో నేరుగా Share Sheet (WhatsApp, Telegram, etc.) ఓపెన్ అవుతుంది
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share error or cancelled', err);
      }
    } else {
      // డెస్క్‌టాప్‌లో అయితే లింక్ క్లిప్‌బోర్డ్‌కి కాపీ అవుతుంది
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-500">
        ప్రోడక్ట్ వివరాలు లోడ్ అవుతున్నాయి...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-black uppercase mb-3">ప్రోడక్ట్ లభించలేదు!</h2>
        <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
          మీరు వెతుకుతున్న ప్రోడక్ట్ తొలగించబడి ఉండవచ్చు లేదా లభ్యం కావడం లేదు.
        </p>
        <Link
          href="/"
          className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest"
        >
          ← Back to Store
        </Link>
      </div>
    );
  }

  const availableSizes = getCategorySizes(product.category, product.sizes);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-black text-white border-b border-white/15 px-4 md:px-10 h-[60px] flex items-center justify-between">
        <Link href="/" className="text-lg md:text-xl font-black uppercase tracking-[0.16em] flex items-center gap-2">
          <span>SPY ZONE</span>
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain filter invert" />
        </Link>

        <Link
          href="/"
          className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest border border-white/50 px-3 py-1.5 hover:bg-white hover:text-black transition"
        >
          ← Back to Store
        </Link>
      </header>

      {/* PRODUCT DETAILS CONTAINER */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* LEFT: Product Image */}
          <div className="bg-[#f8f8f8] border border-gray-200 aspect-square w-full flex items-center justify-center p-4">
            {product.image && product.image.trim() !== '' ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                No Image Available
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500 mb-1">
                {product.category || 'Collection'}
              </p>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-black mb-3">
                {product.name}
              </h1>

              <div className="text-xl md:text-2xl font-bold text-black mb-6">
                {typeof product.price === 'number' ? `₹${product.price}` : product.price}
              </div>

              {/* SIZE SELECTOR */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                  Select Size:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 h-10 px-3 text-xs font-bold border transition flex items-center justify-center ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {/* ADD TO BAG */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition active:scale-[0.98]"
              >
                Add to Bag
              </button>

              {/* SHARE PRODUCT LINK BUTTON */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full bg-emerald-600 text-white py-3 text-xs font-bold uppercase tracking-[0.18em] hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <span>🔗 Share Product Link</span>
              </button>

              {copied && (
                <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">
                  ✓ లింక్ కాపీ అయింది! మీ ఫ్రెండ్స్‌కి పంపవచ్చు.
                </p>
              )}
            </div>

            {/* PRODUCT DESCRIPTION */}
            {product.description && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-800">
                  Product Description:
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}