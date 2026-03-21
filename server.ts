import { checkRenewals } from './src/cron/check-renewals';
import { addSecurityHeaders } from './src/lib/security-headers';
import tanstackHandler from '@tanstack/react-start/server-entry';

// Wrap the TanStack Start handler with security headers
const wrappedFetch = async (request: Request, env: any) => {
  const response = await tanstackHandler.fetch(request, env);
  return addSecurityHeaders(response);
};

export default {
  fetch: wrappedFetch,

  // Cron job handler
  async scheduled(
    _event: ScheduledEvent,
    env: CloudflareEnv,
    ctx: ExecutionContext
  ) {
    ctx.waitUntil(checkRenewals(env));
  },
};
