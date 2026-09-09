import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // حماية المسارات (إذا لم يكن مسجلاً وحاول دخول لوحة التحكم، يوجه لصفحة الدخول)
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // التوجيه الذكي للمستخدمين المسجلين
  if (user) {
    const isSuperAdmin = user.email === 'samrtflow.info.sa@gmail.com';

    // 1. إذا كان المالك وحاول دخول لوحة التاجر العادية -> يوجه لصفحة الإدارة
    if (isSuperAdmin && request.nextUrl.pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/admin'
      return NextResponse.redirect(url)
    }

    // 2. إذا كان تاجراً وحاول دخول صفحة المالك -> يمنع ويوجه للوحة التاجر
    if (!isSuperAdmin && request.nextUrl.pathname.startsWith('/dashboard/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // 3. إذا كان مسجلاً وحاول العودة لصفحة تسجيل الدخول، نوجهه لمكانه الصحيح
    if (request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = isSuperAdmin ? '/dashboard/admin' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}