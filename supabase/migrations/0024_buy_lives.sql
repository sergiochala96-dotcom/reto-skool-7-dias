-- Comprar vidas con monedas de oro.
--
-- Paquetes: 1 vida por 15 monedas, o 3 vidas por 40. Las vidas nunca pasan de 3 (el máximo del
-- juego), así que solo se puede comprar lo que cabe. Todo o nada: descuenta las monedas, suma las
-- vidas y deja el movimiento en el historial de monedas (coin_transactions) con motivo "vidas".

create or replace function public.buy_lives(p_pack integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  qty integer;
  price integer;
  cur integer;
  new_lives integer;
  new_coins integer;
begin
  if uid is null then
    raise exception 'No hay sesión';
  end if;

  if p_pack = 1 then
    qty := 1; price := 15;
  elsif p_pack = 3 then
    qty := 3; price := 40;
  else
    return json_build_object('ok', false, 'error', 'invalid');
  end if;

  -- Vidas actuales (aplica el relleno de las 6:00 a. m. si toca). Bloquea la fila hasta terminar.
  cur := public.sync_lives(uid);
  if cur + qty > 3 then
    return json_build_object('ok', false, 'error', 'full', 'lives', cur);
  end if;

  perform set_config('app.economy_write', '1', true);
  update public.profiles
    set coins = coins - price, lives = lives + qty
    where id = uid and coins >= price
    returning lives, coins into new_lives, new_coins;
  perform set_config('app.economy_write', '', true);

  if new_lives is null then
    return json_build_object('ok', false, 'error', 'insufficient', 'lives', cur);
  end if;

  insert into public.coin_transactions (user_id, amount, reason, ref)
  values (uid, -price, 'vidas', gen_random_uuid()::text);

  return json_build_object('ok', true, 'lives', new_lives, 'coins', new_coins);
end;
$$;
revoke all on function public.buy_lives(integer) from public, anon;
grant execute on function public.buy_lives(integer) to authenticated;
