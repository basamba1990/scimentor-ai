// supabase/functions/analyze-notebook/index.ts
// CORS inline to avoid missing shared file during bundling
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

interface NotebookCell {
  cell_type: "code" | "markdown";
  source: string[];
  metadata?: Record<string, unknown>;
}

interface AnalysisRequest {
  notebook_content: string;
  user_id: string;
}

interface FeedbackPoint {
  criterion: string;
  cell_index: number;
  severity: "low" | "medium" | "high";
  comment: string;
  suggestion: string;
}

interface AnalysisFeedback {
  global_evaluation: string;
  feedback_points: FeedbackPoint[];
  final_score: string;
}

function generateLLMPrompt(notebookContent: string): string {
  return `You are a scientific mentor AI specialized in analyzing Jupyter notebooks. Your task is to evaluate the scientific validity, physical coherence, and conceptual accuracy of the notebook content.

Analyze the following notebook and provide structured feedback:

${notebookContent}

Evaluate based on these criteria:
1. **Physical Coherence**: Are the physical laws and formulas correctly applied?
2. **Scientific Reasoning**: Is the scientific logic sound and well-explained?
3. **Conceptual Errors**: Are there any conceptual mistakes or misconceptions?

Respond with a JSON object containing:
{
  "global_evaluation": "Overall assessment of the notebook",
  "feedback_points": [
    {
      "criterion": "Criterion name",
      "cell_index": 0,
      "severity": "high|medium|low",
      "comment": "Specific feedback",
      "suggestion": "How to improve"
    }
  ],
  "final_score": "A+|A|B+|B|B-|C+|C|C-|D|F"
}

Provide only the JSON object, no additional text.`;
}

async function callOpenAI(prompt: string): Promise<AnalysisFeedback> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a scientific mentor AI. Respond only with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const err = await response.json();
      detail = err?.error?.message ?? JSON.stringify(err);
    } catch {
      // ignore
    }
    throw new Error(`OpenAI API error: ${detail || response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as AnalysisFeedback;
}

console.info("[analyze-notebook] server started");
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { notebook_content, user_id } = (await req.json()) as AnalysisRequest;

    if (!notebook_content || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: notebook_content, user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[analyze-notebook] Starting analysis for user: ${user_id}`);

    const prompt = generateLLMPrompt(notebook_content);
    const feedback = await callOpenAI(prompt);

    console.log(`[analyze-notebook] Analysis completed for user: ${user_id}`);

    return new Response(JSON.stringify(feedback), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[analyze-notebook] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
