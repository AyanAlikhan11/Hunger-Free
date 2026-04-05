import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create users
  const donor = await prisma.user.upsert({
    where: { email: 'rajesh@gmail.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'rajesh@gmail.com',
      password: 'password',
      role: 'donor',
      phone: '+91 98765 43210',
      address: 'Mumbai, India',
      lat: 19.076,
      lng: 72.8777,
    },
  });

  const ngo = await prisma.user.upsert({
    where: { email: 'priya@gmail.com' },
    update: {},
    create: {
      name: 'Feed The Children Foundation',
      email: 'priya@gmail.com',
      password: 'password',
      role: 'ngo',
      phone: '+91 98765 43211',
      address: 'Delhi, India',
      lat: 28.6139,
      lng: 77.209,
    },
  });

  const volunteer = await prisma.user.upsert({
    where: { email: 'amit@gmail.com' },
    update: {},
    create: {
      name: 'Amit Patel',
      email: 'amit@gmail.com',
      password: 'password',
      role: 'volunteer',
      phone: '+91 98765 43212',
      address: 'Bangalore, India',
      lat: 12.9716,
      lng: 77.5946,
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'sunita@gmail.com' },
    update: {},
    create: {
      name: 'Sunita Devi',
      email: 'sunita@gmail.com',
      password: 'password',
      role: 'farmer',
      phone: '+91 98765 43213',
      address: 'Punjab, India',
      lat: 31.1471,
      lng: 75.3412,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hungerfree.org' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@hungerfree.org',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43214',
      address: 'New Delhi, India',
    },
  });

  // Create food donations
  const donations = [
    {
      donorId: donor.id,
      donorName: donor.name,
      foodName: 'Cooked Rice & Curry',
      description: 'Freshly cooked vegetarian rice and curry meals, enough for 50 people.',
      quantity: '50',
      unit: 'servings',
      expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      category: 'Cooked Food',
      address: '123 Main Street, Mumbai',
      lat: 19.076,
      lng: 72.8777,
      status: 'available',
    },
    {
      donorId: donor.id,
      donorName: donor.name,
      foodName: 'Fresh Vegetables',
      description: 'Assorted fresh vegetables including tomatoes, onions, potatoes, and spinach.',
      quantity: '20',
      unit: 'kg',
      expiryTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      category: 'Vegetables',
      address: '456 Market Road, Mumbai',
      lat: 19.0896,
      lng: 72.8656,
      status: 'available',
    },
    {
      donorId: donor.id,
      donorName: 'Green Valley Restaurant',
      foodName: 'Bread & Bakery Items',
      description: 'Day-old bread, pastries, and bakery items. Still fresh and consumable.',
      quantity: '30',
      unit: 'pieces',
      expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      category: 'Bakery',
      address: '789 Bandra West, Mumbai',
      lat: 19.1197,
      lng: 72.8464,
      status: 'claimed',
      claimedBy: ngo.id,
    },
    {
      donorId: donor.id,
      donorName: 'City Hotel Grand',
      foodName: 'Packed Lunch Boxes',
      description: 'Packed vegetarian lunch boxes with rice, dal, sabzi, and roti.',
      quantity: '100',
      unit: 'boxes',
      expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      category: 'Cooked Food',
      address: '321 Andheri East, Mumbai',
      lat: 19.0904,
      lng: 72.8612,
      status: 'delivered',
      claimedBy: ngo.id,
      volunteerId: volunteer.id,
    },
    {
      donorId: donor.id,
      donorName: 'Meera Household',
      foodName: 'Fruits & Milk',
      description: 'Extra apples, bananas, oranges, and packets of milk.',
      quantity: '15',
      unit: 'kg',
      expiryTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      category: 'Fruits & Dairy',
      address: '567 Juhu, Mumbai',
      lat: 19.0759,
      lng: 72.8932,
      status: 'available',
    },
    {
      donorId: donor.id,
      donorName: 'Spice Garden Restaurant',
      foodName: 'Cooked Meals (Non-Veg)',
      description: 'Freshly prepared chicken biryani and raita, enough for 40 people.',
      quantity: '40',
      unit: 'servings',
      expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      category: 'Cooked Food',
      address: '890 Lower Parel, Mumbai',
      lat: 19.0696,
      lng: 72.8407,
      status: 'available',
    },
  ];

  for (const d of donations) {
    await prisma.foodDonation.upsert({
      where: { id: `${d.donorId}-${d.foodName.replace(/\s/g, '')}`.slice(0, 25) || undefined },
      update: {},
      create: d,
    });
  }

  // Create farmer products
  const products = [
    {
      farmerId: farmer.id,
      farmerName: farmer.name,
      productName: 'Organic Wheat',
      description: 'Premium quality organic wheat, freshly harvested. Perfect for making flour.',
      price: 45,
      unit: 'kg',
      quantity: 500,
      category: 'Grains',
      address: 'Punjab, India',
      lat: 31.1471,
      lng: 75.3412,
      isOrganic: true,
    },
    {
      farmerId: farmer.id,
      farmerName: farmer.name,
      productName: 'Fresh Tomatoes',
      description: 'Vine-ripened tomatoes, grown without pesticides. Great for cooking.',
      price: 30,
      unit: 'kg',
      quantity: 200,
      category: 'Vegetables',
      address: 'Punjab, India',
      lat: 31.1471,
      lng: 75.3412,
      isOrganic: true,
    },
    {
      farmerId: farmer.id,
      farmerName: 'Vikram Singh',
      productName: 'Basmati Rice',
      description: 'Aged basmati rice with aromatic fragrance. Directly from the fields of Punjab.',
      price: 120,
      unit: 'kg',
      quantity: 1000,
      category: 'Grains',
      address: 'Amritsar, Punjab',
      lat: 30.901,
      lng: 75.8573,
      isOrganic: false,
    },
    {
      farmerId: farmer.id,
      farmerName: 'Ramesh Kumar',
      productName: 'Fresh Potatoes',
      description: 'Farm-fresh potatoes, perfect for everyday cooking. Bulk discounts available.',
      price: 20,
      unit: 'kg',
      quantity: 800,
      category: 'Vegetables',
      address: 'Jalandhar, Punjab',
      lat: 31.326,
      lng: 75.5762,
      isOrganic: false,
    },
    {
      farmerId: farmer.id,
      farmerName: farmer.name,
      productName: 'Organic Green Vegetables',
      description: 'Fresh spinach, fenugreek, and mustard greens bundle. Harvested this morning.',
      price: 25,
      unit: 'kg',
      quantity: 150,
      category: 'Vegetables',
      address: 'Punjab, India',
      lat: 31.1471,
      lng: 75.3412,
      isOrganic: true,
    },
  ];

  for (const p of products) {
    await prisma.farmerProduct.upsert({
      where: { id: `${p.farmerId}-${p.productName.replace(/\s/g, '')}`.slice(0, 25) || undefined },
      update: {},
      create: p,
    });
  }

  // Create pickup requests
  const allDonations = await prisma.foodDonation.findMany();
  const claimedDonations = allDonations.filter(d => d.status === 'claimed' || d.status === 'delivered');

  for (const donation of claimedDonations) {
    await prisma.pickupRequest.upsert({
      where: { id: `${donation.id}-req` },
      update: {},
      create: {
        donationId: donation.id,
        ngoId: ngo.id,
        ngoName: ngo.name,
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        status: donation.status === 'delivered' ? 'delivered' : 'in_transit',
      },
    });
  }

  console.log('✅ Seeding complete!');
  console.log(`   Users: ${5}`);
  console.log(`   Donations: ${donations.length}`);
  console.log(`   Products: ${products.length}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
