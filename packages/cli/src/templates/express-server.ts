import express, { Request, Response } from 'express';
import { join } from 'path';

const { mastra } = await import(join(process.cwd(), 'mastra.mjs'));

const app = express();

app.use(express.json());

interface ValidationResult {
  ok: boolean;
  errorResponse?: Record<string, string>;
}

const validateBody = async (body: Record<string, unknown>): Promise<ValidationResult> => {
  const errorResponse = Object.entries(body).reduce<Record<string, string>>((acc, [key, value]) => {
    if (!value) {
      acc[key] = `${key} is required`;
    }
    return acc;
  }, {});

  if (Object.keys(errorResponse).length > 0) {
    return { ok: false, errorResponse };
  }

  return { ok: true };
};

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/agent/:agentId', (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const agent = mastra.getAgent(agentId);

  res.json({
    agentId: agent.name,
    enabledTools: agent.enabledTools,
  });
});

app.post('/agent/:agentId/text', async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const agent = mastra.getAgent(agentId);
  const messages = req.body.messages;
  const result = await agent.text({ messages });
  res.json(result);
});

app.post('/agent/:agentId/stream', async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const agent = mastra.getAgent(agentId);
  const messages = req.body.messages;

  const streamResult = await agent.stream({
    messages,
  });

  streamResult.pipeDataStreamToResponse(res);
});

app.post('/agent/:agentId/text-object', async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const agent = mastra.getAgent(agentId);
  const messages = req.body.messages;
  const structuredOutput = req.body.structuredOutput;

  const { ok, errorResponse } = await validateBody({
    messages,
    structuredOutput,
  });

  if (!ok) {
    res.status(400).json({ error: errorResponse });
    return;
  }

  try {
    const result = await agent.textObject({ messages, structuredOutput });
    res.json(result);
  } catch (error) {
    console.error('Error getting structured output from agent', error);
    res.status(500).json({ error: 'Error getting structured output from agent' });
    return;
  }
});

app.post('/agent/:agentId/stream-object', async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const agent = mastra.getAgent(agentId);
  const messages = req.body.messages;
  const structuredOutput = req.body.structuredOutput;

  const { ok, errorResponse } = await validateBody({
    messages,
    structuredOutput,
  });

  if (!ok) {
    res.status(400).json({ error: errorResponse });
    return;
  }

  try {
    const streamResult = await agent.streamObject({
      messages,
      structuredOutput,
    });

    streamResult.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error('Error streaming structured output from agent', error);
    res.status(500).json({ error: 'Error streaming structured output from agent' });
    return;
  }
});

app.post('/workflows/:workflowId/execute', async (req: Request, res: Response) => {
  const workflowId = req.params.workflowId;
  const workflow = mastra.workflows.get(workflowId);

  try {
    console.log('req.body', req.body);
    const result = await workflow.execute(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error executing workflow', error);
    res.status(500).json({ error: 'Error executing workflow' });
    return;
  }
});

// Memory endpoints
app.get('/memory/threads/get-by-resourceid/:resourceid', async (req: Request, res: Response) => {
  const resourceid = req.params.resourceid;
  const memory = mastra.memory;

  if (!memory) {
    res.status(400).json({ error: 'Memory is not initialized' });
    return;
  }

  try {
    const threads = await memory.getThreadsByResourceId({ resourceid });
    res.json(threads);
  } catch (error) {
    console.error('Error getting threads from memory', error);
    res.status(500).json({ error: 'Error getting threads from memory' });
    return;
  }
});

app.get('/memory/threads/:threadId', async (req: Request, res: Response) => {
  const threadId = req.params.threadId;
  const memory = mastra.memory;

  if (!memory) {
    res.status(400).json({ error: 'Memory is not initialized' });
    return;
  }

  try {
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }
    res.json(thread);
  } catch (error) {
    console.error('Error getting thread from memory', error);
    res.status(500).json({ error: 'Error getting thread from memory' });
    return;
  }
});

app.post('/memory/threads', async (req: Request, res: Response) => {
  const memory = mastra.memory;
  const { title, metadata, resourceid, threadId } = req.body;

  if (!memory) {
    res.status(400).json({ error: 'Memory is not initialized' });
    return;
  }

  const { ok, errorResponse } = await validateBody({ resourceid });

  if (!ok) {
    res.status(400).json({ error: errorResponse });
    return;
  }

  try {
    const result = await memory.createThread({ resourceid, title, metadata, threadId });
    res.json(result);
  } catch (error) {
    console.error('Error saving thread to memory', error);
    res.status(500).json({ error: 'Error saving thread to memory' });
    return;
  }
});

app.listen(process.env.PORT || 4111, () => {
  console.log(`🦄Server running on port ${process.env.PORT || 4111}`);
});
