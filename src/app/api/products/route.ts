import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/mock-data';
import type { FarmerProduct } from '@/lib/types';

let products = [...mockProducts];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const organic = searchParams.get('organic');
  
  let filtered = [...products];
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (organic === 'true') {
    filtered = filtered.filter(p => p.isOrganic);
  }
  
  return NextResponse.json({ products: filtered });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newProduct: FarmerProduct = {
    id: `p${Date.now()}`,
    farmerId: body.farmerId || '4',
    farmerName: body.farmerName || 'Unknown Farmer',
    productName: body.productName,
    description: body.description,
    price: body.price,
    unit: body.unit,
    quantity: body.quantity,
    category: body.category,
    imageUrl: body.imageUrl,
    location: body.location,
    isOrganic: body.isOrganic || false,
    createdAt: new Date().toISOString(),
  };
  
  products.unshift(newProduct);
  
  return NextResponse.json({ product: newProduct }, { status: 201 });
}
