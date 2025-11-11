// app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ذخیره موقت وضعیت (برای تست - بعداً می‌تونی به دیتابیس ببری)
const jobStatus = new Map<string, any>();

// POST: دریافت نتیجه از n8n
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, downloadUrl, fileId } = body;

    if (!jobId || !downloadUrl) {
      return NextResponse.json(
        { error: 'jobId و downloadUrl الزامی است' },
        { status: 400 }
      );
    }

    // ذخیره وضعیت
    jobStatus.set(jobId, {
      jobId,
      downloadUrl,
      fileId: fileId || null,
      status: 'ready',
      receivedAt: new Date().toISOString(),
    });

    console.log('n8n: نتیجه دریافت شد', { jobId, downloadUrl });

    return NextResponse.json(
      { received: true, jobId, message: 'نتیجه ذخیره شد' },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطا در POST /api/notify:', error);
    return NextResponse.json(
      { error: 'خطا در پردازش JSON' },
      { status: 400 }
    );
  }
}

// GET: چک کردن وضعیت برای فرانت
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'jobId الزامی است' },
      { status: 400 }
    );
  }

  const status = jobStatus.get(jobId);

  if (!status) {
    return NextResponse.json({
      jobId,
      status: 'processing',
      downloadUrl: null,
    });
  }

  return NextResponse.json(status);
}
