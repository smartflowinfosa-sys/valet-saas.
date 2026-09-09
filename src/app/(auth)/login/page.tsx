'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // 1. محاولة تسجيل الدخول أولاً
    let { error } = await supabase.auth.signInWithPassword({ email, password });

    // 2. إذا لم يكن الحساب موجوداً (Invalid login credentials)، نقوم بإنشائه فوراً (تسجيل جديد)
    if (error && error.message.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      
      if (signUpError) {
        setMessage({ type: 'error', text: signUpError.message });
        setLoading(false);
        return;
      }
      
      // تسجيل دخول تلقائي بعد إنشاء الحساب
      const { error: signInAfterSignUpError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInAfterSignUpError;
    } else if (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في تسجيل الدخول. تأكد من البيانات.' });
      setLoading(false);
      return;
    }

    if (!error) {
      setMessage({ type: 'success', text: 'تم الدخول بنجاح! جاري التوجيه...' });
      
      // التوجيه الذكي المبدئي (والـ Middleware سيؤكد ذلك)
      if (email === 'samrtflow.info.sa@gmail.com') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] p-4" dir="rtl">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-500 text-sm">أدخل بريدك الإلكتروني وكلمة المرور للمتابعة</p>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742] text-left" 
              dir="ltr"
              placeholder="name@company.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742] text-left" 
              dir="ltr"
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg disabled:opacity-50 shadow-lg"
          >
            {loading ? 'جاري التحقق...' : 'دخول / تسجيل جديد'}
          </button>
        </form>
      </div>
    </div>
  );
}