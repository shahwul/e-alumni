import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicApi = pathname.startsWith('/api/auth');

  if (!token && !isAuthPage && !isPublicApi) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      await jwtVerify(
        token, 
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      if (isAuthPage) {
        return NextResponse.redirect(new URL('/ptk', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Pantau semua halaman kecuali:
     * - api (kecuali api auth yang sudah dihandle di atas)
     * - _next/static (file CSS/JS)
     * - _next/image (optimasi gambar)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};