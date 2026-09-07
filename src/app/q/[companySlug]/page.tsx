'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';

export default function PublicQuoteRequestPage() {
  const params = useParams();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [company, setCompany] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  
  // بيانات النموذج
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event_type: 'زفاف',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    expected_cars: '',
    service_id: '',
    extra_services: '',
    notes: ''
  });

  useEffect(() => {
    async function fetchCompanyAndServices() {
      if (!params.companySlug) return;
      
      // 1. البحث عن الشركة باستخدام الـ Slug فقط
      const { data: comp } = await supabase
        .from('companies')
        .select('id, name, logo_url, description')
        .eq('slug', params.companySlug)
        .single();

      if (comp) {
        setCompany(comp);
        // 2. جلب خدمات هذه الشركة لكي يختار منها العميل
        const { data: srvs } = await supabase
          .from('services')
          .select('id, name, description')
          .eq('company_id', comp.id);
          
        if (srvs && srvs.length > 0) {
          setServices(srvs);
          setFormData(prev => ({ ...prev, service_id: srvs[0].id }));
        }
      }
      setLoading(false);
    }
    fetchCompanyAndServices();
  }, [params.companySlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // تجهيز البيانات بصيغة JSON لحفظها في حقل details
    const details = {
      event_type: formData.event_type,
      event_date: formData.event_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.location,
      expected_cars: Number(formData.expected_cars),
      service_id: formData.service_id,
      extra_services: formData.extra_services,
      notes: formData.notes
    };

    // حفظ الطلب في قاعدة البيانات (بدون تسجيل دخول للعميل)
    const { error } = await supabase.from('quote_requests').insert([
      {
        company_id: company.id,
        status: 'pending',
        details: details,
        // يمكن لاحقاً ربطها بجدول العملاء (customers) مباشرة، حالياً نكتفي بإنشاء الطلب
      }
    ]);

    if (!error) {
      // إذا أردت حفظ بيانات العميل في جدول customers أيضاً ليكون لديك أرشيف، يمكن إضافتها هنا.
      // للتبسيط في هذه المرحلة سنعرض رسالة النجاح.
      setSubmitted(true);
    } else {
      alert('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">جاري تحميل البيانات...</div>;
  
  if (!company) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-2">الشركة غير موجودة</h2>
        <p className="text-gray-500">تأكد من الرابط أو تواصل مع إدارة المنصة.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] p-4" dir="rtl">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100 text-center max-w-lg w-full">
        <div className="text-green-500 text-6xl mb-6">✅</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">تم استلام طلبك بنجاح!</h2>
        <p className="text-gray-600 text-lg">شكراً لك {formData.name}. سيقوم فريق {company.name} بمراجعة تفاصيل مناسبتك والتواصل معك قريباً لتقديم عرض السعر النهائي.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* رأس الصفحة الفاخر (Header) */}
        <div className="bg-gray-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-black opacity-50 z-0"></div>
          <div className="relative z-10">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4 bg-white" />
            ) : (
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#b89742] to-[#9c7f35] flex items-center justify-center text-3xl text-white font-bold mb-4 border-4 border-white shadow-lg">
                {company.name.substring(0, 2)}
              </div>
            )}
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{company.name}</h1>
            {company.description && <p className="text-gray-300 mt-2 max-w-lg mx-auto">{company.description}</p>}
          </div>
        </div>

        {/* نموذج الطلب */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">طلب عرض سعر لخدمات الفاليه</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكريم</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" placeholder="الاسم الكامل" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" placeholder="05XXXXXXXX" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع المناسبة</label>
                <select value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none">
                  <option>زفاف</option>
                  <option>مؤتمر / معرض</option>
                  <option>حفلة خاصة</option>
                  <option>افتتاح مطعم / مقهى</option>
                  <option>أخرى</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ المناسبة</label>
                <input type="date" required value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">وقت البداية</label>
                <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">وقت النهاية</label>
                <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">موقع المناسبة / القاعة</label>
                <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" placeholder="اسم القاعة أو الحي" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عدد السيارات المتوقع</label>
                <input type="number" required min="1" value={formData.expected_cars} onChange={e => setFormData({...formData, expected_cars: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none" placeholder="مثال: 50" />
              </div>
            </div>

            {services.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الخدمة المطلوبة</label>
                <select value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none">
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.description}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات أو طلبات خاصة (اختياري)</label>
              <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] outline-none resize-none" placeholder="أي تفاصيل إضافية تود إخبارنا بها..."></textarea>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={submitting} className="w-full bg-[#b89742] text-white p-5 rounded-xl hover:bg-[#9c7f35] transition-all font-extrabold text-xl shadow-lg disabled:opacity-50">
                {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب عرض السعر'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}