'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import DataTable from '@/components/dashboard/DataTable';

export default function QuotesPage() {
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: quotes } = await supabase.from('quotes').select('*, quote_requests(details)').order('created_at', { ascending: false });
      
      const formattedData = quotes?.map(q => ({
        id: q.id,
        quote_number: q.quote_number,
        total_amount: `${q.total_amount} ريال`,
        client_name: q.quote_requests?.details?.name || 'غير محدد',
        created_at: new Date(q.created_at).toISOString().split('T')[0],
        status: q.status
      })) || [];
      
      setData(formattedData as any);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <DataTable 
        title="إدارة عروض الأسعار"
        data={data}
        loading={loading}
        emptyMessage="لا توجد عروض أسعار حالياً."
        columns={[
          { key: 'quote_number', label: 'رقم العرض' },
          { key: 'client_name', label: 'اسم العميل' },
          { key: 'total_amount', label: 'المبلغ الإجمالي' },
          { key: 'created_at', label: 'تاريخ الإصدار' }
        ]}
        statuses={[
          { value: 'draft', label: 'مسودة' },
          { value: 'accepted', label: 'مقبول' },
          { value: 'rejected', label: 'مرفوض' },
          { value: 'expired', label: 'منتهي' }
        ]}
      />
    </div>
  );
}