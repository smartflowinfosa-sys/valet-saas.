'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculatePrice } from '@/lib/pricing/engine';
import { notifier } from '@/lib/notifications/NotificationService'; // 👈 إضافة: استدعاء مدير الإشعارات

// دالة مساعدة لحساب عدد الساعات بين وقتين
function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diff = (eh + em / 60) - (sh + sm / 60);
  if (diff <= 0) diff += 24; 
  return Math.ceil(diff); 
}

export async function submitAndGenerateQuote(companySlug: string, formData: any) {
  const cookieStore = await cookies(); 
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', companySlug)
      .single();

    if (companyError || !company) throw new Error("الشركة غير موجودة");

    const { data: request, error: requestError } = await supabase
      .from('quote_requests')
      .insert([{ company_id: company.id, status: 'pending', details: formData }])
      .select()
      .single();

    if (requestError) throw new Error("حدث خطأ أثناء حفظ الطلب");

    const pricingParams = {
      hours: calculateHours(formData.start_time, formData.end_time),
      cars: Number(formData.expected_cars || 0),
      valets: Number(formData.valets || 0) // تم التحديث ليقرأ الموظفين بشكل صحيح
    };

    const { total, breakdown } = await calculatePrice(supabase, formData.service_id, pricingParams);

    const quoteNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        company_id: company.id,
        quote_request_id: request.id,
        quote_number: quoteNumber,
        total_amount: total,
        status: 'draft',
        snapshot: breakdown 
      }]);

    if (quoteError) throw new Error("حدث خطأ أثناء توليد عرض السعر");

    // ==========================================
    // 💡 إضافة: إطلاق الإشعار في الخلفية
    // (بدون await لكي لا نؤخر العميل أبداً)
    // ==========================================
    notifier.dispatch({
      companyId: company.id,
      type: 'new_request',
      title: 'طلب عرض سعر جديد 📥',
      message: `تم استلام طلب جديد، رقم العرض: ${quoteNumber}`
    });
    // ==========================================

    return { success: true, message: "تم إنشاء الطلب وعرض السعر بنجاح" };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}