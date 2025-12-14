import React, { useRef, useEffect, useCallback, useState } from 'react';

interface ColorWheelProps {
  size: number;
  onChange: (color: {
    hue: number;
    saturation: number;
    value: number;
    position: { x: number; y: number };
  }) => void;
  hue: number;
  saturation: number;
  value: number;
  whiteCenter: boolean;
  position: { x: number; y: number };
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
  size: initialSize,
  onChange,
  whiteCenter,
  position
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);
  const lastDrawTime = useRef(0);
  const wheelImageData = useRef<ImageData | null>(null);

  const hsvToRgb = useCallback((h: number, s: number, v: number): [number, number, number] => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }, []);

  const createWheelBuffer = useCallback(() => {
    if (!bufferCanvasRef.current) return;

    const canvas = bufferCanvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true
    });
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 2;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dxSquared = dx * dx;

      for (let y = 0; y < size; y++) {
        const dy = y - centerY;
        const distanceSquared = dxSquared + dy * dy;
        const radiusSquared = radius * radius;

        if (distanceSquared <= radiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const normalizedAngle = angle < 0 ? angle + 360 : angle;
          const distanceRatio = distance / radius;

          let s, v;
          if (whiteCenter) {
            s = distanceRatio;
            v = 1;
          } else {
            s = 1;
            v = distanceRatio;  // Changed: Removed the 1 - distanceRatio
          }

          const [r, g, b] = hsvToRgb(normalizedAngle, s, v);

          const idx = (y * size + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        } else {
          const idx = (y * size + x) * 4;
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    wheelImageData.current = imageData;
  }, [size, whiteCenter, hsvToRgb]);

  const drawWheel = useCallback(() => {
    if (!canvasRef.current || !bufferCanvasRef.current) return;

    const now = performance.now();
    if (now - lastDrawTime.current < 16) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(bufferCanvasRef.current, 0, 0);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 2;
    const selectorX = centerX + position.x * radius;
    const selectorY = centerY + position.y * radius;

    ctx.beginPath();
    ctx.arc(selectorX, selectorY, 6, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(selectorX, selectorY, 5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    lastDrawTime.current = now;
  }, [size, position]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const newSize = Math.min(containerWidth, window.innerHeight - 200);
      setSize(newSize);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bufferCanvas = bufferCanvasRef.current;
    if (!canvas || !bufferCanvas) return;

    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    bufferCanvas.width = size * scale;
    bufferCanvas.height = size * scale;

    const ctx = canvas.getContext('2d');
    const bufferCtx = bufferCanvas.getContext('2d');

    if (ctx && bufferCtx) {
      ctx.scale(scale, scale);
      bufferCtx.scale(scale, scale);
    }

    wheelImageData.current = null;
    createWheelBuffer();
    drawWheel();
  }, [size, createWheelBuffer, drawWheel]);

  useEffect(() => {
    wheelImageData.current = null;
    createWheelBuffer();
    drawWheel();
  }, [size, createWheelBuffer, drawWheel]);

  useEffect(() => {
    drawWheel();
  }, [position, drawWheel]);

  const handleInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = size / 2;
    const centerY = size / 2;
    const dx = x - centerX;
    const dy = y - centerY;

    const radius = (size / 2) - 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Allow clicking slightly outside (padding) for better UX
    if (distance <= radius + 10) {
      const normalizedX = dx / radius;
      const normalizedY = dy / radius;
      // Clamp distance ratio to 1
      const distanceRatio = Math.min(distance / radius, 1);

      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      let s, v;
      if (whiteCenter) {
        s = distanceRatio;
        v = 1;
      } else {
        s = 1;
        v = distanceRatio;
      }

      onChange({
        hue: angle,
        saturation: s,
        value: v,
        position: { x: normalizedX, y: normalizedY }
      });
    }
  }, [size, onChange, whiteCenter]);

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto">
      <canvas
        ref={bufferCanvasRef}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="touch-none cursor-pointer rounded-full shadow-lg mx-auto"
        onClick={handleInteraction}
        onMouseDown={handleInteraction}
        onMouseMove={(e) => e.buttons === 1 && handleInteraction(e)}
        onTouchStart={(e) => {
          e.preventDefault();
          handleInteraction(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          handleInteraction(e);
        }}
      />
    </div>
  );
};