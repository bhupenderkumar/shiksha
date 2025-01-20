import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
} as const;

type GameState = typeof GAME_STATES[keyof typeof GAME_STATES];

const MarioGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const gameData = useRef({
    player: {
      x: 50,
      y: 200,
      width: 30,
      height: 40,
      velocity: 0,
      isJumping: false,
      color: '#ff0000' // Mario red
    },
    coins: [] as { x: number; y: number; collected: boolean }[],
    obstacles: [] as { x: number; width: number; height: number; color: string }[],
    background: {
      color: '#87CEEB', // Sky blue
      groundColor: '#90EE90' // Light green
    },
    speed: 5,
    gameLoop: 0
  });

  const resetGame = () => {
    gameData.current = {
      ...gameData.current,
      player: {
        ...gameData.current.player,
        y: 200,
        velocity: 0,
        isJumping: false
      },
      coins: Array.from({ length: 3 }, (_, i) => ({
        x: 600 + i * 200,
        y: 150,
        collected: false
      })),
      obstacles: Array.from({ length: 2 }, (_, i) => ({
        x: 800 + i * 400,
        width: 30,
        height: 40,
        color: '#663300' // Brown color for obstacles
      }))
    };
    setScore(0);
  };

  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    resetGame();

    const jump = () => {
      if (!gameData.current.player.isJumping) {
        gameData.current.player.velocity = -15;
        gameData.current.player.isJumping = true;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };

    const drawCloud = (x: number, y: number) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
      ctx.arc(x + 15, y + 10, 15, 0, Math.PI * 2);
      ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const update = () => {
      // Update player position
      gameData.current.player.y += gameData.current.player.velocity;
      gameData.current.player.velocity += 0.8;

      // Ground collision
      if (gameData.current.player.y > 200) {
        gameData.current.player.y = 200;
        gameData.current.player.isJumping = false;
        gameData.current.player.velocity = 0;
      }

      // Update obstacles and coins
      gameData.current.obstacles.forEach(obstacle => {
        obstacle.x -= gameData.current.speed;
      });

      gameData.current.coins.forEach(coin => {
        if (!coin.collected) {
          coin.x -= gameData.current.speed;
        }
      });

      // Collect coins
      gameData.current.coins.forEach(coin => {
        if (!coin.collected &&
            gameData.current.player.x < coin.x + 20 &&
            gameData.current.player.x + gameData.current.player.width > coin.x &&
            gameData.current.player.y < coin.y + 20 &&
            gameData.current.player.y + gameData.current.player.height > coin.y) {
          coin.collected = true;
          setScore(prev => prev + 10);
        }
      });

      // Check collisions with obstacles
      for (const obstacle of gameData.current.obstacles) {
        if (
          gameData.current.player.x < obstacle.x + obstacle.width &&
          gameData.current.player.x + gameData.current.player.width > obstacle.x &&
          gameData.current.player.y < 200 + obstacle.height &&
          gameData.current.player.y + gameData.current.player.height > 200
        ) {
          setHighScore(prev => Math.max(prev, score));
          setGameState(GAME_STATES.GAME_OVER);
          return;
        }
      }

      // Respawn obstacles and coins
      if (gameData.current.obstacles[0].x < -50) {
        gameData.current.obstacles.shift();
        gameData.current.obstacles.push({
          x: canvas.width + Math.random() * 300,
          width: 30,
          height: 40,
          color: '#663300'
        });
      }

      if (gameData.current.coins[0].x < -50) {
        gameData.current.coins.shift();
        gameData.current.coins.push({
          x: canvas.width + Math.random() * 300,
          y: 150,
          collected: false
        });
      }
    };

    const draw = () => {
      // Clear canvas and draw background
      ctx.fillStyle = gameData.current.background.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      drawCloud(100, 50);
      drawCloud(300, 70);
      drawCloud(500, 40);

      // Draw ground
      ctx.fillStyle = gameData.current.background.groundColor;
      ctx.fillRect(0, 230, canvas.width, 70);

      // Draw player
      ctx.fillStyle = gameData.current.player.color;
      ctx.fillRect(
        gameData.current.player.x,
        gameData.current.player.y,
        gameData.current.player.width,
        gameData.current.player.height
      );

      // Draw obstacles
      gameData.current.obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, 200, obstacle.width, obstacle.height);
      });

      // Draw coins
      gameData.current.coins.forEach(coin => {
        if (!coin.collected) {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw score
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#000';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(`High Score: ${highScore}`, 10, 60);
    };

    const gameLoop = () => {
      if (gameState === GAME_STATES.PLAYING) {
        update();
        draw();
        gameData.current.gameLoop = requestAnimationFrame(gameLoop);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    gameData.current.gameLoop = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(gameData.current.gameLoop);
    };
  }, [gameState, score]);

  const handleStartClick = () => {
    setGameState(GAME_STATES.PLAYING);
  };

  const handleRestartClick = () => {
    resetGame();
    setGameState(GAME_STATES.PLAYING);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="border border-gray-300 rounded-lg shadow-lg"
        onClick={() => gameState === GAME_STATES.MENU && handleStartClick()}
      />
      
      {gameState === GAME_STATES.MENU && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h3 className="mb-4 text-xl font-bold">🎮 Mario Runner</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500 rounded-full" />
                Player
              </span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-400 rounded-full" />
                Coins
              </span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brown-500 rounded-full" />
                Obstacles
              </span>
            </div>
            <Button
              onClick={handleStartClick}
              className="mt-2 bg-green-500 hover:bg-green-600"
            >
              Start Game
            </Button>
          </div>
        </motion.div>
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="mb-2 text-xl font-bold">Game Over!</h3>
          <p className="mb-4">
            Score: {score} | High Score: {highScore}
          </p>
          <Button
            onClick={handleRestartClick}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Play Again
          </Button>
        </motion.div>
      )}

      {gameState === GAME_STATES.PLAYING && (
        <div className="text-center">
          <p>Press Space to jump!</p>
        </div>
      )}
    </div>
  );
};

export const NoInternet = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
          No Internet Connection
        </h2>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          Please check your internet connection and try again. In the meantime, enjoy this game!
        </p>
        <MarioGame />
      </div>
    </motion.div>
  );
};

export default NoInternet;
