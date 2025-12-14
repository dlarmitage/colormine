import React, { useState } from 'react';
import { Plus, Trash2, Download, Copy, FileCode, FileJson } from 'lucide-react';

interface PaletteManagerProps {
    currentColor: string; // hex
}

export const PaletteManager: React.FC<PaletteManagerProps> = ({ currentColor }) => {
    const [palette, setPalette] = useState<string[]>([]);

    const addColor = () => {
        if (!palette.includes(currentColor)) {
            setPalette([...palette, currentColor]);
        }
    };

    const removeColor = (color: string) => {
        setPalette(palette.filter(c => c !== color));
    };

    const exportCSS = () => {
        const cssContent = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
        downloadFile(cssContent, 'palette.css', 'text/css');
    };

    const exportJSON = () => {
        const jsonContent = JSON.stringify(palette, null, 2);
        downloadFile(jsonContent, 'palette.json', 'application/json');
    };

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const copyPalette = () => {
        navigator.clipboard.writeText(palette.join(', '));
        // Could add toast here
    };


    return (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">My Palette ({palette.length})</h3>
                <button
                    onClick={addColor}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-medium rounded-lg transition-colors border border-blue-500/30"
                >
                    <Plus size={14} />
                    Add Current
                </button>
            </div>

            {palette.length > 0 ? (
                <>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {palette.map((color) => (
                            <div key={color} className="group relative">
                                <div
                                    className="w-10 h-10 rounded-lg border border-white/10 shadow-sm"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                                <button
                                    onClick={() => removeColor(color)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <button onClick={exportCSS} className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-colors">
                            <FileCode size={14} /> CSS
                        </button>
                        <button onClick={exportJSON} className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-colors">
                            <FileJson size={14} /> JSON
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-6 text-gray-600 text-xs italic bg-black/20 rounded-xl border border-dashed border-white/5">
                    Add colors to build a set
                </div>
            )}
        </div>
    );
};
