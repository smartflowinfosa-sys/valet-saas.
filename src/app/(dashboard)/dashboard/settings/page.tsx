'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // جلب الصلاحية من الجدول الجديد
        const { data: userData } = await supabase.from('company_users').select('company_id, role').eq('id', user.id).single();
        
        if (userData) {
          setRole(userData.role);
          const { data: comp } = await supabase.from('companies').select('*').eq('id', userData.company_id).single();
          setCompany(comp);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'admin' && role !== 'super_admin') {
      setMessage('❌ ليس لديك صلاحية لتعديل بيانات الشركة');
      return;
    }

    setSaving(true);
    setMessage('');
    
    const { error } = await supabase.from('companies').update({
      name: company.name,
      logo_url: company.logo_url,
      phone: company.phone,
      email: company.email,
      description: company.description,
      slug: company.slug
    }).eq('id', company.id);

    if (error) setMessage('❌ حدث خطأ أثناء الحفظ: ' + error.message);
    else setMessage('✅ تم تحديث بيانات الشركة بنجاح!');
    setSaving(false);
  };

  if (loading) return <div dir="rtl" className="font-bold text-gray-500">جاري تحميل الإعدادات...</div>;
  if (!company) return <div dir="rtl" className="font-bold text-red-500">لم يتم العثور على شركتك.</div>;

  return (
    <div dir="rtl" className="max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات الشركة الأساسية</h1>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-bold">الصلاحية: {role}</span>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الشركة</label>
            <input type="text" value={company.name || ''} onChange={e => setCompany({...company, name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الرابط المخصص (Slug)</label>
            <input type="text" dir="ltr" value={company.slug || ''} onChange={e => setCompany({...company, slug: e.target.value.toLowerCase()})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742]" placeholder="company-name" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
            <input type="tel" value={company.phone || ''} onChange={e => setCompany({...company, phone: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني للشركة</label>
            <input type="email" value={company.email || ''} onChange={e => setCompany({...company, email: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الشعار المباشر</label>
          <input type="url" dir="ltr" value={company.logo_url || ''} onChange={e => setCompany({...company, logo_url: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742]" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الشركة (نبذة)</label>
          <textarea rows={3} value={company.description || ''} onChange={e => setCompany({...company, description: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b89742] resize-none" placeholder="اكتب نبذة عن خدماتكم..."></textarea>
        </div>

        <button type="submit" disabled={saving || (role !== 'admin' && role !== 'super_admin')} className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg disabled:opacity-50 mt-4">
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}