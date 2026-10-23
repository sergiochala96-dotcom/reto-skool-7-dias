-- Dispositivo desde el que entra la gente (computadora, Android, iPhone u otro).
-- leads.device: con qué dispositivo se registró. profiles.last_device: con cuál entró la
-- última vez. Solo se guarda una palabra, no el user-agent completo.
alter table public.leads add column if not exists device text;
alter table public.profiles add column if not exists last_device text;
