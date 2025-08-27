import { useEffect, useRef } from 'react';

interface MatrixChar {
  x: number;
  y: number;
  char: string;
  alpha: number;
  speed: number;
}

const MatrixBackground = () => {
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
      // Create trailing effect with semi-transparent black overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';  // Short trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'start';

      charactersRef.current.forEach((char, index) => {
        // Create gradient effect - brighter at the front of the "rain"
        const gradient = ctx.createLinearGradient(0, char.y - fontSize * 10, 0, char.y + fontSize);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
        gradient.addColorStop(0.8, `rgba(0, 255, 0, ${char.alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(0, 255, 0, ${char.alpha})`);
        
        ctx.fillStyle = gradient;
        ctx.fillText(char.char, char.x, char.y);

        // Add a bright white character at the leading edge occasionally
        if (Math.random() < 0.05) {
          ctx.fillStyle = `rgba(255, 255, 255, ${char.alpha})`;
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
  }, []);

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
        backgroundColor: '#000',
      }}
    />
  );
};

export default MatrixBackground;