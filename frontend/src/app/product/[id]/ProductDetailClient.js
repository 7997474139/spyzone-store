'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

const getCategorySizes = (category, productSizes) => {
  if (Array.isArray(productSizes) && productSizes.length > 0) return productSizes;
  const cat = (category || '').toLowerCase();
  if (['shoes', 'crocs', 'slippers'].includes(cat)) return ['6', '7', '8', '9', '10'];
  if (['pants', 'shorts'].includes(cat)) return ['28', '30', '32', '34', '36'];
  if (['watches', 'caps', 'perfumes'].includes(cat)) return ['FREE SIZE'];
  return ['S', 'M', 'L', 'XL', 'XXL'];
};

export default function ProductDetailClient({ product }) {
  const { addToCart, setIsCartOpen } = useCart();
  const availableSizes = getCategorySizes(product?.category, product?.sizes);
  const [selectedSize, setSelectedSize] = useState(availableSizes.length === 1 ? availableSizes[0] : '');
  const [copied, setCopied] = useState(false);

  // 🚀 మల్టిపుల్ యాంగిల్స్ ఇమేజెస్ ఉంటే సేకరించడం
  const imageList = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : (product?.image ? [product.image] : []);

  // 🚀 ప్రస్తుతం కస్టమర్ సెలెక్ట్ చేసిన ఇమేజ్
  const [activeImage, setActiveImage] = useState(imageList[0] || product?.image || '');

  // 💡 ప్రొడక్ట్ లోడ్ కాగానే మొదటి ఇమేజ్‌ని ఆటోమేటిక్‌గా సెట్ చేయడం
  useEffect(() => {
    if (imageList.length > 0) {
      setActiveImage(imageList[0]);
    } else if (product?.image) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-black uppercase mb-3">ప్రోడక్ట్ లభించలేదు!</h2>
        <Link href="/" className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest">
          ← Back to Store
        </Link>
      </div>
    );
  }

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

  const handleShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store.vercel.app';
    const currentUrl = typeof window !== 'undefined' && !window.location.href.includes('localhost')
      ? window.location.href
      : `${baseUrl}/product/${product._id || product.id}`;

    const shareTitle = `${product.name} - ₹${product.price} | SPY ZONE`;
    const shareText = `🔥 Check out *${product.name}* on SPY ZONE!\n💰 Price: ₹${product.price}\n\n👇 Click link to view product:\n${currentUrl}`;

    const shareData = {
      title: shareTitle,
      text: `🔥 Check out *${product.name}* on SPY ZONE! Price: ₹${product.price}`,
      url: currentUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      const fullMessage = encodeURIComponent(shareText);
      window.open(`https://api.whatsapp.com/send?text=${fullMessage}`, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (copyErr) {
        console.error('Clipboard copy failed:', copyErr);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <header className="sticky top-0 z-40 bg-black text-white border-b border-white/15 px-4 md:px-10 h-[60px] flex items-center justify-between">
        <Link href="/" className="text-lg md:text-xl font-black uppercase tracking-[0.16em] flex items-center gap-2">
          <span>SPY ZONE</span>
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain filter invert" />
        </Link>
        <Link href="/" className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest border border-white/50 px-3 py-1.5 hover:bg-white hover:text-black transition">
          ← Back to Store
        </Link>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
          
          {/* 🛍️ Amazon / Flipkart Style Gallery (Thumbnails + Main Image) */}
          <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
            
            {/* 📸 మల్టిపుల్ యాంగిల్స్ థంబ్‌నెయిల్స్ (1 కంటే ఎక్కువ ఉన్నప్పుడు మాత్రమే చూపిస్తుంది) */}
            {imageList.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px] p-1">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 md:w-20 md:h-20 border-2 rounded p-1 transition flex-shrink-0 bg-[#f8f8f8] cursor-pointer ${
                      activeImage === img ? 'border-black ring-2 ring-black opacity-100 scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* 🖼️ మెయిన్ పెద్ద ఇమేజ్ (థంబ్‌నెయిల్ క్లిక్ చేస్తే ఇది మారుతుంది) */}
            <div className="bg-[#f8f8f8] border border-gray-200 aspect-square w-full flex-1 flex items-center justify-center p-4 rounded">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain transition-all duration-300" />
              ) : (
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">No Image Available</div>
              )}
            </div>
          </div>

          {/* 📝 ప్రొడక్ట్ వివరాలు & యాడ్ టు బ్యాగ్ */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500 mb-1">{product.category || 'Collection'}</p>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-black mb-3">{product.name}</h1>
              <div className="text-xl md:text-2xl font-bold text-black mb-6">₹{product.price}</div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">Select Size:</label>
                <div className="flex gap-2 flex-wrap">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 h-10 px-3 text-xs font-bold border transition flex items-center justify-center ${
                        selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={handleAddToCart} className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition cursor-pointer">
                Add to Bag
              </button>
              <button type="button" onClick={handleShare} className="w-full bg-emerald-600 text-white py-3 text-xs font-bold uppercase tracking-[0.18em] hover:bg-emerald-700 transition flex items-center justify-center gap-2 cursor-pointer">
                <span>🔗 Share Product Link</span>
              </button>
              {copied && <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">✓ లింక్ కాపీ అయింది!</p>}
            </div>

            {product.description && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-800">Product Description:</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}