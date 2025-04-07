
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Globe({
  className,
  containerClassName,
}: {
  className?: string;
  containerClassName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let animationFrameId: number;
    const pixelRatio = window.devicePixelRatio || 1;

    // Set canvas size
    function setCanvasSize() {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
    }
    setCanvasSize();

    // Dot properties
    const dotsArray: {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      startRadius: number;
    }[] = [];
    const numDots = 100;
    const connectionDistance = 100;
    const dotMinRadius = 1;
    const dotMaxRadius = 2;
    
    function createDots() {
      for (let i = 0; i < numDots; i++) {
        const radius = dotMinRadius + Math.random() * (dotMaxRadius - dotMinRadius);
        dotsArray.push({
          x: Math.random() * canvas.clientWidth,
          y: Math.random() * canvas.clientHeight,
          radius,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          startRadius: radius,
        });
      }
    }
    createDots();

    function drawConnection(x1: number, y1: number, x2: number, y2: number, distance: number) {
      const opacity = 1 - distance / connectionDistance;
      ctx.strokeStyle = isDark 
        ? `rgba(255, 255, 255, ${opacity * 0.15})`
        : `rgba(5, 46, 64, ${opacity * 0.15})`;
        
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function drawDots() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw dots and connections
      for (let i = 0; i < dotsArray.length; i++) {
        const dot = dotsArray[i];
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0 ? '#E62F29' : '#0C9D6A';
        ctx.fill();
        
        // Update position
        dot.x += dot.speedX;
        dot.y += dot.speedY;
        
        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.clientWidth) dot.speedX *= -1;
        if (dot.y < 0 || dot.y > canvas.clientHeight) dot.speedY *= -1;
        
        // Draw connections to nearby dots
        for (let j = i + 1; j < dotsArray.length; j++) {
          const otherDot = dotsArray[j];
          const distance = Math.sqrt(
            Math.pow(dot.x - otherDot.x, 2) + Math.pow(dot.y - otherDot.y, 2)
          );
          
          if (distance < connectionDistance) {
            drawConnection(dot.x, dot.y, otherDot.x, otherDot.y, distance);
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(drawDots);
    }
    
    drawDots();
    
    window.addEventListener("resize", setCanvasSize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isDark]);

  return (
    <div className={cn("absolute inset-0 z-0", containerClassName)}>
      <canvas
        ref={canvasRef}
        className={cn("h-full w-full", className)}
      />
    </div>
  );
}
