import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are the Quantum Pi Forge AI, specialized in:
- Analyzing blockchain transactions and token economics
- Providing guidance on the OINIO Soul System
- Explaining staking mechanics and gasless transactions
- Supporting the Truth Movement community

${context ? `Context: ${context}` : ''}

Provide clear, accurate, and helpful responses.`;

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt,
    });

    return new Response(
      JSON.stringify({ success: true, response: text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Completion Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
