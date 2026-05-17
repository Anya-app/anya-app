import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["th", "en"];
const defaultLocale = "th";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path already has a locale prefix
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!hasLocale) {
    // Detect browser locale preference
    const acceptLang = request.headers.get("accept-language") ?? "";
    const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
    const locale = locales.includes(preferred) ? preferred : defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|icons|.*\\..*).*)"],
};
