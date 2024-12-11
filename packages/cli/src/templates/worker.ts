import { AutoRouter } from 'itty-router';
import { join } from 'path';

const { mastra } = await import(join(process.cwd(), 'mastra.mjs'));

interface IRequest extends Request {
  params: Record<string, string>;
  query: Record<string, string>;
  json: () => Promise<any>;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

const router = AutoRouter();

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

router.get('/', () => {
  return new Response('Hello to the Mastra API!', {
    headers: { 'Content-Type': 'text/plain' },
  });
});

router.get('/agent/:agentId', ({ params }: IRequest) => {
  const agentId = decodeURIComponent(params.agentId || '');
  const agent = mastra.getAgent(agentId);

  return new Response(
    JSON.stringify({
      agentId: agent.name,
      enabledTools: agent.enabledTools,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
});

router.post('/agent/:agentId/text', async ({ params, json }: IRequest) => {
  const agentId = decodeURIComponent(params.agentId || '');
  const agent = mastra.getAgent(agentId);
  const body = await json();
  const messages = body.messages;

  const result = await agent.text({ messages });

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
});

router.post('/agent/:agentId/stream', async ({ params, json }: IRequest) => {
  const agentId = decodeURIComponent(params.agentId || '');
  const agent = mastra.getAgent(agentId);
  const body = await json();
  const messages = body.messages;

  const streamResult = await agent.stream({
    messages,
  });

  return streamResult.toDataStreamResponse({
    headers: {
      'Content-Type': 'text/x-unknown',
      'content-encoding': 'identity',
      'transfer-encoding': 'chunked',
    },
  });
});

router.post('/agent/:agentId/text-object', async ({ params, json }: IRequest) => {
  const agentId = decodeURIComponent(params.agentId || '');
  const agent = mastra.getAgent(agentId);
  const body = await json();
  const messages = body.messages;
  const structuredOutput = body.structuredOutput;

  const { ok, errorResponse } = await validateBody({
    messages,
    structuredOutput,
  });

  if (!ok) {
    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await agent.textObject({ messages, structuredOutput });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting structured output from agent', error);
    return new Response(JSON.stringify({ error: 'Error getting structured output from agent' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.post('/agent/:agentId/stream-object', async ({ params, json }: IRequest) => {
  const agentId = decodeURIComponent(params.agentId || '');
  const agent = mastra.getAgent(agentId);
  const body = await json();
  const messages = body.messages;
  const structuredOutput = body.structuredOutput;

  const { ok, errorResponse } = await validateBody({
    messages,
    structuredOutput,
  });

  if (!ok) {
    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const streamResult = await agent.streamObject({
      messages,
      structuredOutput,
    });

    return streamResult.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/x-unknown',
        'content-encoding': 'identity',
        'transfer-encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error streaming structured output from agent', error);
    return new Response(JSON.stringify({ error: 'Error streaming structured output from agent' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.post('/workflows/:workflowId/execute', async ({ params, json }: IRequest) => {
  const workflowId = decodeURIComponent(params.workflowId || '');
  const workflow = mastra.workflows.get(workflowId);

  try {
    const body = await json();
    console.log('body', body);
    const result = await workflow.execute(body);

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error executing workflow', error);
    return new Response(JSON.stringify({ error: 'Error executing workflow' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.get('/memory/threads/get-by-resourceid/:resourceid', async ({ params }: IRequest) => {
  const resourceid = decodeURIComponent(params.resourceid || '');
  const memory = mastra.memory;

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const threads = await memory.getThreadsByResourceId({ resourceid });
    return new Response(JSON.stringify(threads), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting threads from memory', error);
    return new Response(JSON.stringify({ error: 'Error getting threads from memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.get('/memory/threads/:threadId', async ({ params }: IRequest) => {
  const threadId = decodeURIComponent(params.threadId || '');
  const memory = mastra.memory;

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    return new Response(JSON.stringify(thread), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting thread from memory', error);
    return new Response(JSON.stringify({ error: 'Error getting thread from memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.post('/memory/threads', async ({ json }: IRequest) => {
  const memory = mastra.memory;
  const { title, metadata, resourceid, threadId } = await json();

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const { ok, errorResponse } = await validateBody({ resourceid });

  if (!ok) {
    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await memory.createThread({ resourceid, title, metadata, threadId });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error saving thread to memory', error);
    return new Response(JSON.stringify({ error: 'Error saving thread to memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.patch('/memory/threads/:threadId', async ({ params, json }: IRequest) => {
  const threadId = decodeURIComponent(params.threadId || '');
  const memory = mastra.memory;
  const { title, metadata, resourceid } = await json();
  const updatedAt = new Date();

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const updatedThread = {
      ...thread,
      title: title || thread.title,
      metadata: metadata || thread.metadata,
      resourceid: resourceid || thread.resourceid,
      createdAt: thread.createdat,
      updatedAt,
    };
    const result = await memory.saveThread({ thread: updatedThread });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error saving thread to memory', error);
    return new Response(JSON.stringify({ error: 'Error saving thread to memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.delete('/memory/threads/:threadId', async ({ params }: IRequest) => {
  const threadId = decodeURIComponent(params.threadId || '');
  const memory = mastra.memory;

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    await memory.deleteThread(threadId);
    return new Response(JSON.stringify({ result: 'Thread deleted' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting thread from memory', error);
    return new Response(JSON.stringify({ error: 'Error deleting thread from memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.get('/memory/threads/:threadId/messages', async ({ params }: IRequest) => {
  const threadId = decodeURIComponent(params.threadId || '');
  const memory = mastra.memory;

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await memory.getMessages({ threadId });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting messages from memory', error);
    return new Response(JSON.stringify({ error: 'Error getting messages from memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.get('/memory/threads/:threadId/context-window', async ({ params, query }: IRequest) => {
  const threadId = decodeURIComponent(params.threadId || '');
  const { startDate, endDate, format } = query;
  const memory = mastra.memory;

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await memory.getContextWindow({ threadId, startDate, endDate, format });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting context window from memory', error);
    return new Response(JSON.stringify({ error: 'Error getting context window from memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.post('/memory/save-messages', async ({ json }: IRequest) => {
  const memory = mastra.memory;
  const messages = await json();

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const { ok, errorResponse } = await validateBody({ messages });

  if (!ok) {
    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const processMessages = messages.map((message: any) => {
      return {
        ...message,
        id: memory.generateId(),
        createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
      };
    });
    const result = await memory.saveMessages({ messages: processMessages });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error saving messages to memory', error);
    return new Response(JSON.stringify({ error: 'Error saving messages to memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.post('/memory/threads/:threadId/tool-result', async ({ params, json }: IRequest) => {
  const threadId = decodeURIComponent(params.threadId || '');
  const memory = mastra.memory;
  const { toolName, toolArgs } = await json();

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const { ok, errorResponse } = await validateBody({ toolName, toolArgs });

  if (!ok) {
    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await memory.getToolResult({ threadId, toolName, toolArgs });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting tool result from memory', error);
    return new Response(JSON.stringify({ error: 'Error getting tool result from memory' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

router.post('/memory/validate-tool-call-args', async ({ json }: IRequest) => {
  const memory = mastra.memory;
  const { hashedArgs } = await json();

  if (!memory) {
    return new Response(JSON.stringify({ error: 'Memory is not initialized' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const { ok, errorResponse } = await validateBody({ hashedArgs });

  if (!ok) {
    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await memory.validateToolCallArgs({ hashedArgs });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error validating tool call args', error);
    return new Response(JSON.stringify({ error: 'Error validating tool call args' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request: Request, env: Record<string, string>, ctx: ExecutionContext) {
    Object.entries(env || {}).forEach(([key, value]) => {
      process.env[key] = value;
    });

    return router.fetch(request, env, ctx);
  },
};
