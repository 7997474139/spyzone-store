'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = ['Shirts', 'Pants', 'Shoes', 'Watches', 'Caps', 'Perfumes'];

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Shoes'); // డిఫాల్ట్ కేటగిరీ
  const [image, setImage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      router.push('/admin/login');
    }
  }, [router]);

  // ఫోటోను అప్లోడ్ చేసి రీడ్ చేయడం
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !image || !category) {
      alert('దయచేసి అన్ని వివరాలు నింపండి!');
      return;
    }

    const newProduct = {
      id: Date.now(),
      name,
      price: `₹${price}`,
      image,
      category, // మీరు సెలెక్ట్ చేసిన కేటగిరీ ఇక్కడ సేవ్ అవుతుంది
      sizes: category === 'Shoes' ? ['7', '8', '9', '10'] : ['S', 'M', 'L', 'XL', 'XXL'],
    };

    const existingProducts = JSON.parse(localStorage.getItem('spy_products') || '[]');
    localStorage.setItem('spy_products', JSON.stringify([newProduct, ...existingProducts]));

    alert('ప్రొడక్ట్ విజయవంతంగా యాడ్ అయింది!');
    setName('');
    setPrice('');
    setImage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-8 font-sans">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 p-8 rounded shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-sm font-black uppercase tracking-widest">Admin: Add New Product</h1>
          <div className="flex gap-4">
            <Link href="/" className="text-xs font-bold uppercase underline">Home</Link>
            <button onClick={handleLogout} className="text-xs text-red-600 font-bold uppercase">Logout</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* కేటగిరీ సెలెక్ట్ చేసుకునే ఆప్షన్ */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2">Select Category (కేటగిరీ ఎంచుకోండి)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2.5 text-xs bg-white font-bold uppercase"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Product Name (ప్రొడక్ట్ పేరు)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2.5 text-xs"
              placeholder="ఉదా: Puma Running Shoes / Black Shirt"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Price (₹) (ధర)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2.5 text-xs"
              placeholder="ఉదా: 1899"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Upload Product Image (ఫోటో అప్లోడ్ చేయండి)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border p-2 text-xs bg-gray-50"
              required
            />
          </div>

          {image && (
            <div className="w-24 h-28 border rounded overflow-hidden">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <button type="submit" className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800">
            Publish Product to {category}
          </button>
        </form>
      </div>
    </div>
  );
}