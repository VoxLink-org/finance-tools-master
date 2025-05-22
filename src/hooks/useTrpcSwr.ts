import useSWR from 'swr';
import { swrTrpc } from '../lib/trpc';

export function useGreeting(input: { name?: string }) {
  return useSWR(swrTrpc.greeting(input).key, swrTrpc.greeting(input).fetcher);
}