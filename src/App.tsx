import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Sliders,
  Play,
  Plus,
  Wand2,
  Layers,
  Clock,
  Ratio,
  RefreshCw,
  Sun,
  Palette,
  Eye,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  StoryboardProject,
  ScenePanel,
  AspectRatio,
  CameraAngle,
  TransitionType,
  ConsistencyProfile,
} from './types';
import {
  VISUAL_STYLE_PRESETS,
  LIGHTING_PRESETS,
  SAMPLE_STORIES,
  ASPECT_RATIOS,
} from './constants/presets';
import { Header } from './components/Header';
import { TimelineBar } from './components/TimelineBar';
import { PanelCard } from './components/PanelCard';
import { ScriptIntakeModal } from './components/ScriptIntakeModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { GlobalStyleModal } from './components/GlobalStyleModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { PdfExportModal } from './components/PdfExportModal';
import { ScriptAssistResult, requestGenerateImage } from './utils/aiClient';
import { generateProceduralCinematicFrame } from './utils/proceduralCanvas';

const STORAGE_KEY = 'cineboard_studio_projects_v1';
const CURRENT_PROJ_KEY = 'cineboard_studio_current_proj_v1';

function createDefaultProject(): StoryboardProject {
  const sample = SAMPLE_STORIES[0];
  const visualPreset =
    VISUAL_STYLE_PRESETS.find((v) => v.id === sample.suggestedStyle) || VISUAL_STYLE_PRESETS[0];
  const lightingPreset =
    LIGHTING_PRESETS.find((l) => l.id === sample.suggestedLighting) || LIGHTING_PRESETS[0];

  const defaultScenes: ScenePanel[] = [
    {
      id: 'scene-init-1',
      sceneNumber: 1,
      title: 'Menara Kota Tua Berhujan',
      narrative: 'Di lantai 42 menara Kota Tua Baru, detektif Kaelen menatap kabel serat optik yang terbakar.',
      visualDescription: 'Kaelen berdiri di dekat jendela kaca basah, memegang kabel bercahaya dengan latar kota neon berkabut.',
      cinematicPrompt:
        'A weathered cyberpunk detective standing beside a rain-streaked high-rise window, holding smoking fiber optic cables, illuminated by distant holographic signs, volumetric smoke, cinematic 35mm photograph, blade runner 2049 mood, anamorphic lens flare, photorealistic',
      cameraAngle: 'Medium Shot',
      lighting: lightingPreset.name,
      duration: 4.0,
      motionEffect: 'zoom-in',
    },
    {
      id: 'scene-init-2',
      sceneNumber: 2,
      title: 'Hologram Naga & Langit Malam',
      narrative: 'Di seberang jalan raya gantung, hologram naga raksasa meliuk di antara gedung pencakar langit.',
      visualDescription: 'Sudut pandang lebar memperlihatkan megastruktur kota Jakarta masa depan dengan lalu lintas terbang.',
      cinematicPrompt:
        'Extreme wide shot of a futuristic metropolis with towering dark brutalist skyscrapers, massive glowing neon holographic dragon soaring through atmospheric rain and fog, flying maglev transit, cinematic lighting, 8k resolution',
      cameraAngle: 'Extreme Wide Shot',
      lighting: 'Cyberpunk Bi-Color Neon',
      duration: 3.5,
      motionEffect: 'pan-right',
    },
    {
      id: 'scene-init-3',
      sceneNumber: 3,
      title: 'Kristal Memori Berdenyut',
      narrative: 'Kaelen mengeluarkan chip memori kristal kuno yang memancarkan cahaya jingga berdenyut pelan.',
      visualDescription: 'Close up telapak tangan memegang chip kristal poligonal berkilau jingga hangat di tengah kegelapan.',
      cinematicPrompt:
        'Macro close-up shot of a human hand holding a glowing translucent crystal data drive emitting pulsating warm amber light, shallow depth of field, delicate reflections on wet fingertips, film grain, photorealistic',
      cameraAngle: 'Close-Up',
      lighting: 'Dramatic Chiaroscuro',
      duration: 3.0,
      motionEffect: 'zoom-out',
    },
    {
      id: 'scene-init-4',
      sceneNumber: 4,
      title: 'Drone Pengintai Mengunci Target',
      narrative: 'Di sudut bayangan atap seberang, sebuah drone pengintai berlensa merah menyala dan mengunci tatapan.',
      visualDescription: 'Drone mekanis hitam melayang di atas balkon basah dengan sensor mata merah mengintimidasi.',
      cinematicPrompt:
        'Low angle heroic shot of a stealth surveillance drone hovering silently in rainy night mist, sharp crimson red optical eye sensor glowing intensely, rain droplets splashing on matte carbon fiber frame, dark suspenseful cinema',
      cameraAngle: 'Low Angle Heroic',
      lighting: 'Moody Edge & Rim Light',
      duration: 3.5,
      motionEffect: 'pan-left',
    },
    {
      id: 'scene-init-5',
      sceneNumber: 5,
      title: 'Pelarian di Tangga Darurat',
      narrative: 'Kaelen menarik tudung kepalanya, melompat ke tangga darurat, memulai pelarian di tengah malam yang basah.',
      visualDescription: 'Sosok berjaket melesat menuruni tangga besi industri berkarat di bawah guyuran hujan lebat.',
      cinematicPrompt:
        'Dynamic action shot of a hooded detective running down wet industrial steel fire escapes, motion blur, backlit by flashing neon billboard signs, atmospheric rain pouring down, cinematic film still, intense momentum',
      cameraAngle: 'Dutch Angle / Tilted',
      lighting: 'Cyberpunk Bi-Color Neon',
      duration: 4.5,
      motionEffect: 'zoom-in',
    },
  ];

  return {
    id: `project-${Date.now()}`,
    title: 'Jakarta 2088: Neon & Rain',
    description: sample.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aspectRatio: '16:9',
    visualStyle: visualPreset.name + ' - ' + visualPreset.promptSuffix,
    lightingStyle: lightingPreset.name + ' - ' + lightingPreset.promptKeywords,
    transition: 'crossfade',
    consistencyProfile: {
      protagonist: 'Detektif Kaelen, mantel sintetis transparan, tudung kepala, wajah lelah bertato siber kecil di pelipis.',
      environment: 'Kota Tua Jakarta distopia 2088, hujan asam terus menerus, menara beton tinggi berlumut, neon billboard.',
      colorPalette: 'Teal, Cyan, Neon Magenta, Amber Warm',
      artStyleTokens: visualPreset.name,
    },
    scenes: defaultScenes,
    rawSourceText: sample.text,
    sourceType: 'story',
  };
}

