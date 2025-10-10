import express, { Application } from 'express';
import cors from 'cors';
import { appRouter } from './routes/apps';
import { healthRouter } from './routes/health';
import { Database } from './db/database';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Initialize database
Database.getInstance();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/apps', appRouter);
app.use('/api/health', healthRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
