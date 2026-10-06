import { NextResponse } from 'next/server';
import { getDisbursements, createDisbursement, getCategories } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;

    const disbursements = getDisbursements({ search, startDate, endDate, category, status });
    const categories = getCategories();
    return NextResponse.json({ success: true, count: disbursements.length, data: disbursements, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.particulars || !body.date) {
      return NextResponse.json({ success: false, error: 'Particulars and Date are required' }, { status: 400 });
    }

    const disbursement = createDisbursement(body);
    return NextResponse.json({ success: true, data: disbursement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
