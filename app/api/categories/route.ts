import { NextRequest, NextResponse } from 'next/server';
import {
  getCategoriesFromDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
} from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const categories = await getCategoriesFromDb();
      return NextResponse.json({ success: true, source: 'mysql', total: categories.length, data: categories });
    }
    const categories = store.getCategories();
    return NextResponse.json({ success: true, source: 'fallback', total: categories.length, data: categories });
  } catch (error: any) {
    console.error('[API /api/categories GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, minAge, maxAge, description, active } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const id = body.id || `cat-${Date.now()}`;

    if (isDbConfigured()) {
      await createCategoryInDb({
        id,
        name,
        minAge: minAge || 5,
        maxAge: maxAge || 25,
        description,
        active: active !== false,
      });
      return NextResponse.json({ success: true, id }, { status: 201 });
    }

    const cat = store.createCategory({
      name,
      minAge: minAge || 5,
      maxAge: maxAge || 25,
      description: description || '',
      active: active !== false,
    });
    return NextResponse.json({ success: true, data: cat }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/categories POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    if (isDbConfigured()) {
      await updateCategoryInDb(id, updates);
      return NextResponse.json({ success: true, message: 'Category updated in MySQL' });
    }

    store.updateCategory(id, updates);
    return NextResponse.json({ success: true, message: 'Category updated' });
  } catch (error: any) {
    console.error('[API /api/categories PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    if (isDbConfigured()) {
      await deleteCategoryInDb(id);
      return NextResponse.json({ success: true, message: 'Category deleted from MySQL' });
    }

    store.deleteCategory(id);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    console.error('[API /api/categories DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
