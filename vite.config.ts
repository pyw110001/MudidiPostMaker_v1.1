import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // 桌面端必须把密钥交给用户本机保存；不能把构建机 .env 打进包，否则会跳过输入框
  const isElectronBundle = mode === 'electron';
  // Vercel / CI 只在 process.env 里注入变量，不会写入 .env 文件；loadEnv 读不到，需合并
  const geminiInBundle = isElectronBundle
    ? ''
    : String(
        env.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          ''
      ).trim();
  const apiKeyInBundle = isElectronBundle
    ? ''
    : String(
        env.API_KEY ||
          process.env.API_KEY ||
          env.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          ''
      ).trim();
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiInBundle),
      'process.env.API_KEY': JSON.stringify(apiKeyInBundle),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
