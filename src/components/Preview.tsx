import React, { useEffect, useState } from 'react';
import {
  Copy,
  Download,
  Expand,
  Image as ImageIcon,
  Maximize2,
  RefreshCw,
  Share2,
  Sparkles
} from 'lucide-react';
import { HistoryItem } from '../App';

interface PreviewProps {
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  ratio: string;
  history: HistoryItem[];
  onSelectHistory: (url: string) => void;
  promptPreview: string;
  meta: Record<string, string>;
}

export function Preview({
  isGenerating,
  generatedImage,
  error,
  ratio,
  history,
  onSelectHistory,
  promptPreview,
  meta
}: PreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'prompt' | 'meta'>('preview');
  const [progress, setProgress] = useState(0);
  const [actionHint, setActionHint] = useState('');

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(98, prev + Math.random() * 12 + 3));
    }, 280);
    return () => clearInterval(timer);
  }, [isGenerating]);

  const [w, h] = ratio.split(':').map(Number);
  const aspectRatio = Number.isFinite(w / h) ? w / h : 3 / 4;

  useEffect(() => {
    if (!actionHint) return;
    const timer = setTimeout(() => setActionHint(''), 1800);
    return () => clearTimeout(timer);
  }, [actionHint]);

  const handleBatchExport = () => {
    if (history.length === 0) return;
    history.forEach((item, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.url;
        a.download = `mudidi-poster-${item.timestamp}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 400);
    });
  };

  const handleOpenImage = () => {
    if (!generatedImage) {
      setActionHint('暂无可放大的图片');
      return;
    }
    window.open(generatedImage, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCurrent = () => {
    if (!generatedImage) {
      setActionHint('暂无可下载的图片');
      return;
    }
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `mudidi-poster-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setActionHint('已开始下载');
  };

  const handleCopy = async () => {
    if (!generatedImage) {
      setActionHint('暂无可复制内容');
      return;
    }
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const res = await fetch(generatedImage);
        const blob = await res.blob();
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        setActionHint('已复制图片到剪贴板');
        return;
      }
      await navigator.clipboard.writeText(generatedImage);
      setActionHint('已复制图片链接');
    } catch {
      setActionHint('复制失败，请手动复制');
    }
  };

  const handleShare = async () => {
    if (!generatedImage) {
      setActionHint('暂无可分享的图片');
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mudidi Poster',
          text: '查看我生成的 Mudidi 海报',
          url: generatedImage
        });
        setActionHint('已调用系统分享');
        return;
      }
      await navigator.clipboard.writeText(generatedImage);
      setActionHint('设备不支持系统分享，已复制链接');
    } catch {
      setActionHint('分享已取消');
    }
  };

  return (
    <section className="bg-[var(--bg-deep)] flex flex-col min-h-0 relative overflow-hidden">
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.06)_0%,transparent_72%)] pointer-events-none" />

      <div className="h-12 shrink-0 border-b border-[var(--border)] bg-black/30 backdrop-blur-lg px-4 flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`h-7 px-3 rounded-md text-xs transition-all ${activeTab === 'preview' ? 'bg-[var(--bg-hover)] text-[var(--text-1)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
          >
            预览
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`h-7 px-3 rounded-md text-xs transition-all ${activeTab === 'prompt' ? 'bg-[var(--bg-hover)] text-[var(--text-1)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
          >
            提示词
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`h-7 px-3 rounded-md text-xs transition-all ${activeTab === 'meta' ? 'bg-[var(--bg-hover)] text-[var(--text-1)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
          >
            元数据
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenImage}
            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)] hover:border-[var(--border-hi)] hover:bg-[var(--bg-hover)] transition-all"
            title="放大"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadCurrent}
            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)] hover:border-[var(--border-hi)] hover:bg-[var(--bg-hover)] transition-all"
            title="下载"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)] hover:border-[var(--border-hi)] hover:bg-[var(--bg-hover)] transition-all"
            title="复制"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)] hover:border-[var(--border-hi)] hover:bg-[var(--bg-hover)] transition-all"
            title="分享"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleBatchExport}
            disabled={history.length === 0}
            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border-hi)] flex items-center justify-center text-[var(--gold)] bg-[var(--gold-dim)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {actionHint ? <div className="px-4 py-1 text-[11px] text-[var(--gold-light)]">{actionHint}</div> : null}

      <div className="flex-1 min-h-0 p-4 lg:p-6 flex items-center justify-center relative">
        {activeTab === 'prompt' ? (
          <div className="w-full h-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/25 p-4 overflow-y-auto custom-scrollbar">
            <pre className="text-[12px] leading-relaxed text-[var(--text-2)] whitespace-pre-wrap font-mono">{promptPreview || '暂无提示词'}</pre>
          </div>
        ) : activeTab === 'meta' ? (
          <div className="w-full h-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/25 p-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(meta).map(([key, value]) => (
                <div key={key} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                  <div className="text-[11px] text-[var(--text-3)]">{key}</div>
                  <div className="text-[12px] text-[var(--text-1)] break-words">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-950/20 px-6 py-4 text-red-300 text-sm">
            {error}
          </div>
        ) : generatedImage ? (
          <div className="relative max-h-full max-w-full" style={{ aspectRatio }}>
            <div className="relative rounded-[var(--radius-xl)] overflow-hidden border border-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.7)] group">
              <img src={generatedImage} alt="Generated Poster" className="w-full h-full object-contain bg-black/45" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                <button type="button" className="h-8 px-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs text-white hover:border-[var(--gold)] hover:text-[var(--gold-light)] transition-all">
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  重新生成
                </button>
                <button type="button" className="h-8 px-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs text-white hover:border-[var(--gold)] hover:text-[var(--gold-light)] transition-all">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  生成变体
                </button>
                <a
                  href={generatedImage}
                  download={`poster-${Date.now()}.png`}
                  className="h-8 px-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs text-white hover:border-[var(--gold)] hover:text-[var(--gold-light)] transition-all inline-flex items-center"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1" />
                  放大高清
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
            <div className="w-20 h-20 rounded-2xl border border-dashed border-white/12 bg-black/20 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm">等待生成 (Ready to create)</p>
          </div>
        )}

        {isGenerating ? (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-5">
            <div className="w-14 h-14 rounded-full border-2 border-[rgba(245,166,35,0.15)] border-t-[var(--gold)] animate-spin" />
            <div className="w-56">
              <p className="text-xs text-[var(--text-2)] mb-2 tracking-[0.04em] text-center">正在构图中...</p>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[linear-gradient(90deg,var(--gold),var(--gold-light))] shadow-[0_0_8px_var(--gold-glow)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="h-24 shrink-0 border-t border-[var(--border)] bg-black/30 backdrop-blur-lg px-4 py-3 flex items-center gap-3 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={handleBatchExport}
          disabled={history.length === 0}
          className="h-full px-3 rounded-[var(--radius-sm)] border border-[var(--border-hi)] bg-[var(--gold-dim)] text-[var(--gold-light)] text-[11px] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          一键导出 ({history.length})
        </button>
        {history.length === 0 ? (
          <div className="h-full flex-1 min-w-[180px] rounded-[var(--radius-sm)] border border-dashed border-white/10 flex items-center justify-center text-[11px] text-[var(--text-3)]">
            暂无历史记录
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectHistory(item.url)}
              className={`h-full aspect-square rounded-[var(--radius-sm)] overflow-hidden border transition-all shrink-0 ${
                generatedImage === item.url
                  ? 'border-[var(--gold)] shadow-[0_0_14px_rgba(245,166,35,0.35)]'
                  : 'border-transparent hover:border-[var(--border-hi)]'
              }`}
            >
              <img src={item.url} alt="History" className="w-full h-full object-cover" />
            </button>
          ))
        )}
      </div>
    </section>
  );
}
