// app/api/status/[jobId]/route.ts
import { NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

export async function GET(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: 'job پیدا نشد' }, { status: 404 });
  }

  return NextResponse.json(job);
}
