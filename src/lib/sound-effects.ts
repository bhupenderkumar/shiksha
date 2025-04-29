// Simple utility for playing sound effects

// Cache for preloaded sounds
const soundCache: Record<string, HTMLAudioElement> = {};

// Sound effect URLs
const SOUND_EFFECTS = {
  DROP: '/sounds/drop.mp3',
  SUCCESS: '/sounds/success.mp3',
  ERROR: '/sounds/error.mp3',
  POP: '/sounds/pop.mp3',
  CLICK: '/sounds/click.mp3',
};

// Preload sounds for better performance
export const preloadSounds = () => {
  try {
    Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      soundCache[key] = audio;
    });
  } catch (error) {
    console.error('Failed to preload sounds:', error);
  }
};

// Play a sound effect
export const playSound = (soundName: keyof typeof SOUND_EFFECTS) => {
  try {
    // If sound is already cached, use it
    if (soundCache[soundName]) {
      // Clone the audio to allow overlapping sounds
      const sound = soundCache[soundName].cloneNode() as HTMLAudioElement;
      sound.volume = 0.5; // Set volume to 50%
      sound.play().catch(err => console.error('Error playing sound:', err));
      return;
    }

    // If not cached, create a new audio element
    const url = SOUND_EFFECTS[soundName];
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Error playing sound:', err));
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

export default SOUND_EFFECTS;
