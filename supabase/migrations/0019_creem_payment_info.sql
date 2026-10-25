-- Datos del último pago de Creem de cada persona, para soporte: con qué correo pagó (puede ser
-- distinto al de su cuenta), su id de cliente y el id de su suscripción en Creem.
-- Los escribe el aviso de pago (service role).
alter table public.profiles add column if not exists creem_customer_email text;
alter table public.profiles add column if not exists creem_customer_id text;
alter table public.profiles add column if not exists creem_subscription_id text;

-- Mismo candado que el plan: solo el admin o el servidor pueden cambiar estos campos.
create or replace function public.protect_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.plan is distinct from old.plan
      or new.plan_expires_at is distinct from old.plan_expires_at
      or new.creem_customer_email is distinct from old.creem_customer_email
      or new.creem_customer_id is distinct from old.creem_customer_id
      or new.creem_subscription_id is distinct from old.creem_subscription_id)
     and coalesce(auth.jwt() ->> 'email', '') <> 'sergiochala96@gmail.com'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.plan := old.plan;
    new.plan_expires_at := old.plan_expires_at;
    new.creem_customer_email := old.creem_customer_email;
    new.creem_customer_id := old.creem_customer_id;
    new.creem_subscription_id := old.creem_subscription_id;
  end if;
  return new;
end;
$$;
