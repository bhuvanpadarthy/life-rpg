import dotenv from 'dotenv';
import app from './app.js';
import { db } from './database/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

db.init().then(() => {
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
