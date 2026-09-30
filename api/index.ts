import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/app';

/**
 * Vercel Serverless Function Handler for MediPrep AI Backend
 * Routes all /api requests through the Express application safely
 */
export default function handler(req: any, res: any) {
  try {
    // If Vercel passed the matched path in headers from rewrites, preserve it
    const originalPath =
      req.headers['x-matched-path'] ||
      req.headers['x-invoke-path'] ||
      req.headers['x-forwarded-uri'] ||
      req.headers['x-original-url'];

    if (originalPath && typeof originalPath === 'string' && (originalPath.startsWith('/api') || originalPath.startsWith('/uploads'))) {
      req.url = originalPath;
    } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      req.url = `/api${req.url.startsWith('/') ? req.url : '/' + req.url}`;
    }

    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Handler Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Serverless Invocation Error',
          message: err?.message || String(err),
        })
      );
    }
  }
}

export { app };
