-- Última visita: solo una FECHA (sin hora), actualizada como mucho una vez al día por persona.
alter table public.profiles add column if not exists last_seen_date date;

-- Estado ya enviado a Systeme.io (texto corto, ej. "casi_listo|15d"): así el proceso diario
-- solo llama a la API cuando alguien cambia de estado.
alter table public.profiles add column if not exists systeme_tags text;

-- Punto de partida para los usuarios actuales: su último inicio de sesión (o su registro).
update public.profiles p
set last_seen_date = coalesce(date(u.last_sign_in_at), date(p.created_at))
from auth.users u
where u.id = p.id and p.last_seen_date is null;

update public.profiles set last_seen_date = date(created_at) where last_seen_date is null;

create or replace view public.admin_users_overview
with (security_invoker = on) as
select
  p.id,
  p.email,
  p.display_name,
  p.created_at,
  count(cp.day) as completed_days,
  max(cp.completed_at) as last_activity,
  p.episode2_locked_override,
  p.last_seen_date
from public.profiles p
left join public.challenge_progress cp on cp.user_id = p.id
group by p.id, p.email, p.display_name, p.created_at, p.episode2_locked_override, p.last_seen_date
order by p.created_at desc;
