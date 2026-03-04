import { useCallback, useRef } from 'react';

/**
 * Sound effects hook using Web Audio API (no external files needed).
 * Produces child-friendly sounds for correct/wrong answers, matching, completion etc.
 */
export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Silently ignore audio errors
    }
  }, [getCtx]);

  /** Happy ascending chime for correct answer */
  const playCorrect = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.25); // C5
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100); // E5
    setTimeout(() => playTone(784, 0.25, 'sine', 0.3), 200); // G5
  }, [playTone]);

  /** Descending tone for wrong answer */
  const playWrong = useCallback(() => {
    playTone(330, 0.2, 'triangle', 0.2); // E4
    setTimeout(() => playTone(262, 0.3, 'triangle', 0.15), 150); // C4
  }, [playTone]);

  /** Short tap/click sound */
  const playTap = useCallback(() => {
    playTone(880, 0.05, 'sine', 0.15);
  }, [playTone]);

  /** Match success - sparkle sound */
  const playMatch = useCallback(() => {
    playTone(698, 0.12, 'sine', 0.2);  // F5
    setTimeout(() => playTone(880, 0.15, 'sine', 0.25), 80); // A5
  }, [playTone]);

  /** Celebration fanfare for completing test / all matched */
  const playCelebration = useCallback(() => {
    const notes = [523, 587, 659, 784, 880, 1047]; // C5 to C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 100);
    });
  }, [playTone]);

  /** Star / bonus sound */
  const playStar = useCallback(() => {
    playTone(1047, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(1319, 0.12, 'sine', 0.25), 60);
    setTimeout(() => playTone(1568, 0.2, 'sine', 0.2), 120);
  }, [playTone]);

  /** Applause / cheering sound – rapid ascending arpeggios */
  const playApplause = useCallback(() => {
    // Two quick ascending arpeggios for a "clap clap yay!" feel
    const notes1 = [523, 659, 784, 1047]; // C5 E5 G5 C6
    const notes2 = [587, 740, 880, 1175]; // D5 F#5 A5 D6
    notes1.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine', 0.25), i * 70);
    });
    notes2.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.28), 300 + i * 70);
    });
    // Final shimmer
    setTimeout(() => playTone(1319, 0.3, 'sine', 0.2), 600); // E6
    setTimeout(() => playTone(1568, 0.4, 'sine', 0.15), 700); // G6
  }, [playTone]);

  /** "Oh oh" / sad trombone sound for wrong answers */
  const playOhOh = useCallback(() => {
    // Descending "wah wah" – like a cartoon fail
    playTone(494, 0.25, 'triangle', 0.25); // B4
    setTimeout(() => playTone(466, 0.25, 'triangle', 0.22), 250); // Bb4
    setTimeout(() => playTone(440, 0.25, 'triangle', 0.2), 500); // A4
    setTimeout(() => playTone(370, 0.5, 'triangle', 0.18), 750); // F#4 long sad hold
  }, [playTone]);

  /** Whoosh for transitions */
  const playWhoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Silently ignore
    }
  }, [getCtx]);

  return { playCorrect, playWrong, playTap, playMatch, playCelebration, playStar, playWhoosh, playApplause, playOhOh };
}
