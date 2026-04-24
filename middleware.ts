import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_HOSTS = new Set(['localhost:3000', '127.0.0.1:3000']);

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host') || '';

  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (!PUBLIC_HOSTS.has(host) && host.split('.').length >= 3) {
    const response = NextResponse.next();
    response.headers.set('x-tenant-host', host);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
