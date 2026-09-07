'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    requests: 0,
    quotes: 0,
    acceptedQuotes: 0,
    bookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
      
      if (userData) {
        const { data: company } = await supabase.from('companies').select('name').eq('id', userData.company_id).single();
        if (company) setCompanyName(company.name);

        // جلب الإحصائيات المعزولة تلقائياً بفضل RLS
        const { count: requestsCount } = await supabase.from('quote_requests').select('*', { count: 'exact', head: true });
        const { count: quotesCount } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
        const { count: acceptedCount } = await supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'accepted');
        
        // جلب الحجوزات وحساب القيمة الإجمالية
        const { data: bookingsData } = await supabase.from('bookings').select('total_price');
        const bookingsCount = bookingsData?.length || 0;
        const revenue = bookingsData?.reduce((sum, item) => sum + Number(item.total_price || 0), 0) || 0;

        setStats({
          requests: requestsCount || 0,
          quotes: quotesCount || 0,
          acceptedQuotes: acceptedCount || 0,
          bookings: bookingsCount,
          totalRevenue: revenue
        });
      }
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#b89742] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // بطاقات الإحصائيات الفاخرة
  const statCards = [
    { title: 'طلبات التسعير', value: stats.requests, icon: '📥', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'إجمالي العروض', value: stats.quotes, icon: '📄', color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'العروض المقبولة', value: stats.acceptedQuotes, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'الحجوزات المؤكدة', value: stats.bookings, icon: '📅', color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'القيمة الإجمالية (ريال)', value: stats.totalRevenue.toLocaleString(), icon: '💰', color: 'text-[#b89742]', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">مرحباً بك في لوحة تحكم {companyName} 👋</h1>
        <p className="text-gray-500 font-medium">نظرة عامة على أداء شركتك وأحدث الإحصائيات الحية.</p>
      </header>

      {/* شبكة الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <h3 className="text-gray-500 text-sm font-bold mb-1">{stat.title}</h3>
            <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* مساحة فارغة أنيقة للرسوم البيانية مستقبلاً */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">✨</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">مساحة مخصصة للرسوم البيانية</h2>
        <p className="text-gray-500 max-w-md">سيتم برمجة هذا القسم في المراحل القادمة ليعرض تفاصيل الحجوزات ونشاطات الشركة في شكل رسوم بيانية تفاعلية.</p>
      </div>
    </div>
  );
}