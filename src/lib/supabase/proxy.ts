import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient(url, publishableKey, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  }});
  const { data } = await supabase.auth.getClaims();
  if (request.nextUrl.pathname.startsWith("/dashboard") && !data?.claims) {
    const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (request.nextUrl.pathname.startsWith("/dashboard") && data?.claims?.sub) {
    const { data: profile } = await supabase.from("profiles").select("active").eq("user_id", data.claims.sub).maybeSingle<{ active: boolean }>();
    if (!profile?.active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone(); url.pathname = "/login"; url.search = ""; url.searchParams.set("status", "inactive");
      return NextResponse.redirect(url);
    }
  }
  return response;
}
