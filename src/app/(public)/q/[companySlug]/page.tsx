'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function QuotePage({ params }: { params: any }) {
  // استخدام فك تغليف الـ params الخاص بـ Next.js
  const resolvedParams = React.use(params) as any;
  const supabase = createClient();
  
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // مدخلات العميل (افتراضياً: 4 ساعات و 2 موظفين)
  const [hours, setHours] = useState(4);
  const [valets, setValets] = useState(2);

  useEffect(() => {
    async function fetchCompany() {
      const { data } = await supabase.from('companies').select('*').eq('slug', resolvedParams.companySlug).single();
      setCompany(data);
      setLoading(false);
    }
    fetchCompany();
  }, [resolvedParams.companySlug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">جاري تحميل النظام...</div>;
  if (!company) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500 text-xl">هذه الشركة غير مسجلة في النظام</div>;

  // الحسبة التلقائية (محرك التسعير)
  const extraHours = Math.max(0, hours - 4);
  const extraValets = Math.max(0, valets - 2);
  const totalPrice = Number(company.base_price || 0) + (extraHours * Number(company.hourly_rate || 0)) + (extraValets * Number(company.valet_rate || 0));

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-900 to-gray-50 rounded-b-[100%] opacity-90 -z-0"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative z-10 mt-10">
        
        {/* عرض شعار الشركة من الإعدادات */}
        {company.logo_url ? (
          <img src={company.logo_url} alt="الشعار" className="w-24 h-24 rounded-full mx-auto mb-6 shadow-lg border-4 border-white object-cover bg-white" />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-[#b89742] to-[#9c7f35] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-white font-bold text-xl">{company.name.substring(0, 2)}</span>
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">خدمات الفاليه الـ VIP</h1>
        <p className="text-gray-500 mb-8 font-medium">مرحباً بك في صفحة <span className="text-[#b89742] font-bold">{company.name}</span></p>

        <div className="space-y-6 mb-8 text-right bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الساعات المطلوبة (الأدنى 4 ساعات)</label>
            <input type="number" min="4" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742] transition-all" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عدد موظفي الفاليه (الأدنى 2 موظفين)</label>
            <input type="number" min="2" value={valets} onChange={(e) => setValets(Number(e.target.value))} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742] transition-all" />
          </div>
        </div>

        {/* عرض التكلفة المباشرة للعميل */}
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl shadow-xl">
          <p className="text-gray-300 text-sm font-medium mb-1">التكلفة الإجمالية المقدرة</p>
          <p className="text-4xl font-extrabold text-[#b89742]">{totalPrice} <span className="text-lg text-white font-normal">ريال</span></p>
        </div>

        <button className="w-full bg-[#b89742] text-white p-4 rounded-xl hover:bg-[#9c7f35] hover:-translate-y-1 transition-all duration-300 font-bold text-lg">
          إرسال طلب الحجز
        </button>
      </div>
    </main>
  );
}