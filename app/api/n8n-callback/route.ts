// app/api/n8n-callback/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { updateJob, getJob } from '@/lib/jobStore';

const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jobId = formData.get('jobId') as string | null;
    const secret = formData.get('secret') as string | null;

    // اعتبارسنجی secret
    if (N8N_WEBHOOK_SECRET && secret !== N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    if (!file || !jobId) {
      return NextResponse.json({ error: 'فایل یا jobId گم شده' }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'job پیدا نشد' }, { status: 404 });
    }

    // آپلود به Vercel Blob
    const { url } = await put(`processed/${jobId}-${file.name}`, file, {
      access: 'public',
    });

    updateJob(jobId, { status: 'done', url });

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error('خطا در callback:', err);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
