import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  pincode: String,
  items: Array,
  totalAmount: Number,
  paymentStatus: { type: String, default: 'Paid' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);