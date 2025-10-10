import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { SandboxManager } from './services/sandboxManager';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8002;

const sandboxManager = new SandboxManager();

app.use(cors());
app.use(express.json());

app.post('/execute', async (req: Request, res: Response) => {
  try {
    const { appId, files, dependencies, config } = req.body;
    
    if (!appId || !files) {
      return res.status(400).json({ error: 'appId and files are required' });
    }

    const result = await sandboxManager.execute(appId, files, dependencies, config);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error executing in sandbox:', error);
    res.status(500).json({ error: 'Failed to execute in sandbox' });
  }
});

app.get('/apps/:appId', async (req: Request, res: Response) => {
  try {
    const status = await sandboxManager.getStatus(req.params.appId);
    
    if (!status) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error getting app status:', error);
    res.status(500).json({ error: 'Failed to get app status' });
  }
});

app.patch('/apps/:appId', async (req: Request, res: Response) => {
  try {
    const { files } = req.body;
    
    const result = await sandboxManager.update(req.params.appId, files);
    
    if (!result) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating app:', error);
    res.status(500).json({ error: 'Failed to update app' });
  }
});

app.delete('/apps/:appId', async (req: Request, res: Response) => {
  try {
    await sandboxManager.stop(req.params.appId);
    res.status(204).send();
  } catch (error) {
    console.error('Error stopping app:', error);
    res.status(500).json({ error: 'Failed to stop app' });
  }
});

app.get('/apps/:appId/logs', async (req: Request, res: Response) => {
  try {
    const tail = parseInt(req.query.tail as string) || 100;
    const logs = await sandboxManager.getLogs(req.params.appId, tail);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sandbox service running on http://localhost:${PORT}`);
  });
}

export default app;
