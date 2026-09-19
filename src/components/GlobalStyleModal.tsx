import React from 'react';
import {
  X,
  Sliders,
  Palette,
  Sun,
  Ratio,
  User,
  MapPin,
  Sparkles,
  Check,
} from 'lucide-react';
import { AspectRatio, ConsistencyProfile } from '../types';
import {
  ASPECT_RATIOS,
  VISUAL_STYLE_PRESETS,
  LIGHTING_PRESETS,
} from '../constants/presets';

interface GlobalStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  visualStyle: string;
  onChangeVisualStyle: (style: string) => void;
  lightingStyle: string;
  onChangeLightingStyle: (lighting: string) => void;
  consistencyProfile: ConsistencyProfile;
  onChangeConsistencyProfile: (profile: ConsistencyProfile) => void;
  onApplyStyleToAllScenes: () => void;
}

export const GlobalStyleModal: React.FC<GlobalStyleModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  onChangeAspectRatio,
  visualStyle,
  onChangeVisualStyle,
  lightingStyle,
  onChangeLightingStyle,
  consistencyProfile,
  onChangeConsistencyProfile,
  onApplyStyleToAllScenes,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="global-style-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="global-style-modal-content"
        className="relative flex w-full max-w-3xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden my-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 font-['Syne']">
                Gaya Visual & Konsistensi Sinematik
              </h2>
              <p className="text-xs text-neutral-400">
                Atur aspek rasio kanvas, tata cahaya panggung & jangkar konsistensi karakter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Aspect Ratio Selector */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <Ratio className="h-4 w-4 text-amber-400" />
              <span>Pengaturan Aspek Rasio (Viewport Kanvas & Video):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {ASPECT_RATIOS.map((item) => {
                const isSelected = item.id === aspectRatio;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeAspectRatio(item.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <span className="font-mono text-sm font-bold">{item.id}</span>
                    <span className="text-[10px] text-neutral-400 mt-1 leading-tight">
                      {item.iconDesc.split('/')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Style Preset */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <Palette className="h-4 w-4 text-amber-400" />
              <span>Gaya Visual Sinematik Konsisten:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VISUAL_STYLE_PRESETS.map((preset) => {
                const isSelected = visualStyle.includes(preset.name);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeVisualStyle(preset.name + ' - ' + preset.promptSuffix)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/40'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-neutral-100">{preset.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-1 leading-normal">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lighting Style Preset */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Gaya Pencahayaan Panggung Spesifik:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LIGHTING_PRESETS.map((light) => {
                const isSelected = lightingStyle.includes(light.name);
                return (
                  <button
                    key={light.id}
                    type="button"
                    onClick={() => onChangeLightingStyle(light.name + ' - ' + light.promptKeywords)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/40'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-neutral-100">{light.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-medium">{light.mood}</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                      {light.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character & Environment Consistency Anchors */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Jangkar Konsistensi Karakter & Latar Dunia</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Informasi ini akan otomatis diinjeksi ke setiap prompt gambar panel agar karakter dan atmosfer tetap koheren sepanjang adegan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-neutral-300 pb-1">
                  <User className="h-3 w-3 text-amber-400" />
                  <span>Ciri Karakter Protagonis:</span>
                </label>
                <textarea
                  rows={2}
                  value={consistencyProfile.protagonist}
                  onChange={(e) =>
                    onChangeConsistencyProfile({ ...consistencyProfile, protagonist: e.target.value })
                  }
                  placeholder="Contoh: Pria berumur 28 tahun berambut ikal hitam, mengenakan mantel cokelat berkerah wol, jam tangan kuningan vintage..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-neutral-300 pb-1">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  <span>Ciri Lingkungan / Setting:</span>
                </label>
                <textarea
                  rows={2}
                  value={consistencyProfile.environment}
                  onChange={(e) =>
                    onChangeConsistencyProfile({ ...consistencyProfile, environment: e.target.value })
                  }
                  placeholder="Contoh: Kota distopia berhujan dengan jalan berbatu basah dan jembatan kabel gantung..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <button
            type="button"
            onClick={onApplyStyleToAllScenes}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Terapkan Gaya Ini ke Semua Adegan Sekarang</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-neutral-950 shadow hover:bg-amber-400 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
