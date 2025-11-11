// app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';

const jobStatus = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, downloadUrl, fileId } = body;

    jobStatus.set(jobId, { jobId, downloadUrl, fileId, status: 'ready' });

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  const status = jobStatus.get(jobId) || { jobId, status: 'processing' };
  return NextResponse.json(status);
}
