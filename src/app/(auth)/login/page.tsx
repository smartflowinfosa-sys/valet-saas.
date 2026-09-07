'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // استدعاء أداة الاتصال بقاعدة البيانات
  const supabase = createClient();

  // وظيفة تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // لمنع تحديث الصفحة عند الضغط
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('بيانات الدخول غير صحيحة، تأكد من البريد وكلمة المرور.');
      setLoading(false);
    } else {
      // إذا نجح الدخول، يتم توجيه الشركة فوراً إلى لوحة التحكم
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">تسجيل الدخول للشركات</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* رسالة الخطأ في حال كانت البيانات خاطئة */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-70"
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </main>
  );
}