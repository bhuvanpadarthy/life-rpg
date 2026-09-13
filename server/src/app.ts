import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database/db.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();

// Configure CORS for single Vercel domain and local development
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173']
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep health checks independent from request-time database initialization so
// deployment diagnostics can distinguish a live API from a ready API.
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    await db.init();
    res.json({
      status: 'ONLINE',
      ready: true,
      system: 'LIFE RPG API SERVER',
      timestamp: new Date().toISOString(),
      databaseMode: db.isPg ? 'POSTGRESQL' : 'SQLITE_DEVELOPMENT_ONLY'
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'ONLINE',
      ready: false,
      system: 'LIFE RPG API SERVER',
      error: err?.message || 'Database connection failed'
    });
  }
});

// Database connection middleware for Vercel serverless functions
app.use(async (req, res, next) => {
  try {
    await db.init();
    next();
  } catch (err: any) {
    console.error('[DB INIT ERROR]', err);
    res.status(500).json({ error: (err && err.message) || 'Database connection failed' });
  }
});

// Mount API Routes under both /api and root level
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  const errorMessage = typeof err === 'string' ? err : (err.message || 'Internal Server Error');
  res.status(err.status || 500).json({
    error: errorMessage
  });
});

export default app;
