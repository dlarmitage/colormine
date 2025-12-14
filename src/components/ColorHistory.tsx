import React, { useEffect, useState } from 'react';

interface ColorHistoryProps {
    currentColor: string; // The hex color currently selected
    onSelectColor: (hex: string) => void;
    triggerSave: boolean; // Toggle to trigger a save
}

export const ColorHistory: React.FC<ColorHistoryProps> = ({ currentColor, onSelectColor, triggerSave }) => {
    const [history, setHistory] = useState<string[]>([]);

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem('colorMine_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    // Save color when triggerSave toggles
    useEffect(() => {
        // Don't save on initial load or if empty
        if (!currentColor) return;

        setHistory(prev => {
            // Remove if existing to move to top
            const filtered = prev.filter(c => c !== currentColor);
            const newHistory = [currentColor, ...filtered].slice(0, 10);
            localStorage.setItem('colorMine_history', JSON.stringify(newHistory));
            return newHistory;
        });
    }, [triggerSave, currentColor]);

    if (history.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 w-full">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recent Colors</h3>
            <div className="flex gap-2 flex-wrap">
                {history.map((color) => (
                    <button
                        key={color}
                        onClick={() => onSelectColor(color)}
                        className="w-8 h-8 rounded-full border border-white/10 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Select color ${color}`}
                    />
                ))}
            </div>
        </div>
    );
};
