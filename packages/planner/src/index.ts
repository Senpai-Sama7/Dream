import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { IntentAnalyzer } from './services/intentAnalyzer';
import { CodeGenerator } from './services/codeGenerator';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8001;

const analyzer = new IntentAnalyzer();
const generator = new CodeGenerator();

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const intent = analyzer.analyze(prompt, context);
    const code = generator.generate(intent);

    res.json({
      intent: intent.type,
      components: intent.components,
      plan: intent.plan,
      code
    });
  } catch (error) {
    console.error('Error analyzing prompt:', error);
    res.status(500).json({ error: 'Failed to analyze prompt' });
  }
});

app.post('/infer', async (req: Request, res: Response) => {
  try {
    const { action, context, history } = req.body;
    
    const suggestions = analyzer.inferFromAction(action, context, history);

    res.json({
      suggestions,
      confidence: suggestions.length > 0 ? suggestions[0].confidence : 0
    });
  } catch (error) {
    console.error('Error inferring from action:', error);
    res.status(500).json({ error: 'Failed to infer from action' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Planner service running on http://localhost:${PORT}`);
  });
}

export default app;
