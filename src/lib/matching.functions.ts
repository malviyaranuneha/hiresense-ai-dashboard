import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface MatchResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
  reason: string;
}

const TOOL = {
  type: "function" as const,
  function: {
    name: "submit_match",
    description: "Return the structured match between a job description and a resume.",
    parameters: {
      type: "object",
      properties: {
        match_score: { type: "number", description: "0-100 overall match" },
        matched_skills: { type: "array", items: { type: "string" } },
        missing_skills: { type: "array", items: { type: "string" } },
        recommendation: {
          type: "string",
          description: "One of: Strong fit, Consider, Reject",
        },
        reason: { type: "string", description: "Short one or two sentence justification" },
      },
      required: [
        "match_score",
        "matched_skills",
        "missing_skills",
        "recommendation",
        "reason",
      ],
      additionalProperties: false,
    },
  },
};

async function scoreOne(
  apiKey: string,
  jobText: string,
  resumeText: string,
): Promise<MatchResult> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical recruiter. Compare a job description with a candidate resume and call the submit_match tool with strict, honest results. Never invent skills that are not in the resume.",
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobText.slice(0, 12000)}\n\nRESUME:\n${resumeText.slice(0, 12000)}`,
        },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "submit_match" } },
    }),
  });

  if (response.status === 429) throw new Error("AI rate limit reached — please retry shortly.");
  if (response.status === 402)
    throw new Error("AI credits exhausted — add credits in your workspace settings.");
  if (!response.ok) throw new Error(`AI request failed (${response.status}): ${await response.text()}`);

  const payload = (await response.json()) as {
    choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
  };
  const args = payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no structured result.");

  const parsed = JSON.parse(args) as Partial<MatchResult>;
  return {
    match_score: Math.max(0, Math.min(100, Math.round(Number(parsed.match_score ?? 0)))),
    matched_skills: (parsed.matched_skills ?? []).map(String),
    missing_skills: (parsed.missing_skills ?? []).map(String),
    recommendation: String(parsed.recommendation ?? ""),
    reason: String(parsed.reason ?? ""),
  };
}

export const runJobMatching = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string }) => {
    if (!input?.jobId || typeof input.jobId !== "string") throw new Error("A job description is required.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const { supabase, userId } = context;

    const { data: job, error: jobError } = await supabase
      .from("job_descriptions")
      .select("id, title, description")
      .eq("id", data.jobId)
      .maybeSingle();
    if (jobError) throw new Error(jobError.message);
    if (!job) throw new Error("Job description not found.");
    const jobText = `${job.title}\n\n${job.description}`.trim();
    if (!job.description.trim()) throw new Error("This job description has no text to match against.");

    const { data: resumes, error: resumeError } = await supabase
      .from("resumes")
      .select("id, candidate_name, parsed_text")
      .not("parsed_text", "is", null);
    if (resumeError) throw new Error(resumeError.message);

    const usable = (resumes ?? []).filter((r) => (r.parsed_text ?? "").trim().length > 0);
    if (usable.length === 0)
      throw new Error("No processed resumes with extracted text were found.");

    let matched = 0;
    const errors: string[] = [];

    for (const resume of usable) {
      try {
        const result = await scoreOne(apiKey, jobText, resume.parsed_text ?? "");

        const { data: existing } = await supabase
          .from("candidate_analysis")
          .select("id")
          .eq("resume_id", resume.id)
          .eq("user_id", userId)
          .maybeSingle();

        const row = {
          user_id: userId,
          resume_id: resume.id,
          job_description_id: job.id,
          overall_score: result.match_score,
          matched_skills: result.matched_skills,
          missing_skills: result.missing_skills,
          summary: result.reason,
          recommendation: result.recommendation,
        };

        const { error: saveError } = existing
          ? await supabase.from("candidate_analysis").update(row).eq("id", existing.id)
          : await supabase.from("candidate_analysis").insert(row);
        if (saveError) throw new Error(saveError.message);

        const { error: resumeUpdateError } = await supabase
          .from("resumes")
          .update({
            match_score: result.match_score,
            skills: result.matched_skills.slice(0, 4),
            job_description_id: job.id,
            status:
              result.match_score >= 85
                ? "shortlisted"
                : result.match_score >= 70
                  ? "in review"
                  : "on hold",
          })
          .eq("id", resume.id);
        if (resumeUpdateError) throw new Error(resumeUpdateError.message);

        matched += 1;
      } catch (err) {
        errors.push(
          `${resume.candidate_name || resume.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { total: usable.length, matched, errors };
  });
