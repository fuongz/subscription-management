import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { getAuth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = getAuth((env as { DB: D1Database }).DB)
        return auth.handler(request)
      },
      POST: async ({ request }: { request: Request }) => {
        const auth = getAuth((env as { DB: D1Database }).DB)
        return auth.handler(request)
      },
    },
  },
})
