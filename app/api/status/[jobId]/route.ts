// app/api/status/[jobId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ذخیره موقت (Map برای تست — بعداً Supabase/Redis)
const jobStatus = new Map<string, any>();

// GET: فرانت polling می‌کنه (قدم‌شمار + لینک)
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const status = jobStatus.get(jobId);

  if (!status) {
    return NextResponse.json({
      steps: [],  // قدم‌شمار خالی برای processing
      status: 'processing',
      url: null
    });
  }

  return NextResponse.json(status);
}

// POST: n8n بروزرسانی می‌فرسته (قدم‌ها + لینک)
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const body = await request.json();
    const { status, url, steps } = body;

    // ذخیره وضعیت جدید
    jobStatus.set(params.jobId, {
      steps: steps || ['OCR', 'AI Translation', 'Code Generation', 'Word Creation', 'Supabase Upload'],  // ۵ قدم
      status: status || 'done',
      url: url || null
    });

    console.log(`وضعیت ${params.jobId} بروز شد:`, body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('خطا در POST /api/status/[jobId]:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
