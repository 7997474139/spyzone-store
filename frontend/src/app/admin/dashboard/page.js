'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// కేటగిరీల వారీగా సైజుల మ్యాపింగ్
const CATEGORY_SIZES = {
  shirts: ['S', 'M', 'L', 'XL', 'XXL'],
  't-shirts': ['S', 'M', 'L', 'XL', 'XXL'],
  shorts: ['S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '30', '32', '34', '36', '38', '40'],
  shoes: ['6', '7', '8', '9', '10', '11'],
  crocs: ['6', '7', '8', '9', '10', '11'],
  slippers: ['6', '7', '8', '9', '10', '11'],
  watches: ['Free Size'],
  caps: ['Free Size'],
  perfumes: ['Free Size'],
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    category: 'shirts',
    sizes: ['S', 'M', 'L'],
  });

  const categories = Object.keys(CATEGORY_SIZES);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/product');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('is_admin_logged_in');
    if (!isLoggedIn) {
      window.location.href = '/admin/login';
      return;
    }
    fetchProducts();
    const savedOrders = JSON.parse(localStorage.getItem('spy_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  // కేటగిరీ మారినప్పుడు సైజులను ఆటోమేటిక్‌గా మార్చడం
  const handleCategoryChange = (cat) => {
    const defaultSizes = CATEGORY_SIZES[cat] || ['Free Size'];
    setNewProduct({
      ...newProduct,
      category: cat,
      sizes: defaultSizes,
    });
  };

  const handleSizeToggle = (size) => {
    let updatedSizes = [...newProduct.sizes];
    if (updatedSizes.includes(size)) {
      updatedSizes = updatedSizes.filter((s) => s !== size);
    } else {
      updatedSizes.push(size);
    }
    setNewProduct({ ...newProduct, sizes: updatedSizes });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('దయచేసి అన్ని వివరాలు మరియు ప్రొడక్ట్ ఫోటోను ఇవ్వండి!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();

      if (data.success) {
        alert('ప్రొడక్ట్ విజయవంతంగా MongoDB లోకి యాడ్ చేయబడింది!');
        await fetchProducts();
        setNewProduct({
          name: '',
          price: '',
          image: '',
          category: 'shirts',
          sizes: ['S', 'M', 'L'],
        });
        setActiveTab('manage');
      } else {
        alert('లోపం: ' + data.error);
      }
    } catch (error) {
      alert('సర్వర్ ఎర్రర్ సంభవించింది!');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 సవరించబడిన డిలీట్ ఫంక్షన్ (MongoDB నుండి డిలీట్ చేస్తుంది)
  const handleRemoveProduct = async (id) => {
    if (!confirm('ఈ ప్రొడక్ట్‌ని డేటాబేస్ నుండి శాశ్వతంగా తొలగించాలనుకుంటున్నారా?')) return;

    try {
      const res = await fetch(`/api/product?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('ప్రొడక్ట్ డేటాబేస్ నుండి విజయవంతంగా తొలగించబడింది!');
        const filtered = products.filter((p) => (p._id || p.id) !== id);
        setProducts(filtered);
      } else {
        alert('డిలీట్ చేయడంలో లోపం: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('సర్వర్ ఎర్రర్ వచ్చింది!');
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (confirm('ఈ ఆర్డర్ను డిలీట్ చేయాలనుకుంటున్నారా?')) {
      const updatedOrders = orders.filter((ord) => ord.orderId !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('spy_orders', JSON.stringify(updatedOrders));
    }
  };

  const handleClearAllOrders = () => {
    if (confirm('అన్ని ఆర్డర్‌లను శాశ్వతంగా తొలగించాలనుకుంటున్నారా?')) {
      setOrders([]);
      localStorage.removeItem('spy_orders');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('is_admin_logged_in');
    window.location.href = '/admin/login';
  };

  const availableSizesForCategory =
    CATEGORY_SIZES[newProduct.category] || ['Free Size'];

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-16">
      <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-45">
        <h1 className="text-sm md:text-base font-black uppercase tracking-widest">
          SPY ZONE ADMIN
        </h1>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            📦 Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition whitespace-nowrap ${
              activeTab === 'add'
                ? 'bg-black text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            ➕ Add Product
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-black text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛠️ Manage ({products.length})
          </button>
        </div>

        <div className="flex gap-3 items-center">
          <Link
            href="/"
            className="text-xs font-bold uppercase underline text-gray-700 hover:text-black"
          >
            Visit Store
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1.5 text-xs font-bold uppercase rounded hover:bg-red-700 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white border p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-sm font-black uppercase tracking-widest">
                Customer Orders List
              </h2>
              {orders.length > 0 && (
                <button
                  onClick={handleClearAllOrders}
                  className="bg-red-600 text-white px-3 py-1.5 text-[11px] font-bold uppercase rounded hover:bg-red-700 transition"
                >
                  Clear All ({orders.length})
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 py-12 text-center">
                ప్రస్తుతం ఎలాంటి ఆర్డర్లు రాలేదు.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b uppercase text-[10px] text-gray-700">
                      <th className="p-3">Order ID & Date</th>
                      <th className="p-3">Customer Details</th>
                      <th className="p-3">Shipping Address</th>
                      <th className="p-3">Items Ordered</th>
                      <th className="p-3">Total & Payment</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 align-top font-extrabold">
                          {ord.orderId}
                          <p className="text-[10px] text-gray-500 font-normal">
                            {ord.date}
                          </p>
                        </td>
                        <td className="p-3 align-top font-bold uppercase">
                          {ord.shippingAddress?.fullName}
                          <p className="text-blue-600 font-semibold">
                            📞 {ord.shippingAddress?.phone}
                          </p>
                        </td>
                        <td className="p-3 align-top">
                          {ord.shippingAddress?.address},{' '}
                          {ord.shippingAddress?.city} -{' '}
                          <span className="text-red-600">
                            {ord.shippingAddress?.pincode}
                          </span>
                        </td>
                        <td className="p-3 align-top">
                          {ord.items?.map((it, i) => (
                            <div key={i} className="text-[11px]">
                              - {it.name} ({it.selectedSize})
                            </div>
                          ))}
                        </td>
                        <td className="p-3 align-top font-black text-green-700">
                          ₹{ord.totalAmount}{' '}
                          <span className="block text-[10px] text-purple-700 uppercase">
                            ({ord.paymentMethod})
                          </span>
                        </td>
                        <td className="p-3 align-top text-center">
                          <button
                            onClick={() => handleDeleteOrder(ord.orderId)}
                            className="bg-red-100 text-red-600 px-2.5 py-1 text-[10px] font-bold uppercase rounded hover:bg-red-600 hover:text-white transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add' && (
          <div className="max-w-xl mx-auto bg-white border p-6 md:p-8 rounded-lg shadow-sm">
            <h2 className="text-md font-black uppercase tracking-widest mb-6 border-b pb-3 text-center">
              Add Product to Store
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Select Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border p-3 text-xs rounded uppercase font-bold bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Product / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="ఉదా: Puma / Nike / Sparx"
                  className="w-full border p-3 text-xs rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Price (₹)
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  placeholder="ఉదా: 499"
                  className="w-full border p-3 text-xs rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Upload Product Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border p-2 text-xs rounded bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  లేదా ఇమేజ్ URL లింక్ పేస్ట్ చేయండి:
                </p>
                <input
                  type="text"
                  value={
                    newProduct.image.startsWith('data:') ? '' : newProduct.image
                  }
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full border p-2.5 text-xs rounded mt-1"
                />
              </div>

              {newProduct.image && (
                <div className="mt-2 flex items-center gap-3 border p-2 rounded bg-gray-50">
                  <img
                    src={newProduct.image}
                    alt="Preview"
                    className="w-12 h-16 object-cover rounded border"
                  />
                  <span className="text-[11px] text-green-700 font-bold">
                    ఫోటో ఎంపిక చేయబడింది!
                  </span>
                </div>
              )}

              {/* Dynamic Sizes according to Category */}
              <div>
                <label className="block text-xs font-bold uppercase mb-2">
                  Available Sizes ({newProduct.category.toUpperCase()})
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizesForCategory.map((size) => (
                    <label
                      key={size}
                      className={`flex items-center gap-1.5 px-3 py-2 border rounded cursor-pointer text-xs font-bold ${
                        newProduct.sizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newProduct.sizes.includes(size)}
                        onChange={() => handleSizeToggle(size)}
                        className="hidden"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded shadow cursor-pointer disabled:bg-gray-400"
              >
                {loading ? 'Publishing...' : 'Publish Product'}
              </button>
            </form>
          </div>
        )}

        {/* Manage Products Tab */}
        {activeTab === 'manage' && (
          <div className="max-w-4xl mx-auto bg-white border p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b pb-3 flex justify-between items-center">
              <span>Manage Store Products</span>
              <span className="text-xs text-gray-500 font-bold">
                Total: {products.length} Items
              </span>
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-gray-500 mb-4">
                  ప్రస్తుతం ఎలాంటి ప్రొడక్ట్స్ లేవు.
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase rounded cursor-pointer"
                >
                  Add New Product Now
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {products.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="flex justify-between items-center border-b pb-3 gap-4 hover:bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded border"
                      />
                      <div>
                        <p className="font-bold text-xs uppercase">
                          {item.name}{' '}
                          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded ml-2">
                            {item.category}
                          </span>
                        </p>
                        <p className="text-xs text-green-700 font-extrabold mt-0.5">
                          ₹{item.price}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Sizes:{' '}
                          {item.sizes && item.sizes.length > 0
                            ? item.sizes.join(', ')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(item._id || item.id)}
                      className="bg-red-100 text-red-600 px-3 py-1.5 text-xs font-bold uppercase rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}