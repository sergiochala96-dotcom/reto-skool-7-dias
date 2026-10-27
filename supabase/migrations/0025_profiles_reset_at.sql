-- Marca de cuándo el admin reinició la cuenta por última vez. La usa la guía de inicio para volver a
-- mostrarse aunque el navegador ya la hubiera visto antes del reinicio.
alter table public.profiles add column if not exists reset_at timestamptz;
