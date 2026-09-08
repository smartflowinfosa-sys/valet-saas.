'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import DataTable from '@/components/dashboard/DataTable';

export default function RequestsPage() {
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // الـ RLS في قاعدة البيانات سيجلب بيانات شركة المستخدم تلقائياً
      const { data: requests } = await supabase.from('quote_requests').select('*').order('created_at', { ascending: false });
      
      // تبسيط البيانات للجدول
      const formattedData = requests?.map(r => ({
        id: r.id,
        created_at: new Date(r.created_at).toISOString().split('T')[0],
        client_name: r.details?.name || 'غير محدد',
        phone: r.details?.phone || 'غير محدد',
        status: r.status
      })) || [];
      
      setData(formattedData as any);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <DataTable 
        title="إدارة طلبات التسعير"
        data={data}
        loading={loading}
        emptyMessage="لا توجد طلبات تسعير حالياً."
        columns={[
          { key: 'client_name', label: 'اسم العميل' },
          { key: 'phone', label: 'رقم الجوال' },
          { key: 'created_at', label: 'تاريخ الطلب' }
        ]}
        statuses={[
          { value: 'new', label: 'جديد' },
          { value: 'pending', label: 'قيد المعالجة' },
          { value: 'closed', label: 'مغلق' }
        ]}
      />
    </div>
  );
}