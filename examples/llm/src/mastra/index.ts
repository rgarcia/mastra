import { Mastra, type ModelConfig } from '@mastra/core';

async function main() {
  // Configure your model

  const mastra = new Mastra({});

  const modelConfig: ModelConfig = {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
  };

  const llm = mastra.LLM(modelConfig);

  const response = await llm.generate('What is machine learning?');

  console.log(response.text);

  const response2 = await llm.generate(['What is machine learning?', 'I love machine learning']);

  console.log(response2.text);

  // Text object

  // Streaming responses
  // const stream = await llm.stream({
  //   messages: [
  //     {
  //       role: 'system',
  //       content: 'You are a helpful assistant',
  //     },
  //     {
  //       role: 'user',
  //       content: 'Explain quantum computing',
  //     },
  //   ],
  //   model: modelConfig,
  //   onStepFinish: step => {
  //     console.log('Step completed:', step);
  //   },
  //   maxSteps: 3,
  // });
}

main();
