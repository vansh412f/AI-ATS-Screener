import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Any route added here will require an authenticated session.
// The regex suffixes ensure nested paths are caught too —
// e.g. /vault/new, /dashboard/settings all match.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/vault(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // auth.protect() redirects unauthenticated users to Clerk's
    // sign-in page automatically — no manual redirect logic needed.
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};