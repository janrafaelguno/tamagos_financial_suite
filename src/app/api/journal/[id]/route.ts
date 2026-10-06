import { NextResponse } from 'next/server';
import { deleteJournalEntry } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteJournalEntry(id);
    return NextResponse.json({ success: true, message: `Journal entry ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
