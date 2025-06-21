import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
}

const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    const numStars = 800;
    const speed = 0.5;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 1000,
          prevX: 0,
          prevY: 0,
        });
      }
    };

    const updateStars = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Mouse influence
      const mouseInfluence = 0.0001;
      const mouseX = (mouseRef.current.x - centerX) * mouseInfluence;
      const mouseY = (mouseRef.current.y - centerY) * mouseInfluence;

      stars.forEach((star) => {
        star.prevX = star.x;
        star.prevY = star.y;
        
        star.z -= speed + mouseY * 100;
        
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
          star.z = 1000;
          star.prevX = star.x;
          star.prevY = star.y;
        }
        
        // Add mouse influence to star movement
        star.x += mouseX * star.z;
        star.y += mouseY * star.z * 0.5;
      });
    };

    const drawStars = () => {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach((star) => {
        const x = (star.x / star.z) * canvas.width + centerX;
        const y = (star.y / star.z) * canvas.height + centerY;
        const prevX = (star.prevX / (star.z + speed)) * canvas.width + centerX;
        const prevY = (star.prevY / (star.z + speed)) * canvas.height + centerY;

        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
          const size = (1 - star.z / 1000) * 2;
          const opacity = 1 - star.z / 1000;

          // Create teal-to-white gradient based on speed
          const speed = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
          const hue = Math.max(0, 180 - speed * 10); // Teal to white
          
          ctx.strokeStyle = `hsla(${hue}, 70%, ${50 + speed * 5}%, ${opacity})`;
          ctx.lineWidth = size;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();

          // Add a bright center dot for closer stars
          if (star.z < 200) {
            ctx.fillStyle = `rgba(72, 209, 204, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    };

    const animate = () => {
      updateStars();
      drawStars();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouseRef.current.x = event.touches[0].clientX;
        mouseRef.current.y = event.touches[0].clientY;
      }
    };

    const handleResize = () => {
      resizeCanvas();
      initStars();
    };

    resizeCanvas();
    initStars();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
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
      }}
    />
  );
};

export default StarfieldBackground;