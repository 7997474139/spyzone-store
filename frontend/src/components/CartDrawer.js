'use client';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  // Subtotal కాలిక్యులేషన్ (₹2,499 రకం నుండి నంబర్లని వేరు చేసి కూడుతుంది)
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
      return total + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-black p-6 flex flex-col justify-between shadow-2xl">
          
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold uppercase tracking-widest">Shopping Bag ({cart.length})</h2>
              <button onClick={() => setIsOpen(false)} className="text-xl font-light hover:text-gray-500">✕</button>
            </div>

            <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12 uppercase tracking-wider">Your bag is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="flex space-x-4 border-b border-gray-100 pb-4">
                    <img src={item.images[0]} alt={item.name} className="w-20 h-24 object-cover bg-gray-100" />
                    <div className="flex-1 text-xs space-y-1">
                      <h3 className="uppercase tracking-wider font-medium">{item.name}</h3>
                      <p className="text-gray-500">Size: {item.selectedSize}</p>
                      <p className="font-semibold">{item.price}</p>
                      <button 
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-gray-400 underline hover:text-black pt-2 text-[10px] uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                <span>Subtotal</span>
                <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}