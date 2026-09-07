'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-64 bg-white border-l border-gray-200 shadow-sm hidden md:flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-gray-100 text-xl font-bold text-gray-800">
            بوابة الشركات VIP
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className="block p-3 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 transition-colors">
              الرئيسية
            </Link>
            <Link href="/dashboard/settings" className="block p-3 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 transition-colors">
              إعدادات الشركة
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full text-right p-3 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors text-sm">
            تسجيل الخروج 🚪
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}