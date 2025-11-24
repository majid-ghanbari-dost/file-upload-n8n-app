// app/upload/route.ts
import { NextResponse } from 'next/server';
import { createJob } from '@/lib/jobStore';
import { randomUUID } from 'crypto';

// وب‌هوک n8n رو از environment variable می‌خونه (حرفه‌ای و امن)
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

if (!N8N_WEBHOOK_URL) {
  console.error('خطا: NEXT_PUBLIC_N8N_WEBHOOK_URL تنظیم نشده است!');
  // در محیط توسعه خطا می‌ده، در پروداکشن فقط لاگ می‌کنه
}

const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET; // اختیاری

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'فایل پیدا نشد' }, { status: 400 });
    }

    const jobId = randomUUID();
    createJob(jobId);

    // فقط اگر URL تنظیم شده باشه، به n8n ارسال کن
    if (N8N_WEBHOOK_URL) {
      const forwardData = new FormData();
      forwardData.append('file', file);
      forwardData.append('jobId', jobId);
      if (N8N_WEBHOOK_SECRET) {
        forwardData.append('secret', N8N_WEBHOOK_SECRET);
      }

      // fire and forget — بدون بلاک کردن پاسخ کاربر
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: forwardData,
      }).catch((err) => {
        console.error('خطا در ارسال به n8n:', err);
        // کاربر همچنان jobId رو می‌گیره و صفحه وضعیت باز می‌شه
      });
    } else {
      console.warn('n8n webhook غیرفعاله — فقط jobId ساخته شد (مناسب برای تست)');
    }

    return NextResponse.json({ ok: true, jobId });
  } catch (err) {
    console.error('خطا در /api/upload:', err);
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 });
  }
}
