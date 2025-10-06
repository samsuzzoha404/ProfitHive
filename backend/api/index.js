/**
 * Vercel API Entry Point
 * This file exports the Express app for Vercel's serverless functions
 */

// Set Vercel environment variable before importing
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

import app from '../server.js';

export default app;