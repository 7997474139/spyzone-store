import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: '' },
    shippingAddress: {
      fullName: { type: String, default: 'N/A' },
      email: { type: String, default: 'N/A' },
      phone: { type: String, default: 'N/A' },
      address: { type: String, default: 'N/A' },
      city: { type: String, default: 'N/A' },
      pincode: { type: String, default: 'N/A' },
      state: { type: String, default: 'N/A' },
    },
    // ఫ్లాట్ ఫీల్డ్స్ (బ్యాకప్ కోసం)
    name: { type: String, default: 'N/A' },
    email: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    address: { type: String, default: 'N/A' },
    city: { type: String, default: 'N/A' },
    pincode: { type: String, default: 'N/A' },
    items: { type: Array, default: [] },
    totalAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'PhonePe / UPI' },
    paymentStatus: { type: String, default: 'Paid' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);