-- Tabla de progreso del reto de 7 días
create table if not exists public.challenge_progress (
  user_id uuid references auth.users(id) on delete cascade not null,
  day int not null check (day >= 1 and day <= 7),
  completed_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.challenge_progress enable row level security;

create policy "Los usuarios ven su propio progreso"
  on public.challenge_progress for select
  using (auth.uid() = user_id);

create policy "Los usuarios insertan su propio progreso"
  on public.challenge_progress for insert
  with check (auth.uid() = user_id);
