'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('spy_cart') || '[]');
      setCart(savedCart);
    } catch (e) {
      console.error("Failed to load cart:", e);
      setCart([]);
    }
  }, []);

  const removeFromCart = (cartId) => {
    const updated = cart.filter((item) => (item.cartId || item.id) !== cartId);
    setCart(updated);
    try {
      localStorage.setItem('spy_cart', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceStr = String(item.price || '0');
      const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
      return total + priceNum;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-16">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black text-white px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="text-xs font-bold uppercase tracking-widest bg-white/20 hover:bg-white hover:text-black px-3 py-1.5 rounded transition"
        >
          ← Back
        </button>
        <Link href="/" className="text-sm md:text-lg font-black uppercase tracking-widest">
          SPY ZONE
        </Link>
        <div className="text-xs font-bold uppercase tracking-wider">
          Bag ({cart.length})
        </div>
      </header>

      {/* Cart Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-black uppercase tracking-wide mb-6">
          Your Shopping Bag
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg">
            <p className="text-sm font-bold uppercase text-gray-500 mb-4">
              మీ కార్ట్ ప్రస్తుతం ఖాళీగా ఉంది.
            </p>
            <Link 
              href="/" 
              className="inline-block bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="divide-y border-t border-b border-gray-200">
              {cart.map((item, idx) => (
                <div key={item.cartId || idx} className="py-4 flex items-center gap-4">
                  
                  {/* ప్రొడక్ట్ ఇమేజ్ */}
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name || 'Product'} 
                      className="w-20 h-24 object-contain bg-gray-50 border rounded p-1"
                    />
                  ) : (
                    <div className="w-20 h-24 bg-gray-100 border rounded flex items-center justify-center text-[10px] text-gray-400 uppercase">
                      No Image
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase">{item.name || 'SPY ZONE Item'}</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      Size: {item.selectedSize || item.size || 'Standard'}
                    </p>
                    <p className="text-sm font-bold mt-1 text-black">
                      {item.price ? (String(item.price).startsWith('₹') ? item.price : `₹${item.price}`) : '₹0'}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartId || idx)}
                    className="text-xs font-bold uppercase text-red-600 hover:underline px-3 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs uppercase text-gray-500 font-bold">Total Amount</p>
                <p className="text-xl font-black text-black">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </p>
              </div>
              <Link
                href="/checkout"
                className="w-full sm:w-auto bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-center hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}