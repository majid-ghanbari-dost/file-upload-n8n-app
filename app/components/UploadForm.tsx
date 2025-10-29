// app/components/UploadForm.tsx
'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.ok && data.jobId) {
        setJobId(data.jobId);
        // شروع polling برای نتیجه
        pollResult(data.jobId);
      } else {
        setError(data.error || 'خطا در آپلود');
      }
    } catch (err) {
      setError('خطای شبکه');
    } finally {
      setUploading(false);
    }
  };

  const pollResult = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();

        if (data.status === 'done' && data.url) {
          setResult({ url: data.url });
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setError('پردازش ناموفق بود');
          clearInterval(interval);
        }
      } catch (err) {
        // ادامه می‌دیم
      }
    }, 2000);

    // حداکثر 2 دقیقه
    setTimeout(() => clearInterval(interval), 120000);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            انتخاب فایل
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
        </div>
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'در حال آپلود...' : 'آپلود و پردازش'}
        </button>
      </form>

      {uploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">در حال ارسال به n8n...</p>
        </div>
      )}

      {jobId && !result && !uploading && (
        <p className="text-center text-sm text-gray-600">
          در حال پردازش... (job: {jobId})
        </p>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium mb-2">آپلود و پردازش موفق!</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700 transition"
          >
            دانلود فایل
          </a>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center font-medium">{error}</p>
      )}
    </div>
  );
}
