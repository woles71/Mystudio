import React from 'react';
import {
  Film,
  Sparkles,
  Sliders,
  Play,
  Layers,
  Clock,
  Ratio,
  Plus,
  Wand2,
  FileText,
} from 'lucide-react';
import { AspectRatio, StoryboardProject } from '../types';
import { ASPECT_RATIOS } from '../constants/presets';

interface HeaderProps {
  project: StoryboardProject;
  onUpdateProject: (partial: Partial<StoryboardProject>) => void;
  onOpenScriptIntake: () => void;
  onOpenProjectManager: () => void;
  onOpenStyleModal: () => void;
  onOpenVideoPlayer: () => void;
  onOpenPdfExport: () => void;
  onAddScene: () => void;
  totalDuration: number;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  onOpenScriptIntake,
  onOpenProjectManager,
  onOpenStyleModal,
  onOpenVideoPlayer,
  onOpenPdfExport,
  onAddScene,
  totalDuration,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md px-4 py-2.5 sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
            <Film className="h-5 w-5 text-neutral-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Syne'] text-base font-bold tracking-tight text-neutral-100 sm:text-lg">
                CineBoard
              </span>
              <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                AI STUDIO
              </span>
            </div>
            {/* Clickable Project Title */}
            <button
              id="header-project-title-btn"
              onClick={onOpenProjectManager}
              className="group flex items-center gap-1.5 text-xs text-neutral-400 transition hover:text-neutral-200"
              title="Kelola & Ganti Proyek"
            >
              <span className="max-w-[160px] truncate font-medium text-neutral-300 sm:max-w-[240px]">
                {project.title}
              </span>
              <Layers className="h-3 w-3 text-neutral-500 group-hover:text-amber-400" />
            </button>
          </div>
        </div>

        {/* Center Control: Aspect Ratio & Duration Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 p-1">
          {/* Aspect Ratio Selector */}
          <div className="relative flex items-center">
            <Ratio className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-amber-400" />
            <select
              id="header-aspect-ratio-select"
              value={project.aspectRatio}
              onChange={(e) => onUpdateProject({ aspectRatio: e.target.value as AspectRatio })}
              className="h-8 rounded-lg bg-transparent pl-8 pr-6 text-xs font-medium text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {ASPECT_RATIOS.map((r) => (
                <option key={r.id} value={r.id} className="bg-neutral-900 text-neutral-100">
                  {r.id} ({r.label.split(' ')[1] || r.id})
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-neutral-800" />

          {/* Duration Badge */}
          <div className="flex items-center gap-1.5 px-2.5 text-xs text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono font-semibold text-amber-300">{totalDuration.toFixed(1)}s</span>
            <span className="text-neutral-500">({project.scenes.length} Adegan)</span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Script & Lyrics Button */}
          <button
            id="header-open-script-intake-btn"
            onClick={onOpenScriptIntake}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 px-3 text-xs font-semibold text-neutral-200 shadow-sm transition hover:border-amber-500/50 hover:bg-neutral-800 hover:text-white"
            title="Upload atau Paste Naskah Cerita / Lirik Lagu dengan AI Assistant"
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Naskah & Lirik</span>
          </button>

          {/* Style & Lighting Button */}
          <button
            id="header-open-style-modal-btn"
            onClick={onOpenStyleModal}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 px-3 text-xs font-semibold text-neutral-200 shadow-sm transition hover:border-amber-500/50 hover:bg-neutral-800 hover:text-white"
            title="Pengaturan Gaya Visual, Pencahayaan & Konsistensi Karakter"
          >
            <Sliders className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden lg:inline">Gaya & Lighting</span>
          </button>

          {/* Export PDF Review Button */}
          <button
            id="header-open-pdf-export-btn"
            onClick={onOpenPdfExport}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 px-3 text-xs font-semibold text-neutral-200 shadow-sm transition hover:border-amber-500/50 hover:bg-neutral-800 hover:text-white"
            title="Ekspor Storyboard & Naskah ke Dokumen PDF untuk Ulasan Profesional"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ekspor PDF</span>
          </button>

          {/* Add Scene Button */}
          <button
            id="header-add-scene-btn"
            onClick={onAddScene}
            className="flex h-9 items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            title="Tambah Panel Adegan Baru"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Panel</span>
          </button>

          {/* Primary Action: Video Player & Export */}
          <button
            id="header-open-video-player-btn"
            onClick={onOpenVideoPlayer}
            className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Putar & Ekspor Video</span>
          </button>
        </div>
      </div>
    </header>
  );
};
