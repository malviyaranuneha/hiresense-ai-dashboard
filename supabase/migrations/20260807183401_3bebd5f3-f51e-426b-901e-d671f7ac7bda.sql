REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TABLE public.candidate_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
  overall_score INTEGER NOT NULL DEFAULT 0,
  skills_score INTEGER,
  experience_score INTEGER,
  education_score INTEGER,
  matched_skills TEXT[] NOT NULL DEFAULT '{}',
  missing_skills TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_analysis TO authenticated;
GRANT ALL ON public.candidate_analysis TO service_role;

ALTER TABLE public.candidate_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters manage their own candidate analyses"
  ON public.candidate_analysis FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX candidate_analysis_user_id_idx ON public.candidate_analysis (user_id);
CREATE INDEX candidate_analysis_resume_id_idx ON public.candidate_analysis (resume_id);

CREATE TRIGGER update_candidate_analysis_updated_at BEFORE UPDATE ON public.candidate_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();