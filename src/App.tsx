import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Preview } from './components/Preview';
import { generatePoster } from './services/gemini';
import { motion } from 'motion/react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  const [referenceImage, setReferenceImage] = useState<{data: string, mime: string} | null>(null);
  const [quantity, setQuantity] = useState('4');
  const [emotion, setEmotion] = useState('无 (None)');
  const [season, setSeason] = useState('夏 (Summer)');
  const [holiday, setHoliday] = useState('无 (None)');
  const [action, setAction] = useState('围坐在绿色圆桌旁吃点心 (eating dim sum at a round green table)');
  const [scene, setScene] = useState('装饰着荷花的温馨餐厅 (a warm restaurant with lotus decorations)');
  const [ratio, setRatio] = useState('3:4');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptPreview, setPromptPreview] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const has = await window.aistudio.hasSelectedApiKey();
          setHasKey(has);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasKey(true);
        }
      } else {
        setHasKey(true);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  // Update prompt preview whenever inputs change
  useEffect(() => {
    const baseStyle = "A warm, textured, flat-vector illustration style with a grainy, crayon or pastel artistic feel. Warm color palette with soft lighting. Naive art, children's book illustration style. Apple-style clean composition.";
    const characters = `${quantity} cute anthropomorphic sheep characters. CRITICAL ANATOMY INSTRUCTION: ABSOLUTELY NO HUMAN SKIN/FLESH COLORS. Follow this EXACT color blocking:\n1. Head: White, fluffy, cloud-like with simple dot eyes and a small mouth.\n2. Torso: MUST wear colorful clothes (if swimming, they must wear full-body swimsuits or shirts). NO bare chests, NO bare bellies, NO flesh-colored bodies.\n3. Arms: Extremely thin WHITE stick-like lines ONLY. NO flesh-colored arms.\n4. Legs: Extremely thin BLACK stick-like lines ONLY. NO flesh-colored legs.\nDo not draw realistic animal bodies or thick limbs.`;
    
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
      ? "EXTREMELY IMPORTANT: Look closely at the reference image. You MUST replicate the EXACT character design: white fluffy head, CLOTHED torso, thin WHITE stick arms, and thin BLACK stick legs. You MUST keep this exact style. ONLY change their specific clothing styles, poses, and actions to match the prompt. DO NOT draw plain white bodies and NEVER use flesh/human skin tones for any part of the sheep." 
      : "";
    
    setPromptPreview([baseStyle, characters, charEmotion, setting, activity, time, festivity, referenceInstruction].filter(Boolean).join('\n\n'));
  }, [quantity, emotion, season, holiday, action, scene, referenceImage]);

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
            请选择您的 API Key 以继续。
            <br/><br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
              了解有关计费的更多信息 (Learn more about billing)
            </a>
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
          >
            选择 API Key (Select API Key)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-white font-sans overflow-hidden">
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
        promptPreview={promptPreview}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
      <Preview 
        isGenerating={isGenerating}
        generatedImage={generatedImage}
        error={error}
        ratio={ratio}
      />
    </div>
  );
}
