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
