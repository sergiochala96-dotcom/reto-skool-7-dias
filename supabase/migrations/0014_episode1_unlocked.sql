-- Checklist de inicio: tras unirse a WhatsApp y a Skool, la persona toca el candado del
-- Episodio 1 para abrir el reto. Esa fecha es lo que desbloquea el Día 1 (null = candado cerrado).
-- Quien ya tiene días completados no la necesita: el Día 1 ya está abierto para esas cuentas.
alter table public.profiles add column if not exists episode1_unlocked_at timestamptz;

-- Quien ya había completado las dos misiones con la versión anterior (el Día 1 se abría solo)
-- conserva el Día 1 abierto.
update public.profiles
set episode1_unlocked_at = now()
where episode1_unlocked_at is null
  and joined_skool_at is not null
  and joined_whatsapp_at is not null;
