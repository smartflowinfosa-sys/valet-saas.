'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function processQuoteAction(quoteId: string, action: 'accept' | 'reject') {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  try {
    // 1. جلب العرض والتأكد من وجوده وأنه ما زال "مسودة"
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*, quote_requests(details), companies(name)')
      .eq('id', quoteId)
      .single();

    if (error || !quote) return { success: false, error: 'عرض السعر غير موجود أو الرابط غير صحيح.' };
    if (quote.status !== 'draft') return { success: false, error: 'تمت معالجة عرض السعر هذا مسبقاً.' };

    // 2. حالة الرفض
    if (action === 'reject') {
      await supabase.from('quotes').update({ status: 'rejected' }).eq('id', quoteId);
      return { success: true, message: 'تم رفض العرض، شكراً لوقتك.' };
    }

    // 3. حالة القبول (يجب منع التكرار وإنشاء حجز)
    if (action === 'accept') {
      // التحقق من عدم وجود حجز مسبق لهذا العرض
      const { data: existingBooking } = await supabase.from('bookings').select('id').eq('quote_id', quoteId).single();
      if (existingBooking) return { success: false, error: 'يوجد حجز مؤكد مسبقاً لهذا العرض.' };

      // تحديث حالة العرض إلى مقبول
      await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);

      // استخراج بيانات العميل من الطلب الأصلي
      const details = quote.quote_requests.details;

      // إنشاء الحجز الفعلي (Booking)
      await supabase.from('bookings').insert([{
        company_id: quote.company_id,
        quote_id: quote.id,
        customer_phone: details.phone,
        total_price: quote.total_amount,
        // يمكننا إضافة عدد الساعات والموظفين هنا إذا أردت تحديث جدول الحجوزات لاحقاً
      }]);

      return { success: true, message: 'تم قبول العرض وتأكيد حجزك بنجاح!' };
    }

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}