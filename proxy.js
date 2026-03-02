import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ALLOWED_FRONTEND_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:80'
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin") ?? '';

  if (request.method === "OPTIONS") {
    const isFrontendAllowed = ALLOWED_FRONTEND_ORIGINS.includes(origin);
    const originToAllow = isFrontendAllowed ? origin : "*";

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": originToAllow,
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": "x-api-key, Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version",
        "Access-Control-Allow-Credentials": "true"
      },
    });
  }

  const addCorsToResponse = (response, allowOrigin = "*") => {
    response.headers.set("Access-Control-Allow-Origin", allowOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicApi = pathname.startsWith('/api/auth');
  const isStaticFile = pathname.includes('.') || pathname.startsWith('/_next');
  const isApiRoute = pathname.startsWith('/api/');

  if (isStaticFile) {
    return NextResponse.next();
  }

  if (isApiRoute) {
    const apiKey = request.headers.get('x-api-key');
    const validFrontendKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY;
    const validBackendKey = process.env.BACKEND_API_KEY;

    if (apiKey === validBackendKey) {
      return addCorsToResponse(NextResponse.next(), "*");
    }

    if (apiKey === validFrontendKey) {
      if (origin && !ALLOWED_FRONTEND_ORIGINS.includes(origin)) {
        return addCorsToResponse(
          NextResponse.json({ message: 'Akses Ditolak: Origin tidak terdaftar (CORS Blocked)' }, { status: 403 })
        );
      }

      const frontendCorsOrigin = origin || "*";

      if (isPublicApi) {
        return addCorsToResponse(NextResponse.next(), frontendCorsOrigin);
      }
      const token = request.cookies.get('auth_token')?.value;
      if (!token) {
        return addCorsToResponse(
          NextResponse.json({ message: 'Authentication required' }, { status: 401 }),
          frontendCorsOrigin
        );
      }

      try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        return addCorsToResponse(NextResponse.next(), frontendCorsOrigin);
      } catch (err) {
        console.error("Middleware Frontend Auth Error:", err.message);
        const res = addCorsToResponse(NextResponse.json({ message: 'Session expired or invalid' }, { status: 401 }), frontendCorsOrigin);
        res.cookies.delete('auth_token');
        return res;
      }
    }

    return addCorsToResponse(
      NextResponse.json({ message: 'Akses Ditolak: Invalid or missing x-api-key header' }, { status: 401 })
    );
  }

  const token = request.cookies.get('auth_token')?.value;

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
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Page Auth Error:", err.message);
    const response = NextResponse.redirect(new URL('/login', request.url));
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