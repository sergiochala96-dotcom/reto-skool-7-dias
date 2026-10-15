-- Leads captados en /reto, con el origen del tráfico (etiquetas UTM + referrer).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Cualquier visitante puede registrarse como lead desde /reto (formulario público).
create policy "Visitantes registran leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- Solo el admin ve los leads y su origen.
create policy "El admin ve los leads"
  on public.leads for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
