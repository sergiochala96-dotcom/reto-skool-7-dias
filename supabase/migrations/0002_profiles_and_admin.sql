-- Perfiles públicos (uno por usuario), poblados automáticamente al registrarse
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "El admin ve todos los perfiles"
  on public.profiles for select
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Trigger: crea el perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- El admin también puede ver el progreso de todos los usuarios
create policy "El admin ve todo el progreso"
  on public.challenge_progress for select
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Vista para el panel de admin: usuarios + días completados + última actividad
create or replace view public.admin_users_overview
with (security_invoker = on) as
select
  p.id,
  p.email,
  p.display_name,
  p.created_at,
  count(cp.day) as completed_days,
  max(cp.completed_at) as last_activity
from public.profiles p
left join public.challenge_progress cp on cp.user_id = p.id
group by p.id, p.email, p.display_name, p.created_at
order by p.created_at desc;
