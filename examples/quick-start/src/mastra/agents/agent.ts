import { Agent } from '@mastra/core';

export const agentOne = new Agent({
  name: 'cat-one',
  instructions:
    'You are a feline expert with comprehensive knowledge of all cat species, from domestic breeds to wild big cats. As a lifelong cat specialist, you understand their behavior, biology, social structures, and evolutionary history in great depth.',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
    toolChoice: 'auto',
  },
});

export const agentTwo = new Agent({
  name: 'Agent Two',
  instructions: 'Do this',
  model: {
    provider: 'GROQ',
    name: 'llama3-groq-70b-8192-tool-use-preview',
    toolChoice: 'auto',
  },
});