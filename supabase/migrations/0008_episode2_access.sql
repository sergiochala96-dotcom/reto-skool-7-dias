-- Episodio 2: bloqueado para todos por defecto. Solo el admin puede darle (o quitarle)
-- acceso a un usuario (profiles.episode2_locked_override = false => desbloqueado).

-- Los usuarios pueden editar su propio perfil, pero NO este campo: si alguien que no
-- es el admin lo intenta cambiar, se conserva el valor anterior.
create or replace function public.protect_episode2_override()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.episode2_locked_override is distinct from old.episode2_locked_override
     and coalesce(auth.jwt() ->> 'email', '') <> 'sergiochala96@gmail.com' then
    new.episode2_locked_override := old.episode2_locked_override;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_episode2_override on public.profiles;
create trigger protect_episode2_override
  before update on public.profiles
  for each row execute function public.protect_episode2_override();

-- El panel de admin necesita ver quién tiene acceso al Episodio 2.
create or replace view public.admin_users_overview
with (security_invoker = on) as
select
  p.id,
  p.email,
  p.display_name,
  p.created_at,
  count(cp.day) as completed_days,
  max(cp.completed_at) as last_activity,
  p.episode2_locked_override
from public.profiles p
left join public.challenge_progress cp on cp.user_id = p.id
group by p.id, p.email, p.display_name, p.created_at, p.episode2_locked_override
order by p.created_at desc;
