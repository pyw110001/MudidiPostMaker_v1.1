import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface PreviewProps {
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  ratio: string;
}

export function Preview({ isGenerating, generatedImage, error, ratio }: PreviewProps) {
  // Calculate aspect ratio for the container
  const [w, h] = ratio.split(':').map(Number);
  const aspectRatio = w / h;

  return (
    <div className="flex-1 relative flex items-center justify-center p-12 bg-[#0a0a0c]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-red-400 max-w-md text-center p-8 bg-red-500/5 rounded-3xl border border-red-500/10"
            >
              <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
              <p className="font-medium">{error}</p>
            </motion.div>
          ) : isGenerating ? (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-400 tracking-widest uppercase">正在绘制海报... (Crafting your poster...)</p>
            </motion.div>
          ) : generatedImage ? (
            <motion.div 
              key="image"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-h-full max-w-full flex items-center justify-center"
              style={{ aspectRatio }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                <img 
                  src={generatedImage} 
                  alt="Generated Poster" 
                  className="w-full h-full object-contain bg-black/50"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <a 
                    href={generatedImage} 
                    download={`poster-${Date.now()}.png`}
                    className="px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform shadow-xl"
                  >
                    下载高清大图 (Download High-Res)
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-zinc-600"
            >
              <div className="w-24 h-24 rounded-3xl border border-dashed border-zinc-700 flex items-center justify-center mb-6 bg-zinc-900/50">
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium tracking-wide">等待生成 (Ready to create)</p>
              <p className="text-xs mt-2 opacity-50">MUDIDI ARCHITECT × GEMINI 3.1 PRO</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
