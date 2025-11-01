// app/components/UploadForm.tsx
'use client';

import { useState } from 'react';

const STEPS = 5; // 5 گام

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [steps, setSteps] = useState(0);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);
    setSteps(0);

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
        setSteps(1); // گام 1 تمام
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

        if (data.steps) {
          setSteps(data.steps.length + 1);
        }

        if (data.status === 'done' && data.url) {
          setSteps(STEPS);
          setResult({ url: data.url });
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setError('پردازش ناموفق');
          clearInterval(interval);
        }
      } catch (err) {
        // ادامه
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 60000); // ۱ دقیقه timeout
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            آپلود سند (تصویر)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading || !!jobId}
          />
          <p className="text-xs text-gray-500 mt-1">فرمت‌های مجاز: JPG, PNG, PDF. حداکثر ۵MB.</p>
        </div>
        <button
          type="submit"
          disabled={!file || uploading || !!jobId}
          className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? 'در حال ارسال...' : 'شروع پردازش'}
        </button>
      </form>

      {uploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">ارسال به n8n...</p>
        </div>
      )}

      {jobId && (
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-600">در حال پردازش...</p>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: STEPS }, (_, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < steps ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index < steps ? '✓' : index + 1}
                </div>
                {index < STEPS - 1 && (
                  <div className={`w-8 h-1 rounded-full ${
                    index < steps - 1 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium mb-2">پردازش موفق! فایل Word آماده است.</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700 transition"
          >
            دانلود فایل Word
          </a>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center font-medium">{error}</p>
      )}
    </div>
  );
}
