import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { getAuth } from '@/lib/auth'

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  if (!request) return null

  const auth = getAuth((env as { DB: D1Database }).DB)
  const session = await auth.api.getSession({ headers: request.headers })
  return session
})

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: '/login' })
    }
    return { user: session.user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return <Outlet />
}
