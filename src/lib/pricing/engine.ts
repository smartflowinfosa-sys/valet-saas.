export async function calculatePrice(
  supabase: any, 
  serviceId: string, 
  params: { hours?: number, valets?: number, cars?: number }
) {
  // 1. جلب بيانات الخدمة (السعر الأساسي)
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('base_price, name')
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) throw new Error("لم يتم العثور على الخدمة");

  // 2. جلب قواعد التسعير المرتبطة بهذه الخدمة (بفضل RLS، ستأتي قواعد الشركة فقط)
  const { data: rules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('service_id', serviceId);

  let total = Number(service.base_price || 0);
  let breakdown = [{ desc: `السعر الأساسي (${service.name})`, amount: total }];

  const hours = params.hours || 0;
  const valets = params.valets || 0;
  const cars = params.cars || 0;

  // 3. تطبيق القواعد الديناميكية
  rules?.forEach(rule => {
    const val = Number(rule.value);
    switch (rule.rule_type) {
      case 'hourly':
        if (hours > 0) {
          total += (hours * val);
          breakdown.push({ desc: `رسوم ساعات (${hours})`, amount: hours * val });
        }
        break;
      case 'extra_valet':
        if (valets > 0) {
          total += (valets * val);
          breakdown.push({ desc: `رسوم موظفين (${valets})`, amount: valets * val });
        }
        break;
      case 'per_car':
        if (cars > 0) {
          total += (cars * val);
          breakdown.push({ desc: `رسوم سيارات (${cars})`, amount: cars * val });
        }
        break;
      case 'fixed_fee':
        total += val;
        breakdown.push({ desc: 'رسوم ثابتة إضافية', amount: val });
        break;
    }
  });

  return { total, breakdown };
}