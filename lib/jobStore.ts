// lib/jobStore.ts
// ذخیره موقت وضعیت job در حافظه (برای تست)
// در پروداکشن: Vercel KV یا Redis

type JobStatus = 'pending' | 'done' | 'failed';

interface Job {
  status: JobStatus;
  url?: string;
  error?: string;
}

const jobStore = new Map<string, Job>();

export function createJob(jobId: string) {
  jobStore.set(jobId, { status: 'pending' });
}

export function updateJob(jobId: string, update: Partial<Job>) {
  const job = jobStore.get(jobId);
  if (job) {
    jobStore.set(jobId, { ...job, ...update });
  }
}

export function getJob(jobId: string): Job | undefined {
  return jobStore.get(jobId);
}
