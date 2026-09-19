import { ScenePanel, ConsistencyProfile, AspectRatio, CameraAngle } from '../types';

export interface ScriptAssistResult {
  storyTitle: string;
  logline: string;
  consistencyProfile: ConsistencyProfile;
  scenes: ScenePanel[];
}

export async function requestScriptAssist(params: {
  sourceText: string;
  mode: 'breakdown' | 'expand_script' | 'lyrics_to_storyboard';
  targetScenes: number;
  visualStyle: string;
  lightingStyle: string;
  aspectRatio: AspectRatio;
  characterNotes?: string;
  settingNotes?: string;
}): Promise<ScriptAssistResult> {
  try {
    const res = await fetch('/api/ai/script-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    // Validate and format scene panels
    const scenes: ScenePanel[] = (data.scenes || []).map((s: any, idx: number) => ({
      id: `scene-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      sceneNumber: s.sceneNumber || idx + 1,
      title: s.title || `Adegan ${idx + 1}`,
      narrative: s.narrative || '',
      visualDescription: s.visualDescription || '',
      cinematicPrompt: s.cinematicPrompt || '',
      cameraAngle: (s.cameraAngle as CameraAngle) || 'Medium Shot',
      lighting: s.lighting || params.lightingStyle,
      duration: Math.max(1, Number(s.duration) || 3.5),
      motionEffect: idx % 4 === 0 ? 'zoom-in' : idx % 4 === 1 ? 'pan-right' : idx % 4 === 2 ? 'zoom-out' : 'pan-left',
    }));

    return {
      storyTitle: data.storyTitle || 'Proyek Storyboard AI',
      logline: data.logline || '',
      consistencyProfile: {
        protagonist: data.consistencyProfile?.protagonist || params.characterNotes || '',
        environment: data.consistencyProfile?.environment || params.settingNotes || '',
        colorPalette: data.consistencyProfile?.colorPalette || '',
        artStyleTokens: params.visualStyle,
      },
      scenes,
    };
  } catch (err: any) {
    console.warn('Backend AI assistance error, triggering smart script parsing fallback:', err);
    // Fallback: parse raw text into clean storyboard beats
    return generateFallbackScenes(params);
  }
}

export async function requestPromptRefine(params: {
  scenePrompt: string;
  visualStyle: string;
  lightingStyle: string;
  characterNotes?: string;
  cameraAngle?: string;
}): Promise<{ enhancedPrompt: string; directorNotes: string }> {
  const res = await fetch('/api/ai/refine-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to refine prompt');
  }

  return res.json();
}

export async function requestGenerateImage(params: {
  prompt: string;
  aspectRatio: AspectRatio;
}): Promise<string> {
  const res = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Image generation failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.imageUrl) {
    throw new Error('No image URL returned from generator');
  }
  return data.imageUrl;
}

/**
 * Intelligent local fallback when network or API key is not yet configured
 */
function generateFallbackScenes(params: {
  sourceText: string;
  mode: string;
  targetScenes: number;
  visualStyle: string;
  lightingStyle: string;
  aspectRatio: AspectRatio;
  characterNotes?: string;
  settingNotes?: string;
}): ScriptAssistResult {
  const lines = params.sourceText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('[') && !l.endsWith(']'));

  const count = Math.min(Math.max(3, params.targetScenes || 5), Math.max(lines.length, 3));
  const step = Math.max(1, Math.floor(lines.length / count));

  const cameraAngles: CameraAngle[] = [
    'Extreme Wide Shot',
    'Medium Shot',
    'Close-Up',
    'Low Angle Heroic',
    'High Angle Overlook',
    'Dutch Angle / Tilted',
  ];

  const scenes: ScenePanel[] = [];
  for (let i = 0; i < count; i++) {
    const startIdx = i * step;
    const textSnippet = lines.slice(startIdx, startIdx + step).join(' ') || lines[i % lines.length] || `Adegan narasi babak ${i + 1}`;
    const cam = cameraAngles[i % cameraAngles.length];

    scenes.push({
      id: `fallback-scene-${Date.now()}-${i}`,
      sceneNumber: i + 1,
      title: `Adegan ${i + 1}: Perjalanan Narasi`,
      narrative: textSnippet.slice(0, 140),
      visualDescription: `Visual dramatis yang menggambarkan peristiwa: "${textSnippet.slice(0, 80)}" dengan kontinuitas karakter yang terjaga.`,
      cinematicPrompt: `Cinematic frame of ${textSnippet.slice(0, 100)}, ${params.visualStyle}, ${params.lightingStyle}, shot on anamorphic lens, ${cam}, realistic textures, hyper-detailed, masterwork composition`,
      cameraAngle: cam,
      lighting: params.lightingStyle,
      duration: 3.5,
      motionEffect: i % 2 === 0 ? 'zoom-in' : 'pan-right',
    });
  }

  return {
    storyTitle: 'Naskah Storyboard Terstruktur',
    logline: params.sourceText.slice(0, 120) + '...',
    consistencyProfile: {
      protagonist: params.characterNotes || 'Karakter utama dengan ciri pakaian dan ekspresi konsisten',
      environment: params.settingNotes || 'Latar dunia atmosferik terpadu',
      colorPalette: 'Sinematik harmonis',
      artStyleTokens: params.visualStyle,
    },
    scenes,
  };
}
