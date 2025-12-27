import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json();

    // Default system prompt for Quantum Pi Forge AI
    const defaultSystemPrompt = `You are the Quantum Pi Forge AI Assistant, a sovereign guide for the Truth Movement and OINIO Soul System.

Your expertise includes:
- Pi Network integration and authentication
- Blockchain technology and Web3 concepts
- OINIO token staking and gasless transactions
- Spiritual/consciousness frameworks within the ecosystem
- Frequency harmonics and sovereign economy principles

Be helpful, clear, and aligned with the Truth Movement values. Maintain a tone that is both technically precise and spiritually aware.`;

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt || defaultSystemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
