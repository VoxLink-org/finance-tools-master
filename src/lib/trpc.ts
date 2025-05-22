import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@server/trpc';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/api/trpc',
    }),
  ],
});

export const swrTrpc = {
  greeting: (input: { name?: string }) => ({
    key: ['greeting', input],
    fetcher: () => trpc.greeting.query(input),
  }),
};