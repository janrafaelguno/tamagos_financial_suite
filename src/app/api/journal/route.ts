import { NextResponse } from 'next/server';
import { getJournalEntries, createJournalEntry } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const entry_type = searchParams.get('type') || undefined;

    const entries = getJournalEntries({ search, entry_type });
    return NextResponse.json({ success: true, count: entries.length, data: entries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.narration || !body.date) {
      return NextResponse.json({ success: false, error: 'Narration and Date are required' }, { status: 400 });
    }

    const entry = createJournalEntry(body);
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
