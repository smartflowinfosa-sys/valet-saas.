'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // الأقسام الستة المطلوبة
  const navItems = [
    { name: 'الرئيسية', href: '/dashboard', icon: '📊' },
    { name: 'طلبات التسعير', href: '/dashboard/requests', icon: '📥' },
    { name: 'عروض الأسعار', href: '/dashboard/quotes', icon: '📄' },
    { name: 'الحجوزات', href: '/dashboard/bookings', icon: '📅' },
    { name: 'إعدادات التسعير', href: '/dashboard/pricing', icon: '💰' },
    { name: 'إعدادات الشركة', href: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex" dir="rtl">
      {/* القائمة الجانبية الفاخرة */}
      <aside className="w-72 bg-white border-l border-gray-200 shadow-sm hidden md:flex flex-col justify-between">
        <div>
          <div className="p-8 border-b border-gray-100 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-[#2d3748] tracking-tight">بوابة <span className="text-[#b89742]">VIP</span></span>
          </div>
          <nav className="p-6 space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard' ? true : false); // تبسيط تفعيل الرابط
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-[#b89742] text-white shadow-md' : 'text-[#718096] hover:bg-gray-50 hover:text-[#2d3748]'}`}>
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors text-sm">
            <span>تسجيل الخروج</span>
            <span>🚪</span>
          </button>
        </div>
      </aside>
      
      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}