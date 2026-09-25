// Campanita corta de "logro" (subida de 2 notas), sintetizada con Web Audio
// API (sin depender de ningún archivo de audio externo). Se usa para las
// micro-celebraciones: completar un campo o una sección de una misión.
export function playSuccessDing() {
  if (typeof window === "undefined") return;
  const AudioCtxClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) return;

  const ctx = new AudioCtxClass();
  const now = ctx.currentTime;

  function tone(freq: number, start: number, duration: number, peakGain: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peakGain, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.05);
  }

  tone(880, 0, 0.14, 0.18);
  tone(1318.5, 0.08, 0.22, 0.16);

  setTimeout(() => ctx.close().catch(() => {}), 500);
}

// Fanfarria corta de "victoria" (arpegio ascendente + acorde final), para
// cuando se completa un día entero del reto. Dura menos de 1 segundo.
export function playVictoryFanfare() {
  if (typeof window === "undefined") return;
  const AudioCtxClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) return;

  const ctx = new AudioCtxClass();
  const now = ctx.currentTime;

  function tone(freq: number, start: number, duration: number, peakGain: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peakGain, now + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.05);
  }

  tone(523.25, 0, 0.16, 0.16); // Do
  tone(659.25, 0.1, 0.16, 0.16); // Mi
  tone(783.99, 0.2, 0.16, 0.16); // Sol
  tone(1046.5, 0.3, 0.5, 0.2); // Do agudo
  tone(1318.5, 0.32, 0.45, 0.12); // Mi agudo (acorde)

  setTimeout(() => ctx.close().catch(() => {}), 1000);
}
