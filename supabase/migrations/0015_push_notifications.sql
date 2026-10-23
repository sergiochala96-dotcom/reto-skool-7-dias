-- Notificaciones push (pantalla de bloqueo del celular).
-- Cada fila es un dispositivo que aceptó recibir avisos. Una persona puede tener varios
-- (celular + computadora). El envío lo hace el servidor con la service role; los usuarios solo
-- pueden ver y borrar los suyos (el guardado pasa por una acción del servidor).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Cada usuario ve sus dispositivos"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario borra sus dispositivos"
  on public.push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "El admin ve todos los dispositivos"
  on public.push_subscriptions for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Última ausencia por la que ya se avisó: guarda el last_seen_date en el que se envió el aviso
-- de "te extrañamos", para mandarlo UNA sola vez por ausencia (cuando la persona vuelve y se va
-- otra vez, last_seen_date cambia y el aviso puede repetirse).
alter table public.profiles add column if not exists push_reminder_for date;
