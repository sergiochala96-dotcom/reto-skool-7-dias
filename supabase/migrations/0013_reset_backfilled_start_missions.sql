-- La migración 0012 dejó las dos misiones iniciales como "hechas" en las cuentas que ya tenían
-- avance. Se pidió que las misiones las vean TODOS los usuarios, así que se deshace esa marca
-- (solo la que puso la 0012: ambas fechas idénticas y anteriores al 17/10/2026 03:00 UTC).
-- Quien ya tiene días completados conserva el Día 1 abierto (esa regla no depende de estas fechas).
update public.profiles
set joined_skool_at = null,
    joined_whatsapp_at = null
where joined_skool_at is not null
  and joined_skool_at = joined_whatsapp_at
  and joined_skool_at < '2026-10-17 03:00:00+00';
