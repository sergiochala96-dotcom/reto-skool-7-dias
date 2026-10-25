-- Recompensa de 50 monedas por unirse a la comunidad de WhatsApp y al curso en Skool, con
-- verificación: la persona debe escribir un CÓDIGO que solo se ve dentro de cada grupo (el admin lo
-- publica ahí y lo guarda en el panel de admin). Así no basta con tocar el botón de unirse.
--
-- Antes se daban 5 monedas por solo tocar el botón (sin verificar): se quita ese premio. Las 5
-- monedas ya entregadas se conservan.

drop trigger if exists award_community_coins on public.profiles;
drop function if exists public.award_community_coins();

-- Códigos vigentes (solo los lee y cambia el admin; las personas nunca ven el código, solo lo
-- comparan a través de la función claim_join_reward).
create table if not exists public.join_codes (
  kind text primary key check (kind in ('whatsapp', 'skool')),
  code text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.join_codes enable row level security;
create policy "El admin ve los códigos"
  on public.join_codes for select to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin crea códigos"
  on public.join_codes for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin edita códigos"
  on public.join_codes for update to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin borra códigos"
  on public.join_codes for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

insert into public.join_codes (kind, code) values ('whatsapp', ''), ('skool', '')
on conflict (kind) do nothing;

-- Intentos de canje (para limitar los intentos al azar). Sin políticas: solo la función los toca.
create table if not exists public.join_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  ok boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists join_attempts_user_kind_idx on public.join_attempts (user_id, kind, created_at);
alter table public.join_attempts enable row level security;

-- Canjear la recompensa: compara el código, limita los intentos y da las monedas una sola vez.
create or replace function public.claim_join_reward(p_kind text, p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  stored text;
begin
  if uid is null then
    raise exception 'No hay sesión';
  end if;
  if p_kind not in ('whatsapp', 'skool') then
    return json_build_object('ok', false, 'error', 'invalid');
  end if;

  if exists (
    select 1 from public.coin_transactions
    where user_id = uid and reason = 'verificado' and ref = p_kind
  ) then
    return json_build_object('ok', true, 'already', true);
  end if;

  -- Máximo 6 intentos fallidos por hora y por comunidad.
  if (
    select count(*) from public.join_attempts
    where user_id = uid and kind = p_kind and ok = false and created_at > now() - interval '1 hour'
  ) >= 6 then
    return json_build_object('ok', false, 'error', 'too_many');
  end if;

  select code into stored from public.join_codes where kind = p_kind;
  if stored is null or btrim(stored) = '' then
    return json_build_object('ok', false, 'error', 'not_configured');
  end if;

  if lower(btrim(coalesce(p_code, ''))) <> lower(btrim(stored)) then
    insert into public.join_attempts (user_id, kind, ok) values (uid, p_kind, false);
    return json_build_object('ok', false, 'error', 'wrong_code');
  end if;

  insert into public.join_attempts (user_id, kind, ok) values (uid, p_kind, true);
  perform public.award_coins(uid, 50, 'verificado', p_kind);

  -- También marca la misión de inicio como hecha (para que se vea completa en el panel).
  if p_kind = 'whatsapp' then
    update public.profiles set joined_whatsapp_at = coalesce(joined_whatsapp_at, now()) where id = uid;
  else
    update public.profiles set joined_skool_at = coalesce(joined_skool_at, now()) where id = uid;
  end if;

  return json_build_object('ok', true);
end;
$$;
revoke all on function public.claim_join_reward(text, text) from public, anon;
grant execute on function public.claim_join_reward(text, text) to authenticated;
