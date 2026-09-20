# Reto de 7 Días — Plataforma

App en Next.js + Supabase para el reto de 7 días: registro (email o Google), panel con las 7 misiones que se desbloquean una a una, y el Cofre del Tesoro final al completarlas todas.

## Estado actual

- ✅ App completa: landing, login, registro, dashboard, detalle de cada día, cofre del tesoro con confetti.
- ✅ Lógica de desbloqueo progresivo (el día N se abre solo si completaste el día N-1).
- ⏳ Pendiente: conectar un proyecto real de Supabase (login con Google/email y guardar el progreso).

## Conectar Supabase (pendiente)

Tu cuenta de Supabase llegó al límite de 2 proyectos gratuitos. Para continuar:

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard/projects).
2. Pausa o elimina un proyecto que no estés usando (revisa también si tienes proyectos en otra organización).
3. Avísame y yo termino automáticamente: creo el proyecto, aplico la tabla de progreso (`supabase/migrations/0001_challenge_progress.sql`) y relleno `.env.local` con las claves.

## Activar login con Google (manual, una vez tengamos el proyecto)

1. En el [dashboard de Supabase](https://supabase.com/dashboard) → tu proyecto → **Authentication → Providers → Google** → actívalo.
2. Necesitas un **Client ID** y **Client Secret** de Google. Se crean en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → "Crear credenciales" → "ID de cliente de OAuth" → tipo "Aplicación web".
3. En "URIs de redireccionamiento autorizados" agrega la URL de callback que te mostrará Supabase (algo como `https://TU-PROYECTO.supabase.co/auth/v1/callback`).
4. Pega el Client ID y Secret en Supabase y guarda.

El login por email/contraseña ya funciona apenas conectemos el proyecto (no requiere configuración extra).

## Editar el contenido de los 7 días

Todo el contenido de las misiones está en [`src/lib/challenge.ts`](src/lib/challenge.ts) — objetivo, tareas y entregable de cada día. Edítalo con tu contenido real cuando quieras.

## Editar el premio final

El cofre del tesoro y el mensaje del premio están en [`src/components/TreasureChest.tsx`](src/components/TreasureChest.tsx).

## Desarrollo local

```bash
npm run dev
```

## Estructura

- `src/app/login`, `src/app/registro` — autenticación.
- `src/app/dashboard` — panel con las 7 misiones y barra de progreso.
- `src/app/dia/[numero]` — detalle y botón de completar cada misión.
- `src/app/cofre` — cofre del tesoro (solo accesible tras completar los 7 días).
- `src/lib/challenge.ts` — contenido de las misiones.
- `supabase/migrations/` — esquema de base de datos.
