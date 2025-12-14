import React from 'react';

interface ColorSliderProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  onChange: (value: number) => void;
}

export const ColorSlider: React.FC<ColorSliderProps> = ({ label, value, max, color, onChange }) => {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="w-8 text-sm font-medium text-white">{label}</span>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-6 rounded-lg appearance-none cursor-pointer touch-action-manipulation"
        style={{
          background: color
            ? `linear-gradient(to right, #000, ${color})`
            : undefined,
        }}
      />
      <span className="w-12 text-right text-sm font-mono text-white">{Math.round(value)}</span>
    </div>
  );
};