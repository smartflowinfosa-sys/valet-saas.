import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

import NotificationBell from '@/components/dashboard/NotificationBell';
import LogoutButton from '@/components/dashboard/LogoutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // التحقق من هوية المالك (Super Admin)
  const isSuperAdmin = user.email?.toLowerCase() === 'samrtflow.info.sa@gmail.com' || user.email?.toLowerCase() === 'smartflow.info.sa@gmail.com';

  // ==========================================
  // 👑 واجهة المالك (Super Admin Dashboard)
  // ==========================================
  if (isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans" dir="rtl">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">لوحة تحكم الإدارة (المالك)</h2>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>
        <div className="flex flex-1">
          {/* الشريط الجانبي (Sidebar) لإدارة المستخدمين */}
          <aside className="w-64 bg-white border-l border-gray-100 p-6 hidden md:block shadow-sm z-20">
            <nav className="space-y-4">
              <a href="/dashboard/admin" className="flex items-center gap-3 text-gray-700 hover:text-[#b89742] font-bold p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span>👥</span> إدارة المشتركين
              </a>
              <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-[#b89742] font-bold p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span>⚙️</span> إعدادات المنصة
              </a>
            </nav>
          </aside>
          <main className="flex-1 relative p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🏢 واجهة التاجر (Company Dashboard)
  // ==========================================
  const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
  if (!userData) return <div className="p-10 text-center font-bold text-gray-600" dir="rtl">لا توجد شركة مرتبطة بحسابك. يرجى التواصل مع الإدارة.</div>;

  const { data: company } = await supabase.from('companies').select('name, subscription_status, trial_ends_at').eq('id', userData.company_id).single();
  if (!company) return <div className="p-10 text-center font-bold text-gray-600" dir="rtl">بيانات الشركة غير موجودة.</div>;

  const now = new Date().getTime();
  const trialEndsAt = new Date(company.trial_ends_at).getTime();
  const isTrialing = company.subscription_status === 'trialing';
  const isActive = company.subscription_status === 'active';
  const isExpired = isTrialing && now > trialEndsAt;
  const daysLeft = isTrialing && !isExpired ? Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans" dir="rtl">
      {isTrialing && !isExpired && (
        <div className="bg-[#b89742] text-white text-center p-3 font-bold text-sm shadow-md z-50 relative">
          ⭐ حسابك حالياً في الفترة التجريبية. متبقي <span className="bg-white text-[#b89742] px-2 py-0.5 rounded-md mx-1">{daysLeft}</span> أيام على انتهاء التجربة.
        </div>
      )}

      <main className="flex-1 relative">
        {isExpired ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full border border-red-100">
              <div className="text-red-500 text-6xl mb-6">🔒</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">انتهت الفترة التجريبية</h2>
              <p className="text-gray-600 text-lg mb-8">
                عذراً، لقد انتهت فترة الـ 3 أيام التجريبية الخاصة بشركة <strong>{company.name}</strong>. 
                جميع بياناتك محفوظة. للاستمرار يرجى تفعيل الاشتراك.
              </p>
              <button className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg shadow-lg">
                تواصل مع الإدارة للترقية
              </button>
            </div>
          </div>
        ) : null}

        <div className={isExpired ? 'pointer-events-none blur-sm opacity-50 h-screen overflow-hidden' : ''}>
          <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">لوحة تحكم التاجر</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <LogoutButton />
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}