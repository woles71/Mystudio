import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  BookOpen,
  Music,
  FileText,
  Sliders,
  CheckCircle2,
  Wand2,
  ChevronRight,
  Sun,
  Palette,
  User,
  MapPin,
} from 'lucide-react';
import { AspectRatio } from '../types';
import {
  VISUAL_STYLE_PRESETS,
  LIGHTING_PRESETS,
  SAMPLE_STORIES,
} from '../constants/presets';
import { requestScriptAssist, ScriptAssistResult } from '../utils/aiClient';

interface ScriptIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  onApplyResult: (result: ScriptAssistResult, rawText: string, sourceType: any) => void;
}

export const ScriptIntakeModal: React.FC<ScriptIntakeModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  onApplyResult,
}) => {
  const [sourceType, setSourceType] = useState<'story' | 'lyrics' | 'storyboard_raw'>('story');
  const [inputText, setInputText] = useState('');
  const [targetScenes, setTargetScenes] = useState(5);
  const [selectedStyleId, setSelectedStyleId] = useState(VISUAL_STYLE_PRESETS[0].id);
  const [selectedLightingId, setSelectedLightingId] = useState(LIGHTING_PRESETS[0].id);
  const [characterNotes, setCharacterNotes] = useState('');
  const [settingNotes, setSettingNotes] = useState('');
  const [aiMode, setAiMode] = useState<'breakdown' | 'expand_script' | 'lyrics_to_storyboard'>('breakdown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setErrorMessage('');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample: (typeof SAMPLE_STORIES)[0]) => {
    setInputText(sample.text);
    setSourceType(sample.type);
    setSelectedStyleId(sample.suggestedStyle);
    setSelectedLightingId(sample.suggestedLighting);
    setTargetScenes(sample.targetScenes);
    if (sample.type === 'lyrics') {
      setAiMode('lyrics_to_storyboard');
    } else {
      setAiMode('breakdown');
    }
    setErrorMessage('');
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Silakan tulis, tempel, atau unggah teks cerita/lirik terlebih dahulu.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const visualPreset = VISUAL_STYLE_PRESETS.find((v) => v.id === selectedStyleId) || VISUAL_STYLE_PRESETS[0];
      const lightingPreset = LIGHTING_PRESETS.find((l) => l.id === selectedLightingId) || LIGHTING_PRESETS[0];

      const result = await requestScriptAssist({
        sourceText: inputText,
        mode: aiMode,
        targetScenes,
        visualStyle: visualPreset.name + ' - ' + visualPreset.promptSuffix,
        lightingStyle: lightingPreset.name + ' - ' + lightingPreset.promptKeywords,
        aspectRatio,
        characterNotes,
        settingNotes,
      });

      onApplyResult(result, inputText, sourceType);
      onClose();
    } catch (err: any) {
      console.error('Process script error:', err);
      setErrorMessage(err?.message || 'Gagal memproses naskah dengan AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="script-intake-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="script-intake-modal-content"
        className="relative flex w-full max-w-4xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden my-6 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 font-['Syne']">
                AI Scriptwriter & Storyboard Intake
              </h2>
              <p className="text-xs text-neutral-400">
                Pecah naskah cerita, storyboard kasar, atau lirik lagu menjadi panel sinematik sekuensial koheren
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Type Selector & Samples */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setSourceType('story');
                  setAiMode('breakdown');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  sourceType === 'story'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Naskah Cerita</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType('lyrics');
                  setAiMode('lyrics_to_storyboard');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  sourceType === 'lyrics'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Music className="h-3.5 w-3.5" />
                <span>Lirik Lagu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType('storyboard_raw');
                  setAiMode('breakdown');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  sourceType === 'storyboard_raw'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Outline Kasar</span>
              </button>
            </div>

            {/* Presets Button Quick Pick */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Contoh Cepat:</span>
              {SAMPLE_STORIES.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:border-amber-500/40 hover:text-amber-300 transition"
                >
                  {sample.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea & File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                {sourceType === 'lyrics'
                  ? 'Ketik atau Tempelkan Lirik Lagu:'
                  : 'Ketik atau Tempelkan Cerita / Naskah:'}
              </label>
              <label className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File (.txt, .md, .lrc)</span>
                <input
                  type="file"
                  accept=".txt,.md,.lrc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                sourceType === 'lyrics'
                  ? 'Tempelkan bait dan reff lirik lagu di sini...\nContoh:\n[Bait 1]\nLampu peron mulai temaram menyala\nKereta senja bersiap pergi ke utara...'
                  : 'Tulis atau tempelkan narasi cerita Anda di sini...\nContoh:\nDi sebuah stasiun angkasa yang terbengkalai, seorang penjelajah menemukan kristal memori kuno...'
              }
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition font-sans leading-relaxed"
            />
          </div>

          {/* AI Scriptwriter Strategy Options */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Strategi Bantuan Penulisan AI (Coherent Script Engine)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setAiMode('breakdown')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  aiMode === 'breakdown'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="text-xs font-bold text-neutral-100">Pecah ke Adegan Berurutan</span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Mendeteksi ketukan dramatis dan membagi menjadi urutan visual proporsional.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAiMode('expand_script')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  aiMode === 'expand_script'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="text-xs font-bold text-neutral-100">Perluas Naskah Koheren</span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Menyempurnakan ide kasar menjadi naskah utuh dengan karakterisasi tajam.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAiMode('lyrics_to_storyboard')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  aiMode === 'lyrics_to_storyboard'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="text-xs font-bold text-neutral-100">Visualisasi Puitis Lagu</span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Menerjemahkan emosi dan ritme lirik menjadi video klip musik sinematik.
                </span>
              </button>
            </div>
          </div>

          {/* Visual Style & Specific Lighting Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Style Preset */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                <Palette className="h-3.5 w-3.5 text-amber-400" />
                <span>Preset Gaya Visual Sinematik:</span>
              </label>
              <select
                value={selectedStyleId}
                onChange={(e) => setSelectedStyleId(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2.5 text-xs font-medium text-neutral-200 focus:border-amber-500 focus:outline-none"
              >
                {VISUAL_STYLE_PRESETS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-neutral-950 text-neutral-200">
                    {v.name} ({v.filmLook})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500">
                {VISUAL_STYLE_PRESETS.find((v) => v.id === selectedStyleId)?.description}
              </p>
            </div>

            {/* Lighting Style Preset */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Gaya Pencahayaan Spesifik:</span>
              </label>
              <select
                value={selectedLightingId}
                onChange={(e) => setSelectedLightingId(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2.5 text-xs font-medium text-neutral-200 focus:border-amber-500 focus:outline-none"
              >
                {LIGHTING_PRESETS.map((l) => (
                  <option key={l.id} value={l.id} className="bg-neutral-950 text-neutral-200">
                    {l.name} — {l.mood}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500">
                {LIGHTING_PRESETS.find((l) => l.id === selectedLightingId)?.description}
              </p>
            </div>
          </div>

          {/* Target Scene Count & Continuity Anchors */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Jumlah Target Panel Adegan:
              </label>
              <span className="font-mono text-xs font-bold text-amber-400">
                {targetScenes} Adegan
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={targetScenes}
              onChange={(e) => setTargetScenes(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            {/* Character & Environment Consistency Anchors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 pb-1">
                  <User className="h-3 w-3 text-amber-400" />
                  <span>Ciri Karakter Utama (Konsistensi):</span>
                </label>
                <input
                  type="text"
                  value={characterNotes}
                  onChange={(e) => setCharacterNotes(e.target.value)}
                  placeholder="Contoh: Pria 30an, jaket kulit cokelat tua, kacamata perak..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 pb-1">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  <span>Ciri Lingkungan & Dunia:</span>
                </label>
                <input
                  type="text"
                  value={settingNotes}
                  onChange={(e) => setSettingNotes(e.target.value)}
                  placeholder="Contoh: Stasiun kereta uap klasik di pedesaan berkabut..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Error notification if any */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing || !inputText.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Memproses dengan AI...' : 'Bangun Storyboard Sinematik'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
