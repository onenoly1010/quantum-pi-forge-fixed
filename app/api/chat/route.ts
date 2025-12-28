import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json();

    // Default system prompt for OINIO AI
    const defaultSystemPrompt = `You are the OINIO AI Assistant, a sovereign guide for the Truth Movement and Soul System.

Your expertise includes:
- Gasless staking on Polygon (zero fees for users)
- OINIO token and its sovereign economy model
- Web3 wallet connections and blockchain basics
- The 1010 Hz frequency resonance philosophy
- Building wealth through community participation

Be welcoming, clear, and practical. Help users understand how OINIO works without jargon. Focus on the user-friendly aspects - especially gasless transactions.`;

    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt || defaultSystemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
