import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/app';

/**
 * Vercel Serverless Function Handler for MediPrep AI Backend
 * Routes all /api requests through the Express application
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}

export { app };
