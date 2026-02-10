import { streamText } from "ai";
import { getXAIModel, AI_MODELS, SYSTEM_PROMPTS } from "@/lib/ai-config";
import { trace } from "@opentelemetry/api";

export const runtime = "edge";

export async function POST(request: Request) {
  const tracer = trace.getTracer("quantum-pi-forge-ai");

  return tracer.startActiveSpan("ai-grok-stream", async (span) => {
    try {
      const {
        prompt,
        model = AI_MODELS.GROK_2,
        systemPrompt,
      } = await request.json();

      span.setAttributes({
        "ai.operation": "text-streaming",
        "ai.model": model,
        "ai.provider": "xai",
        "ai.prompt_length": prompt?.length || 0,
        "ai.has_custom_prompt": !!systemPrompt,
        "quantum.operation": "ai-grok",
      });

      if (!prompt) {
        span.setStatus({ code: 1, message: "Missing prompt" });
        return Response.json({ error: "Prompt is required" }, { status: 400 });
      }

      // Check for xAI API key
      if (!process.env.XAI_API_KEY) {
        span.setStatus({ code: 1, message: "XAI API key not configured" });
        return Response.json(
          { error: "XAI_API_KEY not configured" },
          { status: 500 },
        );
      }

      const result = await streamText({
        model: getXAIModel(model),
        system: systemPrompt || SYSTEM_PROMPTS.GENERAL,
        prompt,
      });

      span.setStatus({ code: 0 }); // OK
      return result.toTextStreamResponse();
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 1, message: "Grok streaming failed" });
      console.error("xAI API error:", error);
      return Response.json(
        { error: "Failed to generate response" },
        { status: 500 },
      );
    } finally {
      span.end();
    }
  });
}
