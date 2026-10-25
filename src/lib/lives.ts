// Vidas: máximo 3. Se pierde una por cada respuesta fallada en la trivia y todos los días a las
// 6:00 a. m. (hora de Colombia) se rellenan a 3: si ya hay 3 no cambia nada y si hay menos vuelven a
// 3. El relleno real lo hace la base de datos al usarlas (función sync_lives, migración 0022); esto
// calcula el mismo resultado para MOSTRARLAS sin escribir nada.

export const MAX_LIVES = 3;

// Última vez que fueron las 6:00 a. m. en Colombia (UTC-5, sin horario de verano = 11:00 UTC).
export function lastLivesBoundary(now: Date = new Date()): Date {
  const boundary = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 11, 0, 0)
  );
  if (boundary.getTime() > now.getTime()) boundary.setUTCDate(boundary.getUTCDate() - 1);
  return boundary;
}

// Vidas que tiene la persona ahora: si ya pasaron las 6:00 a. m. desde su último relleno, vuelven a 3.
export function effectiveLives(
  lives: number,
  refilledAt: string | null | undefined,
  now: Date = new Date()
): number {
  if (!refilledAt || new Date(refilledAt).getTime() < lastLivesBoundary(now).getTime()) {
    return Math.max(lives, MAX_LIVES);
  }
  return lives;
}
