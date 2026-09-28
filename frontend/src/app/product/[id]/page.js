'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // లోకల్ స్టోరేజ్ నుండి ప్రొడక్ట్స్ మరియు కార్ట్ లోడ్ చేయి
    const savedProducts = JSON.parse(localStorage.getItem('spy_products') || '[]');
    const foundProduct = savedProducts.find((p) => p.id.toString() === id.toString());
    
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
    }

    const savedCart = JSON.parse(localStorage.getItem('spy_cart') || '[]');
    setCart(savedCart);
  }, [id]);

  const handleAddToCart = () => {
    try {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert('దయచేసి ముందుగా సైజ్ (Size) సెలెక్ట్ చేసుకోండి!');
        return;
      }

      // కేవలం అవసరమైన లైట్‌వెయిట్ ప్రాపర్టీస్‌ను మాత్రమే తీసుకోవాలి
      const lightweightItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        selectedSize: selectedSize || 'Standard',
        cartId: `${product.id}-${selectedSize || 'Standard'}-${Date.now()}`
      };

      const updatedCart = [...cart, lightweightItem];
      setCart(updatedCart);

      try {
        localStorage.setItem('spy_cart', JSON.stringify(updatedCart));
      } catch (storageError) {
        // స్టోరేజ్ కోటా దాటితే దీన్ని ట్రిగ్గర్ చేసి కేవలం లేటెస్ట్ ఐటెమ్‌ను మాత్రమే స్టోర్ చేస్తుంది
        localStorage.removeItem('spy_cart');
        localStorage.setItem('spy_cart', JSON.stringify([lightweightItem]));
      }

      alert('ప్రొడక్ట్ కార్ట్‌లోకి విజయవంతంగా జోడించబడింది!');
    } catch (error) {
      console.error(error);
      alert('కార్ట్‌లోకి యాడ్ చేయడంలో సమస్య ఏర్పడింది.');
    }
  };

  // కేవలం వాట్సాప్ కాకుండా, ఎక్కడికైనా షేర్ చేసుకునే యూనివర్సల్ షేర్ ఫంక్షన్
  const handleUniversalShare = async () => {
    const productUrl = window.location.href;
    const shareData = {
      title: product.name,
      text: `Check out this amazing item "${product.name}" on SPY ZONE for just ${product.price}!`,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(productUrl);
        alert('ప్రొడక్ట్ లింక్ కాపీ చేయబడింది! మీరు దీన్ని ఎక్కడైనా షేర్ చేసుకోవచ్చు.');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black">
        <p className="text-sm font-bold uppercase mb-4">ఈ ప్రొడక్ట్ కనుగొనబడలేదు లేదా తొలగించబడింది.</p>
        <button 
          onClick={() => router.back()} 
          className="bg-black text-white px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2"
        >
          <span>←</span> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-16">
      {/* Header with Back Arrow */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-gray-100 hover:bg-black hover:text-white px-3 py-2 rounded transition"
        >
          <span className="text-sm font-extrabold">←</span> Back
        </button>

        <Link href="/" className="text-sm md:text-lg font-black uppercase tracking-widest">SPY ZONE</Link>
        
        <div className="flex gap-4 items-center">
          <Link href="/cart" className="text-xs font-bold uppercase bg-black text-white px-3 py-1.5 rounded">
            Bag ({cart.length})
          </Link>
        </div>
      </header>

      {/* Product Details Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          
          {/* ప్రొడక్ట్ ఇమేజ్ */}
          <div className="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden border">
            <img src={product.image} alt={product.name} className="w-full h-[400px] object-cover" />
          </div>

          {/* ప్రొడక్ట్ సమాచారం */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase bg-gray-100 px-2.5 py-1 rounded text-gray-600">
                {product.category || 'Item'}
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase mt-2">{product.name}</h1>
              <p className="text-lg font-extrabold text-green-700 mt-2">{product.price}</p>
              <p className="text-xs text-gray-500 mt-1">SPY ZONE స్టోర్‌లో ప్రత్యేకంగా లభిస్తుంది.</p>
            </div>

            {/* సైజ్ సెలెక్షన్ */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Select Size:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded text-xs font-bold uppercase transition ${
                        selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* యాక్షన్ బటన్స్ */}
            <div className="space-y-3 pt-4 border-t">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition shadow"
              >
                Add to Bag
              </button>
              
              <button
                onClick={handleUniversalShare}
                className="w-full bg-gray-900 text-white py-3.5 text-xs font-bold uppercase tracking-widest rounded hover:bg-black transition shadow flex items-center justify-center gap-2"
              >
                Share 🔗
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}