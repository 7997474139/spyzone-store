'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

const initialProducts = [];

// Crocs మరియు Slippers కేటగిరీలు యాడ్ చేయబడ్డాయి
const categories = [
  'all',
  'shirts',
  't-shirts',
  'shorts',
  'pants',
  'shoes',
  'crocs',
  'slippers',
  'watches',
  'caps',
  'perfumes'
];

export default function Home() {
  const {
    cart,
    addToCart,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [selectedSizes, setSelectedSizes] = useState({});
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState('all');
  const [bannerImages, setBannerImages] = useState([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('spy_products');
    let allProds = initialProducts;

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (parsed.length > 0) {
          allProds = parsed;
          setProducts(allProds);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (allProds.length > 0) {
      const imagesList = allProds.map((item) => item.image).filter(Boolean);
      const uniqueImages = [...new Set(imagesList)];
      if (uniqueImages.length > 0) {
        setBannerImages(uniqueImages);
      }
    }
  }, []);

  useEffect(() => {
    if (bannerImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [bannerImages]);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = (item) => {
    const selectedSize = selectedSizes[item.id];

    if (!selectedSize) {
      alert('దయచేసి ముందుగా సైజ్ (Size) సెలెక్ట్ చేసుకోండి!');
      return;
    }

    addToCart({
      ...item,
      selectedSize,
      cartId: `${item.id}-${selectedSize}-${Date.now()}`,
    });

    setIsCartOpen(true);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum = parseInt(
        item.price
          ? item.price.replace(/[^0-9]/g, '')
          : '0',
        10
      );

      return total + priceNum;
    }, 0);
  };

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter(
          (item) =>
            item.category?.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-white text-black font-sans">

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-black text-white border-b border-white/15 overflow-hidden">
        <div className="max-w-[1400px] mx-auto h-[68px] px-5 md:px-10 flex items-center justify-between gap-6">

          <div className="flex-1 overflow-hidden relative flex items-center">
            <div className="flex whitespace-nowrap animate-marquee items-center">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center mx-6 gap-3 shrink-0">
                  <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-lg md:text-xl font-black uppercase tracking-[0.16em]">
                      SPY ZONE
                    </span>
                    <img 
                      src="/logo.png" 
                      alt="Spider Logo" 
                      className="w-5 h-5 md:w-6 md:h-6 object-contain filter invert" 
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5 shrink-0 z-10 bg-black pl-4">
            <button
              type="button"
              aria-label="Search"
              className="hidden sm:block text-lg leading-none hover:text-gray-300 transition"
            >
              ⌕
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] hover:text-gray-300 transition"
            >
              Bag ({cart.length})
            </button>

            <Link
              href="/admin/login"
              className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] border border-white/70 px-3.5 py-2 hover:bg-white hover:text-black transition"
            >
              Admin
            </Link>
          </div>

        </div>
      </header>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] lg:h-[500px] bg-black overflow-hidden">
        {bannerImages.length > 0 ? (
          bannerImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentBanner
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-end pr-6 sm:pr-12 md:pr-20 bg-[#080808]">
                <img
                  src={img}
                  alt={`SPY ZONE Collection ${idx + 1}`}
                  className="h-[70%] sm:h-[75%] md:h-[80%] max-w-[50%] sm:max-w-[40%] md:max-w-[35%] object-contain drop-shadow-xl opacity-95 transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent w-full md:w-[75%]" />

              <div className="absolute inset-0 flex items-center z-20">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 w-full">
                  <div className="max-w-2xl text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.42em] font-semibold text-gray-400">
                        SPY ZONE EXCLUSIVE
                      </span>
                      <img 
                        src="/logo.png" 
                        alt="Spider Icon" 
                        className="w-4 h-4 object-contain filter invert opacity-80" 
                      />
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-[1.1] font-black uppercase tracking-[0.03em] mb-3">
                      REDEFINE YOUR STYLE. <br />
                      <span className="text-gray-300 text-xl sm:text-2xl md:text-3xl lg:text-[36px]">UNLEASH THE CONFIDENCE.</span>
                    </h1>

                    <p className="text-xs md:text-sm uppercase tracking-[0.32em] text-gray-400 mb-6">
                      Crafted for the bold. Built for your everyday statement.
                    </p>

                    <a
                      href="#arrivals"
                      className="inline-flex items-center justify-center bg-white text-black px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-gray-200 transition"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center px-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider">
                  SPY ZONE
                </h1>
                <img 
                  src="/logo.png" 
                  alt="Spider Icon" 
                  className="w-6 h-6 object-contain filter invert" 
                />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">
                Redefine your style. Unleash the confidence.
              </p>
              <a
                href="#arrivals"
                className="inline-block bg-white text-black px-6 py-3 text-xs uppercase tracking-widest font-bold"
              >
                Shop Now
              </a>
            </div>
          </div>
        )}

        {bannerImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to banner ${idx + 1}`}
                onClick={() => setCurrentBanner(idx)}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentBanner
                    ? 'bg-white scale-125'
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* NEW ARRIVALS */}
      <section
        id="arrivals"
        className="max-w-[1400px] mx-auto px-5 md:px-10 py-10 md:py-14"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
              Latest drops
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.08em]">
              New Arrivals
            </h2>
          </div>
        </div>

        {/* Categories Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] border transition ${
                activeCategory === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-14 text-gray-500 text-xs uppercase font-semibold tracking-widest border border-dashed border-gray-300 rounded-lg">
            ఈ కేటగిరీలో ఎలాంటి ప్రొడక్ట్స్ అందుబాటులో లేవు.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map((item) => (
              <article
                key={item.id}
                className="group bg-white border border-gray-200 hover:border-black transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    <Link href={`/product/${item.id}`} className="block">
                      <div className="w-full aspect-[4/4.5] bg-[#f8f8f8] overflow-hidden flex items-center justify-center p-2.5">
                        {item.image && item.image.trim() !== '' ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    <span className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] font-bold">
                      New
                    </span>
                  </div>

                  <div className="p-2.5">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-medium text-[11px] uppercase tracking-wide leading-tight line-clamp-1 hover:underline text-gray-900">
                        {item.name}
                      </h3>
                    </Link>

                    <p className="text-xs font-bold mt-1 text-black">
                      {item.price}
                    </p>

                    <div className="mt-2">
                      <div className="flex gap-1 flex-wrap">
                        {(item.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeSelect(item.id, size)}
                            className={`min-w-5 h-5 px-1 text-[8px] font-bold border transition flex items-center justify-center ${
                              selectedSizes[item.id] === size
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
                </div>

                <div className="p-2.5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-black text-white py-1.5 text-[9px] uppercase tracking-[0.15em] font-bold hover:bg-gray-800 transition"
                  >
                    Add to Bag
                  </button>

                  <Link
                    href={`/product/${item.id}`}
                    className="block text-center mt-1.5 text-[8px] uppercase tracking-[0.12em] font-semibold text-gray-500 hover:text-black transition"
                  >
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SIDE CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">

              <div className="flex items-center justify-between px-6 py-5 border-b">
                <h2 className="text-sm font-bold uppercase tracking-[0.15em]">
                  SPY ZONE Bag ({cart.length})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-black font-bold text-lg hover:rotate-90 transition"
                  aria-label="Close cart"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-12 uppercase tracking-widest">
                    మీ బ్యాగ్ ఖాళీగా ఉంది.
                  </p>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-center border-b pb-4"
                    >
                      {item.image && item.image.trim() !== '' ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 object-contain border bg-gray-50"
                        />
                      ) : (
                        <div className="w-16 h-20 border bg-gray-50 flex items-center justify-center text-[9px] text-gray-400">
                          No Img
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className="font-bold text-xs uppercase">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          Size: {item.selectedSize}
                        </p>
                        <p className="text-xs font-semibold mt-1">
                          {item.price}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId || idx)}
                        className="text-[10px] text-red-600 font-bold uppercase hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-6 bg-gray-50">
                  <div className="flex justify-between font-bold text-sm mb-4">
                    <span>Total</span>
                    <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="block text-center w-full bg-black text-white py-3.5 text-xs uppercase tracking-[0.18em] font-bold hover:bg-gray-800 transition"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}