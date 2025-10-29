// app/page.tsx
import UploadForm from './components/UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          آپلود فایل
        </h1>
        <p className="text-center text-gray-600 mb-8">
          فایل خود را انتخاب کنید و منتظر پردازش باشید
        </p>
        <UploadForm />
      </div>
    </main>
  );
}
