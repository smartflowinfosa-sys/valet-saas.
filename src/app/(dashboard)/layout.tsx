import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-white border-l border-gray-200 shadow-sm hidden md:block">
        <div className="p-6 border-b border-gray-100 text-xl font-bold text-gray-800">
          بوابة الشركات VIP
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="block p-3 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 transition-colors">
            الرئيسية (الإحصائيات)
          </Link>
          <Link href="/dashboard/settings" className="block p-3 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 transition-colors">
            إعدادات التسعير والهوية
          </Link>
        </nav>
      </aside>
      
      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}