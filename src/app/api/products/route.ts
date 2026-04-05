import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const organic = searchParams.get('organic');
    const farmerId = searchParams.get('farmerId');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }
    if (organic === 'true') {
      where.isOrganic = true;
    }
    if (farmerId) {
      where.farmerId = farmerId;
    }

    const products = await db.farmerProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmerId, farmerName, productName, description, price, unit, quantity, category, imageUrl, address, lat, lng, isOrganic } = body;

    if (!productName || !farmerId || !farmerName) {
      return NextResponse.json({ error: 'productName, farmerId, and farmerName are required' }, { status: 400 });
    }

    const product = await db.farmerProduct.create({
      data: {
        farmerId,
        farmerName,
        productName,
        description: description || '',
        price: Number(price) || 0,
        unit: unit || 'kg',
        quantity: Number(quantity) || 0,
        category: category || 'Other',
        imageUrl: imageUrl || null,
        address: address || '',
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        isOrganic: Boolean(isOrganic),
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await db.farmerProduct.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Products PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.farmerProduct.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
