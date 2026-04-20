import React, { useMemo, useRef, useState } from 'react';
import { ChevronRight, Minus, Plus, Upload, X } from 'lucide-react';

interface SidebarProps {
  referenceImage: { data: string; mime: string } | null;
  setReferenceImage: (img: { data: string; mime: string } | null) => void;
  quantity: string;
  setQuantity: (val: string) => void;
  emotion: string;
  setEmotion: (val: string) => void;
  season: string;
  setSeason: (val: string) => void;
  holiday: string;
  setHoliday: (val: string) => void;
  action: string;
  setAction: (val: string) => void;
  scene: string;
  setScene: (val: string) => void;
  ratio: string;
  setRatio: (val: string) => void;
  promptPreview: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

function Group({
  title,
  isOpen,
  onToggle,
  dotClassName,
  children
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  dotClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden transition-colors hover:border-white/12">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3.5 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors"
      >
        <span className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[var(--text-2)] font-medium">
          <span className={`w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold-glow)] ${dotClassName ?? ''}`} />
          {title}
        </span>
        <ChevronRight className={`w-3.5 h-3.5 text-[var(--text-3)] transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen ? <div className="p-3.5 bg-[var(--bg-panel)] space-y-3">{children}</div> : null}
    </section>
  );
}

function TagList({
  options,
  selected,
  onSelect
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className={`h-7 px-3 rounded-full border text-xs transition-all ${
            selected === item
              ? 'border-[var(--gold)] bg-[linear-gradient(135deg,rgba(245,166,35,0.2),rgba(245,166,35,0.08))] text-[var(--gold-light)]'
              : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-2)] hover:border-[var(--border-hi)] hover:text-[var(--gold-light)]'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function Sidebar({
  referenceImage,
  setReferenceImage,
  quantity,
  setQuantity,
  emotion,
  setEmotion,
  season,
  setSeason,
  holiday,
  setHoliday,
  action,
  setAction,
  scene,
  setScene,
  ratio,
  setRatio,
  promptPreview,
  onGenerate,
  isGenerating
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    reference: true,
    character: true,
    scene: true,
    output: true
  });

