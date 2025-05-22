import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
  })
);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`tRPC server running on port ${port}`);
});