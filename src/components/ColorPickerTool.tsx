import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RotateCcw, Sun, Moon, Pipette } from 'lucide-react';
import { ColorWheel } from './ColorWheel';
import { ColorSlider } from './ColorSlider';

export function ColorPickerTool() {
    const [whiteCenter, setWhiteCenter] = useState(true);
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(1);
    const [value, setValue] = useState(1);
    const [position, setPosition] = useState({ x: 1, y: 0 });
    const [showCopied, setShowCopied] = useState<'hex' | 'rgb' | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isUserAdjusting, setIsUserAdjusting] = useState(false);
    const [hexInput, setHexInput] = useState("#FF0000");
    const [rgbInput, setRgbInput] = useState("255, 0, 0");

    const hsvToRgb = useCallback((h: number, s: number, v: number) => {
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

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }, []);

    const rgbToHsv = useCallback((r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = 0;
        if (diff === 0) h = 0;
        else if (max === r) h = 60 * ((g - b) / diff % 6);
        else if (max === g) h = 60 * ((b - r) / diff + 2);
        else if (max === b) h = 60 * ((r - g) / diff + 4);
        if (h < 0) h += 360;

        const s = max === 0 ? 0 : diff / max;
        const v = max;

        return { h, s, v };
    }, []);

    const rgb = hsvToRgb(hue, saturation, value);
    const hexColor = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();

    // Sync inputs with state when not editing
    useEffect(() => {
        if (!document.activeElement?.className.includes('hex-input')) {
            setHexInput(hexColor);
        }
        if (!document.activeElement?.className.includes('rgb-input')) {
            setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }, [hexColor, rgb]);

    const calculateWheelPosition = useCallback((h: number, s: number, v: number) => {
        const angleRad = (h * Math.PI) / 180;
        let radius;

        if (v === 1) {
            radius = s;
        } else {
            radius = v;
        }

        return {
            x: Math.cos(angleRad) * radius,
            y: Math.sin(angleRad) * radius
        };
    }, []);

    const updateColorFromRgb = useCallback((r: number, g: number, b: number) => {
        // Clamp values
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        const { h, s, v } = rgbToHsv(r, g, b);

        const shouldBeWhiteCenter = v === 1;
        if (whiteCenter !== shouldBeWhiteCenter) {
            setWhiteCenter(shouldBeWhiteCenter);
        }

        setHue(h);
        setSaturation(s);
        setValue(v);
        setPosition(calculateWheelPosition(h, s, v));
    }, [rgbToHsv, calculateWheelPosition, whiteCenter]);


    const toggleCenterMode = useCallback(() => {
        setWhiteCenter(prev => !prev);
    }, []);

    const reset = useCallback(() => {
        setHue(0);
        setSaturation(1);
        setValue(1);
        setPosition({ x: 1, y: 0 });
        setWhiteCenter(true);
    }, []);

    const handleColorChange = useCallback(({ hue: h, saturation: s, value: v, position: pos }) => {
        setIsUserAdjusting(true);
        setHue(h);
        setSaturation(s);
        setValue(v);
        setPosition(pos);
        setIsUserAdjusting(false);
    }, []);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHexInput(val);

        // Basic Hex Validation
        if (/^#?([0-9A-F]{3}){1,2}$/i.test(val)) {
            let cleanHex = val.replace('#', '');
            if (cleanHex.length === 3) {
                cleanHex = cleanHex.split('').map(char => char + char).join('');
            }

            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);

            updateColorFromRgb(r, g, b);
        }
    };

    const handleRgbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setRgbInput(val);

        const parts = val.split(',').map(p => parseInt(p.trim()));
        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
            updateColorFromRgb(parts[0], parts[1], parts[2]);
        }
    };


    const handleRgbSliderChange = useCallback((r: number, g: number, b: number) => {
        updateColorFromRgb(r, g, b);
    }, [updateColorFromRgb]);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(hexColor);
        setShowCopied('hex');
        setTimeout(() => setShowCopied(null), 2000);
    }, [hexColor]);

    const copyRgbToClipboard = useCallback((rgbVal: { r: number, g: number, b: number }) => {
        const rgbString = `rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`;
        navigator.clipboard.writeText(rgbString);
        setShowCopied('rgb');
        setTimeout(() => setShowCopied(null), 2000);
    }, []);

    const handleEyeDropper = async () => {
        if (!('EyeDropper' in window)) {
            alert('Your browser does not support the EyeDropper API.');
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const eyeDropper = new (window as any).EyeDropper();
            const result = await eyeDropper.open();
            const hex = result.sRGBHex;
            setHexInput(hex);

            // Parse hex from eyedropper
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            updateColorFromRgb(r, g, b);

        } catch (e) {
            console.log('Eyedropper cancelled', e);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-6 border border-white/20">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Color Picker</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleEyeDropper}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl transition-colors backdrop-blur-md border border-purple-500/30"
                    >
                        <Pipette size={18} />
                        <span className="text-sm font-medium hidden sm:inline">Pick Color</span>
                    </button>
                    <button
                        onClick={toggleCenterMode}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-md border border-white/10"
                    >
                        {whiteCenter ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="text-sm font-medium">{whiteCenter ? 'White Center' : 'Black Center'}</span>
                    </button>

                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-md border border-white/10"
                    >
                        <RotateCcw size={18} />
                        <span className="text-sm font-medium">Reset</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                <div className="w-full max-w-md relative">
                    {/* Glow effect behind the wheel */}
                    <div
                        className="absolute inset-0 rounded-full blur-[60px] opacity-20 transition-colors duration-500 pointer-events-none"
                        style={{ backgroundColor: hexColor }}
                    />
                    <ColorWheel
                        size={Math.min(Math.min(window.innerWidth - 64, 400), window.innerHeight - 300)}
                        onChange={handleColorChange}
                        hue={hue}
                        saturation={saturation}
                        value={value}
                        whiteCenter={whiteCenter}
                        position={position}
                    />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-black/20 rounded-2xl w-full lg:w-auto border border-white/5 backdrop-blur-sm">
                    <div
                        className="w-full h-32 md:w-32 md:h-72 rounded-2xl shadow-inner transition-all duration-300 ring-4 ring-white/5 bg-transparent"
                        style={{ backgroundColor: hexColor }}
                    />

                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        {/* Hex Display */}
                        <div className="relative group">
                            <div className="flex items-center justify-between gap-3 bg-black/40 p-3 pl-4 rounded-xl border border-white/10 w-full min-w-[240px]">
                                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider select-none">HEX</span>
                                <div className="flex items-center gap-2 flex-grow">
                                    <input
                                        type="text"
                                        value={hexInput}
                                        onChange={handleHexChange}
                                        className="hex-input bg-transparent border-none text-white font-mono text-lg uppercase focus:ring-0 w-full text-right p-0"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                                        title="Copy Hex Code"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                            {showCopied === 'hex' && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-up z-10">
                                    Copied!
                                </span>
                            )}
                        </div>

                        {/* RGB Display */}
                        <div className="relative group">
                            <div className="flex items-center justify-between gap-3 bg-black/40 p-3 pl-4 rounded-xl border border-white/10 w-full min-w-[240px]">
                                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider select-none">RGB</span>
                                <div className="flex items-center gap-2 flex-grow">
                                    <input
                                        type="text"
                                        value={rgbInput}
                                        onChange={handleRgbInputChange} // Use handleRgbInputChange here
                                        className="rgb-input bg-transparent border-none text-white font-mono text-lg focus:ring-0 w-full text-right p-0"
                                    />
                                    <button
                                        onClick={() => copyRgbToClipboard(rgb)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                                        title="Copy RGB Values"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                            {showCopied === 'rgb' && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-up z-10">
                                    Copied!
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4">
                    <ColorSlider
                        label="R"
                        value={rgb.r}
                        max={255}
                        color="#FF4444"
                        onChange={(v) => handleRgbSliderChange(v, rgb.g, rgb.b)}
                    />
                    <ColorSlider
                        label="G"
                        value={rgb.g}
                        max={255}
                        color="#44FF44"
                        onChange={(v) => handleRgbSliderChange(rgb.r, v, rgb.b)}
                    />
                    <ColorSlider
                        label="B"
                        value={rgb.b}
                        max={255}
                        color="#4444FF"
                        onChange={(v) => handleRgbSliderChange(rgb.r, rgb.g, v)}
                    />
                </div>
            </div>
        </div>
    );
}
