import React, { useMemo, useRef, useState } from 'react';
import { Minus, Plus, Upload, X } from 'lucide-react';

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
  referenceWeight: number;
  setReferenceWeight: (val: number) => void;
  promptPreview: string;
  onGenerate: () => void;
  isGenerating: boolean;
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
  referenceWeight,
  setReferenceWeight,
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
  const nextWeight = referenceWeight >= 1.0 ? 0.6 : Number((referenceWeight + 0.2).toFixed(1));

  const pickPreset = (key: 'summer' | 'holiday' | 'brand') => {
    if (key === 'summer') {
      setSeason('夏 (Summer)');
      setHoliday('无 (None)');
      setAction('围坐在绿色圆桌旁吃点心 (eating dim sum at a round green table)');
      setScene('装饰着荷花的温馨餐厅 (a warm restaurant with lotus decorations)');
    }
    if (key === 'holiday') {
      setSeason('冬 (Winter)');
      setHoliday('春节 (Spring Festival)');
      setAction('一起举灯笼合影并分发红包 (holding lanterns and sharing red envelopes)');
      setScene('挂满灯笼和春联的节日街景 (a festive street with lanterns and spring couplets)');
    }
    if (key === 'brand') {
      setSeason('秋 (Autumn)');
      setHoliday('无 (None)');
      setAction('围绕品牌展台介绍新品并互动 (presenting products around a branded booth)');
      setScene('现代感强烈的品牌快闪展示空间 (a modern branded pop-up showcase space)');
    }
  };

  return (
    <aside className="border-r-[3px] border-[var(--ink)] bg-[var(--paper)] flex flex-col min-h-0 max-lg:border-r-0 max-lg:border-b-[3px]">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-3 border-b-[3px] border-[var(--ink)]">
          <button type="button" onClick={() => pickPreset('summer')} className="py-2 text-[9px] uppercase tracking-[0.1em] border-r-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">夏日<br />美食</button>
          <button type="button" onClick={() => pickPreset('holiday')} className="py-2 text-[9px] uppercase tracking-[0.1em] border-r-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">节日<br />贺卡</button>
          <button type="button" onClick={() => pickPreset('brand')} className="py-2 text-[9px] uppercase tracking-[0.1em] hover:bg-[var(--ink)] hover:text-[var(--paper)]">品牌<br />海报</button>
        </div>

        <section className="border-b-[3px] border-[var(--ink)]">
          <button type="button" onClick={() => setOpenGroups((prev) => ({ ...prev, reference: !prev.reference }))} className="w-full flex items-center justify-between px-3 py-2 border-b-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            <span className="text-[9px] text-neutral-500 tracking-[0.08em]">01</span>
            <span className="font-display text-[18px] flex-1 text-left px-2">参考角色</span>
            <span className={`text-xs transition-transform ${openGroups.reference ? 'rotate-90' : ''}`}>▶</span>
          </button>
          {openGroups.reference ? <div className="p-3 space-y-3"> 
          <div
            onClick={() => !referenceImage && fileInputRef.current?.click()}
            className={`relative overflow-hidden border-[3px] border-[var(--ink)] ${
              referenceImage
                ? 'bg-[var(--paper)]'
                : 'bg-[var(--lgray)] cursor-pointer'
            }`}
          >
            {referenceImage ? (
              <div className="relative">
                <img src={referenceImage.data} alt="Reference" className="w-full h-[120px] object-cover" />
                <div className="absolute inset-0 bg-black/30 p-2.5 flex items-end justify-between">
                  <span className="text-[10px] text-white">当前参考图</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="h-6 px-2 border-2 border-[var(--ink)] bg-[var(--paper)] text-[10px]"
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
                  className="absolute top-2 right-2 w-7 h-7 border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-[120px] flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Upload className="w-5 h-5" />
                <span className="text-[11px]">点击上传参考图</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <div className="grid grid-cols-2 border-[3px] border-[var(--ink)]">
            <button
              type="button"
              onClick={() => setReferenceImage(null)}
              className="h-9 text-[10px] uppercase tracking-[0.1em] border-r-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              清除
            </button>
            <div className="h-9 flex items-center">
            <button
              type="button"
              onClick={() => setReferenceWeight(nextWeight)}
              className="w-full h-full text-[10px] uppercase tracking-[0.1em] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
              title="点击循环切换参考图权重（0.6 / 0.8 / 1.0）"
            >
              权重 {referenceWeight.toFixed(1)}
            </button>
            </div>
          </div>
          </div> : null}
        </section>

        <section className="border-b-[3px] border-[var(--ink)]">
          <button type="button" onClick={() => setOpenGroups((prev) => ({ ...prev, character: !prev.character }))} className="w-full flex items-center justify-between px-3 py-2 border-b-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            <span className="text-[9px] text-neutral-500 tracking-[0.08em]">02</span>
            <span className="font-display text-[18px] flex-1 text-left px-2">角色设置</span>
            <span className={`text-xs transition-transform ${openGroups.character ? 'rotate-90' : ''}`}>▶</span>
          </button>
          {openGroups.character ? <div className="p-3 space-y-3"> 
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">数量 / QTY</div>
            <div className="w-full h-11 border-[3px] border-[var(--ink)] flex items-center">
              <button type="button" onClick={() => adjustQuantity(-1)} className="w-11 h-11 border-r-2 border-[var(--ink)] flex items-center justify-center hover:bg-[var(--ink)] hover:text-[var(--paper)]">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 h-11 flex items-center justify-center font-display text-[32px]">{String(qtyValue).padStart(2, '0')}</div>
              <button type="button" onClick={() => adjustQuantity(1)} className="w-11 h-11 border-l-2 border-[var(--ink)] flex items-center justify-center hover:bg-[var(--ink)] hover:text-[var(--paper)]">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">表情 / EMOTION</div>
            <div className="flex flex-wrap border-[3px] border-[var(--ink)]">
              {emotionOptions.map((item) => (
                <button key={item} type="button" onClick={() => setEmotion(item)} className={`px-2.5 py-2 text-[10px] border-r-2 border-b-2 border-[var(--ink)] ${emotion === item ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-[var(--lgray)]'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          </div> : null}
        </section>

        <section className="border-b-[3px] border-[var(--ink)]">
          <button type="button" onClick={() => setOpenGroups((prev) => ({ ...prev, scene: !prev.scene }))} className="w-full flex items-center justify-between px-3 py-2 border-b-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            <span className="text-[9px] text-neutral-500 tracking-[0.08em]">03</span>
            <span className="font-display text-[18px] flex-1 text-left px-2">场景氛围</span>
            <span className={`text-xs transition-transform ${openGroups.scene ? 'rotate-90' : ''}`}>▶</span>
          </button>
          {openGroups.scene ? <div className="p-3 space-y-3"> 
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">季节 / SEASON</div>
            <div className="flex flex-wrap border-[3px] border-[var(--ink)]">
              {seasonOptions.map((item) => (
                <button key={item} type="button" onClick={() => setSeason(item)} className={`px-2.5 py-2 text-[10px] border-r-2 border-b-2 border-[var(--ink)] ${season === item ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-[var(--lgray)]'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">节日 / HOLIDAY</div>
            <div className="flex flex-wrap border-[3px] border-[var(--ink)]">
              {holidayOptions.map((item) => (
                <button key={item} type="button" onClick={() => setHoliday(item)} className={`px-2.5 py-2 text-[10px] border-r-2 border-b-2 border-[var(--ink)] ${holiday === item ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-[var(--lgray)]'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">动作 / ACTION</div>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={2}
              className="w-full bg-[var(--paper)] border-[3px] border-[var(--ink)] px-3 py-2 text-[12px] outline-none resize-none focus:border-[var(--red)]"
              placeholder="描述角色正在做什么..."
            />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">场景 / SCENE</div>
            <textarea
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              rows={2}
              className="w-full bg-[var(--paper)] border-[3px] border-[var(--ink)] px-3 py-2 text-[12px] outline-none resize-none focus:border-[var(--red)]"
              placeholder="描述场景环境..."
            />
          </div>
          </div> : null}
        </section>

        <section className="border-b-[3px] border-[var(--ink)]">
          <button type="button" onClick={() => setOpenGroups((prev) => ({ ...prev, output: !prev.output }))} className="w-full flex items-center justify-between px-3 py-2 border-b-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            <span className="text-[9px] text-neutral-500 tracking-[0.08em]">04</span>
            <span className="font-display text-[18px] flex-1 text-left px-2">构图输出</span>
            <span className={`text-xs transition-transform ${openGroups.output ? 'rotate-90' : ''}`}>▶</span>
          </button>
          {openGroups.output ? <div className="p-3 space-y-3"> 
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">比例 / RATIO</div>
            <div className="grid grid-cols-5 border-[3px] border-[var(--ink)]">
              {ratioOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRatio(item)}
                  className={`h-11 text-[11px] border-r-2 border-[var(--ink)] transition-all ${
                    ratio === item
                      ? 'bg-[var(--ink)] text-[var(--paper)]'
                      : 'hover:bg-[var(--lgray)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 mb-1">提示词预览</div>
            <div className="border-[3px] border-[var(--ink)] bg-[var(--paper)] p-2.5 text-[10px] leading-relaxed max-h-28 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
              {promptPreview}
            </div>
          </div>
          </div> : null}
        </section>
      </div>

      <div className="p-3 border-t-[3px] border-[var(--ink)] bg-[var(--paper)]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full h-14 border-[3px] border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] font-display text-[28px] tracking-[0.15em] uppercase shadow-[5px_5px_0_var(--red)] hover:bg-[var(--red)] hover:shadow-[5px_5px_0_var(--ink)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? '生成中...' : '立即生成'}
        </button>
      </div>
    </aside>
  );
}
