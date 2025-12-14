import React, { useMemo } from 'react';

interface HarmonyDisplayProps {
    hue: number;
    saturation: number;
    value: number;
    onSelectColor: (h: number, s: number, v: number) => void;
}

// Helper: HSV to Hex (duplicated from ColorPickerTool for standalone utility, or could be shared)
const hsvToHex = (h: number, s: number, v: number): string => {
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

    const toHex = (n: number) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const HarmonyDisplay: React.FC<HarmonyDisplayProps> = ({ hue, saturation, value, onSelectColor }) => {

    const harmonies = useMemo(() => {
        const normalize = (h: number) => (h < 0 ? h + 360 : h % 360);

        return [
            { name: 'Complementary', hues: [normalize(hue + 180)] },
            { name: 'Analogous', hues: [normalize(hue - 30), normalize(hue + 30)] },
            { name: 'Triadic', hues: [normalize(hue + 120), normalize(hue + 240)] },
            { name: 'Split Comp.', hues: [normalize(hue + 150), normalize(hue + 210)] },
        ];
    }, [hue]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Harmony Rules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {harmonies.map((harmony) => (
                    <div key={harmony.name} className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">{harmony.name}</span>
                        <div className="flex gap-1">
                            {harmony.hues.map((h, i) => {
                                const hex = hsvToHex(h, saturation, value);
                                return (
                                    <button
                                        key={`${harmony.name}-${i}`}
                                        onClick={() => onSelectColor(h, saturation, value)}
                                        className="h-8 w-full rounded-md border border-white/10 shadow-sm transition-transform hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: hex }}
                                        title={`Select ${hex}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
