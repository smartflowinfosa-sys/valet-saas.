'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    async function loadCompany() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
        if (profile) {
          const { data: comp } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
          setCompany(comp);
        }
      }
      setLoading(false);
    }
    loadCompany();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const { error } = await supabase.from('companies').update({
      base_price: company.base_price,
      hourly_rate: company.hourly_rate,
      valet_rate: company.valet_rate,
      logo_url: company.logo_url
    }).eq('id', company.id);

    if (error) setMessage('❌ حدث خطأ أثناء الحفظ');
    else setMessage('✅ تم حفظ الإعدادات والتسعيرة بنجاح!');
    setSaving(false);
  };

  if (loading) return <div dir="rtl" className="font-bold text-gray-500">جاري تحميل إعدادات شركتك...</div>;

  return (
    <div dir="rtl" className="max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إعدادات التسعير والهوية</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">رابط شعار الشركة (يجب أن يكون رابطاً مباشراً للصورة)</label>
          <input type="text" dir="ltr" value={company?.logo_url || ''} onChange={e => setCompany({...company, logo_url: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742]" placeholder="https://..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">السعر الأساسي (ريال)</label>
            <input type="number" value={company?.base_price || 0} onChange={e => setCompany({...company, base_price: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">سعر الساعة الإضافية</label>
            <input type="number" value={company?.hourly_rate || 0} onChange={e => setCompany({...company, hourly_rate: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">سعر الموظف الإضافي</label>
            <input type="number" value={company?.valet_rate || 0} onChange={e => setCompany({...company, valet_rate: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b89742]" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg disabled:opacity-70 mt-4">
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}