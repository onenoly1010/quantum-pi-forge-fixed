import { streamText } from 'ai';
import { getXAIModel, AI_MODELS, SYSTEM_PROMPTS } from '@/lib/ai-config';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { prompt, model = AI_MODELS.GROK_2, systemPrompt } = await request.json();

    if (!prompt) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for xAI API key
    if (!process.env.XAI_API_KEY) {
      return Response.json(
        { error: 'XAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const result = await streamText({
      model: getXAIModel(model),
      system: systemPrompt || SYSTEM_PROMPTS.GENERAL,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('xAI API error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
