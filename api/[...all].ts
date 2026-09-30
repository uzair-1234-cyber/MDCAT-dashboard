import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/app';

/**
 * Vercel Serverless Function Catch-All Handler
 * Handles any dynamic /api/[...all] routes seamlessly
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}

export { app };
