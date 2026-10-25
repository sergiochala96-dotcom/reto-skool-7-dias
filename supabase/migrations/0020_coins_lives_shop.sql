-- Monedas de oro, vidas y tienda de canjes.
--
-- Monedas: se ganan solas con triggers (10 por cada día del reto completado, 5 por cada misión de
-- comunidad —WhatsApp y Skool— y 50 de bono al completar los 7 días). Cada premio queda en un libro
-- (coin_transactions) con una clave única, así no se puede ganar dos veces lo mismo aunque se
-- reinicie el progreso. Las monedas y las vidas NO las puede cambiar una persona desde el
-- navegador: solo las funciones de este archivo (y el admin / el servidor).
-- Vidas: arrancan en 3; sirven para reparar rachas rotas (la mecánica de reparar se define aparte).

alter table public.profiles add column if not exists coins integer not null default 0;
alter table public.profiles add column if not exists lives integer not null default 3;

-- Libro de movimientos de monedas.
create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,   -- day | comunidad | bono | canje | ajuste
  ref text not null,      -- qué lo originó (día, comunidad, producto...)
  created_at timestamptz not null default now(),
  unique (user_id, reason, ref)
);
alter table public.coin_transactions enable row level security;

create policy "Cada usuario ve sus movimientos"
  on public.coin_transactions for select to authenticated
  using (auth.uid() = user_id);
create policy "El admin ve todos los movimientos"
  on public.coin_transactions for select to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Candado: monedas y vidas solo cambian dentro de las funciones de este archivo (que activan la
-- marca app.economy_write), o por el admin o el servidor.
create or replace function public.protect_economy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.coins is distinct from old.coins or new.lives is distinct from old.lives)
     and coalesce(current_setting('app.economy_write', true), '') <> '1'
     and coalesce(auth.jwt() ->> 'email', '') <> 'sergiochala96@gmail.com'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.coins := old.coins;
    new.lives := old.lives;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_economy on public.profiles;
create trigger protect_economy
  before update on public.profiles
  for each row execute function public.protect_economy();

-- Da monedas una sola vez por (persona, motivo, referencia).
create or replace function public.award_coins(p_user uuid, p_amount integer, p_reason text, p_ref text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
begin
  insert into public.coin_transactions (user_id, amount, reason, ref)
  values (p_user, p_amount, p_reason, p_ref)
  on conflict (user_id, reason, ref) do nothing;
  get diagnostics inserted = row_count;
  if inserted > 0 then
    perform set_config('app.economy_write', '1', true);
    update public.profiles set coins = coins + p_amount where id = p_user;
    perform set_config('app.economy_write', '', true);
  end if;
end;
$$;
-- Solo las usan los triggers y el servidor: nadie puede llamarla desde el navegador.
revoke all on function public.award_coins(uuid, integer, text, text) from public, anon, authenticated;

-- 10 monedas por día completado y 50 de bono al completar los 7.
create or replace function public.award_day_coins()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award_coins(new.user_id, 10, 'day', new.day::text);
  if (select count(*) from public.challenge_progress where user_id = new.user_id) >= 7 then
    perform public.award_coins(new.user_id, 50, 'bono', 'reto-completo');
  end if;
  return new;
end;
$$;
drop trigger if exists award_day_coins on public.challenge_progress;
create trigger award_day_coins
  after insert on public.challenge_progress
  for each row execute function public.award_day_coins();

-- 5 monedas por unirse a cada comunidad (la primera vez que se marca la misión).
create or replace function public.award_community_coins()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.joined_whatsapp_at is null and new.joined_whatsapp_at is not null then
    perform public.award_coins(new.id, 5, 'comunidad', 'whatsapp');
  end if;
  if old.joined_skool_at is null and new.joined_skool_at is not null then
    perform public.award_coins(new.id, 5, 'comunidad', 'skool');
  end if;
  return new;
end;
$$;
drop trigger if exists award_community_coins on public.profiles;
create trigger award_community_coins
  after update of joined_skool_at, joined_whatsapp_at on public.profiles
  for each row execute function public.award_community_coins();

-- Tienda: catálogo (visible para todos), contenido (solo de lo canjeado) y canjes.
create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  emoji text not null default '🎁',
  cost integer not null check (cost >= 0),
  kind text not null default 'prompt' check (kind in ('prompt', 'link', 'text')),
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.shop_items enable row level security;
create policy "Se ve el catálogo activo"
  on public.shop_items for select to authenticated using (active);
create policy "El admin ve todo el catálogo"
  on public.shop_items for select to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin crea productos"
  on public.shop_items for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin edita productos"
  on public.shop_items for update to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin borra productos"
  on public.shop_items for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

create table if not exists public.shop_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.shop_items(id) on delete cascade,
  cost integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);
alter table public.shop_redemptions enable row level security;
create policy "Cada usuario ve sus canjes"
  on public.shop_redemptions for select to authenticated using (auth.uid() = user_id);
create policy "El admin ve todos los canjes"
  on public.shop_redemptions for select to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- El contenido (el prompt, el enlace, el texto) solo se puede leer después de canjearlo.
create table if not exists public.shop_item_contents (
  item_id uuid primary key references public.shop_items(id) on delete cascade,
  content text not null
);
alter table public.shop_item_contents enable row level security;
create policy "Solo se lee lo canjeado"
  on public.shop_item_contents for select to authenticated
  using (
    exists (
      select 1 from public.shop_redemptions r
      where r.item_id = shop_item_contents.item_id and r.user_id = auth.uid()
    )
    or (auth.jwt() ->> 'email') = 'sergiochala96@gmail.com'
  );
