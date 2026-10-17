-- Misiones iniciales antes del Día 1: unirse al Skool gratis y a la comunidad de WhatsApp.
-- Una fecha por misión (null = pendiente). No se puede verificar la unión desde aquí:
-- se marcan al tocar el botón, así que son de avance, no de prueba.
alter table public.profiles add column if not exists joined_skool_at timestamptz;
alter table public.profiles add column if not exists joined_whatsapp_at timestamptz;

-- Cuentas que ya tenían avance en el reto: quedan con las dos misiones hechas para no
-- estorbarles. Las que aún no empezaron verán las misiones.
update public.profiles p
set joined_skool_at = coalesce(joined_skool_at, now()),
    joined_whatsapp_at = coalesce(joined_whatsapp_at, now())
where exists (select 1 from public.challenge_progress cp where cp.user_id = p.id)
   or exists (select 1 from public.mission_answers ma where ma.user_id = p.id);
