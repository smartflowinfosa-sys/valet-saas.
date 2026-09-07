'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function QuotePage({ params }: { params: any }) {
  const resolvedParams = React.use(params) as any;
  const supabase = createClient();
  
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [hours, setHours] = useState(4);
  const [valets, setValets] = useState(2);
  const [phone, setPhone] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      const { data } = await supabase.from('companies').select('*').eq('slug', resolvedParams.companySlug).single();
      setCompany(data);
      setLoading(false);
    }
    fetchCompany();
  }, [resolvedParams.companySlug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">جاري تحميل النظام...</div>;
  if (!company) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">هذه الشركة غير مسجلة</div>;

  const extraHours = Math.max(0, hours - 4);
  const extraValets = Math.max(0, valets - 2);
  const totalPrice = Number(company.base_price || 0) + (extraHours * Number(company.hourly_rate || 0)) + (extraValets * Number(company.valet_rate || 0));

  const handleBooking = async () => {
    if (!phone) return alert("الرجاء إدخال رقم الجوال للتواصل");
    setSubmitting(true);
    
    const { error } = await supabase.from('bookings').insert({
      company_id: company.id,
      customer_phone: phone,
      hours,
      valets,
      total_price: totalPrice
    });

    if (!error) setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-green-100">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إرسال طلبك بنجاح!</h2>
        <p className="text-gray-500">سيتواصل معك فريق {company.name} قريباً على رقمك {phone}.</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-900 to-gray-50 rounded-b-[100%] opacity-90 -z-0"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative z-10 mt-10">
        {company.logo_url ? (
          <img src={company.logo_url} alt="الشعار" className="w-24 h-24 rounded-full mx-auto mb-6 shadow-lg border-4 border-white object-cover bg-white" />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-[#b89742] to-[#9c7f35] rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{company.name.substring(0, 2)}</span>
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">خدمات الفاليه الـ VIP</h1>
        
        <div className="space-y-4 mb-6 text-right bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الساعات (الأدنى 4)</label>
            <input type="number" min="4" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الموظفين (الأدنى 2)</label>
            <input type="number" min="2" value={valets} onChange={(e) => setValets(Number(e.target.value))} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الجوال للتواصل</label>
            <input type="tel" placeholder="05XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl">
          <p className="text-gray-300 text-sm font-medium mb-1">التكلفة الإجمالية المقدرة</p>
          <p className="text-4xl font-extrabold text-[#b89742]">{totalPrice} <span className="text-lg text-white font-normal">ريال</span></p>
        </div>

        <button onClick={handleBooking} disabled={submitting} className="w-full bg-[#b89742] text-white p-4 rounded-xl hover:bg-[#9c7f35] transition-all font-bold text-lg disabled:opacity-50">
          {submitting ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
        </button>
      </div>
    </main>
  );
}