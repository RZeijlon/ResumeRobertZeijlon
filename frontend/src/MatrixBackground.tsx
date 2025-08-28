import { useEffect, useRef } from 'react';

interface MatrixChar {
  x: number;
  y: number;
  char: string;
  alpha: number;
  speed: number;
}

interface MatrixBackgroundProps {
  isDarkMode?: boolean;
}

const MatrixBackground = ({ isDarkMode = true }: MatrixBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const charactersRef = useRef<MatrixChar[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Matrix characters - mix of Japanese katakana, numbers, and symbols
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-*/=()[]{}|\\:;,.?!@#$%^&*~`';
    
    let fontSize = 18;
    let columns = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      fontSize = Math.max(14, Math.min(20, window.innerWidth / 100));
      columns = Math.floor(canvas.width / fontSize);
      initMatrix();
    };

    const initMatrix = () => {
      charactersRef.current = [];
      for (let i = 0; i < columns; i++) {
        // Start some columns with different initial positions for variety
        charactersRef.current.push({
          x: i * fontSize,
          y: Math.random() * canvas.height,
          char: matrixChars.charAt(Math.floor(Math.random() * matrixChars.length)),
          alpha: Math.random(),
          speed: Math.random() * 3 + 2
        });
      }
    };

    const drawMatrix = () => {
      // Create trailing effect with theme-appropriate overlay
      if (isDarkMode) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';  // Dark mode: black trails
      } else {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';  // Light mode: darker gray trails (slate-200)
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'start';

      charactersRef.current.forEach((char, index) => {
        // Create gradient effect - different colors for light/dark themes
        const gradient = ctx.createLinearGradient(0, char.y - fontSize * 10, 0, char.y + fontSize);
        
        if (isDarkMode) {
          // Dark theme: classic green matrix
          gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
          gradient.addColorStop(0.8, `rgba(0, 255, 0, ${char.alpha * 0.8})`);
          gradient.addColorStop(1, `rgba(0, 255, 0, ${char.alpha})`);
        } else {
          // Light theme: soft green tones
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0)');  // green-500 transparent
          gradient.addColorStop(0.8, `rgba(22, 163, 74, ${char.alpha * 0.7})`);  // green-600
          gradient.addColorStop(1, `rgba(21, 128, 61, ${char.alpha * 0.85})`);  // green-700
        }
        
        ctx.fillStyle = gradient;
        ctx.fillText(char.char, char.x, char.y);

        // Add a bright character at the leading edge occasionally
        if (Math.random() < 0.05) {
          if (isDarkMode) {
            ctx.fillStyle = `rgba(255, 255, 255, ${char.alpha})`;  // White in dark mode
          } else {
            ctx.fillStyle = `rgba(16, 185, 129, ${char.alpha * 0.95})`;  // Bright green-500 in light mode
          }
          ctx.fillText(char.char, char.x, char.y);
        }

        // Move character down
        char.y += char.speed;

        // Change character occasionally for dynamic effect
        if (Math.random() < 0.02) {
          char.char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        }

        // Reset when character goes off screen
        if (char.y > canvas.height + fontSize) {
          char.y = -fontSize;
          char.x = index * fontSize;
          char.char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
          char.alpha = Math.random();
          char.speed = Math.random() * 3 + 2;
        }
      });
    };

    const animate = () => {
      drawMatrix();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isDarkMode]);  // Re-run effect when theme changes

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        backgroundColor: isDarkMode ? '#000' : '#e2e8f0',  // Dark: black, Light: darker gray (slate-200)
      }}
    />
  );
};

export default MatrixBackground;