import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Printer,
  Moon,
  Sun,
  LayoutGrid,
  Layers,
  UserCheck,
} from 'lucide-react';
import { StoryboardProject } from '../types';
import { exportStoryboardToPdf } from '../utils/pdfExporter';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: StoryboardProject;
  totalDuration: number;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  project,
  totalDuration,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light'); // default to print-friendly light for reviews
  const [layoutMode, setLayoutMode] = useState<'detailed' | 'compact'>('detailed');
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [includeScriptText, setIncludeScriptText] = useState(Boolean(project.rawSourceText?.trim()));
  const [includePrompts, setIncludePrompts] = useState(true);
  const [includeReviewerSignOff, setIncludeReviewerSignOff] = useState(true);
  const [includeConsistencyProfile, setIncludeConsistencyProfile] = useState(true);
  const [reviewerName, setReviewerName] = useState('Director / Executive Producer');
  const [productionCompany, setProductionCompany] = useState('CineBoard AI Studio');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalScenes = project.scenes.length;
  // Estimated pages calculation
  let estimatedPages = 0;
  if (includeCoverPage) estimatedPages += 1;
  if (includeScriptText && project.rawSourceText?.trim()) estimatedPages += 1;
  estimatedPages += Math.ceil(totalScenes / (layoutMode === 'detailed' ? 2 : 4));

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setProgress(0);
      setDownloadUrl(null);

      const result = await exportStoryboardToPdf({
        project,
        theme,
        layoutMode,
        includeCoverPage,
        includeScriptText,
        includePrompts,
        includeReviewerSignOff,
        includeConsistencyProfile,
        reviewerName,
        productionCompany,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusText(msg);
        },
      });

      setDownloadUrl(result.downloadUrl);
      setFilename(result.filename);
    } catch (err: any) {
      console.error('Export PDF error:', err);
      setErrorMessage(err?.message || 'Gagal menghasilkan dokumen PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPreview = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div
      id="pdf-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="pdf-export-modal-content"
        className="relative flex w-full max-w-3xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 font-['Syne']">
                Ekspor Dokumen PDF Storyboard & Naskah
              </h2>
              <p className="text-xs text-neutral-400">
                Format dokumen ulasan profesional untuk sutradara, produser, klien, dan tim produksi
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
          {/* Theme & Layout Style Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Document Theme */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5 text-amber-400" />
                <span>Tema & Gaya Tampilan Dokumen:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    theme === 'light'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Sun className="h-4 w-4 mb-1" />
                  <span className="text-xs font-bold">Studio Light</span>
                  <span className="text-[10px] text-neutral-400">Hemat tinta, siap cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    theme === 'dark'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Moon className="h-4 w-4 mb-1" />
                  <span className="text-xs font-bold">Executive Dark</span>
                  <span className="text-[10px] text-neutral-400">Presentasi iPad & layar</span>
                </button>
              </div>
            </div>

            {/* Layout Density */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5 text-amber-400" />
                <span>Format Tata Letak Adegan:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutMode('detailed')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    layoutMode === 'detailed'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Layers className="h-4 w-4 mb-1" />
                  <span className="text-xs font-bold">Rinci (2 Adegan/Hal)</span>
                  <span className="text-[10px] text-neutral-400">Lengkap dengan dialog & sign-off</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('compact')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    layoutMode === 'compact'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 mb-1" />
                  <span className="text-xs font-bold">Ringkas (4 Adegan/Hal)</span>
                  <span className="text-[10px] text-neutral-400">Shotlist padat efisien</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Toggles */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
            <div className="text-xs font-bold text-neutral-200">
              Komponen & Bagian Dokumen yang Disertakan:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={includeCoverPage}
                  onChange={(e) => setIncludeCoverPage(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <span>Halaman Sampul Eksekutif & Logline Proyek</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={includeScriptText}
                  onChange={(e) => setIncludeScriptText(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <span>Halaman Teks Naskah Asli / Lirik Narasi</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={includePrompts}
                  onChange={(e) => setIncludePrompts(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <span>Prompt Teknis Sinematik AI / VFX</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={includeReviewerSignOff}
                  onChange={(e) => setIncludeReviewerSignOff(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <span>Area Tanda Tangan & Kotak Persetujuan Ulasan</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer p-1 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={includeConsistencyProfile}
                  onChange={(e) => setIncludeConsistencyProfile(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <span>Jangkar Konsistensi Karakter & Deskripsi Dunia</span>
              </label>
            </div>
          </div>

          {/* Professional Header Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Nama Perusahaan Produksi / Studio:
              </label>
              <input
                type="text"
                value={productionCompany}
                onChange={(e) => setProductionCompany(e.target.value)}
                placeholder="Contoh: CineBoard Creative Studio Ltd."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Sasaran Penilai / Reviewer:
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Contoh: Director, Lead Producer, atau Nama Klien"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-900/80 px-4 py-2.5 border border-neutral-800/80 text-xs">
            <div className="flex items-center gap-4 text-neutral-400">
              <span>
                Total Adegan: <strong className="text-amber-400">{totalScenes}</strong>
              </span>
              <span>
                Total Durasi: <strong className="text-amber-400">{totalDuration.toFixed(1)}s</strong>
              </span>
              <span>
                Estimasi Halaman: <strong className="text-neutral-200">±{estimatedPages} Halaman</strong>
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">A4 • 300 DPI Rendering</span>
          </div>

          {/* Progress Status Bar */}
          {isGenerating && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  {statusText}
                </span>
                <span className="font-mono font-bold text-amber-300">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-amber-500 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {/* Completed Download Card */}
          {downloadUrl && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-xs text-emerald-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-100">PDF Siap Diunduh!</div>
                  <div className="text-[11px] text-emerald-400/80">{filename}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-900/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/70 transition"
                  title="Buka Pratinjau PDF di Tab Baru"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka di Tab Baru</span>
                </button>

                <a
                  href={downloadUrl}
                  download={filename || 'Storyboard_Review_Deck.pdf'}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 font-bold text-neutral-950 shadow hover:bg-emerald-400 transition"
                >
                  <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            Tutup
          </button>

          <button
            id="modal-generate-pdf-btn"
            type="button"
            onClick={handleExport}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            <FileText className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Membuat Dokumen PDF...' : 'Buat & Unduh PDF Review'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
