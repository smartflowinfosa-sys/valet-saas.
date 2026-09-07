import React from 'react';

export default function QuotePage({ params }: { params: { companySlug: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* خلفية زخرفية ناعمة */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-900 to-gray-50 rounded-b-[100%] opacity-90 -z-0"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative z-10">
        {/* الشعار الفاخر */}
        <div className="w-24 h-24 bg-gradient-to-br from-[#b89742] to-[#9c7f35] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg border-4 border-white">
          <span className="text-white font-bold text-xl">شعار</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          خدمات الفاليه الـ VIP
        </h1>
        <p className="text-gray-500 mb-8 font-medium">
          أهلاً بك في صفحة <span className="text-[#b89742] font-bold">{params.companySlug}</span>
        </p>

        {/* نموذج مبدئي لطلب السعر */}
        <div className="space-y-4 mb-8 text-right">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">نوع المناسبة</label>
            <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742] focus:bg-white transition-all appearance-none">
              <option>زواج / مناسبة خاصة</option>
              <option>معرض / مؤتمر</option>
              <option>مطعم / مقهى</option>
            </select>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2">
          <span>اطلب عرض السعر الآن</span>
          <span className="text-[#b89742]">➔</span>
        </button>
      </div>
    </main>
  );
}