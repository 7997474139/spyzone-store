'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Clear cart after successful order confirmation
    clearCart();

    try {
      const pending = localStorage.getItem('pending_spy_order');
      if (pending) {
        const parsed = JSON.parse(pending);
        setOrderDetails(parsed);

        // Save into permanent orders list
        const existingOrders = JSON.parse(localStorage.getItem('spy_orders') || '[]');
        localStorage.setItem('spy_orders', JSON.stringify([parsed, ...existingOrders]));
        localStorage.removeItem('pending_spy_order');
      }
    } catch (e) {
      console.error('Error saving confirmed order:', e);
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto my-16 p-8 border rounded-xl shadow-lg bg-white text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
        ✓
      </div>
      <h1 className="text-2xl font-black uppercase tracking-wider text-green-700">Order Confirmed!</h1>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Payment Received via PhonePe</p>

      <div className="my-6 p-4 bg-gray-50 rounded border text-left text-sm space-y-2">
        <div className="flex justify-between font-bold border-b pb-2">
          <span>Order ID:</span>
          <span className="text-purple-700">{orderId || orderDetails?.orderId || 'SPY-CONFIRMED'}</span>
        </div>
        {orderDetails && (
          <>
            <div className="flex justify-between text-gray-600">
              <span>Customer Name:</span>
              <span className="font-semibold text-black">{orderDetails.shippingAddress.fullName}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Paid:</span>
              <span className="font-extrabold text-black">₹{orderDetails.totalAmount}</span>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-600 mb-8">
        మీ ఆర్డర్ విజయవంతంగా కన్ఫర్మ్ అయింది. అతిత్వరలో డిస్పాచ్ వివరాలు మీకు అందజేస్తాం.
      </p>

      <Link
        href="/"
        className="inline-block bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <Suspense fallback={<div className="text-center font-bold">Loading Order Details...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}