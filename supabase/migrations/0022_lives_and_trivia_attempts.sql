-- Vidas reales y trivia con intentos.
--
-- Vidas: máximo 3. Se pierde una por cada respuesta fallada en la trivia. Todos los días a las
-- 6:00 a. m. (hora de Colombia) se rellenan a 3: si ya hay 3 no pasa nada y si hay menos, vuelven a
-- 3. El relleno se calcula al usarlas (sin tarea programada) comparando con la última "frontera" de
-- las 6:00 a. m. (profiles.lives_refilled_at).
--
-- Trivia: cada día de juego (empieza a las 6:00 a. m. de Colombia) cada persona tiene UN intento,
-- guardado en trivia_attempts. Las respuestas se califican pregunta por pregunta en el servidor.

alter table public.profiles add column if not exists lives_refilled_at timestamptz;

-- El relleno de vidas también queda protegido contra cambios desde el navegador.
create or replace function public.protect_economy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.coins is distinct from old.coins
      or new.lives is distinct from old.lives
      or new.lives_refilled_at is distinct from old.lives_refilled_at)
     and coalesce(current_setting('app.economy_write', true), '') <> '1'
     and coalesce(auth.jwt() ->> 'email', '') <> 'sergiochala96@gmail.com'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.coins := old.coins;
    new.lives := old.lives;
    new.lives_refilled_at := old.lives_refilled_at;
  end if;
  return new;
end;
$$;

-- Última vez que fueron las 6:00 a. m. en Colombia.
create or replace function public.last_lives_boundary()
returns timestamptz
language sql
stable
as $$
  select (date_trunc('day', (now() at time zone 'America/Bogota') - interval '6 hours') + interval '6 hours')
         at time zone 'America/Bogota'
$$;

-- Rellena las vidas a 3 si pasaron las 6:00 a. m. desde el último relleno; devuelve las vidas.
create or replace function public.sync_lives(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  b timestamptz := public.last_lives_boundary();
  cur integer;
  refilled timestamptz;
begin
  select lives, lives_refilled_at into cur, refilled from public.profiles where id = p_user for update;
  if cur is null then
    return 0;
  end if;
  if refilled is null or refilled < b then
    perform set_config('app.economy_write', '1', true);
    update public.profiles set lives = greatest(lives, 3), lives_refilled_at = b where id = p_user;
    perform set_config('app.economy_write', '', true);
    return greatest(cur, 3);
  end if;
  return cur;
end;
$$;

-- Quita una vida (nunca baja de 0) y devuelve las que quedan.
create or replace function public.lose_life(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cur integer;
begin
  cur := public.sync_lives(p_user);
  if cur <= 0 then
    return 0;
  end if;
  perform set_config('app.economy_write', '1', true);
  update public.profiles set lives = lives - 1 where id = p_user returning lives into cur;
  perform set_config('app.economy_write', '', true);
  return cur;
end;
$$;

revoke all on function public.sync_lives(uuid) from public, anon, authenticated;
revoke all on function public.lose_life(uuid) from public, anon, authenticated;

-- Intento diario de la trivia. Solo el servidor lo escribe; cada persona puede ver el suyo.
create table if not exists public.trivia_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  play_date date not null,
  answers integer[] not null default '{}',
  wrong integer not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, play_date)
);
alter table public.trivia_attempts enable row level security;
create policy "Cada usuario ve su intento"
  on public.trivia_attempts for select to authenticated using (auth.uid() = user_id);
create policy "El admin ve todos los intentos"
  on public.trivia_attempts for select to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Agrega una respuesta solo si es la que sigue (evita contar dos veces la misma pregunta).
create or replace function public.append_trivia_answer(
  p_user uuid, p_date date, p_index integer, p_choice integer, p_is_wrong boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.trivia_attempts
  set answers = array_append(answers, p_choice),
      wrong = wrong + case when p_is_wrong then 1 else 0 end,
      updated_at = now()
  where user_id = p_user and play_date = p_date and status = 'in_progress'
    and coalesce(array_length(answers, 1), 0) = p_index;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
revoke all on function public.append_trivia_answer(uuid, date, integer, integer, boolean) from public, anon, authenticated;
