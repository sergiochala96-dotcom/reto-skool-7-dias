create policy "Los usuarios eliminan su propio progreso"
  on public.challenge_progress for delete
  using (auth.uid() = user_id);
