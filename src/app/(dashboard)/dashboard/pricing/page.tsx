'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PricingRulesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState('');
  
  const [newRule, setNewRule] = useState({ service_id: '', rule_type: 'hourly', value: 0 });

  const ruleTypes = [
    { id: 'hourly', label: 'تسعير بالساعة' },
    { id: 'extra_valet', label: 'تسعير بالموظف' },
    { id: 'per_car', label: 'تسعير بالسيارة' },
    { id: 'fixed_fee', label: 'رسوم ثابتة إضافية' }
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
        if (userData) {
          setCompanyId(userData.company_id);
          const { data: srvs } = await supabase.from('services').select('id, name');
          setServices(srvs || []);
          if (srvs && srvs.length > 0) setNewRule(prev => ({ ...prev, service_id: srvs[0].id }));

          const { data: rls } = await supabase.from('pricing_rules').select('*, services(name)').order('created_at', { ascending: false });
          setRules(rls || []);
        }
      }
    }
    loadData();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.service_id) return alert("الرجاء إضافة خدمة أولاً من صفحة الخدمات");

    const { data, error } = await supabase.from('pricing_rules').insert([
      { company_id: companyId, ...newRule }
    ]).select('*, services(name)');

    if (!error && data) {
      setRules([data[0], ...rules]);
      setNewRule({ ...newRule, value: 0 });
    }
  };

  const getRuleLabel = (type: string) => ruleTypes.find(r => r.id === type)?.label || type;

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">قواعد التسعير المرنة</h1>
      
      <form onSubmit={handleAddRule} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">الخدمة المرتبطة</label>
          <select value={newRule.service_id} onChange={e => setNewRule({...newRule, service_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">نوع القاعدة</label>
          <select value={newRule.rule_type} onChange={e => setNewRule({...newRule, rule_type: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
            {ruleTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">القيمة (ريال)</label>
          <div className="flex gap-2">
            <input type="number" required min="0" value={newRule.value} onChange={e => setNewRule({...newRule, value: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            <button type="submit" className="bg-[#b89742] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#9c7f35] whitespace-nowrap">إضافة القاعدة</button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr><th className="p-4">الخدمة</th><th className="p-4">نوع القاعدة</th><th className="p-4">القيمة المضافة</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-medium">
            {rules.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-900">{r.services?.name}</td>
                <td className="p-4 text-gray-500">{getRuleLabel(r.rule_type)}</td>
                <td className="p-4 text-[#b89742] font-bold">+{r.value} ريال</td>
              </tr>
            ))}
            {rules.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400">لا توجد قواعد تسعير</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}