import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-white border-l border-gray-200 shadow-sm hidden md:block">
        <div className="p-6 border-b border-gray-100 text-xl font-bold text-gray-800">
          Valet SaaS
        </div>
        <nav className="p-4 space-y-2">
          <div className="p-3 bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 cursor-pointer">الرئيسية</div>
          <div className="p-3 text-gray-500 text-sm hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">الإعدادات</div>
        </nav>
      </aside>
      
      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}