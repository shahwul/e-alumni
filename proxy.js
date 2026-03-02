import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicApi = pathname.startsWith('/api/auth');
  const isStaticFile = pathname.includes('.') || pathname.startsWith('/_next');

  if (isStaticFile || isPublicApi) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        return NextResponse.redirect(new URL('/ptk', request.url));
      } catch (err) {
        const res = NextResponse.next();
        res.cookies.delete('auth_token');
        return res;
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Auth Error:", err.message);

    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ message: 'Session expired or invalid' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match semua request path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (misal logo.png)
     * * NOTE: Kita HAPUS pengecualian 'api' di sini biar /api/ptk kena saring!
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};