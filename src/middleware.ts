import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // If accessing via 127.0.0.1, redirect to localhost
  if (host.startsWith('127.0.0.1')) {
    const url = request.nextUrl.clone();
    const redirectUrl = request.url.replace('127.0.0.1', 'localhost');
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
