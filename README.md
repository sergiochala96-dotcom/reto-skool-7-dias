# Skooly: Reto de Skool en 7 Días

App en Next.js + Supabase: registro (email o Google), panel con las 7 misiones que se desbloquean una a una, el Cofre del Tesoro final al completarlas todas, y un panel de administración para ver a todos los usuarios.

- **Repo:** https://github.com/sergiochala96-dotcom/reto-skool-7-dias
- **En vivo:** https://reto-skool-7-dias.vercel.app

## Estado actual

- ✅ App completa: landing, login, registro, dashboard, detalle de cada día, cofre del tesoro con confetti.
- ✅ Lógica de desbloqueo progresivo (el día N se abre solo si completaste el día N-1).
- ✅ Supabase conectado (auth por email + tabla de progreso con RLS), probado de punta a punta.
- ✅ Panel de admin en `/admin` (solo para `sergiochala96@gmail.com`) con lista de usuarios, progreso y filtros de 15/50/100 por página.
- ⏳ Pendiente: activar login con Google en Supabase (paso manual, ver abajo) y reemplazar el contenido placeholder de los días y el premio final.

## Activar login con Google (pendiente, manual)

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
- `src/app/admin` — panel de administración (solo `sergiochala96@gmail.com`, ver `src/lib/admin.ts`).
- `supabase/migrations/` — esquema de base de datos.
