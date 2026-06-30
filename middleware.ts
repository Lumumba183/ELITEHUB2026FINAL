import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/blog(.*)',
  '/login(.*)',
  '/register(.*)',
  '/api/clerk-webhook(.*)',
  '/api/pesapal-callback(.*)',
  '/api/pesapal-ipn(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Protect all non-public routes
  if (!isPublicRoute(req) && !userId) {
    return Response.redirect(new URL('/login', req.url))
  }

  // Protect admin routes
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string })?.role
    if (role !== 'admin') {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
