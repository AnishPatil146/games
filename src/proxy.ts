import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AUTHORIZED_ADMIN_EMAIL, getEnvConfig } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy /curator paths cleanly to /admin
  if (pathname === "/curator") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (pathname.startsWith("/curator/")) {
    const subPath = pathname.replace(/^\/curator/, "/admin");
    return NextResponse.redirect(new URL(subPath, request.url));
  }

  // Redirect /admin root to /admin/dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Enforce server-side Supabase Auth + allowlist on /admin/* routes
  if (pathname.startsWith("/admin/")) {
    let supabaseResponse = NextResponse.next({ request });
    const { supabaseUrl, supabasePublicKey, isSupabaseConfigured, allowedAdminEmails } =
      getEnvConfig();

    const isLoginRoute = pathname === "/admin/login";

    if (!isSupabaseConfigured) {
      if (!isLoginRoute) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabasePublicKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const normalizedEmail = user?.email?.trim().toLowerCase() || "";
    const isAuthorized =
      Boolean(user) &&
      normalizedEmail === AUTHORIZED_ADMIN_EMAIL &&
      allowedAdminEmails.includes(normalizedEmail);

    if (!isAuthorized && !isLoginRoute) {
      const loginUrl = new URL("/admin/login", request.url);
      if (user && !isAuthorized) {
        loginUrl.searchParams.set("reason", "forbidden");
      }
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthorized && isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/curator", "/curator/:path*"],
};

