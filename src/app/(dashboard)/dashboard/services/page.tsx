'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [newService, setNewService] = useState({ name: '', description: '', base_price: 0 });

  useEffect(() => {
    async function loadServices() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
        if (userData) {
          setCompanyId(userData.company_id);
          const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
          setServices(data || []);
        }
      }
    }
    loadServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('services').insert([
      { company_id: companyId, ...newService }
    ]).select();

    if (!error && data) {
      setServices([data[0], ...services]);
      setNewService({ name: '', description: '', base_price: 0 });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">إدارة الخدمات</h1>
      
      {/* نموذج إضافة خدمة */}
      <form onSubmit={handleAddService} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">اسم الخدمة (مثل: VIP Valet)</label>
          <input type="text" required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
          <input type="text" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">السعر الأساسي (ريال)</label>
          <div className="flex gap-2">
            <input type="number" required min="0" value={newService.base_price} onChange={e => setNewService({...newService, base_price: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            <button type="submit" className="bg-[#b89742] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#9c7f35]">إضافة</button>
          </div>
        </div>
      </form>

      {/* قائمة الخدمات */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr><th className="p-4">اسم الخدمة</th><th className="p-4">الوصف</th><th className="p-4">السعر الأساسي</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-medium">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-900">{s.name}</td>
                <td className="p-4 text-gray-500">{s.description}</td>
                <td className="p-4 text-[#b89742] font-bold">{s.base_price} ريال</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}