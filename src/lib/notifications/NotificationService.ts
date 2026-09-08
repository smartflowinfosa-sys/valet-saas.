// 1. تحديد هيكل البيانات للإشعار
export interface NotificationPayload {
  companyId: string;
  title: string;
  message: string;
  emailTo?: string;
  phoneTo?: string;
  type: 'new_request' | 'quote_accepted';
}

// 2. تجريد مزود الخدمة (Abstraction)
export interface NotificationProvider {
  name: string;
  send(payload: NotificationPayload): Promise<void>;
}

// 3. مزود الإشعارات الداخلية (Dashboard)
export class InAppProvider implements NotificationProvider {
  name = 'InApp';
  async send(payload: NotificationPayload) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);
    
    await supabase.from('notifications').insert([{
      company_id: payload.companyId,
      title: payload.title,
      message: payload.message
    }]);
  }
}

// 4. مزود الإيميل (مجهز للربط مع Resend أو SendGrid)
export class EmailProvider implements NotificationProvider {
  name = 'Email';
  async send(payload: NotificationPayload) {
    if (!payload.emailTo) return;
    // هنا نضع كود إرسال الإيميل الفعلي لاحقاً. 
    console.log(`Sending Email to ${payload.emailTo}: ${payload.title}`);
  }
}

// 5. مزود الواتساب (مهيأ للمستقبل - Dummy Provider حالياً)
export class WhatsAppProvider implements NotificationProvider {
  name = 'WhatsApp';
  async send(payload: NotificationPayload) {
    if (!payload.phoneTo) return;
    // هنا يمكن ربط Twilio أو مزود خارجي للواتساب لاحقاً
    console.log(`Sending WhatsApp to ${payload.phoneTo}: ${payload.title}`);
  }
}

// 6. المدير المركزي للإشعارات (Manager)
export class NotificationManager {
  private providers: NotificationProvider[] = [];

  register(provider: NotificationProvider) {
    this.providers.push(provider);
  }

  // هذه الدالة ترسل الإشعارات بدون أن تعرقل النظام إذا حدث خطأ (Fault Tolerance)
  async dispatch(payload: NotificationPayload) {
    // نستخدم allSettled لكي لا يوقف خطأ مزود واحد باقي المزودين
    Promise.allSettled(this.providers.map(p => p.send(payload)))
      .then(results => console.log('Notification dispatch results:', results))
      .catch(err => console.error('Notification Manager Error:', err));
  }
}

// تصدير نسخة مجهزة للاستخدام
export const notifier = new NotificationManager();
notifier.register(new InAppProvider());
notifier.register(new EmailProvider());
// notifier.register(new WhatsAppProvider()); // يمكن تفعيله لاحقاً