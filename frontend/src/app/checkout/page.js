'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

// ----------------------------------------------------
// ⚙️ మీ వివరాలు ఇక్కడ అప్‌డేట్ చేయబడ్డాయి:
// ----------------------------------------------------
const STORE_UPI_ID = "8978314516@ybl"; // 👈 మీ PhonePe UPI ID
const STORE_NAME = "SPY ZONE";
const OWNER_WHATSAPP_NUMBER = "917890644323"; // 👈 మీ వాట్సాప్ నంబర్
const QR_IMAGE_PATH = "/qr-code.png"; // 👈 public/qr-code.png లో ఉన్న మీ Scanner ఫోటో
// ----------------------------------------------------

// పిన్‌కోడ్ (516101 Base) ఆధారంగా డైనామిక్ షిప్పింగ్ ఛార్జీలు
const calculateShippingFee = (pincode) => {
  const cleanPin = pincode ? pincode.trim() : '';

  if (cleanPin.length < 6) {
    return { fee: 40, zone: 'Local / Standard Zone' };
  }

  // 1. రైల్వే కోడూరు & పరిసర ప్రాంతాలు (5161XX)
  if (cleanPin.startsWith('5161')) {
    return { fee: 40, zone: 'Local Koduru Zone (Railway Koduru Area)' };
  }

  // 2. ఆంధ్రప్రదేశ్ & తెలంగాణ (50, 51, 52, 53)
  const prefix2 = cleanPin.substring(0, 2);
  if (['51', '52', '53', '50'].includes(prefix2)) {
    return { fee: 70, zone: 'Andhra Pradesh & Telangana Zone' };
  }

  // 3. సౌత్ ఇండియా (కార్ణాటక, తమిళనాడు, కేరళ)
  const pinNum = parseInt(cleanPin, 10);
  if (
    (pinNum >= 560000 && pinNum <= 599999) ||
    (pinNum >= 600000 && pinNum <= 649999) ||
    (pinNum >= 670000 && pinNum <= 699999)
  ) {
    return { fee: 90, zone: 'South India Regional Zone' };
  }

  // 4. మిగతా భారతదేశం (Rest of India)
  return { fee: 120, zone: 'National Zone (Rest of India)' };
};

