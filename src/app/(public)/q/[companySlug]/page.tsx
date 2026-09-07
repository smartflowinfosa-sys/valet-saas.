import React from 'react';

export default function QuotePage({ params }: { params: { companySlug: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
          شعار
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          طلب عرض سعر فاليه
        </h1>
        <p className="text-gray-500 mb-6">
          مرحباً بك في صفحة شركة: <span className="font-semibold text-blue-600">{params.companySlug}</span>
        </p>
        <button className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
          اطلب عرض السعر الآن
        </button>
      </div>
    </main>
  );
}