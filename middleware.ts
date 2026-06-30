import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

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

// Simple in-memory rate limiting for API routes
// For production, use Redis (Upstash) or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, limit: maxRequests, remaining: maxRequests - 1 }
  }
  
  if (record.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0 }
  }
  
  record.count++
  return { success: true, limit: maxRequests, remaining: maxRequests - record.count }
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Rate limit API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimit = checkRateLimit(ip, 30, 60000) // 30 requests per minute
    
    if (!rateLimit.success) {
      return new Response('Too many requests', { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      })
    }
  }

  // Protect all non-public routes
  if (!isPublicRoute(req) && !userId) {
    return Response.redirect(new URL('/login', req.url))
  }

  // Protect admin routes
  // NOTE: This checks the session claim which is set at login.
  // For dynamic role changes, the admin page also checks the database.
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
