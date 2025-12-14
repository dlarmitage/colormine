
import React, { useEffect } from 'react';
import { Download, Palette, Zap, Layout } from 'lucide-react';
import { ColorPickerTool } from './components/ColorPickerTool';

function App() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  useEffect(() => {
    // Check if PWA install prompt is available
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const scrollToTool = () => {
    document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Outfit'] overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Palette className="w-8 h-8 text-purple-400" />
          <span className="text-2xl font-bold tracking-tight">ColorMine</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
          <button
            onClick={scrollToTool}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all text-sm font-medium"
          >
            Launch App
          </button>
        </div>
      </nav>

      <main className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            New: PWA Support
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent">
            Colors, Elevated.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            The professional color picker for modern designers.
            Experience a fluid color selection workflow with our advanced HSB wheel and
            real-time conversion tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={scrollToTool}
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              Start Creating
              <Palette size={20} />
            </button>
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="px-8 py-4 bg-white/5 text-white font-medium rounded-full hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Install PWA
              <Download size={20} />
            </button>
          </div>
        </section>

        {/* Tool Section */}
        <section id="tool" className="px-4 py-12 md:px-8 max-w-6xl mx-auto mb-20">
          <ColorPickerTool />
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 py-24 max-w-7xl mx-auto border-t border-white/5">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <Zap className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Built with Vite and React for instant load times and smooth 60fps interaction.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <Layout className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">PWA Ready</h3>
              <p className="text-gray-400">Install it on your device and use it offline. Works seamlessly on mobile and desktop.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <Palette className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Professional Grade</h3>
              <p className="text-gray-400">Accurate HSB-RGB conversion with a center-blend mode for precise tint and shade control.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-gray-500 border-t border-white/5 bg-black/50 backdrop-blur-xl">
          <p>© {new Date().getFullYear()} ColorMine. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;