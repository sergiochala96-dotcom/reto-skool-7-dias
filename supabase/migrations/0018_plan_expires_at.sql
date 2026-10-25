-- Hasta cuándo está pagado el plan de una persona (fin del período de su suscripción).
-- Lo escribe el aviso de pago de Creem; null = sin vencimiento (plan dado a mano por el admin).
-- Pasada esa fecha (más unos días de gracia) la app trata a la persona como Standard, así que una
-- cancelación o un pago fallido se reflejan solos sin depender de más avisos.
alter table public.profiles add column if not exists plan_expires_at timestamptz;

-- Mismo candado que el plan: solo el admin o el servidor pueden cambiar plan o vencimiento.
create or replace function public.protect_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.plan is distinct from old.plan or new.plan_expires_at is distinct from old.plan_expires_at)
     and coalesce(auth.jwt() ->> 'email', '') <> 'sergiochala96@gmail.com'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.plan := old.plan;
    new.plan_expires_at := old.plan_expires_at;
  end if;
  return new;
end;
$$;
