import { Router, Request, Response } from 'express';
import axios from 'axios';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  const services: any = {
    backend: 'ok',
    planner: 'unknown',
    sandbox: 'unknown'
  };

  try {
    await axios.get('http://localhost:8001/health', { timeout: 2000 });
    services.planner = 'ok';
  } catch (error) {
    services.planner = 'error';
  }

  try {
    await axios.get('http://localhost:8002/health', { timeout: 2000 });
    services.sandbox = 'ok';
  } catch (error) {
    services.sandbox = 'error';
  }

  res.json({ status: 'ok', services });
});
