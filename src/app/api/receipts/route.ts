import { NextResponse } from 'next/server';
import { getReceipts, createReceipt } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const status = searchParams.get('status') || undefined;

    const receipts = getReceipts({ search, startDate, endDate, status });
    return NextResponse.json({ success: true, count: receipts.length, data: receipts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.client || !body.date) {
      return NextResponse.json({ success: false, error: 'Client and Date are required' }, { status: 400 });
    }

    const receipt = createReceipt(body);
    return NextResponse.json({ success: true, data: receipt }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
