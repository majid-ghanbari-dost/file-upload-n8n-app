// app/upload/route.ts
import { NextResponse } from 'next/server';
import { createJob } from '@/lib/jobStore';
import { randomUUID } from 'crypto';

// وب‌هوک n8n رو از environment variable می‌خونه
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL?.trim();
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET?.trim();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'فایل پیدا نشد' },
        { status: 400 }
      );
    }

    const jobId = randomUUID();
    createJob(jobId);

    // فقط اگر URL معتبر باشه، به n8n بفرست
    if (N8N_WEBHOOK_URL && N8N_WEBHOOK_URL.startsWith('http')) {
      const forwardData = new FormData();
      forwardData.append('file', file);
      forwardData.append('jobId', jobId);

      if (N8N_WEBHOOK_SECRET) {
        forwardData.append('secret', N8N_WEBHOOK_SECRET);
      }

      // fire and forget — کاربر منتظر نمی‌مونه
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: forwardData,
      }).catch((err) => {
        console.error('خطا در ارسال به n8n:', err.message);
        // اینجا همچنان jobId رو برمی‌گردونیم — کاربر متوجه نمی‌شه
      });
    } else {
      console.warn('N8N_WEBHOOK_URL تنظیم نشده یا نامعتبر است — فایل فقط در فرانت ذخیره شد');
    }

    // همیشه jobId رو برگردون تا فرانت‌اند بتونه وضعیت رو چک کنه
    return NextResponse.json({ ok: true, jobId });
  } catch (err: any) {
    console.error('خطای سرور در /api/upload:', err);
    return NextResponse.json(
      { ok: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
