-- Una sola fila (id = 1) con la última sincronización con Systeme.io: no acumula historial.
create table if not exists public.sync_status (
  id int primary key default 1 check (id = 1),
  last_run_at timestamptz not null default now(),
  source text not null,
  summary text not null
);

alter table public.sync_status enable row level security;

create policy "El admin ve la última sincronización"
  on public.sync_status for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

create policy "El admin registra la sincronización"
  on public.sync_status for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

create policy "El admin actualiza la sincronización"
  on public.sync_status for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
