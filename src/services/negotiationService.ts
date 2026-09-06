import { NegotiationRecord } from '../types';

export class NegotiationApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'NegotiationApiError';
    this.status = status;
  }
}

/**
 * Load the negotiation attached to a lot. A missing thread is a normal
 * empty state, while every other response is surfaced to the caller.
 */
export async function fetchNegotiation(lotId: string): Promise<NegotiationRecord | null> {
  const response = await fetch(`/api/negotiations/${encodeURIComponent(lotId)}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new NegotiationApiError('Unable to load the negotiation thread.', response.status);
  }

  return response.json() as Promise<NegotiationRecord>;
}
