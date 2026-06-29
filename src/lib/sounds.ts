/**
 * Procedural sounds via Web Audio API — no external WAV files needed.
 * All sounds are generated at runtime so the game ships self-contained.
 *
 * To replace with real samples: drop .wav files in /public/sounds/ and
 * swap these implementations for <Audio> element play() calls.
 */

function ctx(): AudioContext {
  // Always create a fresh context so sounds work after user gesture
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

/** Short ascending chime — correct find */
export function playChime(): void {
  try {
    const ac = ctx();
    const now = ac.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // AudioContext blocked or unsupported — silent fallback
  }
}

/** Low thud — wrong guess */
export function playBonk(): void {
  try {
    const ac = ctx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // silent fallback
  }
}

/** Sosumi — boss battle triggered */
export function playSosumi(): void {
  try {
    const ac = ctx();
    const now = ac.currentTime;
    // Dramatic minor chord: D, F, A struck together with quick piano-like decay
    [293.66, 349.23, 440.0].forEach(freq => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    });
  } catch {
    // silent fallback
  }
}

/** Victory fanfare — all problems found */
export function playFanfare(): void {
  try {
    const ac = ctx();
    const now = ac.currentTime;
    // Simple 5-note ascending fanfare: C E G C' E'
    const melody = [261.63, 329.63, 392.0, 523.25, 659.25];
    melody.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = now + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.setValueAtTime(0.2, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  } catch {
    // silent fallback
  }
}
