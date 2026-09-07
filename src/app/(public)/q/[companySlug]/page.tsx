'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { submitAndGenerateQuote } from '@/app/actions/quote'; // استدعاء الإجراء الخادم

export default function QuotePage({ params }: { params: any }) {
  const resolvedParams = React.use(params) as any;
  const supabase = createClient();
  
  const [company, setCompany] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [hours, setHours] = useState(4);
  const [valets, setValets] = useState(2);
  const [phone, setPhone] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 1. جلب بيانات الشركة عبر الـ Slug
      const { data: comp } = await supabase.from('companies').select('*').eq('slug', resolvedParams.companySlug).single();
      setCompany(comp);
      
      if (comp) {
        // 2. جلب خدمات الشركة لربطها بمحرك التسعير
        const { data: srvs } = await supabase.from('services').select('id, name').eq('company_id', comp.id);
        if (srvs && srvs.length > 0) {
          setServices(srvs);
          setSelectedServiceId(srvs[0].id); // اختيار أول خدمة تلقائياً
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [resolvedParams.companySlug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">جاري تحميل النظام...</div>;
  if (!company) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">هذه الشركة غير مسجلة</div>;

  const handleBooking = async () => {
    if (!phone) return alert("الرجاء إدخال رقم الجوال للتواصل");
    if (!selectedServiceId) return alert("عذراً، هذه الشركة لم تقم بإضافة خدمات بعد.");
    
    setSubmitting(true);
    
    // تجهيز البيانات للإرسال إلى الخادم (بدون حساب السعر هنا!)
    const formData = {
      name: "عميل VIP", // اسم افتراضي لأن استمارتك لا تطلبه
      phone: phone,
      service_id: selectedServiceId,
      hours: hours,
      valets: valets,
      // قيم افتراضية للساعات لكي يعمل محرك التسعير الذي برمجناه سابقاً بسلاسة
      start_time: "00:00", 
      end_time: hours < 10 ? `0${hours}:00` : `${hours}:00`, 
      expected_cars: 0
    };

    // 3. الاتصال بالخادم لحساب السعر وإصدار العرض بآمان تام
    const response = await submitAndGenerateQuote(resolvedParams.companySlug, formData);

    if (response.success) {
      setSubmitted(true);
    } else {
      alert(`❌ حدث خطأ: ${response.error}`);
    }
    
    setSubmitting(false);
  };

  if (submitted) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-green-100">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h2>
        <p className="text-gray-500">تم إنشاء طلبك وحساب السعر. سيتواصل معك فريق {company.name} قريباً على رقمك {phone}.</p>
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
          
          {/* حقل جديد ديناميكي لاختيار الخدمة */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الخدمة</label>
              <select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]">
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

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

        {/* تم تغيير النص هنا لأن التسعير أصبح يتم خلف الكواليس */}
        <div className="mb-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl">
          <p className="text-gray-300 text-sm font-medium mb-1">تسعير ديناميكي ذكي</p>
          <p className="text-lg font-bold text-[#b89742]">سيتم حساب التكلفة فوراً بناءً على قواعد الشركة</p>
        </div>

        <button onClick={handleBooking} disabled={submitting} className="w-full bg-[#b89742] text-white p-4 rounded-xl hover:bg-[#9c7f35] transition-all font-bold text-lg disabled:opacity-50">
          {submitting ? 'جاري الإصدار...' : 'تأكيد وإرسال الطلب'}
        </button>
      </div>
    </main>
  );
}