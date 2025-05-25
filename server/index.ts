import 'dotenv/config'
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import cors from 'cors';
import { agent } from './agent';
import { handleStripeWebhook } from './credit';
import Stripe from 'stripe';


const app = express();

// Stripe webhook endpoint
app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req: express.Request, res: express.Response) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(500).json({ error: 'Stripe secret key not configured' });
      return;
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      res.status(500).json({ error: 'Stripe webhook secret not configured' });
      return;
    }

    console.log('Received Stripe webhook');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'] as string;
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      res.json({ received: true });
      await handleStripeWebhook(event);
      res.status(200).send();
    } catch (err) {
      console.error('Stripe webhook error:', err);
      if (err instanceof Error) {
        res.status(400).send(`Webhook Error: ${err.message}`);
      } else {
        res.status(400).send('Webhook Error: Unknown error occurred');
      }
    }
  }
);



app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies


// TODO: Configure with an LLM adapter and API key

// CopilotKit backend endpoint
app.all('/api/copilotkit', agent);

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
  })
);


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`tRPC server running on port ${port}`);
  console.log(`CopilotKit endpoint available at /api/copilotkit (requires LLM configuration)`);
  console.log(`Stripe webhook endpoint available at /api/stripe-webhook`);
});