import { NextResponse, type NextRequest } from "next/server";

// Keep public requests independent from Supabase network calls.
// The admin page performs its own authentication and role checks.
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
