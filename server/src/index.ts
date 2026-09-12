import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database/db.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB then start server
db.init().then(() => {
  // API Routes
  app.use('/api', apiRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      system: 'LIFE RPG API SERVER',
      timestamp: new Date().toISOString(),
      databaseMode: db.isPg ? 'POSTGRESQL' : 'SQLITE_EMBEDDED'
    });
  });

  // Production static file serving
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  });

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`⚔️ LIFE RPG API SERVER ONLINE ON PORT ${PORT} ⚔️`);
    console.log(`DATABASE ENGINE: ${db.isPg ? 'POSTGRESQL' : 'SQLITE LOCAL'}`);
    console.log(`==================================================`);
  });
}).catch(err => {
  console.error('Fatal Database Initialization Error:', err);
});

export default app;
