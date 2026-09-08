'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // دالة جلب الإشعارات من قاعدة البيانات
  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();
    if (!userData) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })
      .limit(10); // عرض آخر 10 إشعارات فقط

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    fetchNotifications();

    // إغلاق القائمة عند النقر خارجها
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تحديد إشعار واحد كمقروء
  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetchNotifications();
  };

  // تحديد الكل كمقروء
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase.from('company_users').select('company_id').eq('id', user.id).single();

    await supabase.from('notifications').update({ is_read: true }).eq('company_id', userData?.company_id);
    fetchNotifications();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* أيقونة الجرس */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
        className="relative p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-gray-100 flex items-center justify-center"
      >
        <span className="text-xl">🔔</span>
        {/* شارة العدد غير المقروء (Red Dot) */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة للإشعارات */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden" dir="rtl">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">الإشعارات</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-[#b89742] hover:text-black font-bold">
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">لا توجد إشعارات حالياً.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50/50' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(notif.created_at).toLocaleDateString('ar-SA')} - {new Date(notif.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}