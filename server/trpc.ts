import { z } from 'zod';
import { creditRouter } from './credit';
import { t } from './trpc-instance';

export const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        text: `Hello ${input.name ?? 'world'}`,
      };
    }),
  credit: creditRouter
});

export type AppRouter = typeof appRouter;