export default function App() {
  // State Initialization with LocalStorage
  const [projects, setProjects] = useState<StoryboardProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [createDefaultProject()];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_PROJ_KEY);
      if (savedId) return savedId;
    } catch (_) {}
    return projects[0]?.id || '';
  });

  // Active Project Reference
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  // Selected Scene for focused editing
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    currentProject?.scenes?.[0]?.id || null
  );

  // Modals
  const [isScriptIntakeOpen, setIsScriptIntakeOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  // Batch rendering state
  const [isBatchRendering, setIsBatchRendering] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      if (currentProject) {
        localStorage.setItem(CURRENT_PROJ_KEY, currentProject.id);
      }
    } catch (_) {}
  }, [projects, currentProject]);

  // Keep selectedSceneId valid
  useEffect(() => {
    if (!currentProject?.scenes.some((s) => s.id === selectedSceneId)) {
      setSelectedSceneId(currentProject?.scenes?.[0]?.id || null);
    }
  }, [currentProject, selectedSceneId]);

  // Total Duration calculation
  const totalDuration = (currentProject?.scenes || []).reduce(
    (acc, s) => acc + (s.duration || 3.5),
    0
  );

  // Project Mutators
  const updateProject = (partial: Partial<StoryboardProject>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProject.id
          ? { ...p, ...partial, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const updateScene = (sceneId: string, partial: Partial<ScenePanel>) => {
    if (!currentProject) return;
    const updatedScenes = currentProject.scenes.map((s) =>
      s.id === sceneId ? { ...s, ...partial } : s
    );
    updateProject({ scenes: updatedScenes });
  };

  const addScene = (afterIndex?: number) => {
    if (!currentProject) return;
    const newIndex =
      typeof afterIndex === 'number' ? afterIndex + 1 : currentProject.scenes.length;

    const newScene: ScenePanel = {
      id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sceneNumber: newIndex + 1,
      title: `Adegan ${newIndex + 1}: Adegan Baru`,
      narrative: '',
      visualDescription: 'Karakter utama dalam momen penting yang melanjutkan alur cerita.',
      cinematicPrompt: `Cinematic scene, ${currentProject.visualStyle}, ${currentProject.lightingStyle}, 35mm film still, photorealistic`,
      cameraAngle: 'Medium Shot',
      lighting: currentProject.lightingStyle.split('-')[0] || 'Golden Hour',
      duration: 3.5,
      motionEffect: 'zoom-in',
    };

    const newScenes = [...currentProject.scenes];
    newScenes.splice(newIndex, 0, newScene);

    // Re-index sceneNumbers
    const reIndexed = newScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    updateProject({ scenes: reIndexed });
    setSelectedSceneId(newScene.id);
  };

  const moveScene = (index: number, direction: 'up' | 'down') => {
    if (!currentProject) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentProject.scenes.length) return;

    const newScenes = [...currentProject.scenes];
    const [moved] = newScenes.splice(index, 1);
    newScenes.splice(targetIndex, 0, moved);

    const reIndexed = newScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    updateProject({ scenes: reIndexed });
  };

  const duplicateScene = (index: number) => {
    if (!currentProject) return;
    const original = currentProject.scenes[index];
    const clone: ScenePanel = {
      ...original,
      id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${original.title} (Salinan)`,
      sceneNumber: index + 2,
    };

    const newScenes = [...currentProject.scenes];
    newScenes.splice(index + 1, 0, clone);

    const reIndexed = newScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    updateProject({ scenes: reIndexed });
    setSelectedSceneId(clone.id);
  };

  const deleteScene = (index: number) => {
    if (!currentProject || currentProject.scenes.length <= 1) {
      alert('Storyboard harus memiliki minimal satu panel adegan.');
      return;
    }

    const newScenes = currentProject.scenes.filter((_, idx) => idx !== index);
    const reIndexed = newScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    updateProject({ scenes: reIndexed });
  };

  // Apply script assist result
  const handleApplyScriptResult = (
    result: ScriptAssistResult,
    rawText: string,
    sourceType: any
  ) => {
    updateProject({
      title: result.storyTitle || currentProject.title,
      description: result.logline || currentProject.description,
      consistencyProfile: result.consistencyProfile || currentProject.consistencyProfile,
      scenes: result.scenes,
      rawSourceText: rawText,
      sourceType,
    });
    setSelectedSceneId(result.scenes[0]?.id || null);
  };

  // Apply Global Style to all scenes prompts
  const applyGlobalStyleToAllScenes = () => {
    if (!currentProject) return;
    const updatedScenes = currentProject.scenes.map((s) => ({
      ...s,
      lighting: currentProject.lightingStyle.split('-')[0] || s.lighting,
      cinematicPrompt: `${s.visualDescription || s.title}, ${currentProject.visualStyle}, ${currentProject.lightingStyle}, ${s.cameraAngle}, cinematic photography, 8k resolution`,
    }));
    updateProject({ scenes: updatedScenes });
    setIsStyleModalOpen(false);
  };

  // Batch render all scene images
  const handleBatchRenderAll = async () => {
    if (!currentProject || isBatchRendering) return;
    try {
      setIsBatchRendering(true);
      setBatchProgress(0);

      const total = currentProject.scenes.length;
      const updated = [...currentProject.scenes];

      for (let i = 0; i < total; i++) {
        setBatchProgress(Math.round(((i + 1) / total) * 100));
        const scene = updated[i];

        try {
          const imgUrl = await requestGenerateImage({
            prompt:
              scene.cinematicPrompt ||
              `${scene.visualDescription}, ${scene.lighting}, ${currentProject.visualStyle}`,
            aspectRatio: currentProject.aspectRatio,
          });
          updated[i] = { ...scene, imageUrl: imgUrl, imageError: undefined };
        } catch (err: any) {
          // Fallback procedural
          const fallback = generateProceduralCinematicFrame(
            scene,
            currentProject.aspectRatio,
            currentProject.visualStyle,
            1280,
            720
          );
          updated[i] = {
            ...scene,
            imageUrl: fallback,
            imageError: 'Dihasilkan menggunakan visual canvas sinematik terkurasi.',
          };
        }

        updateProject({ scenes: [...updated] });
      }
    } finally {
      setIsBatchRendering(false);
    }
  };

  // Project Manager Handlers
  const handleCreateProject = (title = 'Proyek Storyboard Baru') => {
    const newProj: StoryboardProject = {
      ...createDefaultProject(),
      id: `project-${Date.now()}`,
      title,
      scenes: [
        {
          id: `scene-${Date.now()}-1`,
          sceneNumber: 1,
          title: 'Adegan Pembuka',
          narrative: 'Awal mula perjalanan kisah...',
          visualDescription: 'Pemandangan lanskap terbuka dengan karakter utama berdiri menatap horizon.',
          cinematicPrompt:
            'Cinematic opening wide shot, serene atmospheric landscape, 35mm analog film, golden hour lighting, masterpiece',
          cameraAngle: 'Wide Shot',
          lighting: 'Golden Hour Sunset',
          duration: 4.0,
          motionEffect: 'zoom-in',
        },
      ],
    };
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
  };

  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const duplicated: StoryboardProject = {
      ...target,
      id: `project-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [duplicated, ...prev]);
    setCurrentProjectId(duplicated.id);
  };

  const handleDeleteProject = (id: string) => {
    const remaining = projects.filter((p) => p.id !== id);
    if (remaining.length === 0) return;
    setProjects(remaining);
    if (currentProjectId === id) {
      setCurrentProjectId(remaining[0].id);
    }
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
    );
  };

  const handleImportProject = (imported: StoryboardProject) => {
    const safeProject: StoryboardProject = {
      ...imported,
      id: `project-${Date.now()}`,
      title: imported.title || 'Proyek Diimpor',
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [safeProject, ...prev]);
    setCurrentProjectId(safeProject.id);
    setIsProjectManagerOpen(false);
  };

  return (
    <div id="cineboard-app-root" className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Top Header Navigation */}
      <Header
        project={currentProject}
        onUpdateProject={updateProject}
        onOpenScriptIntake={() => setIsScriptIntakeOpen(true)}
        onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        onOpenStyleModal={() => setIsStyleModalOpen(true)}
        onOpenVideoPlayer={() => setIsVideoPlayerOpen(true)}
        onOpenPdfExport={() => setIsPdfExportOpen(true)}
        onAddScene={() => addScene()}
        totalDuration={totalDuration}
      />

      {/* Visual Timeline Bar */}
      <TimelineBar
        scenes={currentProject.scenes}
        selectedSceneId={selectedSceneId}
        onSelectScene={(id) => {
          setSelectedSceneId(id);
          const el = document.getElementById(`scene-panel-card-${currentProject.scenes.find((s) => s.id === id)?.sceneNumber}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        totalDuration={totalDuration}
      />

      {/* Workspace Subheader & Quick Tools */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/30 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Active Style & Continuity Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setIsStyleModalOpen(true)}
              className="group flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 text-neutral-300 hover:border-amber-500/50 transition"
              title="Ubah Preset Gaya Visual"
            >
              <Palette className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium text-neutral-400">Gaya:</span>
              <span className="font-semibold text-neutral-200 group-hover:text-amber-300">
                {currentProject.visualStyle.split('-')[0]}
              </span>
            </button>

            <button
              onClick={() => setIsStyleModalOpen(true)}
              className="group flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 text-neutral-300 hover:border-amber-500/50 transition"
              title="Ubah Preset Pencahayaan Panggung"
            >
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium text-neutral-400">Pencahayaan:</span>
              <span className="font-semibold text-neutral-200 group-hover:text-amber-300">
                {currentProject.lightingStyle.split('-')[0]}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 font-mono text-[11px] text-neutral-400">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Total Alur: <strong className="text-amber-300">{totalDuration.toFixed(1)}s</strong></span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            <button
              id="batch-render-all-btn"
              onClick={handleBatchRenderAll}
              disabled={isBatchRendering}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:border-amber-500/40 hover:bg-neutral-800 transition disabled:opacity-50"
              title="Generate / Render Semua Gambar Panel secara Otomatis"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isBatchRendering ? 'animate-spin text-amber-400' : ''}`} />
              <span>
                {isBatchRendering
                  ? `Merender (${batchProgress}%)...`
                  : 'Render Semua Panel'}
              </span>
            </button>

            <button
              id="subheader-play-video-btn"
              onClick={() => setIsVideoPlayerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Pratinjau Video ({totalDuration.toFixed(1)}s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Scene Panel Cards */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-4">
        {currentProject.scenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 p-12 text-center">
            <Film className="h-12 w-12 text-neutral-600 mb-3" />
            <h3 className="text-base font-bold text-neutral-200">Belum Ada Panel Adegan</h3>
            <p className="text-xs text-neutral-400 max-w-md mt-1 mb-4">
              Mulai dengan mengunggah naskah cerita atau lirik lagu Anda, atau tambahkan panel kosong secara manual.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsScriptIntakeOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 shadow"
              >
                <Wand2 className="h-4 w-4" />
                <span>Upload Naskah / Lirik AI</span>
              </button>
              <button
                onClick={() => addScene()}
                className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Panel Kosong</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentProject.scenes.map((scene, index) => (
              <PanelCard
                key={scene.id}
                scene={scene}
                index={index}
                totalScenes={currentProject.scenes.length}
                aspectRatio={currentProject.aspectRatio}
                visualStyleName={currentProject.visualStyle}
                isSelected={selectedSceneId === scene.id}
                onSelect={() => setSelectedSceneId(scene.id)}
                onUpdate={(updated) => updateScene(scene.id, updated)}
                onMoveUp={() => moveScene(index, 'up')}
                onMoveDown={() => moveScene(index, 'down')}
                onDuplicate={() => duplicateScene(index)}
                onDelete={() => deleteScene(index)}
                onInsertAfter={() => addScene(index)}
                onViewImage={(url, title) => setZoomImage({ url, title })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Action Dock for Fast Access */}
      <div className="sticky bottom-4 z-20 mx-auto px-4 pointer-events-none">
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-800/90 bg-neutral-950/90 p-2 shadow-2xl backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => addScene()}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
            title="Tambah Panel Adegan Baru di Akhir"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Tambah Panel</span>
          </button>

          <button
            onClick={() => setIsScriptIntakeOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
            title="Pecah Naskah / Lirik Baru dengan AI"
          >
            <Wand2 className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">AI Naskah</span>
          </button>

          <button
            id="floating-export-pdf-btn"
            onClick={() => setIsPdfExportOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-amber-500/50 hover:bg-neutral-800 hover:text-white transition"
            title="Ekspor Storyboard & Naskah ke PDF Dokumen Ulasan"
          >
            <FileText className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Ekspor PDF</span>
          </button>

          <div className="h-5 w-px bg-neutral-800" />

          <button
            id="floating-play-video-btn"
            onClick={() => setIsVideoPlayerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Putar & Ekspor Video ({totalDuration.toFixed(1)}s)</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ScriptIntakeModal
        isOpen={isScriptIntakeOpen}
        onClose={() => setIsScriptIntakeOpen(false)}
        aspectRatio={currentProject.aspectRatio}
        onApplyResult={handleApplyScriptResult}
      />

      <VideoPlayerModal
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
        scenes={currentProject.scenes}
        aspectRatio={currentProject.aspectRatio}
        visualStyleName={currentProject.visualStyle}
        transition={currentProject.transition}
        onChangeTransition={(trans) => updateProject({ transition: trans })}
        totalDuration={totalDuration}
        onOpenPdfExport={() => {
          setIsVideoPlayerOpen(false);
          setIsPdfExportOpen(true);
        }}
      />

      <PdfExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        project={currentProject}
        totalDuration={totalDuration}
      />

      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        projects={projects}
        currentProjectId={currentProject.id}
        onSwitchProject={(id) => setCurrentProjectId(id)}
        onCreateProject={handleCreateProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onImportProject={handleImportProject}
      />

      <GlobalStyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        aspectRatio={currentProject.aspectRatio}
        onChangeAspectRatio={(ratio) => updateProject({ aspectRatio: ratio })}
        visualStyle={currentProject.visualStyle}
        onChangeVisualStyle={(style) => updateProject({ visualStyle: style })}
        lightingStyle={currentProject.lightingStyle}
        onChangeLightingStyle={(lighting) => updateProject({ lightingStyle: lighting })}
        consistencyProfile={currentProject.consistencyProfile}
        onChangeConsistencyProfile={(profile) => updateProject({ consistencyProfile: profile })}
        onApplyStyleToAllScenes={applyGlobalStyleToAllScenes}
      />

      <ImageViewerModal
        isOpen={Boolean(zoomImage)}
        onClose={() => setZoomImage(null)}
        imageUrl={zoomImage?.url || ''}
        title={zoomImage?.title || 'Visual Adegan Sinematik'}
      />
    </div>
  );
}
