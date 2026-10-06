import { NextResponse } from 'next/server';
import { getReceipts, getDisbursements, getJournalEntries } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'receipts';

    if (type === 'receipts') {
      const rows = getReceipts();
      let csv = 'ID,Date,Client,Description,Sales Invoice No,Cash on Hand,Cash in Bank,CWT (2307),Sales Amount,Status\n';
      for (const r of rows) {
        csv += `"${r.id}","${r.date}","${r.client.replace(/"/g, '""')}","${(r.description || '').replace(/"/g, '""')}","${r.invoice_no}",${r.cash_on_hand},${r.cash_in_bank},${r.cwt},${r.sales_amount},"${r.status}"\n`;
      }
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tamagos_receipts_crj.csv"'
        }
      });
    }

    if (type === 'disbursements') {
      const rows = getDisbursements();
      let csv = 'ID,Date,Particulars,Ref No,Amount,Category,Payment Method,Status,Notes\n';
      for (const d of rows) {
        csv += `"${d.id}","${d.date}","${d.particulars.replace(/"/g, '""')}","${d.ref_no}",${d.amount},"${d.category}","${d.payment_method}","${d.status}","${(d.notes || '').replace(/"/g, '""')}"\n`;
      }
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tamagos_disbursements_cdj.csv"'
        }
      });
    }

    if (type === 'journal') {
      const rows = getJournalEntries();
      let csv = 'ID,Date,Narration,Ref No,Debit,Credit,Entry Type\n';
      for (const j of rows) {
        csv += `"${j.id}","${j.date}","${j.narration.replace(/"/g, '""')}","${j.ref_no}",${j.debit},${j.credit},"${j.entry_type}"\n`;
      }
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tamagos_general_journal.csv"'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
