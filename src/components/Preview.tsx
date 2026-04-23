import React, { useEffect, useMemo, useState } from 'react';
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
  onRegenerate: () => void;
  onGenerateVariant: () => void;
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
  onRegenerate,
  onGenerateVariant,
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

  const aspectRatio = useMemo(() => {
    const [w, h] = ratio.split(':').map(Number);
    return Number.isFinite(w / h) ? w / h : 3 / 4;
  }, [ratio]);

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
    <section className="bg-[var(--paper)] flex flex-col min-h-0 relative overflow-hidden">
      <div className="h-12 shrink-0 border-b-[3px] border-[var(--ink)] bg-[var(--paper)] px-0 flex items-center justify-between">
        <div className="flex items-stretch h-full">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-5 text-[10px] uppercase tracking-[0.12em] border-r-2 border-[var(--ink)] ${activeTab === 'preview' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-neutral-500 hover:bg-[var(--lgray)]'}`}
          >
            预览
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`px-5 text-[10px] uppercase tracking-[0.12em] border-r-2 border-[var(--ink)] ${activeTab === 'prompt' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-neutral-500 hover:bg-[var(--lgray)]'}`}
          >
            提示词
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`px-5 text-[10px] uppercase tracking-[0.12em] border-r-2 border-[var(--ink)] ${activeTab === 'meta' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-neutral-500 hover:bg-[var(--lgray)]'}`}
          >
            元数据
          </button>
        </div>
        <div className="flex items-stretch h-full border-l-[3px] border-[var(--ink)]">
          <button
            type="button"
            onClick={handleOpenImage}
            className="w-12 flex items-center justify-center border-r-2 border-[var(--ink)] text-neutral-500 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            title="放大"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadCurrent}
            className="w-12 flex items-center justify-center border-r-2 border-[var(--ink)] text-neutral-500 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            title="下载"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="w-12 flex items-center justify-center border-r-2 border-[var(--ink)] text-neutral-500 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            title="复制"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="w-12 flex items-center justify-center border-r-2 border-[var(--ink)] text-neutral-500 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            title="分享"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleBatchExport}
            disabled={history.length === 0}
            className="w-12 flex items-center justify-center text-[var(--red)] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {actionHint ? <div className="px-4 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--red)] border-b-2 border-[var(--ink)]">{actionHint}</div> : null}

      <div className="flex-1 min-h-0 p-4 lg:p-8 flex items-center justify-center relative bg-[linear-gradient(0deg,transparent,transparent_29px,var(--lgray)_29px,var(--lgray)_30px),linear-gradient(90deg,transparent,transparent_29px,var(--lgray)_29px,var(--lgray)_30px)]">
        {activeTab === 'prompt' ? (
          <div className="w-full h-full border-[3px] border-[var(--ink)] bg-[var(--paper)] p-4 overflow-y-auto custom-scrollbar">
            <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono">{promptPreview || '暂无提示词'}</pre>
          </div>
        ) : activeTab === 'meta' ? (
          <div className="w-full h-full border-[3px] border-[var(--ink)] bg-[var(--paper)] p-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(meta).map(([key, value]) => (
                <div key={key} className="border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2">
                  <div className="text-[9px] uppercase tracking-[0.08em] text-neutral-500">{key}</div>
                  <div className="text-[11px] break-words">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="border-[3px] border-[var(--red)] bg-[var(--paper)] px-6 py-4 text-[var(--red)] text-sm">
            {error}
          </div>
        ) : generatedImage ? (
          <div className="relative max-h-full max-w-full" style={{ aspectRatio }}>
            <div className="relative overflow-hidden border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] group bg-[var(--paper)]">
              <img src={generatedImage} alt="Generated Poster" className="w-full h-full object-contain" />
              <div className="absolute inset-x-0 bottom-0 bg-[var(--paper)] border-t-2 border-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity flex">
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex-1 py-2 text-[9px] tracking-[0.1em] uppercase border-r-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                >
                  重新生成
                </button>
                <button
                  type="button"
                  onClick={onGenerateVariant}
                  className="flex-1 py-2 text-[9px] tracking-[0.1em] uppercase border-r-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                >
                  生成变体
                </button>
                <a
                  href={generatedImage}
                  download={`poster-${Date.now()}.png`}
                  className="flex-1 py-2 text-center text-[9px] tracking-[0.1em] uppercase hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                >
                  放大高清
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <div className="w-20 h-20 border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center">
              <ImageIcon className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm">等待生成 (Ready to create)</p>
          </div>
        )}

        {isGenerating ? (
          <div className="absolute inset-0 bg-[var(--paper)]/90 z-20 flex flex-col items-center justify-center gap-5">
            <div className="w-14 h-14 rounded-full border-2 border-[var(--lgray)] border-t-[var(--ink)] animate-spin" />
            <div className="w-56">
              <p className="text-xs mb-2 tracking-[0.1em] text-center">正在构图中...</p>
              <div className="h-2 border-2 border-[var(--ink)] overflow-hidden">
                <div className="h-full bg-[var(--ink)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="h-24 shrink-0 border-t-[3px] border-[var(--ink)] bg-[var(--paper)] px-0 py-0 flex items-stretch gap-0 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={handleBatchExport}
          disabled={history.length === 0}
          className="h-full px-3 border-r-2 border-[var(--ink)] text-[10px] uppercase tracking-[0.1em] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          一键导出 ({history.length})
        </button>
        {history.length === 0 ? (
          <div className="h-full flex-1 min-w-[180px] flex items-center justify-center text-[11px] text-neutral-500">
            暂无历史记录
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectHistory(item.url)}
              className={`h-full w-[76px] overflow-hidden border-r-2 border-[var(--ink)] transition-all shrink-0 ${
                generatedImage === item.url
                  ? 'outline outline-4 outline-[var(--red)] outline-offset-[-4px]'
                  : 'hover:brightness-110'
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
