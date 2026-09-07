'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculatePrice } from '@/lib/pricing/engine';

// دالة مساعدة لحساب عدد الساعات بين وقتين
function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diff = (eh + em / 60) - (sh + sm / 60);
  if (diff <= 0) diff += 24; // للتعامل مع الحجوزات التي تمتد لبعد منتصف الليل
  return Math.ceil(diff); 
}

export async function submitAndGenerateQuote(companySlug: string, formData: any) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  try {
    // 1. البحث عن الشركة برقمها السري عبر الـ Slug فقط
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', companySlug)
      .single();

    if (companyError || !company) throw new Error("الشركة غير موجودة");

    // 2. حفظ طلب العميل (Quote Request)
    const { data: request, error: requestError } = await supabase
      .from('quote_requests')
      .insert([{ company_id: company.id, status: 'pending', details: formData }])
      .select()
      .single();

    if (requestError) throw new Error("حدث خطأ أثناء حفظ الطلب");

    // 3. تطبيق محرك التسعير (Pricing Engine)
    const pricingParams = {
      hours: calculateHours(formData.start_time, formData.end_time),
      cars: Number(formData.expected_cars || 0),
      valets: Number(formData.valets || 0) // يمكن تفعيله لاحقاً إذا أضفناه للاستمارة
    };

    // الحساب يتم بآمان على الخادم
    const { total, breakdown } = await calculatePrice(supabase, formData.service_id, pricingParams);

    // 4. إنشاء رقم فريد وحفظ لقطة ثابتة للسعر (Snapshot)
    const quoteNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        company_id: company.id,
        quote_request_id: request.id,
        quote_number: quoteNumber,
        total_amount: total,
        status: 'draft',
        snapshot: breakdown // هنا نحفظ تفاصيل السعر لكي لا يتغير مستقبلاً!
      }]);

    if (quoteError) throw new Error("حدث خطأ أثناء توليد عرض السعر");

    return { success: true, message: "تم إنشاء الطلب وعرض السعر بنجاح" };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}