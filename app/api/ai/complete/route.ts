import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { trace } from "@opentelemetry/api";

export async function POST(req: Request) {
  const tracer = trace.getTracer("quantum-pi-forge-ai");

  return tracer.startActiveSpan("ai-completion", async (span) => {
    try {
      const { prompt, context } = await req.json();

      span.setAttributes({
        "ai.operation": "text-generation",
        "ai.model": "gpt-4o",
        "ai.prompt_length": prompt?.length || 0,
        "ai.has_context": !!context,
        "quantum.operation": "ai-complete",
      });

      if (!prompt) {
        span.setStatus({ code: 1, message: "Missing prompt" });
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const systemPrompt = `You are the Quantum Pi Forge AI, specialized in:
- Analyzing blockchain transactions and token economics
- Providing guidance on the OINIO Soul System
- Explaining staking mechanics and gasless transactions
- Supporting the Truth Movement community

${context ? `Context: ${context}` : ""}

Provide clear, accurate, and helpful responses.`;

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt,
      });

      span.setAttributes({
        "ai.response_length": text?.length || 0,
        "ai.tokens_used": "estimated", // Could be enhanced with actual token counting
      });
      span.setStatus({ code: 0 }); // OK

      return new Response(JSON.stringify({ success: true, response: text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 1, message: "AI completion failed" });
      console.error("AI Completion Error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate AI response" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    } finally {
      span.end();
    }
  });
}
