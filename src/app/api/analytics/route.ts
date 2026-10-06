import { NextResponse } from 'next/server';
import { 
  getFinancialKPIs, 
  getMonthlyFinancials, 
  getDisbursementCategoryBreakdown, 
  getTrialBalance,
  getAuditLogs
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : 2026;

    const kpis = getFinancialKPIs(year);
    const monthlyFinancials = getMonthlyFinancials(year);
    const categoryBreakdown = getDisbursementCategoryBreakdown(year);
    const trialBalance = getTrialBalance();
    const auditLogs = getAuditLogs(20);

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        monthlyFinancials,
        categoryBreakdown,
        trialBalance,
        auditLogs,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
