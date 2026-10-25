-- Plan de cada persona: standard (gratis), premium o vip. Todos empiezan en standard.
alter table public.profiles add column if not exists plan text not null default 'standard';
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('standard', 'premium', 'vip'));

-- Los usuarios pueden editar su propio perfil, pero NO el plan: solo lo cambian el admin o el
-- servidor (service role, p. ej. el aviso de pago de la procesadora). Si cualquier otra persona
-- lo intenta, se conserva el valor anterior.
create or replace function public.protect_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.plan is distinct from old.plan
     and coalesce(auth.jwt() ->> 'email', '') <> 'sergiochala96@gmail.com'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.plan := old.plan;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_plan on public.profiles;
create trigger protect_plan
  before update on public.profiles
  for each row execute function public.protect_plan();
