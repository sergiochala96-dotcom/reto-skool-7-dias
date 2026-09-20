// Sonido "cha-ching" de caja registradora, sintetizado con Web Audio API
// (sin depender de ningún archivo de audio externo).
export function playChaChing() {
  if (typeof window === "undefined") return;
  const AudioCtxClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtxClass) return;

  const ctx = new AudioCtxClass();
  const now = ctx.currentTime;

  function tone(
    freq: number,
    start: number,
    duration: number,
    peakGain: number,
    type: OscillatorType
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peakGain, now + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.05);
  }

  // "cha": dos golpes metálicos rápidos
  tone(1600, 0, 0.09, 0.22, "square");
  tone(2200, 0.03, 0.09, 0.18, "square");
  // "ching": campanilla que se sostiene un poco más
  tone(1100, 0.1, 0.4, 0.26, "triangle");
  tone(1900, 0.1, 0.32, 0.14, "sine");
  tone(2800, 0.11, 0.26, 0.09, "sine");

  setTimeout(() => ctx.close().catch(() => {}), 700);
}
