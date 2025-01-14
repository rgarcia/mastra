import { z } from 'zod';

import { mastra } from './mastra';

async function text() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 1: Basic pantry ingredients

  const query1 =
    'In my kitchen I have: pasta, canned tomatoes, garlic, olive oil, and some dried herbs (basil and oregano). What can I make?';
  console.log(`Query 1: ${query1}`);

  const pastaResponse = await agent.text({
    messages: [query1],
  });
  console.log('\n👨‍🍳 Chef Michel:', pastaResponse.text);
  console.log('\n-------------------\n');
}

async function generateText() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 1: Basic pantry ingredients

  const query1 =
    'In my kitchen I have: pasta, canned tomatoes, garlic, olive oil, and some dried herbs (basil and oregano). What can I make?';
  console.log(`Query 1: ${query1}`);

  const pastaResponse = await agent.generate(query1);

  console.log('\n👨‍🍳 Chef Michel:', pastaResponse.text);
  console.log('\n-------------------\n');
}

async function textStream() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 2: More ingredients
  const query2 =
    "Now I'm over at my friend's house, and they have: chicken thighs, coconut milk, sweet potatoes, and some curry powder.";
  console.log(`Query 2: ${query2}`);

  const curryResponse = await agent.stream({
    messages: [query2],
  });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of curryResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function generateStream() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 2: More ingredients
  const query2 =
    "Now I'm over at my friend's house, and they have: chicken thighs, coconut milk, sweet potatoes, and some curry powder.";
  console.log(`Query 2: ${query2}`);

  const curryResponse = await agent.generate([query2], { stream: true });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of curryResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function textObject() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 3: Generate a lasagna recipe
  const query3 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 3: ${query3}`);

  const lasagnaResponse = await agent.textObject({
    messages: [query3],
    structuredOutput: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });
  console.log('\n👨‍🍳 Chef Michel:', lasagnaResponse.object);
  console.log('\n-------------------\n');
}

async function generateObject() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 3: Generate a lasagna recipe
  const query3 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 3: ${query3}`);

  const lasagnaResponse = await agent.generate([query3], {
    schema: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });
  console.log('\n👨‍🍳 Chef Michel:', lasagnaResponse.object);
  console.log('\n-------------------\n');
}

async function streamObject() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 4: Generate a lasagna recipe
  const query4 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 4: ${query4}`);

  const lasagnaStreamResponse = await agent.streamObject({
    messages: [query4],
    structuredOutput: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of lasagnaStreamResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function generateStreamObject() {
  const agent = mastra.getAgent('Chef Agent');
  // Query 4: Generate a lasagna recipe
  const query4 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 4: ${query4}`);

  const lasagnaStreamResponse = await agent.generate([query4], {
    stream: true,
    schema: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of lasagnaStreamResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function main() {
  await text();

  await generateText();

  await textStream();

  await generateStream();

  await textObject();

  await generateObject();

  await streamObject();

  await generateStreamObject();
}

main();
