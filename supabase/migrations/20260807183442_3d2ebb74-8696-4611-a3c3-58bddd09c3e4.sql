CREATE POLICY "Recruiters can read their own resume files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Recruiters can upload their own resume files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Recruiters can update their own resume files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Recruiters can delete their own resume files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);