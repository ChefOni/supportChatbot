import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/embed(.*)', // Embeddable widget endpoint
  '/widget(.*)', // Widget static files
  '/api/webhooks/clerk', // Clerk webhooks
  '/',
]);

export default clerkMiddleware((auth, req) => {
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next|favicon.ico).*)', '/', '/(api|trpc)(.*)'],
};
