// Sound utility functions for interactive assignments

// Cache for preloaded audio objects
const audioCache: Record<string, HTMLAudioElement> = {};

// Sound types
export type SoundType = 'correct' | 'incorrect' | 'celebration' | 'click' | 'complete';

// Sound file paths
const SOUND_PATHS: Record<SoundType, string> = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  celebration: '/sounds/celebration.mp3',
  click: '/sounds/click.mp3',
  complete: '/sounds/complete.mp3'
};

/**
 * Preload sounds for better performance
 */
export const preloadSounds = () => {
  Object.entries(SOUND_PATHS).forEach(([key, path]) => {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(path);
        audioCache[key] = audio;
      } catch (error) {
        console.error(`Failed to preload sound: ${key}`, error);
      }
    }
  });
};

/**
 * Play a sound effect
 * @param type The type of sound to play
 * @param volume Volume level (0-1)
 * @returns Promise that resolves when sound starts playing
 */
export const playSound = async (type: SoundType, volume = 1): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    // Use cached audio if available, otherwise create a new one
    const audio = audioCache[type] || new Audio(SOUND_PATHS[type]);
    
    // Set volume
    audio.volume = Math.min(1, Math.max(0, volume));
    
    // Reset to beginning if already playing
    audio.currentTime = 0;
    
    // Play the sound
    await audio.play();
  } catch (error) {
    console.error(`Failed to play sound: ${type}`, error);
  }
};

/**
 * Stop a currently playing sound
 * @param type The type of sound to stop
 */
export const stopSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = audioCache[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  } catch (error) {
    console.error(`Failed to stop sound: ${type}`, error);
  }
};

// Initialize by preloading sounds
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', preloadSounds);
}