export default function CheckoutPage() {
  const { cart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
  });

  const [shippingInfo, setShippingInfo] = useState({ fee: 40, zone: 'Local / Standard Zone' });
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [showDesktopQR, setShowDesktopQR] = useState(false);

  useEffect(() => {
    const info = calculateShippingFee(formData.pincode);
    setShippingInfo(info);
  }, [formData.pincode]);

  const subtotal = cart.reduce((total, item) => {
    const priceNum = parseInt(
      item.price ? item.price.toString().replace(/[^0-9]/g, '') : '0',
      10
    );
    return total + priceNum;
  }, 0);

  const shippingFee = subtotal > 0 ? shippingInfo.fee : 0;
  const totalAmount = subtotal + shippingFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isMobileDevice = () => {
    if (typeof window !== 'undefined') {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
    return false;
  };

  const handlePaymentAndOrder = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address || !formData.pincode) {
      alert('దయచేసి అన్ని వివరాలను (Name, Phone, Address, Pincode) పూర్తి చేయండి!');
      return;
    }

    if (cart.length === 0) {
      alert('మీ బ్యాగ్ ఖాళీగా ఉంది!');
      return;
    }

    // 1. WhatsApp Message (ఓనర్ కోసం)
    let itemsListText = cart
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.name} (Size: ${item.selectedSize || 'N/A'}) - ${item.price}`
      )
      .join('\n');

    const whatsappMessage = `🛍️ *NEW ORDER PLACED ON SPY ZONE* 🛍️\n\n` +
      `👤 *Customer Name:* ${formData.fullName}\n` +
      `📞 *Phone:* ${formData.phone}\n` +
      `📧 *Email:* ${formData.email || 'N/A'}\n` +
      `🏠 *Address:* ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}\n` +
      `📍 *Shipping Zone:* ${shippingInfo.zone}\n\n` +
      `📦 *ORDER ITEMS:*\n${itemsListText}\n\n` +
      `💵 *Subtotal:* ₹${subtotal}\n` +
      `🚚 *Shipping Fee:* ₹${shippingFee}\n` +
      `💰 *TOTAL AMOUNT:* ₹${totalAmount}\n\n` +
      `💳 *Payment Method:* PhonePe / Direct UPI`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const ownerWhatsAppUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // 2. Dynamic UPI Direct Link
    const upiUrl = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('SPY ZONE Order')}`;

    if (isMobileDevice()) {
      // 📱 మొబైల్‌లో నేరుగా PhonePe App ఓపెన్ అవుతుంది
      window.location.href = upiUrl;

      setTimeout(() => {
        window.open(ownerWhatsAppUrl, '_blank');
        setLastOrderDetails({
          ...formData,
          totalAmount,
          shippingZone: shippingInfo.zone,
        });
        setOrderConfirmed(true);
      }, 2000);
    } else {
      // 💻 ల్యాప్‌టాప్‌లో మీ public/qr-code.png ఫోటోతో మోడల్ ఓపెన్ అవుతుంది
      setShowDesktopQR(true);
      setLastOrderDetails({
        ...formData,
        totalAmount,
        shippingZone: shippingInfo.zone,
        ownerWhatsAppUrl,
      });
    }
  };

  const handleDesktopPaymentComplete = () => {
    setShowDesktopQR(false);
    if (lastOrderDetails?.ownerWhatsAppUrl) {
      window.open(lastOrderDetails.ownerWhatsAppUrl, '_blank');
    }
    setOrderConfirmed(true);
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wide text-gray-900 mb-2">
            Your Order is Confirmed! 🎉
          </h1>
          <p className="text-xs text-gray-600 mb-6">
            ధన్యవాదాలు <b>{lastOrderDetails?.fullName}</b>! మీ ఆర్డర్ వివరాలు మరియు డెలివరీ అడ్రస్ స్వీకరించబడ్డాయి.
          </p>

          <div className="bg-gray-50 p-4 rounded text-left border text-xs space-y-2 mb-6">
            <p><b>Total Amount:</b> ₹{lastOrderDetails?.totalAmount}</p>
            <p><b>Mobile:</b> {lastOrderDetails?.phone}</p>
            <p><b>Shipping Zone:</b> {lastOrderDetails?.shippingZone}</p>
            <p><b>Delivery Address:</b> {lastOrderDetails?.address}, {lastOrderDetails?.city} - {lastOrderDetails?.pincode}</p>
          </div>

          <Link
            href="/"
            className="block w-full bg-black text-white py-3 text-xs uppercase font-bold tracking-widest hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <header className="border-b px-4 md:px-10 h-[60px] flex items-center justify-between">
        <h1 className="text-lg font-black uppercase tracking-wider">
          SPY ZONE CHECKOUT
        </h1>
        <Link href="/" className="text-xs font-bold uppercase underline">
          Back to Shop
        </Link>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: FORM */}
        <div className="lg:col-span-7 space-y-6">
          <form id="checkout-form" onSubmit={handlePaymentAndOrder} className="space-y-4">
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ex: Vallepu Mahesh"
                className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: 7890644323"
                  className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: mail@example.com"
                  className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                Street Address *
              </label>
              <textarea
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street Name, Area"
                className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="516101"
                  className="w-full border border-purple-500 bg-purple-50/20 p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Cuddapah"
                  className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Andhra Pradesh"
                  className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* LOCATION / SHIPPING ZONE */}
            <div className="bg-purple-50 border border-purple-200 p-2.5 rounded flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-900">
                📍 Location Zone:
              </span>
              <span className="font-bold text-purple-700">
                {shippingInfo.zone} (₹{shippingFee})
              </span>
            </div>

            {/* PAYMENT METHOD */}
            <div className="pt-4 border-t">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
                2. Payment Method
              </h3>

              <div className="border-2 border-purple-600 bg-purple-50/20 p-4 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="w-4 h-4 accent-purple-700"
                  />
                  <div>
                    <p className="text-xs font-bold text-purple-900">
                      Direct PhonePe / UPI Dynamic Link & QR
                    </p>
                    <p className="text-[10px] text-gray-600">
                      Instant Payment via PhonePe App or Official QR Scan
                    </p>
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  Instant
                </span>
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="lg:col-span-5 bg-gray-50 p-6 border border-gray-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2">
              Order Summary ({cart.length} Items)
            </h3>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 mb-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center border-b pb-2">
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="w-12 h-12 object-contain border bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">Size: {item.selectedSize || 'N/A'}</p>
                  </div>
                  <span className="text-xs font-bold">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-purple-800 font-bold">
                <span>Shipping Fee ({shippingInfo.zone})</span>
                <span>₹{shippingFee}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t pt-2 mt-2">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            className="w-full mt-6 bg-purple-700 text-white py-3.5 text-xs font-bold uppercase tracking-[0.18em] hover:bg-purple-800 transition shadow-md active:scale-95"
          >
            Pay Via PhonePe ₹{totalAmount}
          </button>
        </div>

      </main>

      {/* 💻 LAPTOP/DESKTOP QR CODE MODAL WITH YOUR PUBLIC QR IMAGE */}
      {showDesktopQR && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-xl shadow-2xl text-center space-y-4">
            <h3 className="text-base font-black uppercase text-purple-900">
              Scan QR Code to Pay ₹{totalAmount}
            </h3>
            <p className="text-[11px] text-gray-600">
              మీ ఫోన్‌లోని <b>PhonePe, Google Pay లేదా Paytm</b> ద్వారా ఈ క్రింది QR కోడ్‌ని స్కాన్ చేసి ₹{totalAmount} చెల్లించండి:
            </p>

            <div className="flex justify-center border p-3 rounded bg-gray-50 w-fit mx-auto">
              <img 
                src={QR_IMAGE_PATH} 
                alt="PhonePe QR Code" 
                className="w-56 h-auto object-contain rounded"
                onError={(e) => {
                  // ఒకవేళ ఫోటో దొరకకపోతే ఆటో-జనరేటెడ్ QR చూపిస్తుంది
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_NAME)}&am=${totalAmount}&cu=INR`;
                }}
              />
            </div>

            <p className="text-[11px] text-gray-700 font-bold">
              UPI ID: <span className="text-purple-700">{STORE_UPI_ID}</span>
            </p>

            <button
              onClick={handleDesktopPaymentComplete}
              className="w-full bg-emerald-600 text-white py-3 text-xs font-bold uppercase tracking-wider rounded hover:bg-emerald-700 transition"
            >
              ✓ I Have Completed Payment
            </button>
          </div>
        </div>
      )}

    </div>
  );
}