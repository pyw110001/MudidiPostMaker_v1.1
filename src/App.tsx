import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Preview } from './components/Preview';
import { generatePoster } from './services/gemini';

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function hasConfiguredGeminiKey(): boolean {
  const k = (process.env.API_KEY || process.env.GEMINI_API_KEY || '').trim();
  return k.length > 0;
}

function isElectronShell(): boolean {
  return typeof navigator !== 'undefined' && /\bElectron\b/i.test(navigator.userAgent);
}

/** 主进程 loadFile 时附加，保证桌面版一定走本地密钥流程（避免被判成「仅浏览器」只显示 .env 说明、没有输入框） */
function isMudidiDesktopFromMain(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('mudidi') === 'desktop';
  } catch {
    return false;
  }
}

export default function App() {
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [isAiStudio, setIsAiStudio] = useState(false);
  const [isElectronApp, setIsElectronApp] = useState(false);
  const [pendingApiKey, setPendingApiKey] = useState('');
  const [electronKeyError, setElectronKeyError] = useState<string | null>(null);

  const [referenceImage, setReferenceImage] = useState<{data: string, mime: string} | null>(null);
  const [referenceWeight, setReferenceWeight] = useState(0.8);
  const [quantity, setQuantity] = useState('4');
  const [emotion, setEmotion] = useState('无 (None)');
  const [season, setSeason] = useState('夏 (Summer)');
  const [holiday, setHoliday] = useState('无 (None)');
  const [action, setAction] = useState('围坐在绿色圆桌旁吃点心 (eating dim sum at a round green table)');
  const [scene, setScene] = useState('装饰着荷花的温馨餐厅 (a warm restaurant with lotus decorations)');
  const [ratio, setRatio] = useState('3:4');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [promptPreview, setPromptPreview] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      try {
        const isDesktopBundle =
          isMudidiDesktopFromMain() || isElectronShell() || !!window.mudidiElectron;

        if (isDesktopBundle) {
          setIsAiStudio(false);
          setIsElectronApp(true);
          if (window.mudidiElectron) {
            try {
              const k = await window.mudidiElectron.getApiKey();
              setHasKey(k.trim().length > 0);
            } catch (e) {
              console.error("Error reading stored API key:", e);
              setHasKey(false);
            }
          } else {
            console.error("Mudidi Electron: preload bridge missing (mudidiElectron undefined)");
            setHasKey(false);
          }
        } else if (window.aistudio) {
          setIsAiStudio(true);
          setIsElectronApp(false);
          try {
            const has = await window.aistudio.hasSelectedApiKey();
            setHasKey(has);
          } catch (e) {
            console.error("Error checking API key:", e);
            setHasKey(true);
          }
        } else {
          setIsAiStudio(false);
          setIsElectronApp(false);
          setHasKey(hasConfiguredGeminiKey());
        }
      } finally {
        setIsCheckingKey(false);
      }
    };
    void checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleSaveElectronApiKey = async () => {
    setElectronKeyError(null);
    const key = pendingApiKey.trim();
    if (!key) {
      setElectronKeyError('请输入 API Key。');
      return;
    }
    if (!window.mudidiElectron) {
      setElectronKeyError('桌面安全模块未加载，请关闭程序后重新安装最新安装包，或以管理员身份试一次。');
      return;
    }
    try {
      await window.mudidiElectron.setApiKey(key);
      setHasKey(true);
      setPendingApiKey('');
    } catch (e) {
      console.error(e);
      setElectronKeyError('保存失败，请重试。');
    }
  };

  // Update prompt preview whenever inputs change
  useEffect(() => {
    const baseStyle = "A warm, textured, flat-vector illustration style with a grainy, crayon or pastel artistic feel. Warm color palette with soft lighting. Naive art, children's book illustration style. Apple-style clean composition. CRITICAL: ABSOLUTELY NO TEXT, NO TITLES, NO WORDS, NO LETTERS, AND NO WATERMARKS IN THE GENERATED IMAGE.";
    const characters = `${quantity} cute anthropomorphic sheep characters. CRITICAL ANATOMY INSTRUCTION: ABSOLUTELY NO HUMAN SKIN/FLESH COLORS. Maintain rigorous consistency in character design; DO NOT deform or mutate the overall shape of the sheep. Follow this EXACT color blocking:\n1. Head: White, fluffy, perfectly consistent cloud-like circle with simple dot eyes and a small mouth.\n2. Torso: MUST wear clothes that STRICTLY MATCH the current Action and Scene (e.g., if swimming, ALL characters MUST wear proper swimwear like swimsuits or rash guards; if winter, winter coats). ALL characters must be dressed appropriately for the context and environment! NO bare chests, NO bare bellies, NO flesh-colored bodies.\n3. Arms: Extremely thin WHITE stick-like lines ONLY. NO flesh-colored arms.\n4. Legs: Extremely thin BLACK stick-like lines ONLY. NO flesh-colored legs.\nDo not draw realistic animal bodies or thick limbs.`;
    
    // Emotion constraints
    const charEmotion = !emotion.includes('无') 
      ? `Character Emotion: ${emotion}. The characters MUST strongly display this overall emotion on their faces. CRITICAL RESTRICTION: The exact same facial expression MUST NOT appear more than twice in the entire image. If there are multiple characters, vary their expressions and reactions slightly while maintaining the overall emotion.` 
      : '';

    // Scene & Background strong sizing constraints
    const setting = `Scene: ${scene}. VERY IMPORTANT BACKGROUND INSTRUCTION: Background elements (especially flowers, plants, and natural decorations) MUST be realistically proportioned relative to the characters. ABSOLUTELY NO oversized, giant, distorted, or overwhelmingly large floral elements. Keep background elements at a normal, supporting scale.`;
    
    const activity = `Action: ${action}.`;
    const time = !season.includes('无') ? `Season: ${season}.` : '';
    const festivity = !holiday.includes('无') ? `Holiday elements: ${holiday}.` : '';
    
    const referenceInstruction = referenceImage 
      ? `EXTREMELY IMPORTANT: Look closely at the reference image. You MUST replicate the EXACT character design and rigid body proportions: white fluffy perfectly rounded head, CLOTHED torso, thin WHITE stick arms, and thin BLACK stick legs. The overall shape and outline of the sheep MUST NOT deform and MUST be identical to the reference. ONLY change their specific clothing styles, poses, and actions to match the prompt. DO NOT draw plain white bodies and NEVER use flesh/human skin tones for any part of the sheep. Reference adherence weight: ${referenceWeight.toFixed(1)}.` 
      : "";
    
    setPromptPreview([baseStyle, characters, charEmotion, setting, activity, time, festivity, referenceInstruction].filter(Boolean).join('\n\n'));
  }, [quantity, emotion, season, holiday, action, scene, referenceImage, referenceWeight]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      const result = await generatePoster(
        promptPreview,
        ratio,
        referenceImage?.data,
        referenceImage?.mime
      );
      setGeneratedImage(result);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        url: result,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (err: any) {
      const errMsg = err.message || '生成图片失败，请重试。(Failed to generate image. Please try again.)';
      setError(errMsg);
      
      // If permission denied or entity not found, prompt to re-select key
      if (errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403') || errMsg.includes('Requested entity was not found')) {
        setHasKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (isCheckingKey) {
    return <div className="flex h-screen w-full bg-[#0a0a0c] items-center justify-center text-white">加载中 (Loading)...</div>;
  }

  if (!hasKey) {
    return (
      <div className="flex h-screen w-full bg-[#0a0a0c] items-center justify-center text-white p-4">
        <div className="max-w-md p-8 bg-[#121214] rounded-3xl border border-white/10 text-center shadow-2xl">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">需要 API Key (API Key Required)</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            此应用使用了高质量的 <strong>Gemini 3.1 Flash Image Preview</strong> 模型，需要配置启用了计费的 Google Cloud API Key。
            <br/><br/>
            {isAiStudio ? (
              <>请选择您的 API Key 以继续。</>
            ) : isElectronApp ? (
              <>
                桌面版首次使用请输入 <strong className="text-zinc-200">Nano Banana 2 / Gemini</strong> 图像生成 API Key（与
                Google AI Studio / Gemini API 相同）。密钥将保存在本机用户目录，之后打开无需再次输入。
              </>
            ) : (
              <>
                本地运行：在项目根目录的 <code className="text-zinc-200 bg-white/10 px-1.5 py-0.5 rounded">.env</code> 文件中设置{" "}
                <code className="text-zinc-200 bg-white/10 px-1.5 py-0.5 rounded">GEMINI_API_KEY=你的密钥</code>（可参考仓库里的{" "}
                <code className="text-zinc-200 bg-white/10 px-1.5 py-0.5 rounded">.env.example</code>
                ），保存后<strong className="text-zinc-300">重新启动</strong>开发服务器。
              </>
            )}
            <br/><br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
              了解有关计费的更多信息 (Learn more about billing)
            </a>
            {" · "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
              获取 API Key (Google AI Studio)
            </a>
          </p>
          {isAiStudio ? (
            <button
              type="button"
              onClick={handleSelectKey}
              className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
            >
              选择 API Key (Select API Key)
            </button>
          ) : isElectronApp ? (
            <div className="space-y-4 text-left">
              {!window.mudidiElectron ? (
                <p className="text-amber-400 text-sm leading-relaxed rounded-lg bg-amber-500/10 border border-amber-500/25 px-3 py-2">
                  未能加载桌面安全模块，无法保存密钥。请向开发者索取重新打包后的安装程序，或暂时关闭/排查安全软件拦截。
                </p>
              ) : null}
              <label className="block text-xs text-zinc-500 uppercase tracking-wide">API Key</label>
              <input
                type="password"
                autoComplete="off"
                value={pendingApiKey}
                onChange={(e) => setPendingApiKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSaveElectronApiKey();
                }}
                placeholder="粘贴 Nano Banana 2 / Gemini API Key"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              />
              {electronKeyError ? (
                <p className="text-sm text-red-400">{electronKeyError}</p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSaveElectronApiKey()}
                className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
              >
                保存并进入
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              配置完成后若本页未更新，请刷新浏览器。
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--paper)] text-[var(--ink)] overflow-hidden flex flex-col">
      <header className="h-[52px] shrink-0 border-b-[3px] border-[var(--ink)] bg-[var(--paper)] px-0 flex items-stretch justify-between">
        <div className="flex items-center border-r-[3px] border-[var(--ink)] px-5">
          <div className="w-8 h-8 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-display text-lg mr-3">M</div>
          <div>
            <div className="font-display text-[22px] leading-none">MUDIDI</div>
            <div className="text-[9px] tracking-[0.14em] text-neutral-500">POSTER ARCHITECT / V.1.1</div>
          </div>
        </div>
        <div className="flex-1 hidden md:flex items-stretch px-4">
          <button type="button" className="px-4 text-[10px] tracking-[0.12em] text-neutral-500 uppercase border-r border-[var(--lgray)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">构图</button>
          <button type="button" className="px-4 text-[10px] tracking-[0.12em] text-neutral-500 uppercase border-r border-[var(--lgray)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">批量</button>
          <button type="button" className="px-4 text-[10px] tracking-[0.12em] text-neutral-500 uppercase border-r border-[var(--lgray)] hover:bg-[var(--ink)] hover:text-[var(--paper)]">历史</button>
          <button type="button" className="px-4 text-[10px] tracking-[0.12em] text-neutral-500 uppercase hover:bg-[var(--ink)] hover:text-[var(--paper)]">导出</button>
        </div>
        <div className="flex items-center border-l-[3px] border-[var(--ink)] px-5 text-[9px] tracking-[0.1em] text-neutral-500 gap-2">
          <span className="w-2 h-2 bg-emerald-500 outline outline-2 outline-[var(--ink)] outline-offset-1" />
          <span>SYS ONLINE</span>
        </div>
      </header>

      <main className="min-h-0 flex-1 grid grid-cols-1 lg:grid-cols-[286px_1fr]">
        <Sidebar 
          referenceImage={referenceImage}
          setReferenceImage={setReferenceImage}
          quantity={quantity}
          setQuantity={setQuantity}
          emotion={emotion}
          setEmotion={setEmotion}
          season={season}
          setSeason={setSeason}
          holiday={holiday}
          setHoliday={setHoliday}
          action={action}
          setAction={setAction}
          scene={scene}
          setScene={setScene}
          ratio={ratio}
          setRatio={setRatio}
          referenceWeight={referenceWeight}
          setReferenceWeight={setReferenceWeight}
          promptPreview={promptPreview}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        <Preview 
          isGenerating={isGenerating}
          generatedImage={generatedImage}
          error={error}
          ratio={ratio}
          history={history}
          onSelectHistory={setGeneratedImage}
          onRegenerate={handleGenerate}
          onGenerateVariant={handleGenerate}
          promptPreview={promptPreview}
          meta={{
            quantity,
            emotion,
            season,
            holiday,
            action,
            scene,
            ratio,
            hasReference: referenceImage ? '是' : '否',
            historyCount: String(history.length)
          }}
        />
      </main>
    </div>
  );
}
