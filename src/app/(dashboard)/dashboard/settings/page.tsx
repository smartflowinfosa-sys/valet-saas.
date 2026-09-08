'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateCompanySettings } from '@/app/actions/settings';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [appDomain, setAppDomain] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    brand_color: '#b89742'
  });

  useEffect(() => {
    // التقاط الدومين الحالي ديناميكياً لإنشاء الرابط
    setAppDomain(window.location.origin);

    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
      if (userData) {
        setCompanyId(userData.company_id);
        const { data: company } = await supabase.from('companies').select('*').eq('id', userData.company_id).single();
        if (company) {
          setFormData({
            name: company.name || '',
            slug: company.slug || '',
            description: company.description || '',
            logo_url: company.logo_url || '',
            phone: company.phone || '',
            email: company.email || '',
            whatsapp: company.whatsapp || '',
            address: company.address || '',
            brand_color: company.brand_color || '#b89742'
          });
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${appDomain}/q/${formData.slug}`);
    setMessage({ type: 'success', text: 'تم نسخ الرابط بنجاح!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handlePreview = () => {
    if (!formData.slug) return alert('يرجى تحديد الـ Slug أولاً');
    window.open(`${appDomain}/q/${formData.slug}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // تنظيف الـ Slug من المسافات والأحرف الخاصة قبل الإرسال
    const cleanedData = {
      ...formData,
      slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    };

    const response = await updateCompanySettings(companyId, cleanedData);
    
    if (response.success) {
      setMessage({ type: 'success', text: response.message });
      setFormData(cleanedData); // تحديث الواجهة بالـ Slug المنظف
    } else {
      setMessage({ type: 'error', text: response.error });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">جاري تحميل الإعدادات...</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">إعدادات الشركة ⚙️</h1>
        <p className="text-gray-500">تحكم بهويتك التجارية ورابطك المخصص لعملائك.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* قسم الرابط العام (Public URL Section) */}
      <div className="bg-gray-900 rounded-3xl p-6 md:p-8 mb-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-800">
        <div className="flex-1 w-full">
          <h2 className="text-lg font-bold mb-2">رابط طلب عرض السعر لعملائك</h2>
          <p className="text-gray-400 text-sm mb-4">انسخ هذا الرابط وضعه في البايو الخاص بانستغرام أو أرسله لعملائك في الواتساب.</p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-[#b89742] break-all border border-gray-700 select-all">
            {appDomain}/q/{formData.slug || 'company-slug'}
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleCopyLink} className="flex-1 md:flex-none bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            📋 نسخ الرابط
          </button>
          <button onClick={handlePreview} className="flex-1 md:flex-none bg-[#b89742] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#9c7f35] transition-colors">
            👁️ معاينة
          </button>
        </div>
      </div>

      {/* نموذج الإعدادات */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        
        {/* الهوية الأساسية */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">الهوية الأساسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشركة</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الرابط المخصص (Slug)</label>
              <input type="text" name="slug" required value={formData.slug} onChange={handleChange} dir="ltr" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742] text-left" placeholder="my-company" />
              <p className="text-xs text-gray-400 mt-1">أحرف إنجليزية وأرقام وعلامة (-) فقط.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">رابط الشعار (Logo URL)</label>
              <input type="url" name="logo_url" value={formData.logo_url} onChange={handleChange} dir="ltr" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742] text-left" placeholder="https://example.com/logo.png" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">وصف مختصر للشركة</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742] resize-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">لون الهوية الرئيسي</label>
              <div className="flex items-center gap-3">
                <input type="color" name="brand_color" value={formData.brand_color} onChange={handleChange} className="h-12 w-12 rounded-xl cursor-pointer" />
                <span className="text-sm font-mono text-gray-500" dir="ltr">{formData.brand_color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* بيانات التواصل */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">بيانات التواصل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف (الرئيسي)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الواتساب (للتواصل)</label>
              <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">العنوان / المقر الرئيسي</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742]" />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={saving} className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg disabled:opacity-50 shadow-lg">
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}