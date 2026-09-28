'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(0); 
  const [shippingMessage, setShippingMessage] = useState('');

  // UPI Configuration
  const MY_UPI_ID = '9550665977-2@yb';
  const PAYEE_NAME = 'SPYZONE';
  const MY_WHATSAPP_NUMBER = '919550665977'; // మీ WhatsApp నంబర్

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setFormData({ ...formData, phone: val });
      if (errors.phone) setErrors({ ...errors, phone: '' });
    }
  };

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 6) {
      setFormData((prev) => ({ ...prev, pincode: val }));
      if (errors.pincode) setErrors({ ...errors, pincode: '' });

      if (val.length === 6) {
        fetchPincodeDetails(val);
      } else {
        setShippingCharge(0);
        setShippingMessage('');
      }
    }
  };

  const fetchPincodeDetails = async (pin) => {
    setPincodeLoading(true);
    setShippingMessage('లొకేషన్ తనిఖీ చేస్తోంది...');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (data && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const detectedCity = postOffice.District || postOffice.Block;
        const detectedState = postOffice.State;

        setFormData((prev) => ({
          ...prev,
          city: detectedCity,
          state: detectedState,
        }));

        let charge = 60;
        let msg = '';

        if (pin.startsWith('516') || detectedCity.toLowerCase().includes('kadapa')) {
          charge = 40;
          msg = `Local Shipping (${detectedCity})`;
        } else if (['Andhra Pradesh', 'Telangana'].includes(detectedState)) {
          charge = 60;
          msg = `State Shipping (${detectedState})`;
        } else {
          charge = 100;
          msg = `National Shipping (${detectedState})`;
        }

        setShippingCharge(charge);
        setShippingMessage(msg);
      } else {
        setErrors((prev) => ({ ...prev, pincode: 'దయచేసి సరియైన పిన్ కోడ్ ఎంటర్ చేయండి' }));
        setShippingCharge(0);
        setShippingMessage('పిన్ కోడ్ లొకేషన్ దొరకలేదు');
      }
    } catch (err) {
      console.error('Pincode fetch error:', err);
      setShippingMessage('');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    let errs = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'దయచేసి పూర్తి పేరు ఎంటర్ చేయండి';
    }

    if (!formData.phone || formData.phone.length !== 10) {
      errs.phone = 'ఫోన్ నెంబర్ కచ్చితంగా 10 అంకెలు ఉండాలి!';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errs.email = 'సరైన ఇమెయిల్ ఎంటర్ చేయండి';
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = 'దయచేసి పూర్తి అడ్రస్ నింపండి';
    }

    if (!formData.city.trim()) errs.city = 'సిటీ నింపండి';
    if (!formData.state.trim()) errs.state = 'స్టేట్ నింపండి';
    if (!formData.pincode || formData.pincode.length !== 6) {
      errs.pincode = 'పిన్ కోడ్ 6 అంకెలు ఉండాలి!';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const priceNum = parseInt(item.price ? item.price.replace(/[^0-9]/g, '') : '0', 10);
      return total + priceNum;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalAmount = subtotal + shippingCharge;

  // Dynamic PhonePe / UPI Link Trigger
  const handlePayWithPhonePe = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('దయచేసి షిప్పింగ్ వివరాలు సరిగ్గా నింపండి!');
      return;
    }

    if (!cart || cart.length === 0) {
      alert('మీ కార్ట్ ఖాళీగా ఉంది!');
      return;
    }

    const orderId = 'SPY-' + Math.floor(100000 + Math.random() * 900000);

    // Pending Order Details
    const pendingOrder = {
      orderId,
      items: cart,
      subtotal,
      shippingCharge,
      totalAmount,
      shippingAddress: formData,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem('pending_spy_order', JSON.stringify(pendingOrder));

    // Dynamic UPI Intent Link (Generates exact amount on PhonePe)
    const dynamicUpiUrl = `upi://pay?pa=${encodeURIComponent(MY_UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;

    // Open PhonePe / UPI App Directly
    window.location.href = dynamicUpiUrl;

    // Direct WhatsApp Confirmation Trigger
    const waText = `Hi SPY ZONE, I want to confirm my Order:\n\n📌 *Order ID:* ${orderId}\n💰 *Amount:* ₹${totalAmount}\n👤 *Name:* ${formData.fullName}\n📞 *Phone:* ${formData.phone}\n📍 *Address:* ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\nI am attaching the payment screenshot.`;
    const waUrl = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    // 3 సెకన్ల తర్వాత WhatsApp Redirect చేయడం
    setTimeout(() => {
      window.location.href = waUrl;
    }, 3000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-16">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black uppercase tracking-widest">SPY ZONE CHECKOUT</span>
          </Link>
          <Link href="/" className="text-xs font-bold uppercase underline">Back to Shop</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <form onSubmit={handlePayWithPhonePe} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* 1. Shipping Details */}
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b pb-2">1. Shipping Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full border p-3 text-sm rounded ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile no"
                    className={`w-full border p-3 text-sm rounded ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full border p-3 text-sm rounded ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Street Address *</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House No, Street, Landmark"
                  className={`w-full border p-3 text-sm rounded ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.address && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Pincode (6 Digits) *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="e.g. 516101"
                    className={`w-full border p-3 text-sm rounded ${errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {pincodeLoading && <p className="text-blue-600 text-[10px] font-bold mt-1">లొకేషన్ వెతుకుతోంది...</p>}
                  {errors.pincode && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.pincode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City / District"
                    className={`w-full border p-3 text-sm rounded ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.city && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`w-full border p-3 text-sm rounded ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.state && <p className="text-red-600 text-[11px] font-bold mt-1">{errors.state}</p>}
                </div>
              </div>

              {shippingMessage && (
                <div className="p-2.5 bg-gray-100 border rounded text-xs font-bold text-gray-700 flex justify-between items-center">
                  <span>📍 Location Zone:</span>
                  <span className="text-purple-700">{shippingMessage}</span>
                </div>
              )}
            </div>

            {/* 2. Payment Method */}
            <h2 className="text-lg font-bold uppercase tracking-widest mt-10 mb-6 border-b pb-2">2. Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between border p-4 rounded bg-purple-50 border-purple-600 font-bold">
                <div className="flex items-center gap-3">
                  <input type="radio" checked={true} readOnly className="accent-purple-700 w-4 h-4" />
                  <div>
                    <span className="text-purple-900">Direct PhonePe / UPI Dynamic Link</span>
                    <p className="text-[11px] text-gray-600 font-normal">Opens PhonePe directly with exact order amount</p>
                  </div>
                </div>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded font-bold">Instant</span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 border p-8 rounded h-fit">
            <h2 className="text-md font-bold uppercase tracking-widest border-b pb-4 mb-6">
              Order Summary ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
            </h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                మీ కార్ట్ ఖాళీగా ఉంది!
              </div>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b pb-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded border" />
                      <div>
                        <p className="font-bold text-xs uppercase">{item.name}</p>
                        <p className="text-[11px] text-gray-500 font-bold">Size: {item.selectedSize}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-xs">{item.price}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 items-center">
                <span>Shipping Fee</span>
                {shippingCharge > 0 ? (
                  <span className="font-bold text-black">₹{shippingCharge}</span>
                ) : (
                  <span className="text-gray-400 italic text-xs">పిన్ కోడ్ ఎంటర్ చేయండి</span>
                )}
              </div>

              <div className="flex justify-between font-extrabold text-lg border-t pt-3 mt-3">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0}
              className="w-full bg-purple-700 text-white py-4 mt-8 text-xs uppercase tracking-[0.2em] font-bold hover:bg-purple-800 transition disabled:bg-gray-400 cursor-pointer shadow-lg"
            >
              Pay via PhonePe ₹{totalAmount.toLocaleString('en-IN')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}