  const qtyValue = useMemo(() => {
    const parsed = Number(quantity);
    if (Number.isNaN(parsed)) return 1;
    return Math.max(1, Math.min(20, parsed));
  }, [quantity]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage({
        data: reader.result as string,
        mime: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const adjustQuantity = (delta: number) => {
    const next = Math.max(1, Math.min(20, qtyValue + delta));
    setQuantity(String(next));
  };

  const ratioOptions = ['2:3', '1:1', '3:2', '4:5', '3:4'];
  const emotionOptions = ['无 (None)', '开心 😊', '惊喜 😮', '思考 🤔', '调皮 😜', '大哭', '震惊', '比心', '谢谢', '赞'];
  const seasonOptions = ['春 (Spring)', '夏 (Summer)', '秋 (Autumn)', '冬 (Winter)', '无 (None)'];
  const holidayOptions = ['无 (None)', '春节 (Spring Festival)', '中秋 (Mid-Autumn)', '端午', '元旦 (New Year)', '圣诞 (Christmas)'];

  return (
    <aside className="bg-[var(--bg-panel)] border-r border-[var(--border)] flex flex-col min-h-0 max-lg:border-r-0 max-lg:border-b">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="grid grid-cols-3 gap-1.5">
          {['夏日美食', '节日贺卡', '品牌海报'].map((item) => (
            <button
              key={item}
              type="button"
              className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] text-[11px] text-[var(--text-2)] hover:border-[var(--border-hi)] hover:text-[var(--gold-light)] hover:bg-[var(--gold-dim)] transition-all"
            >
              {item}
            </button>
          ))}
        </div>

        <Group
          title="参考角色"
          isOpen={openGroups.reference}
          onToggle={() => setOpenGroups((prev) => ({ ...prev, reference: !prev.reference }))}
        >
          <div
            onClick={() => !referenceImage && fileInputRef.current?.click()}
            className={`relative rounded-[var(--radius-md)] overflow-hidden border border-dashed transition-all ${
              referenceImage
                ? 'border-[var(--border-hi)] bg-[var(--gold-dim)]'
                : 'border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.04)] hover:border-[rgba(245,166,35,0.45)] cursor-pointer'
            }`}
          >
            {referenceImage ? (
              <div className="relative">
                <img src={referenceImage.data} alt="Reference" className="w-full h-[120px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2.5 flex items-end justify-between">
                  <span className="text-[10px] text-white/70">当前参考图</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="h-6 px-2.5 rounded-full bg-[rgba(245,166,35,0.92)] text-[#1a1200] text-[11px] font-medium"
                  >
                    更换
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReferenceImage(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-[120px] flex flex-col items-center justify-center gap-2 text-[var(--text-3)]">
                <Upload className="w-5 h-5" />
                <span className="text-[11px]">点击上传参考图</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setReferenceImage(null)}
              className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] text-[11px] text-[var(--text-2)] hover:border-[var(--border-hi)] hover:text-[var(--gold)] transition-all"
            >
              清除
            </button>
            <button type="button" className="h-8 rounded-[var(--radius-sm)] border border-[var(--border-hi)] bg-[var(--gold-dim)] text-[11px] text-[var(--gold-light)]">
              权重 0.8
            </button>
          </div>
        </Group>

        <Group
          title="角色设置"
          dotClassName="bg-[#7ec8e3] shadow-[0_0_8px_rgba(126,200,227,0.6)]"
          isOpen={openGroups.character}
          onToggle={() => setOpenGroups((prev) => ({ ...prev, character: !prev.character }))}
        >
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">数量</div>
            <div className="w-fit h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] flex items-center overflow-hidden">
              <button type="button" onClick={() => adjustQuantity(-1)} className="w-9 h-9 flex items-center justify-center text-[var(--text-2)] hover:text-[var(--gold)] hover:bg-[var(--bg-hover)]">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="w-12 h-9 border-x border-[var(--border)] flex items-center justify-center text-sm font-medium">{qtyValue}</div>
              <button type="button" onClick={() => adjustQuantity(1)} className="w-9 h-9 flex items-center justify-center text-[var(--text-2)] hover:text-[var(--gold)] hover:bg-[var(--bg-hover)]">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">表情</div>
            <TagList options={emotionOptions} selected={emotion} onSelect={setEmotion} />
          </div>
        </Group>

        <Group
          title="场景氛围"
          dotClassName="bg-[#8ec98a] shadow-[0_0_8px_rgba(142,201,138,0.6)]"
          isOpen={openGroups.scene}
          onToggle={() => setOpenGroups((prev) => ({ ...prev, scene: !prev.scene }))}
        >
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">季节</div>
            <TagList options={seasonOptions} selected={season} onSelect={setSeason} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">节日</div>
            <TagList options={holidayOptions} selected={holiday} onSelect={setHoliday} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">动作描述</div>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={2}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-2 text-[13px] outline-none resize-none transition-all focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]"
              placeholder="描述角色正在做什么..."
            />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">场景描述</div>
            <textarea
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              rows={2}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-2 text-[13px] outline-none resize-none transition-all focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]"
              placeholder="描述场景环境..."
            />
          </div>
        </Group>

        <Group
          title="构图输出"
          dotClassName="bg-[#c8a3e0] shadow-[0_0_8px_rgba(200,163,224,0.6)]"
          isOpen={openGroups.output}
          onToggle={() => setOpenGroups((prev) => ({ ...prev, output: !prev.output }))}
        >
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">画面比例</div>
            <div className="grid grid-cols-5 gap-1.5">
              {ratioOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRatio(item)}
                  className={`h-11 rounded-[var(--radius-sm)] border text-[11px] transition-all ${
                    ratio === item
                      ? 'border-[var(--gold)] bg-[var(--gold-dim)] text-[var(--gold-light)]'
                      : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-2)] hover:border-[var(--border-hi)] hover:text-[var(--gold-light)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 tracking-[0.05em]">提示词预览</div>
            <div className="bg-black/25 border border-[var(--border)] rounded-[var(--radius-sm)] p-2.5 text-[11px] leading-relaxed text-[var(--text-3)] max-h-28 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
              {promptPreview}
            </div>
          </div>
        </Group>
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-panel)]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full h-12 rounded-[var(--radius-md)] border border-transparent bg-[linear-gradient(135deg,#f5a623_0%,#e07b0a_50%,#f5a623_100%)] text-[#1a0f00] font-display text-sm tracking-[0.08em] uppercase font-bold shadow-[0_6px_24px_rgba(245,166,35,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(245,166,35,0.45)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isGenerating ? '生成中...' : '立即生成'}
        </button>
      </div>
    </aside>
  );
}
