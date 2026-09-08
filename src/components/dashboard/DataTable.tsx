'use client';

import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  statuses: { value: string; label: string }[];
  loading: boolean;
  emptyMessage: string;
}

export default function DataTable({ title, data, columns, statuses, loading, emptyMessage }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // فلترة البيانات
  const filteredData = data.filter(item => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesDate = !dateFilter || (item.created_at && item.created_at.startsWith(dateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });

  // الترقيم
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      new: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        
        {/* أدوات الفلترة */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input type="text" placeholder="بحث عام..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#b89742]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#b89742]">
            <option value="all">جميع الحالات</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#b89742]" />
        </div>
      </div>

      {/* الحالات */}
      {loading ? (
        <div className="p-10 text-center text-gray-500 font-bold">جاري تحميل البيانات...</div>
      ) : paginatedData.length === 0 ? (
        <div className="p-10 text-center text-gray-500 font-bold">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <tr>
                {columns.map(col => <th key={col.key} className="p-4">{col.label}</th>)}
                <th className="p-4">الحالة</th>
                <th className="p-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {paginatedData.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="p-4 text-gray-800">{row[col.key]}</td>
                  ))}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => setSelectedRecord(row)} className="text-[#b89742] hover:text-black font-bold underline">التفاصيل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* الترقيم */}
      {!loading && paginatedData.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 text-sm">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 font-bold">السابق</button>
          <span className="text-gray-600 font-bold">صفحة {currentPage} من {totalPages || 1}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 font-bold">التالي</button>
        </div>
      )}

      {/* نافذة التفاصيل */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-xl font-bold text-gray-900">تفاصيل السجل</h3>
              <button onClick={() => setSelectedRecord(null)} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-red-500 hover:text-white transition-colors font-bold">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedRecord).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null; // إخفاء الكائنات المعقدة برمجياً
                return (
                  <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">{key}</span>
                    <span className="block text-gray-900 font-medium break-words">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}