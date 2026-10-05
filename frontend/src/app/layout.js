import { CartProvider } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import './globals.css';

// 🚀 Vercel డొమైన్ Base URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spyzone-2o-store-git-main-spyzone.vercel.app';

export const metadata = {
  // Vercel లింక్‌ను బేస్ URL గా సెట్ చేసాం (WhatsApp OpenGraph ప్రివ్యూలకు చాలా అవసరం)
  metadataBase: new URL(baseUrl),
  title: 'SPY ZONE | Luxury Fashion',
  description: 'SPY ZONE Luxury Apparel and Fashion Store',
  openGraph: {
    title: 'SPY ZONE | Luxury Fashion',
    description: 'SPY ZONE Luxury Apparel and Fashion Store',
    url: baseUrl,
    siteName: 'SPY ZONE',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}