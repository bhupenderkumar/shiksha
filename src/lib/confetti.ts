import confetti from 'canvas-confetti';

// Default confetti options
const defaultOptions = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
};

// Celebrate with confetti
export const triggerConfetti = (options = {}) => {
  try {
    confetti({
      ...defaultOptions,
      ...options,
    });
  } catch (error) {
    console.error('Failed to trigger confetti:', error);
  }
};

// School-themed confetti (primary colors)
export const triggerSchoolConfetti = () => {
  try {
    confetti({
      ...defaultOptions,
      colors: ['#ff5e7e', '#26ccff', '#fcff42', '#88ff5a'],
      particleCount: 150,
    });
  } catch (error) {
    console.error('Failed to trigger school confetti:', error);
  }
};

// Celebration for completing all blanks correctly
export const triggerCompletionConfetti = () => {
  try {
    const duration = 3000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e'],
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#88ff5a', '#fcff42', '#ffa62d'],
      });
    }, 50);
  } catch (error) {
    console.error('Failed to trigger completion confetti:', error);
  }
};

export default {
  triggerConfetti,
  triggerSchoolConfetti,
  triggerCompletionConfetti,
};
