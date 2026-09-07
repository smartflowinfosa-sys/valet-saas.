'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { processQuoteAction } from '@/app/actions/quoteActions';

export default function QuoteDisplayPage({ params }: { params: any }) {
  const resolvedParams = React.use(params) as any;
  const quoteToken = resolvedParams.quoteToken; // هذا هو الـ UUID الآمن
  
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function fetchQuote() {
      // جلب بيانات العرض، الطلب، والشركة بناءً على الرمز الآمن (بدون الحاجة لتسجيل الدخول)
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_requests ( details, created_at ),
          companies ( name, logo_url, phone, email )
        `)
        .eq('id', quoteToken)
        .single();

      if (data) setQuoteData(data);
      setLoading(false);
    }
    fetchQuote();
  }, [quoteToken]);

  const handleAction = async (action: 'accept' | 'reject') => {
    if (!confirm(`هل أنت متأكد أنك تريد ${action === 'accept' ? 'قبول' : 'رفض'} هذا العرض؟`)) return;
    
    setProcessing(true);
    const response = await processQuoteAction(quoteToken, action);
    
    if (response?.success) {
      setQuoteData({ ...quoteData, status: action === 'accept' ? 'accepted' : 'rejected' });
      setStatusMessage(response.message || '');
    } else {
      alert(`❌ خطأ: ${response?.error}`);
    }
    setProcessing(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">جاري تحميل عرض السعر...</div>;
  if (!quoteData) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">عرض السعر غير موجود أو الرابط غير صحيح.</div>;

  const { companies: company, quote_requests: request, snapshot } = quoteData;
  const details = request.details;
  const isProcessed = quoteData.status !== 'draft';

  return (
    <div className="min-h-screen bg-[#f4f6f8] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* رأس الصفحة (Header) */}
        <div className="bg-gray-900 px-8 py-10 text-center relative">
          {company.logo_url && (
            <img src={company.logo_url} alt={company.name} className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4 bg-white" />
          )}
          <h1 className="text-3xl font-extrabold text-white">عرض سعر رسمي</h1>
          <p className="text-[#b89742] mt-2 font-bold">{company.name}</p>
        </div>

        <div className="p-8 md:p-12">
          
          {/* حالة العرض بعد المعالجة */}
          {isProcessed && (
            <div className={`mb-8 p-6 rounded-2xl text-center border-2 ${quoteData.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h2 className={`text-2xl font-bold ${quoteData.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                {quoteData.status === 'accepted' ? '✅ تم قبول العرض وتأكيد الحجز' : '❌ تم رفض العرض'}
              </h2>
              <p className="text-gray-600 mt-2">{statusMessage}</p>
            </div>
          )}

          {/* تفاصيل المناسبة */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">تفاصيل المناسبة</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><span className="text-gray-500 block">رقم العرض</span><strong className="text-gray-900">{quoteData.quote_number}</strong></div>
              <div><span className="text-gray-500 block">تاريخ المناسبة</span><strong className="text-gray-900">{details.event_date}</strong></div>
              <div><span className="text-gray-500 block">المدة</span><strong className="text-gray-900">من {details.start_time} إلى {details.end_time}</strong></div>
              <div><span className="text-gray-500 block">الموقع</span><strong className="text-gray-900">{details.location}</strong></div>
              <div><span className="text-gray-500 block">عدد السيارات</span><strong className="text-gray-900">{details.expected_cars || 0} سيارة</strong></div>
              <div><span className="text-gray-500 block">عدد الموظفين</span><strong className="text-gray-900">{details.valets || 0} موظف</strong></div>
            </div>
          </div>

          {/* تفاصيل الحساب (Snapshot) */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">تفاصيل التكلفة</h3>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
              {snapshot?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm font-medium text-gray-700">
                  <span>{item.desc}</span>
                  <span>{item.amount} ريال</span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">الإجمالي النهائي</span>
                <span className="text-3xl font-extrabold text-[#b89742]">{quoteData.total_amount} <span className="text-sm text-gray-500">ريال</span></span>
              </div>
            </div>
          </div>

          {/* الشروط والأحكام */}
          <div className="mb-10 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <strong className="block mb-2 text-gray-700">الشروط والأحكام:</strong>
            <ul className="list-disc list-inside space-y-1">
              <li>هذا العرض صالح لمدة 7 أيام من تاريخ إصداره.</li>
              <li>الأسعار قابلة للتغيير في حال تم تعديل عدد الساعات أو الموظفين الفعلي في الموقع.</li>
              <li>بالنقر على "قبول العرض"، أنت توافق على شروط الخدمة الخاصة بـ {company.name}.</li>
            </ul>
          </div>

          {/* أزرار الإجراء (تختفي إذا تمت معالجة العرض) */}
          {!isProcessed && (
            <div className="flex gap-4">
              <button onClick={() => handleAction('accept')} disabled={processing} className="flex-1 bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg disabled:opacity-50 shadow-lg">
                ✅ قبول العرض وتأكيد الحجز
              </button>
              <button onClick={() => handleAction('reject')} disabled={processing} className="flex-1 bg-white text-red-600 border-2 border-red-100 p-4 rounded-xl hover:bg-red-50 transition-all font-bold text-lg disabled:opacity-50">
                ❌ رفض العرض
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}