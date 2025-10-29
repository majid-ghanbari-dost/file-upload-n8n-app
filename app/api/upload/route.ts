// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { createJob } from '@/lib/jobStore';
import { randomUUID } from 'crypto';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: 'فایل پیدا نشد' }, { status: 400 });
    }

    const jobId = randomUUID();
    createJob(jobId);

    // فوروارد به n8n
    if (N8N_WEBHOOK_URL) {
      const forwardData = new FormData();
      forwardData.append('file', file);
      forwardData.append('jobId', jobId);
      if (N8N_WEBHOOK_SECRET) {
        forwardData.append('secret', N8N_WEBHOOK_SECRET);
      }

      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: forwardData,
      }).catch((err) => {
        console.error('خطا در ارسال به n8n:', err);
        // ادامه می‌دیم — job در حالت pending می‌مونه
      });
    }

    return NextResponse.json({ ok: true, jobId });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 });
  }
}
