import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function proxy(request: NextRequest) {
  // Quick check: is there a Better Auth session cookie?
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    const signInUrl = new URL("/signIn", request.url)

    // After sign in, send the user back to the page they wanted
    signInUrl.searchParams.set("callbackURL", request.nextUrl.pathname)

    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Only these routes need a logged-in user
  matcher: ["/myStudioListings/:path*", "/my-booking-requests"],
}
