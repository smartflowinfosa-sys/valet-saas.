'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();
  const supabase = createClient();

  // 1. الدخول أو التسجيل عبر الإيميل وكلمة المرور
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // محاولة تسجيل الدخول أولاً
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      // إذا لم ينجح الدخول، نحاول إنشاء حساب جديد
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setMessage({ type: 'error', text: 'البريد الإلكتروني مسجل مسبقاً، كلمة المرور غير صحيحة.' });
        } else {
          setMessage({ type: 'error', text: signUpError.message });
        }
      } else {
        // ✨ نجاح التسجيل لأول مرة
        setMessage({ type: 'success', text: 'تم التسجيل بانتظار تفعيل الحساب وتصل رسالة عالايميل بذلك' });
      }
    } else if (signInError) {
      setMessage({ type: 'error', text: 'حدث خطأ غير متوقع، حاول مرة أخرى.' });
    } else {
      // ✨ نجاح تسجيل الدخول
      setMessage({ type: 'success', text: 'تم الدخول بنجاح! جاري التوجيه...' });
      
      // التوجيه الذكي للمالك أو التاجر (شملت الكلمتين لتجنب أي خطأ إملائي)
      const isAdmin = email.toLowerCase() === 'samrtflow.info.sa@gmail.com' || email.toLowerCase() === 'smartflow.info.sa@gmail.com';
      if (isAdmin) {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  // 2. الدخول بواسطة جوجل (Google OAuth)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage({ type: '', text: '' });
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بجوجل.' });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] p-4" dir="rtl">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-500 text-sm">أدخل بريدك الإلكتروني وكلمة المرور للمتابعة</p>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-xl font-bold text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#b89742] text-left" 
              dir="ltr"
              placeholder="smartflow.info.sa@gmail.com" 
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
              placeholder="••••••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || googleLoading} 
            className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg disabled:opacity-50 shadow-lg"
          >
            {loading ? 'جاري التحقق...' : 'دخول / تسجيل جديد'}
          </button>
        </form>

        <div className="mt-8 relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full absolute"></div>
          <span className="bg-white px-4 text-sm text-gray-400 relative font-bold">أو</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="mt-8 w-full bg-white text-gray-700 p-4 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg border border-gray-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'جاري التحويل...' : 'المتابعة باستخدام Google'}
        </button>

      </div>
    </div>
  );
}