-- Respuestas de las micro-misiones de cada día (una fila por usuario y día)
create table if not exists public.mission_answers (
  user_id uuid references auth.users(id) on delete cascade not null,
  day int not null check (day >= 1 and day <= 7),
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.mission_answers enable row level security;

create policy "Los usuarios ven sus propias respuestas"
  on public.mission_answers for select
  using (auth.uid() = user_id);

create policy "Los usuarios insertan sus propias respuestas"
  on public.mission_answers for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios actualizan sus propias respuestas"
  on public.mission_answers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "El admin ve todas las respuestas"
  on public.mission_answers for select
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