create policy "El admin crea contenidos"
  on public.shop_item_contents for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin edita contenidos"
  on public.shop_item_contents for update to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');
create policy "El admin borra contenidos"
  on public.shop_item_contents for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'sergiochala96@gmail.com');

-- Canjear un producto: descuenta las monedas y registra el canje, todo o nada.
create or replace function public.redeem_shop_item(p_item uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  item_cost integer;
  updated integer;
begin
  if uid is null then
    raise exception 'No hay sesión';
  end if;

  select cost into item_cost from public.shop_items where id = p_item and active;
  if item_cost is null then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;

  if exists (select 1 from public.shop_redemptions where user_id = uid and item_id = p_item) then
    return json_build_object('ok', true, 'already', true);
  end if;

  perform set_config('app.economy_write', '1', true);
  update public.profiles set coins = coins - item_cost where id = uid and coins >= item_cost;
  get diagnostics updated = row_count;
  perform set_config('app.economy_write', '', true);
  if updated = 0 then
    return json_build_object('ok', false, 'error', 'insufficient');
  end if;

  insert into public.shop_redemptions (user_id, item_id, cost) values (uid, p_item, item_cost);
  insert into public.coin_transactions (user_id, amount, reason, ref)
  values (uid, -item_cost, 'canje', p_item::text);

  return json_build_object('ok', true);
end;
$$;
revoke all on function public.redeem_shop_item(uuid) from public, anon;
grant execute on function public.redeem_shop_item(uuid) to authenticated;

-- Quienes ya tenían avance reciben las monedas que les corresponden.
select set_config('app.economy_write', '1', true);
insert into public.coin_transactions (user_id, amount, reason, ref)
  select user_id, 10, 'day', day::text from public.challenge_progress
  on conflict (user_id, reason, ref) do nothing;
insert into public.coin_transactions (user_id, amount, reason, ref)
  select id, 5, 'comunidad', 'whatsapp' from public.profiles where joined_whatsapp_at is not null
  on conflict (user_id, reason, ref) do nothing;
insert into public.coin_transactions (user_id, amount, reason, ref)
  select id, 5, 'comunidad', 'skool' from public.profiles where joined_skool_at is not null
  on conflict (user_id, reason, ref) do nothing;
insert into public.coin_transactions (user_id, amount, reason, ref)
  select user_id, 50, 'bono', 'reto-completo' from public.challenge_progress
  group by user_id having count(*) >= 7
  on conflict (user_id, reason, ref) do nothing;
update public.profiles p
  set coins = coalesce((select sum(amount) from public.coin_transactions t where t.user_id = p.id), 0);
select set_config('app.economy_write', '', true);

-- Productos de ejemplo (contenido provisional; el admin puede editarlos o agregar más).
insert into public.shop_items (slug, title, description, emoji, cost, kind, sort) values
  ('prompt-ideas-contenido', '10 ideas de contenido para tu comunidad', 'Un prompt para que la IA te proponga ideas de publicaciones semanales.', '💡', 20, 'prompt', 1),
  ('prompt-descripcion-skool', 'Descripción irresistible de tu Skool', 'Un prompt para redactar la descripción de tu comunidad con una promesa clara.', '✍️', 30, 'prompt', 2),
  ('plantilla-bienvenida-correo', 'Secuencia de bienvenida por correo', 'Una plantilla de 3 correos para recibir a tus nuevos miembros.', '📧', 40, 'text', 3),
  ('link-comunidad-skool', 'Acceso a la comunidad de Skool', 'Un enlace directo a la comunidad para seguir aprendiendo con otros creadores.', '🔗', 60, 'link', 4)
on conflict (slug) do nothing;

insert into public.shop_item_contents (item_id, content)
select i.id, c.content from public.shop_items i
join (values
  ('prompt-ideas-contenido', 'Actúa como estratega de contenido para una comunidad de [tu nicho]. Dame 10 ideas de publicaciones para las próximas 4 semanas, repartidas en: preguntas para generar conversación, mini-lecciones, historias de avance y retos semanales. Para cada idea, escribe el título y una frase de cómo desarrollarla. Evita promesas de resultados garantizados.'),
  ('prompt-descripcion-skool', 'Escribe 3 versiones de la descripción de mi comunidad de Skool. Mi comunidad es para [tu cliente ideal] y le ayuda a [resultado concreto]. Cada versión debe tener un titular de una línea, 3 beneficios claros y una invitación a unirse. Tono cercano, sin exageraciones, máximo 120 palabras por versión.'),
  ('plantilla-bienvenida-correo', E'Correo 1 (al unirse): Asunto: «Bienvenido/a a [nombre de tu comunidad]». Cuerpo: agradece, explica qué encontrará y cuál es el primer paso de hoy.\n\nCorreo 2 (día 2): Asunto: «Tu primera victoria rápida». Cuerpo: una acción pequeña que pueda hacer en 10 minutos y cómo compartirla.\n\nCorreo 3 (día 5): Asunto: «¿Cómo vas?». Cuerpo: pregunta cómo le fue, ofrece ayuda y recuerda el próximo evento o novedad.'),
  ('link-comunidad-skool', 'https://www.skool.com/the-creators-community-4018/about')
) as c(slug, content) on c.slug = i.slug
on conflict (item_id) do nothing;
