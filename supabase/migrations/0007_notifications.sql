-- Notificaciones: comunicados del admin que ven todos los usuarios en la campanita.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.notifications enable row level security;

create policy "Usuarios autenticados ven las notificaciones"
  on public.notifications for select
  to authenticated
  using (true);

create policy "El admin crea notificaciones"
  on public.notifications for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

create policy "El admin borra notificaciones"
  on public.notifications for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Qué notificaciones ya leyó cada usuario
create table if not exists public.notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_id)
);

alter table public.notification_reads enable row level security;

create policy "Cada usuario ve sus lecturas"
  on public.notification_reads for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario marca sus lecturas"
  on public.notification_reads for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "El admin ve todas las lecturas"
  on public.notification_reads for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
