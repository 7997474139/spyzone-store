'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedOrders = localStorage.getItem('spy_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearAllOrders = () => {
    if (confirm('అన్ని ఆర్డర్ల హిస్టరీని తొలగించాలనుకుంటున్నారా?')) {
      localStorage.removeItem('spy_orders');
      setOrders([]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-16">
      {/* Admin Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black uppercase tracking-widest">SPY ZONE - ADMIN ORDERS</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-xs font-bold uppercase underline">Home</Link>
            <Link href="/admin/add-product" className="text-xs bg-black text-white px-3 py-1.5 uppercase font-bold">
              + Add Product
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest">Customer Orders</h1>
            <p className="text-xs text-gray-500 mt-1">Total Orders Placed: {orders.length}</p>
          </div>
          {orders.length > 0 && (
            <button
              onClick={clearAllOrders}
              className="bg-red-600 text-white px-4 py-2 text-xs uppercase font-bold tracking-wider hover:bg-red-700"
            >
              Clear All Orders
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border p-12 text-center rounded shadow-sm">
            <p className="text-gray-500 text-sm mb-4">ప్రస్తుతానికి ఎలాంటి ఆర్డర్లు రాలేదు.</p>
            <Link href="/" className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest">
              షాపింగ్ పేజీకి వెళ్లండి
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4 gap-2">
                  <div>
                    <span className="text-xs font-bold bg-black text-white px-2.5 py-1 uppercase tracking-wider">
                      {order.orderId}
                    </span>
                    <span className="text-xs text-gray-500 ml-4 font-semibold">Ordered on: {order.date}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 uppercase">
                      Payment: {order.paymentMethod === 'phonepe' ? 'PhonePe / UPI' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded mb-6 text-xs">
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-gray-700 mb-2">Customer Details:</h3>
                    <p><strong className="text-black">Name:</strong> {order.shippingAddress.fullName}</p>
                    <p><strong className="text-black">Phone:</strong> {order.shippingAddress.phone}</p>
                    <p><strong className="text-black">Email:</strong> {order.shippingAddress.email || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-gray-700 mb-2">Shipping Address:</h3>
                    <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>
                </div>

                {/* Ordered Items List */}
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-700">Ordered Items:</h3>
                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-3 text-sm">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded border" />
                        <div>
                          <p className="font-bold text-xs uppercase">{item.name}</p>
                          <p className="text-xs text-gray-500 font-bold">Size: <span className="text-black">{item.selectedSize}</span></p>
                        </div>
                      </div>
                      <span className="font-semibold text-xs">{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-4 font-black text-sm">
                  <span>Total Amount Paid:</span>
                  <span className="text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}