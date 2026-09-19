import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Film,
  Subtitles,
  Sparkles,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Layers,
  FileText,
} from 'lucide-react';
import { ScenePanel, AspectRatio, TransitionType } from '../types';
import { ASPECT_RATIOS } from '../constants/presets';
import { generateProceduralCinematicFrame } from '../utils/proceduralCanvas';
import { globalAudio } from '../utils/audioSynth';
import { exportStoryboardToVideo } from '../utils/videoExporter';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: ScenePanel[];
  aspectRatio: AspectRatio;
  visualStyleName: string;
  transition: TransitionType;
  onChangeTransition: (trans: TransitionType) => void;
  totalDuration: number;
  onOpenPdfExport?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  scenes,
  aspectRatio,
  visualStyleName,
  transition,
  onChangeTransition,
  totalDuration,
  onOpenPdfExport,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Video Export States
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // Current Scene Index calculation
  let accumulatedTime = 0;
  let activeSceneIndex = 0;
  let timeIntoCurrentScene = 0;

  for (let i = 0; i < scenes.length; i++) {
    const sceneDur = scenes[i].duration || 3.5;
    if (currentTime >= accumulatedTime && currentTime < accumulatedTime + sceneDur) {
      activeSceneIndex = i;
      timeIntoCurrentScene = currentTime - accumulatedTime;
      break;
    }
    accumulatedTime += sceneDur;
  }
  if (currentTime >= totalDuration && scenes.length > 0) {
    activeSceneIndex = scenes.length - 1;
    timeIntoCurrentScene = scenes[scenes.length - 1].duration;
  }

  const activeScene = scenes[activeSceneIndex] || scenes[0];
  const activeSceneDuration = activeScene?.duration || 3.5;
  const progressRatioInScene = Math.min(1, Math.max(0, timeIntoCurrentScene / activeSceneDuration));

  // Ken Burns Motion CSS transform
  let kenBurnsTransform = 'scale(1)';
  if (activeScene) {
    const motion = activeScene.motionEffect || (activeSceneIndex % 2 === 0 ? 'zoom-in' : 'pan-right');
    if (motion === 'zoom-in') {
      const scale = 1 + progressRatioInScene * 0.12;
      kenBurnsTransform = `scale(${scale})`;
    } else if (motion === 'zoom-out') {
      const scale = 1.12 - progressRatioInScene * 0.12;
      kenBurnsTransform = `scale(${scale})`;
    } else if (motion === 'pan-right') {
      const translateX = (progressRatioInScene - 0.5) * 40;
      kenBurnsTransform = `scale(1.08) translateX(${translateX}px)`;
    } else if (motion === 'pan-left') {
      const translateX = (0.5 - progressRatioInScene) * 40;
      kenBurnsTransform = `scale(1.08) translateX(${translateX}px)`;
    }
  }

  // Playback Animation Loop
  useEffect(() => {
    if (isPlaying) {
      if (isAudioEnabled) {
        globalAudio.startAtmosphere();
      }

      const loop = (timestamp: number) => {
        if (!lastTickRef.current) lastTickRef.current = timestamp;
        const delta = (timestamp - lastTickRef.current) / 1000;
        lastTickRef.current = timestamp;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= totalDuration) {
            setIsPlaying(false);
            globalAudio.stopAtmosphere();
            return 0; // Loop or reset
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(loop);
      };

      animationFrameRef.current = requestAnimationFrame(loop);
    } else {
      lastTickRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      globalAudio.stopAtmosphere();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      globalAudio.stopAtmosphere();
    };
  }, [isPlaying, totalDuration, isAudioEnabled]);

  if (!isOpen) return null;

  // Aspect ratio resolution
  const aspectConfig = ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[0];

  const handleTogglePlay = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    globalAudio.stopAtmosphere();
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = (clickX / rect.width) * totalDuration;
    setCurrentTime(newTime);
  };

  // Export Video Handler
  const handleStartExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      setExportProgress(0);
      setExportedVideoUrl(null);

      // Pause playback if running
      setIsPlaying(false);

      const res = await exportStoryboardToVideo({
        scenes,
        aspectRatio,
        visualStyleName,
        transition,
        includeSubtitles: showSubtitles,
        includeAudio: isAudioEnabled,
        onProgress: (percent, statusText) => {
          setExportProgress(percent);
          setExportStatusText(statusText);
        },
      });

      setExportedVideoUrl(res.downloadUrl);
      setExportedFilename(res.filename);
    } catch (err: any) {
      console.error('Export video error:', err);
      setExportError(err?.message || 'Gagal mengekspor video.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export HTML Contact Sheet / Print
  const handleExportContactSheet = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Storyboard Sheet - ${visualStyleName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #000; color: #fff; padding: 24px; }
            h1 { font-size: 24px; margin-bottom: 4px; color: #f59e0b; }
            p { color: #888; font-size: 13px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
            .card { border: 1px solid #333; border-radius: 8px; overflow: hidden; background: #111; }
            img { width: 100%; height: 200px; object-fit: cover; display: block; }
            .meta { padding: 12px; }
            .title { font-weight: bold; font-size: 14px; margin-bottom: 6px; }
            .desc { font-size: 12px; color: #aaa; margin-bottom: 8px; }
            .badges { font-size: 11px; color: #f59e0b; }
          </style>
        </head>
        <body>
          <h1>Storyboard Visual Sheet</h1>
          <p>Rasio: ${aspectRatio} • Gaya: ${visualStyleName} • Total Durasi: ${totalDuration.toFixed(1)}s</p>
          <div class="grid">
            ${scenes
              .map(
                (s) => `
              <div class="card">
                <img src="${s.imageUrl || generateProceduralCinematicFrame(s, aspectRatio, visualStyleName, 640, 360)}" />
                <div class="meta">
                  <div class="title">#${s.sceneNumber}: ${s.title} (${s.duration.toFixed(1)}s)</div>
                  <div class="desc">${s.narrative ? `“${s.narrative}”` : s.visualDescription}</div>
                  <div class="badges">🎥 ${s.cameraAngle} • 💡 ${s.lighting}</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </body>
      </html>
    `;
    printWin.document.write(html);
    printWin.document.close();
  };

  const currentDisplayImage =
    activeScene?.imageUrl ||
    (activeScene
      ? generateProceduralCinematicFrame(activeScene, aspectRatio, visualStyleName, 1280, 720)
      : '');

  return (
    <div
      id="video-player-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="video-player-modal-content"
        className="relative flex w-full max-w-5xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden my-auto max-h-[96vh]"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 font-['Syne']">
                Pemutar Sinematik & Ekspor Video
              </h2>
              <p className="text-[11px] text-neutral-400">
                Pratinjau gerakan Ken Burns, transisi adegan, audio atmosferik & download video MP4/WebM
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative flex items-center justify-center bg-black p-4 min-h-[340px] sm:min-h-[440px] overflow-hidden">
          {/* Constrained Video Viewport according to Aspect Ratio */}
          <div
            style={{
              aspectRatio: `${aspectConfig.width} / ${aspectConfig.height}`,
              maxHeight: '52vh',
            }}
            className="relative w-full max-w-full overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950 shadow-2xl flex items-center justify-center"
          >
            {/* Ken Burns Motion Container */}
            <div
              className="absolute inset-0 transition-transform duration-100 ease-out origin-center"
              style={{ transform: kenBurnsTransform }}
            >
              {currentDisplayImage ? (
                <img
                  src={currentDisplayImage}
                  alt={activeScene?.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-600">
                  Tidak ada adegan
                </div>
              )}
            </div>

            {/* Vignette Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70" />

            {/* Subtitle / Narration Banner */}
            {showSubtitles && activeScene?.narrative && (
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-neutral-950/85 px-4 py-2.5 text-center backdrop-blur-md border border-neutral-800/60 shadow-lg">
                <p className="text-xs sm:text-sm font-medium text-amber-200 drop-shadow">
                  “{activeScene.narrative}”
                </p>
                <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                  Adegan #{activeScene.sceneNumber}: {activeScene.title} • {activeScene.cameraAngle}
                </p>
              </div>
            )}

            {/* Top Right Scene Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-neutral-950/80 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300 backdrop-blur-md border border-neutral-800">
              #{activeSceneIndex + 1}/{scenes.length} • {currentTime.toFixed(1)}s /{' '}
              {totalDuration.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Timeline Scrubbing Bar */}
        <div className="border-t border-neutral-800 bg-neutral-900/90 px-5 pt-3 pb-2 space-y-2">
          {/* Interactive scrubber */}
          <div
            id="video-scrubber-track"
            onClick={handleScrub}
            className="group relative h-4 w-full flex items-center cursor-pointer select-none"
          >
            <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden relative group-hover:h-2 transition-all">
              {/* Scene divider ticks */}
              {scenes.map((s, i) => {
                const startSec = scenes.slice(0, i).reduce((a, b) => a + b.duration, 0);
                const leftPercent = totalDuration > 0 ? (startSec / totalDuration) * 100 : 0;
                return (
                  <div
                    key={s.id}
                    style={{ left: `${leftPercent}%` }}
                    className="absolute top-0 bottom-0 w-px bg-neutral-950/80 z-10"
                  />
                );
              })}

              {/* Progress fill */}
              <div
                style={{
                  width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
                }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              />
            </div>

            {/* Playhead thumb */}
            <div
              style={{
                left: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
              }}
              className="absolute -ml-2 h-4 w-4 rounded-full border-2 border-amber-400 bg-neutral-950 shadow-md group-hover:scale-110 transition-transform"
            />
          </div>

          {/* Player Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Left: Play, Reset, Time */}
            <div className="flex items-center gap-2">
              <button
                id="video-play-pause-btn"
                onClick={handleTogglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 shadow-md hover:bg-amber-400 transition active:scale-95"
                title={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>

              <button
                id="video-reset-btn"
                onClick={handleReset}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition hover:bg-neutral-800"
                title="Ulangi dari Awal"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Time display */}
              <div className="font-mono text-xs text-neutral-300 ml-1">
                <span className="font-semibold text-amber-400">{currentTime.toFixed(1)}s</span> /{' '}
                <span className="text-neutral-500">{totalDuration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Center: Audio & Subtitle Toggles, Transition selector */}
            <div className="flex items-center gap-2">
              {/* Transition selector */}
              <div className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-950/70 border border-neutral-800 rounded-lg px-2 py-1">
                <Layers className="h-3 w-3 text-neutral-500" />
                <select
                  value={transition}
                  onChange={(e) => onChangeTransition(e.target.value as TransitionType)}
                  className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="crossfade">Crossfade (Lembut)</option>
                  <option value="fade-to-black">Fade to Black</option>
                  <option value="cut">Cut (Langsung)</option>
                </select>
              </div>

              {/* Subtitle toggle */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition ${
                  showSubtitles
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                }`}
                title="Tampilkan / Sembunyikan Subtitle Lirik & Narasi"
              >
                <Subtitles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Subtitle</span>
              </button>

              {/* Ambient Audio Synth toggle */}
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition ${
                  isAudioEnabled
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                }`}
                title="Aktifkan Musik / Audio Latar Sinematik"
              >
                {isAudioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Audio</span>
              </button>
            </div>

            {/* Right: Export buttons */}
            <div className="flex items-center gap-2">
              {onOpenPdfExport && (
                <button
                  id="player-export-pdf-btn"
                  onClick={onOpenPdfExport}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-xs font-semibold text-neutral-300 hover:border-amber-500/50 hover:bg-neutral-800 hover:text-white transition"
                  title="Ekspor Storyboard & Naskah ke PDF untuk Ulasan Profesional"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Dokumen PDF</span>
                </button>
              )}

              <button
                onClick={handleExportContactSheet}
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                title="Cetak / Buka Lembar Storyboard Kontak"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Lembar Kontak</span>
              </button>

              <button
                id="start-export-video-btn"
                onClick={handleStartExport}
                disabled={isExporting}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{isExporting ? 'Merender...' : 'Ekspor Video'}</span>
              </button>
            </div>
          </div>

          {/* Exporting Progress Bar Banner */}
          {isExporting && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 animate-spin" />
                  {exportStatusText}
                </span>
                <span className="font-mono font-bold text-amber-300">{exportProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden">
                <div
                  style={{ width: `${exportProgress}%` }}
                  className="h-full bg-amber-500 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {/* Completed Download Card */}
          {exportedVideoUrl && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-100">Video Berhasil Dirender!</div>
                  <div className="text-[11px] text-emerald-400/80">{exportedFilename}</div>
                </div>
              </div>
              <a
                href={exportedVideoUrl}
                download={exportedFilename || 'CineBoard_Video.webm'}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-neutral-950 shadow hover:bg-emerald-400 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Video File</span>
              </a>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{exportError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
