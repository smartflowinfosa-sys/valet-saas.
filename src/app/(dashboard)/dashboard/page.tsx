import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">عروض الأسعار اليوم</h3>
          <p className="text-4xl font-bold mt-2 text-gray-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">العملاء</h3>
          <p className="text-4xl font-bold mt-2 text-gray-800">0</p>
        </div>
      </div>
    </div>
  );
}