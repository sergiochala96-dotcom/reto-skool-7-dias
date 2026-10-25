-- Iconos de perfil en la tienda: se canjean con monedas y se usan como foto de perfil.
-- El producto guarda en su contenido la clave del icono (llama, moneda, corazon); los dibujos viven
-- en el código (src/components/AvatarIcon.tsx), así que cambiarlos no necesita tocar la base.
-- La foto de perfil guarda "icon:<clave>" en profiles.avatar_url.

alter table public.shop_items drop constraint if exists shop_items_kind_check;
alter table public.shop_items
  add constraint shop_items_kind_check check (kind in ('prompt', 'link', 'text', 'avatar'));

insert into public.shop_items (slug, title, description, emoji, cost, kind, sort) values
  ('avatar-llama', 'Icono: Llama', 'Un icono para usar como tu foto de perfil.', '🔥', 20, 'avatar', 10),
  ('avatar-moneda', 'Icono: Moneda', 'Un icono para usar como tu foto de perfil.', '🪙', 20, 'avatar', 11),
  ('avatar-corazon', 'Icono: Corazón', 'Un icono para usar como tu foto de perfil.', '❤️', 20, 'avatar', 12)
on conflict (slug) do nothing;

insert into public.shop_item_contents (item_id, content)
select i.id, c.content from public.shop_items i
join (values
  ('avatar-llama', 'llama'),
  ('avatar-moneda', 'moneda'),
  ('avatar-corazon', 'corazon')
) as c(slug, content) on c.slug = i.slug
on conflict (item_id) do nothing;
