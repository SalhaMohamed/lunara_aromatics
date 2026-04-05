import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Pata data za user
  const { data: { user } } = await supabase.auth.getUser()

  // --- 1. ULINZI WA ADMIN (/admin) ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Angalia role kwenye metadata (inaweza kuwa kwenye app_metadata au user_metadata)
    const role = user?.app_metadata?.role || user?.user_metadata?.role;

    if (!user || role !== 'admin') {
      // Kama amesha-login lakini siyo admin, mpeleke home (/). 
      // Kama haja-login kabisa, mpeleke login.
      const redirectPath = user ? '/' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // --- 2. ULINZI WA LOGIN/REGISTER ---
  // Kama tayari amesha-login, asiruhusiwe kuona page za login/register
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // --- 3. LANGUAGE LOGIC (Optimized) ---
  // Badala ya kupiga DB kila wakati, tunasoma cookie kwanza.
  // Tunapiga DB mara moja tu kama user amelogin na cookie haipo.
  const langCookie = request.cookies.get('Bahmad_lang_ssr')?.value;

  if (user && !langCookie) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_lang')
        .eq('id', user.id)
        .single();

      if (profile?.preferred_lang) {
        response.cookies.set('Bahmad_lang_ssr', profile.preferred_lang, { 
          maxAge: 60 * 60 * 24 * 365,
          path: '/' 
        });
      }
    } catch (e) {
      // Shughulikia error kimya kimya
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (supabase auth internal routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}