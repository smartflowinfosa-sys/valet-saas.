'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import DataTable from '@/components/dashboard/DataTable';

export default function BookingsPage() {
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: bookings } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      
      const formattedData = bookings?.map(b => ({
        id: b.id,
        customer_phone: b.customer_phone,
        total_price: `${b.total_price} ريال`,
        created_at: new Date(b.created_at).toISOString().split('T')[0],
        status: b.status || 'confirmed'
      })) || [];
      
      setData(formattedData as any);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <DataTable 
        title="إدارة الحجوزات المؤكدة"
        data={data}
        loading={loading}
        emptyMessage="لا توجد حجوزات مؤكدة حالياً."
        columns={[
          { key: 'customer_phone', label: 'رقم جوال العميل' },
          { key: 'total_price', label: 'القيمة الإجمالية' },
          { key: 'created_at', label: 'تاريخ الحجز' }
        ]}
        statuses={[
          { value: 'pending', label: 'معلق' },
          { value: 'confirmed', label: 'مؤكد' },
          { value: 'completed', label: 'مكتمل' },
          { value: 'cancelled', label: 'ملغى' }
        ]}
      />
    </div>
  );
}