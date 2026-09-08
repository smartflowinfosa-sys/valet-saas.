'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// دالة مساعدة لتهيئة الاتصال بالخادم
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );
}

// 1. تمديد التجربة (مثلاً: إضافة 7 أيام)
export async function extendTrial(companyId: string, additionalDays: number = 7) {
  const supabase = await getSupabase();
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + additionalDays);

  const { error } = await supabase.from('companies').update({
    trial_ends_at: newEndDate.toISOString(),
    subscription_status: 'trialing'
  }).eq('id', companyId);

  if (error) return { success: false, error: error.message };
  return { success: true, message: `تم تمديد التجربة بنجاح لمدة ${additionalDays} أيام إضافية.` };
}

// 2. إنهاء التجربة فوراً
export async function endTrial(companyId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('companies').update({
    trial_ends_at: new Date().toISOString(), // جعل تاريخ الانتهاء هو الآن
    subscription_status: 'trialing' 
  }).eq('id', companyId);

  if (error) return { success: false, error: error.message };
  return { success: true, message: 'تم إيقاف التجربة لهذه الشركة فوراً.' };
}

// 3. تفعيل الشركة (الاشتراك المدفوع)
export async function activateCompany(companyId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('companies').update({
    subscription_status: 'active'
  }).eq('id', companyId);

  if (error) return { success: false, error: error.message };
  return { success: true, message: 'تم تفعيل حساب الشركة بنجاح (حساب نشط).' };
}