/**
 * Seeds the database with demo data:
 *   - 1 demo customer  (demo@efuel.com / demo123)
 *   - 3 demo drivers   (driver1..3@efuel.com / driver123)
 *
 * Drivers are stored in the User collection with role === 'driver'.
 * Run with:  npm run seed
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const DEMO_CUSTOMER = {
  name: 'Demo User',
  email: 'demo@efuel.com',
  password: 'demo123',
  phone: '081200000000',
};

const DEMO_ADMIN = {
  name: 'Admin E-Fuel',
  email: 'admin@efuel.com',
  password: 'admin123',
  phone: '081100000000',
  role: 'admin',
};

const DEMO_DRIVERS = [
  {
    name: 'Andi Pratama',
    email: 'driver1@efuel.com',
    password: 'driver123',
    phone: '081200000001',
    role: 'driver',
    vehicle: 'Honda Vario 160',
    plateNumber: 'B 1234 EFL',
    rating: 4.9,
  },
  {
    name: 'Siti Rahma',
    email: 'driver2@efuel.com',
    password: 'driver123',
    phone: '081200000002',
    role: 'driver',
    vehicle: 'Toyota Hilux Pickup',
    plateNumber: 'B 5678 EFL',
    rating: 4.8,
  },
  {
    name: 'Joko Susilo',
    email: 'driver3@efuel.com',
    password: 'driver123',
    phone: '081200000003',
    role: 'driver',
    vehicle: 'Suzuki Carry',
    plateNumber: 'B 9012 EFL',
    rating: 5.0,
  },
];

const upsertUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    console.log(`ℹ️  ${data.role || 'customer'} ${data.email} — already exists, skipped`);
    return false;
  }
  await User.create(data); // password hashed by pre-save hook
  console.log(`✅ created ${data.role || 'customer'}: ${data.email}`);
  return true;
};

const seed = async () => {
  await connectDB();

  // Clear existing orders to ensure a clean slate for testing
  const Order = require('../models/Order');
  await Order.deleteMany({});
  console.log('🗑️  Cleared all existing orders');

  await upsertUser(DEMO_CUSTOMER);
  await upsertUser(DEMO_ADMIN);
  for (const driver of DEMO_DRIVERS) {
    await upsertUser(driver);
  }

  console.log('\n🌱 Seeding complete. Demo accounts:');
  console.log('   Customer → demo@efuel.com    / demo123');
  console.log('   Admin    → admin@efuel.com   / admin123');
  console.log('   Driver 1 → driver1@efuel.com / driver123');
  console.log('   Driver 2 → driver2@efuel.com / driver123');
  console.log('   Driver 3 → driver3@efuel.com / driver123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
