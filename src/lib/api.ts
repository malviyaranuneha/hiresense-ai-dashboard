import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/* ---------------------------------- auth ---------------------------------- */

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return {
        id: user.id,
        email: user.email ?? "",
        full_name: data?.full_name || user.email?.split("@")[0] || "Recruiter",
        job_title: data?.job_title || "Recruiter",
        avatar_url: data?.avatar_url ?? null,
      };
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { full_name: string; job_title?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...values }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/* ----------------------------- job descriptions ---------------------------- */

export interface JobRow {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  status: string;
  description: string;
  created_at: string;
  file_name: string | null;
  file_path: string | null;
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as JobRow[];
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      title: string;
      department: string;
      description: string;
      location?: string;
      file?: File | null;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not signed in");

      let filePath: string | null = null;
      let fileName: string | null = null;

      if (values.file) {
        const path = `${user.id}/job-descriptions/${crypto.randomUUID()}-${values.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(path, values.file, { upsert: false });
        if (uploadError) throw uploadError;
        filePath = path;
        fileName = values.file.name;
      }

      const { error } = await supabase.from("job_descriptions").insert({
        user_id: user.id,
        title: values.title,
        department: values.department,
        description: values.description,
        location: values.location ?? "Remote",
        status: "active",
        file_name: fileName,
        file_path: filePath,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}


/* --------------------------------- resumes -------------------------------- */

export interface ResumeRow {
  id: string;
  candidate_name: string;
  candidate_email: string | null;
  file_name: string;
  file_path: string | null;
  file_size: number | null;
  match_score: number | null;
  status: string;
  skills: string[];
  created_at: string;
  job_description_id: string | null;
}

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("match_score", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ResumeRow[];
    },
  });
}

/** Placeholder score until the AI matching engine is wired up. */
function placeholderScore(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return 60 + (hash % 38);
}

function candidateNameFromFile(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b(resume|cv)\b/gi, "")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || fileName;
}

export function useUploadResumes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not signed in");

      let extracted = 0;
      const extractionErrors: string[] = [];

      for (const file of files) {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;

        // Real text extraction for PDF / DOCX / TXT resumes.
        let parsedText: string | null = null;
        try {
          const text = await extractJdText(file);
          if (text) {
            parsedText = text;
            extracted += 1;
          } else {
            extractionErrors.push(`${file.name}: no readable text found`);
          }
        } catch (err) {
          extractionErrors.push(
            `${file.name}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }

        const score = placeholderScore(file.name + file.size);
        const { data: resume, error: insertError } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            candidate_name: candidateNameFromFile(file.name),
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            parsed_text: parsedText,
            match_score: score,
            status: score >= 85 ? "shortlisted" : score >= 70 ? "in review" : "on hold",
          })
          .select("id")
          .single();
        if (insertError) throw insertError;

        // Placeholder analysis record — real AI scoring lands in a later phase.
        const { error: analysisError } = await supabase.from("candidate_analysis").insert({
          user_id: user.id,
          resume_id: resume.id,
          overall_score: score,
        });
        if (analysisError) throw analysisError;
      }

      return { total: files.length, extracted, extractionErrors };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

