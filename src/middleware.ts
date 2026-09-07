import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isLogin = request.nextUrl.pathname.startsWith('/login')

  // حماية لوحة التحكم: إذا لم يكن مسجلاً، اطرده إلى صفحة الدخول
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // التوجيه الذكي: إذا كان مسجلاً وحاول فتح صفحة الدخول، وجهه للوحة التحكم
  if (isLogin && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

// تطبيق الحارس على مسارات لوحة التحكم والدخول فقط
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}