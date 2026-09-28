import { CartProvider } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import './globals.css';

export const metadata = {
  title: 'AVENTO | Luxury Fashion',
  description: 'Avento Apparel and Fashion Store',
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