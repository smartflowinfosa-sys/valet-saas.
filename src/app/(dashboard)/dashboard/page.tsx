'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
        if (profile) {
          // جلب الطلبات الخاصة بهذه الشركة فقط
          const { data: reqs } = await supabase.from('bookings').select('*').eq('company_id', profile.company_id).order('created_at', { ascending: false });
          setBookings(reqs || []);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);

  if (loading) return <div className="font-bold text-gray-500">جاري تحميل البيانات...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">نظرة عامة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-bold">إجمالي الطلبات</h3>
          <p className="text-4xl font-extrabold mt-2 text-[#b89742]">{bookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-bold">الإيرادات المحتملة (ريال)</h3>
          <p className="text-4xl font-extrabold mt-2 text-gray-900">{totalRevenue}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">أحدث الطلبات</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4">رقم الجوال</th>
              <th className="p-4">الساعات</th>
              <th className="p-4">الموظفين</th>
              <th className="p-4">السعر الإجمالي</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm text-gray-800 font-medium">
            {bookings.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد طلبات حتى الآن</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4" dir="ltr">{b.customer_phone}</td>
                  <td className="p-4">{b.hours}</td>
                  <td className="p-4">{b.valets}</td>
                  <td className="p-4 font-bold text-[#b89742]">{b.total_price} ريال</td>
                  <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">{b.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}