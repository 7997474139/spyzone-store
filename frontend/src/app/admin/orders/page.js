'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 API నుండి ఆర్డర్లను తెచ్చుకునే ఫంక్షన్
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // ప్రతి 5 సెకన్లకు ఆటోమేటిక్ రిఫ్రెష్
    return () => clearInterval(interval);
  }, []);

  const clearAllOrders = async () => {
    if (confirm('అన్ని ఆర్డర్ల హిస్టరీని తొలగించాలనుకుంటున్నారా?')) {
      try {
        const res = await fetch('/api/orders', { method: 'DELETE' });
        if (res.ok) {
          setOrders([]);
        }
      } catch (err) {
        console.error('Delete orders error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-16">
      {/* HEADER WITH TABS */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xl font-black uppercase tracking-widest">
            SPY ZONE ADMIN
          </span>

          <div className="flex gap-2 items-center bg-gray-100 p-1 rounded-lg">
            <Link
              href="/admin/orders"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-black text-white"
            >
              📦 ORDERS ({orders.length})
            </Link>
            <Link
              href="/admin/add-product"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-200 rounded"
            >
              + ADD PRODUCT
            </Link>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={fetchOrders}
              className="text-xs bg-gray-200 text-black border px-3 py-1.5 uppercase font-bold hover:bg-gray-300 rounded"
            >
              🔄 Refresh
            </button>
            <Link href="/" className="text-xs font-bold uppercase underline">
              VISIT STORE
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-lg font-black uppercase tracking-widest">
                CUSTOMER ORDERS LIST
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                మొత్తం ఆర్డర్లు: {orders.length}
              </p>
            </div>
            {orders.length > 0 && (
              <button
                onClick={clearAllOrders}
                className="bg-red-600 text-white px-3 py-1.5 text-xs uppercase font-bold tracking-wider hover:bg-red-700 rounded"
              >
                Clear All
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs font-semibold text-gray-500">
              ఆర్డర్లు లోడ్ అవుతున్నాయి...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              ప్రస్తుతం ఎలాంటి ఆర్డర్లు రాలేదు.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const addr = order.shippingAddress || order;
                const name = addr.fullName || addr.name || order.name || 'N/A';
                const phone = addr.phone || order.phone || 'N/A';
                const email = addr.email || order.email || 'N/A';
                const address = addr.address || order.address || 'N/A';
                const city = addr.city || order.city || '';
                const state = addr.state || order.state || '';
                const pincode = addr.pincode || order.pincode || '';

                return (
                  <div
                    key={order._id || index}
                    className="border border-gray-300 rounded-lg p-5 bg-gray-50/50 hover:bg-white transition"
                  >
                    <div className="flex flex-col md:flex-row justify-between border-b pb-3 mb-4 gap-2">
                      <div>
                        <span className="text-xs font-black bg-black text-white px-2.5 py-1 rounded uppercase tracking-wider">
                          {order.orderId || `SPY-${index + 1}`}
                        </span>
                        <span className="text-xs text-gray-500 ml-3 font-semibold">
                          Date: {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded w-fit">
                        Payment: {order.paymentMethod || 'PhonePe / UPI'}
                      </span>
                    </div>

                    {/* CUSTOMER & SHIPPING DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border rounded mb-4 text-xs">
                      <div>
                        <h3 className="font-bold uppercase tracking-wider text-gray-700 mb-2 border-b pb-1">
                          👤 Customer Details:
                        </h3>
                        <p className="py-0.5"><strong className="text-black">Name:</strong> {name}</p>
                        <p className="py-0.5"><strong className="text-black">Phone:</strong> {phone}</p>
                        <p className="py-0.5"><strong className="text-black">Email:</strong> {email}</p>
                      </div>
                      <div>
                        <h3 className="font-bold uppercase tracking-wider text-gray-700 mb-2 border-b pb-1">
                          🏠 Delivery Address:
                        </h3>
                        <p className="leading-relaxed">
                          {address}, {city}, {state} - <strong className="text-purple-700 font-bold">{pincode}</strong>
                        </p>
                      </div>
                    </div>

                    {/* ITEMS LIST */}
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                      📦 Ordered Items ({order.items?.length || 0}):
                    </h3>
                    <div className="space-y-2 mb-4 bg-white p-3 border rounded">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b last:border-0 pb-2 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded border"
                              />
                            )}
                            <div>
                              <p className="font-bold uppercase">{item.name}</p>
                              <p className="text-[10px] text-gray-500">
                                Size: <span className="font-bold text-black">{item.selectedSize || 'N/A'}</span>
                              </p>
                            </div>
                          </div>
                          <span className="font-bold">{item.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 font-black text-sm">
                      <span>Total Paid Amount:</span>
                      <span className="text-base text-emerald-600">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}