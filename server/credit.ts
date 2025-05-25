import Database from 'better-sqlite3';
import Stripe from 'stripe';
import { z } from 'zod';
import 'dotenv/config';
import { t } from './trpc-instance';
import { sendJWTToClient } from './jwt-generate';

// Initialize SQLite database
const db = new Database('credits.db');
db.pragma('journal_mode = WAL');

// Create credits table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS credits (
    email TEXT PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 0
  )
`);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil'
});

// Credit management functions
const creditService = {
  addCredits: (email: string, amount: number) => {
    const stmt = db.prepare(`
      INSERT INTO credits (email, balance) 
      VALUES (?, ?)
      ON CONFLICT(email) DO UPDATE SET balance = balance + excluded.balance
    `);
    stmt.run(email, amount);
    console.log(`Added ${amount} credits to ${email}`);
  },

  getBalance: (email: string): number => {
    const stmt = db.prepare('SELECT balance FROM credits WHERE email = ?');
    const result = stmt.get(email) as { balance: number } | undefined;
    return result?.balance || 0;
  }
};

export const creditRouter = t.router({
  getBalance: t.procedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }: { input: { email: string } }) => {
      return creditService.getBalance(input.email);
    }),

  createCheckoutSession: t.procedure
    .input(z.object({ 
      email: z.string().email(),
      priceId: z.string() 
    }))
    .mutation(async ({ input }: { input: { email: string; priceId: string } }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: input.priceId,
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: {
          email: input.email
        }
      });

      return { url: session.url };
    })
});

// Webhook handler for Stripe events
export const handleStripeWebhook = async (event: Stripe.Event) => {
  if (event.type === 'checkout.session.completed') {
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id,
      {
        expand: ['line_items', 'line_items.data.price.product'],
      }
    );
    const email = sessionWithLineItems.customer_details?.email;
    const lineItems = sessionWithLineItems.line_items;

    console.log('Email:', email);
    console.log('Line Items:', lineItems);

    if (email) {
      creditService.addCredits(email, 100);
      await sendJWTToClient(email, `You have been granted 100 credits for session ${(event.data.object as Stripe.Checkout.Session).id}`);
    } else {
      console.log(`Email or line items missing for session ${(event.data.object as Stripe.Checkout.Session).id}. No credits added.`);
      throw new Error('Email or line items missing for session');
    }
  }
};

export default creditService;