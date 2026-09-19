import React, { useState } from 'react';
import {
  Camera,
  Sun,
  Clock,
  Wand2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  Maximize2,
  Sparkles,
  Upload,
  Film,
  AlertCircle,
} from 'lucide-react';
import { ScenePanel, AspectRatio, CameraAngle } from '../types';
import { CAMERA_ANGLES } from '../constants/presets';
import { generateProceduralCinematicFrame } from '../utils/proceduralCanvas';
import { requestPromptRefine, requestGenerateImage } from '../utils/aiClient';

interface PanelCardProps {
  scene: ScenePanel;
  index: number;
  totalScenes: number;
  aspectRatio: AspectRatio;
  visualStyleName: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: Partial<ScenePanel>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertAfter: () => void;
  onViewImage: (imageUrl: string, title: string) => void;
}

export const PanelCard: React.FC<PanelCardProps> = ({
  scene,
  index,
  totalScenes,
  aspectRatio,
  visualStyleName,
  isSelected,
  onSelect,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertAfter,
  onViewImage,
}) => {
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(scene.cinematicPrompt);

  // Compute placeholder image if scene.imageUrl is empty
  const displayImage =
    scene.imageUrl ||
    generateProceduralCinematicFrame(scene, aspectRatio, visualStyleName, 960, 540);

  // Handle AI prompt enhancement
  const handleEnhancePrompt = async () => {
    try {
      setIsRefiningPrompt(true);
      const res = await requestPromptRefine({
        scenePrompt: scene.cinematicPrompt || scene.visualDescription || scene.narrative,
        visualStyle: visualStyleName,
        lightingStyle: scene.lighting,
        cameraAngle: scene.cameraAngle,
      });

      if (res.enhancedPrompt) {
        setLocalPrompt(res.enhancedPrompt);
        onUpdate({ cinematicPrompt: res.enhancedPrompt });
      }
    } catch (err: any) {
      console.error('Enhance prompt failed:', err);
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  // Handle Image Generation via Gemini
  const handleGenerateImage = async () => {
    try {
      setIsGenerating(true);
      onUpdate({ isGeneratingImage: true, imageError: undefined });

      const promptToUse =
        scene.cinematicPrompt ||
        `${scene.visualDescription}, ${scene.lighting}, ${scene.cameraAngle}, ${visualStyleName}, cinematic film still, ultra realistic`;

      const imageUrl = await requestGenerateImage({
        prompt: promptToUse,
        aspectRatio,
      });

      onUpdate({ imageUrl, isGeneratingImage: false, imageError: undefined });
    } catch (err: any) {
      console.warn('Image generation error:', err);
      // Generate procedural frame as fallback so user still has a stylized frame
      const fallbackUrl = generateProceduralCinematicFrame(
        scene,
        aspectRatio,
        visualStyleName,
        1280,
        720
      );
      onUpdate({
        imageUrl: fallbackUrl,
        isGeneratingImage: false,
        imageError:
          'Kunci Gemini API belum mendukung pembuatan gambar nano/imagen langsung, visual sinematik canvas telah digenerate.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Manual Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdate({ imageUrl: dataUrl, imageError: undefined });
      }
    };
    reader.readAsDataURL(file);
  };

  // Duration steppers
  const adjustDuration = (delta: number) => {
    const next = Math.max(0.5, Math.min(60, Math.round((scene.duration + delta) * 10) / 10));
    onUpdate({ duration: next });
  };

  return (
    <div
      id={`scene-panel-card-${scene.sceneNumber}`}
      onClick={onSelect}
      className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-amber-500/80 bg-neutral-900/90 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/40'
          : 'border-neutral-800/90 bg-neutral-900/40 hover:border-neutral-700/80 hover:bg-neutral-900/70'
      }`}
    >
      {/* Top Bar: Scene Index, Title, Order Controls */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/70 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-md bg-amber-500/20 px-1.5 font-mono text-xs font-bold text-amber-300">
            #{scene.sceneNumber}
          </span>
          <input
            type="text"
            value={scene.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="bg-transparent text-sm font-semibold text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1 -ml-1 transition"
            placeholder="Judul Adegan..."
          />
        </div>

        {/* Panel Action Controls: Move, Duplicate, Delete */}
        <div className="flex items-center gap-1">
          <button
            id={`scene-move-up-${scene.sceneNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition rounded hover:bg-neutral-800"
            title="Pindah ke Atas / Sebelum"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            id={`scene-move-down-${scene.sceneNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalScenes - 1}
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition rounded hover:bg-neutral-800"
            title="Pindah ke Bawah / Sesudah"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            id={`scene-duplicate-${scene.sceneNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 text-neutral-400 hover:text-white transition rounded hover:bg-neutral-800"
            title="Duplikasi Panel"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            id={`scene-delete-${scene.sceneNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-neutral-400 hover:text-rose-400 transition rounded hover:bg-rose-950/30"
            title="Hapus Adegan"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Visual Frame Preview, Right is Prompt & Director Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        {/* Left Column: Image Canvas & Visual Controls (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-inner group/img">
            <img
              src={displayImage}
              alt={scene.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
            />

            {/* Overlay Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-neutral-950/80 px-2 py-1 text-[11px] font-medium text-neutral-300 backdrop-blur-sm border border-neutral-800">
              <Camera className="h-3 w-3 text-amber-400" />
              <span>{scene.cameraAngle}</span>
            </div>

            {/* Duration Tag on Thumbnail */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-1 font-mono text-[11px] font-bold text-amber-300 backdrop-blur-sm border border-neutral-800">
              <Clock className="h-3 w-3" />
              <span>{scene.duration.toFixed(1)}s</span>
            </div>

            {/* Quick action buttons on image hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-neutral-950/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover/img:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewImage(displayImage, scene.title);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900/90 text-neutral-200 shadow-md hover:bg-neutral-800 hover:text-white"
                title="Perbesar Visual"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              <label
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900/90 text-neutral-200 shadow-md hover:bg-neutral-800 hover:text-white cursor-pointer"
                title="Upload Gambar Kustom"
                onClick={(e) => e.stopPropagation()}
              >
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateImage();
                }}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-neutral-950 shadow-md hover:bg-amber-400 disabled:opacity-50"
                title="Render Ulang Gambar dengan Gemini AI"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Rendering...' : 'Render AI'}</span>
              </button>
            </div>
          </div>

          {/* Fallback Notice or Error Alert if any */}
          {scene.imageError && (
            <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
              <span>{scene.imageError}</span>
            </div>
          )}

          {/* Quick Duration Adjuster & Motion Effect */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">Durasi:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustDuration(-0.5);
                  }}
                  className="h-6 w-6 rounded bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-700 hover:text-white"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-amber-400 min-w-[38px] text-center">
                  {scene.duration.toFixed(1)}s
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustDuration(0.5);
                  }}
                  className="h-6 w-6 rounded bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-700 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Motion Effect Selector for Video */}
            <div className="flex items-center gap-1">
              <Film className="h-3 w-3 text-neutral-500" />
              <select
                value={scene.motionEffect || 'zoom-in'}
                onChange={(e) => onUpdate({ motionEffect: e.target.value as any })}
                className="h-7 rounded bg-neutral-900 px-1.5 text-[11px] font-medium text-neutral-300 border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                title="Efek Gerak Ken Burns pada Video"
              >
                <option value="zoom-in">Zoom In</option>
                <option value="zoom-out">Zoom Out</option>
                <option value="pan-right">Pan Kanan</option>
                <option value="pan-left">Pan Kiri</option>
                <option value="static">Statis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Subtitle, Cinematic Prompt & Director Controls (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between gap-3">
          {/* Narration / Lyric Beat */}
          <div>
            <div className="flex items-center justify-between pb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Naskah / Lirik / Subtitle Adegan:
              </label>
              <span className="text-[10px] text-neutral-500">Tampil pada banner video</span>
            </div>
            <input
              type="text"
              value={scene.narrative}
              onChange={(e) => onUpdate({ narrative: e.target.value })}
              placeholder="Masukkan potongan lirik lagu atau dialog/narasi adegan ini..."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60 transition"
            />
          </div>

          {/* Cinematic Image Prompt */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Prompt Sinematik Visual:
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnhancePrompt();
                }}
                disabled={isRefiningPrompt}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
                title="Gunakan AI untuk memperkaya detail sinematik prompt"
              >
                <Wand2 className={`h-3 w-3 ${isRefiningPrompt ? 'animate-spin' : ''}`} />
                <span>{isRefiningPrompt ? 'Mengoptimasi...' : 'Pertajam Prompt AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={localPrompt}
              onChange={(e) => {
                setLocalPrompt(e.target.value);
                onUpdate({ cinematicPrompt: e.target.value });
              }}
              placeholder="Deskripsi visual adegan untuk generator gambar AI..."
              className="w-full flex-1 rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60 transition resize-none font-mono"
            />
          </div>

          {/* Director Setting Badges (Camera Shot & Lighting Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
            {/* Camera Angle */}
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800/80 bg-neutral-950/60 px-2.5 py-1.5">
              <Camera className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  Sudut Kamera
                </span>
                <select
                  value={scene.cameraAngle}
                  onChange={(e) => onUpdate({ cameraAngle: e.target.value as CameraAngle })}
                  className="w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none cursor-pointer truncate"
                >
                  {CAMERA_ANGLES.map((angle) => (
                    <option key={angle} value={angle} className="bg-neutral-900 text-neutral-200">
                      {angle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lighting Style */}
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800/80 bg-neutral-950/60 px-2.5 py-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  Pencahayaan
                </span>
                <input
                  type="text"
                  value={scene.lighting}
                  onChange={(e) => onUpdate({ lighting: e.target.value })}
                  placeholder="Gaya Pencahayaan..."
                  className="w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none truncate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insert Button on Divider between scenes */}
      <div className="relative flex justify-center py-1 bg-neutral-950/30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInsertAfter();
          }}
          className="flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-400 hover:border-amber-500/50 hover:bg-neutral-800 hover:text-amber-300 transition shadow-sm"
          title="Sisipkan Adegan Baru Setelah Ini"
        >
          <Plus className="h-3 w-3" />
          <span>Sisipkan Adegan Baru</span>
        </button>
      </div>
    </div>
  );
};
