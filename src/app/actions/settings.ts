'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function updateCompanySettings(companyId: string, formData: any) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  try {
    // 1. التحقق الآمن: التأكد من أن الـ Slug الجديد غير محجوز لشركة "أخرى"
    if (formData.slug) {
      const { data: existingSlug } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', formData.slug)
        .neq('id', companyId) // استثناء الشركة الحالية من البحث
        .single();

      if (existingSlug) {
        return { success: false, error: 'عذراً، هذا الرابط (Slug) مستخدم لشركة أخرى. يرجى اختيار رابط مختلف.' };
      }
    }

    // 2. تحديث البيانات
    const { error } = await supabase
      .from('companies')
      .update({
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp,
        address: formData.address,
        brand_color: formData.brand_color,
        slug: formData.slug
      })
      .eq('id', companyId);

    if (error) throw new Error(error.message);
    
    return { success: true, message: 'تم حفظ إعدادات الشركة بنجاح.' };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}