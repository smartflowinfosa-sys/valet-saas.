// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SuperAdminDashboard() {
  const supabase = createClient();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // إحصائيات الداشبورد
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    // جلب جميع الشركات لمعاينتها في لوحة المالك
    const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    
    if (data) {
      setCompanies(data);
      // حساب الإحصائيات
      setStats({
        total: data.length,
        active: data.filter(c => c.subscription_status === 'active').length,
        pending: data.filter(c => c.subscription_status === 'trialing' || c.subscription_status === 'pending').length,
        suspended: data.filter(c => c.subscription_status === 'suspended').length,
      });
    }
    setLoading(false);
  };

  const updateStatus = async (companyId: string, newStatus: string) => {
    const { error } = await supabase.from('companies').update({ subscription_status: newStatus }).eq('id', companyId);
    if (!error) {
      fetchCompanies(); // تحديث الجدول بعد تغيير الحالة
      alert(`تم تغيير حالة المشترك إلى: ${newStatus}`);
    } else {
      alert('حدث خطأ أثناء التحديث');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">جاري تحميل بيانات المنصة...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir="rtl">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">نظرة عامة على المنصة 📊</h1>
        <p className="text-gray-500">مرحباً بك في لوحة الإدارة العليا. تابع أداء منصتك وقم بإدارة عملائك من هنا.</p>
      </div>

      {/* ========================================== */}
      {/* 💡 قسم الإحصائيات العلوية (Dashboard Stats) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">إجمالي المشتركين</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.total}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">👥</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">نشط حالياً</p>
            <h3 className="text-3xl font-extrabold text-green-600">{stats.active}</h3>
          </div>
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl">✅</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">في الانتظار / تجربة</p>
            <h3 className="text-3xl font-extrabold text-yellow-600">{stats.pending}</h3>
          </div>
          <div className="h-12 w-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl">⏳</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">حسابات متوقفة</p>
            <h3 className="text-3xl font-extrabold text-red-600">{stats.suspended}</h3>
          </div>
          <div className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl">🛑</div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 💡 جدول إدارة المشتركين (Users Management) */}
      {/* ========================================== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">إدارة التجار والمشتركين</h2>
          <button className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
            + إضافة عميل يدوياً
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-bold">اسم الشركة</th>
                <th className="p-4 font-bold">الرابط المخصص</th>
                <th className="p-4 font-bold">تاريخ الانضمام</th>
                <th className="p-4 font-bold">الباقة</th>
                <th className="p-4 font-bold">حالة الحساب</th>
                <th className="p-4 font-bold text-center">الإجراءات (صلاحيات المالك)</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500 font-bold">
                    لا يوجد مشتركون حالياً.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{company.name || 'بدون اسم'}</td>
                    <td className="p-4 text-gray-500 font-mono text-sm" dir="ltr">{company.slug || 'N/A'}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(company.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold">
                        {company.plan_type === 'basic' ? 'الأساسية' : 'المتقدمة'}
                      </span>
                    </td>
                    <td className="p-4">
                      {company.subscription_status === 'active' && <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit"><span>🟢</span> نشط</span>}
                      {company.subscription_status === 'trialing' && <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit"><span>⭐</span> فترة تجريبية</span>}
                      {company.subscription_status === 'suspended' && <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit"><span>🛑</span> متوقف</span>}
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button 
                        onClick={() => updateStatus(company.id, 'active')}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                        title="تفعيل الحساب"
                      >
                        تفعيل
                      </button>
                      <button 
                        onClick={() => updateStatus(company.id, 'suspended')}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        title="إيقاف الحساب"
                      >
                        إيقاف
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                        ⚙️ تعديل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}