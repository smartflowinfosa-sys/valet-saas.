import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

// 💡 استدعاء مكون جرس الإشعارات
import NotificationBell from '@/components/dashboard/NotificationBell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 1. جلب المستخدم الحالي
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. جلب بيانات الشركة المرتبطة
  const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
  if (!userData) return <div>لا توجد شركة مرتبطة بحسابك.</div>;

  const { data: company } = await supabase.from('companies').select('name, subscription_status, trial_ends_at').eq('id', userData.company_id).single();
  if (!company) return <div>بيانات الشركة غير موجودة.</div>;

  // 3. التحقق الآمن في الخادم (Server-side Date Validation)
  const now = new Date().getTime();
  const trialEndsAt = new Date(company.trial_ends_at).getTime();
  const isTrialing = company.subscription_status === 'trialing';
  const isActive = company.subscription_status === 'active';
  
  // هل التجربة منتهية؟ (إذا كانت الحالة تجربة والتاريخ في الماضي)
  const isExpired = isTrialing && now > trialEndsAt;
  
  // حساب الأيام المتبقية (إذا لم تنتهِ بعد)
  const daysLeft = isTrialing && !isExpired ? Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans" dir="rtl">
      
      {/* شريط تنبيه فترة التجربة (يظهر فقط إذا كانت التجربة سارية) */}
      {isTrialing && !isExpired && (
        <div className="bg-[#b89742] text-white text-center p-3 font-bold text-sm shadow-md z-50 relative">
          ⭐ حسابك حالياً في الفترة التجريبية. متبقي <span className="bg-white text-[#b89742] px-2 py-0.5 rounded-md mx-1">{daysLeft}</span> أيام على انتهاء التجربة.
        </div>
      )}

      {/* المحتوى الرئيسي للوحة التحكم */}
      <main className="flex-1 relative">
        {/* إذا انتهت التجربة، يتم عرض شاشة الإيقاف فوق المحتوى (لمنع النقر مع إبقاء البيانات محفوظة) */}
        {isExpired ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full border border-red-100">
              <div className="text-red-500 text-6xl mb-6">🔒</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">انتهت الفترة التجريبية</h2>
              <p className="text-gray-600 text-lg mb-8">
                عذراً، لقد انتهت فترة الـ 3 أيام التجريبية الخاصة بشركة <strong>{company.name}</strong>. 
                جميع بياناتك، عروضك، وحجوزاتك محفوظة بأمان ولن يتم حذفها. للاستمرار في استخدام النظام واستقبال طلبات جديدة، يرجى تفعيل الاشتراك.
              </p>
              <button className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg shadow-lg">
                تواصل مع الإدارة للترقية
              </button>
            </div>
          </div>
        ) : null}

        {/* عرض محتوى الصفحة بشكل طبيعي (أو تحت الشفافية إذا انتهت التجربة) */}
        <div className={isExpired ? 'pointer-events-none blur-sm opacity-50 h-screen overflow-hidden' : ''}>
          
          {/* ========================================== */}
          {/* 💡 الشريط العلوي (Header) مع جرس الإشعارات */}
          {/* ========================================== */}
          <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">لوحة تحكم التاجر</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </header>
          {/* ========================================== */}

          {children}
        </div>
      </main>

    </div>
  );
}