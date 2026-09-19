import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Clock,
  Film,
  Check,
  Edit2,
} from 'lucide-react';
import { StoryboardProject } from '../types';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StoryboardProject[];
  currentProjectId: string;
  onSwitchProject: (id: string) => void;
  onCreateProject: (title?: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onImportProject: (imported: StoryboardProject) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSwitchProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onImportProject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (project: StoryboardProject) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameProject(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportJSON = (project: StoryboardProject) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${project.title.replace(/\s+/g, '_')}_Storyboard.json`;
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.scenes && Array.isArray(json.scenes)) {
          onImportProject(json);
        } else {
          alert('Format file JSON proyek storyboard tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="project-manager-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="project-manager-modal-content"
        className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden my-auto max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 font-['Syne']">
                Manajemen Proyek Storyboard
              </h2>
              <p className="text-xs text-neutral-400">
                Simpan, duplikasi, kelola alur naskah & ekspor backup proyek
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

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 bg-neutral-950 px-6 py-3">
          <button
            onClick={() => onCreateProject('Proyek Storyboard Baru')}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 shadow hover:bg-amber-400 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Buat Proyek Baru</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 cursor-pointer transition">
            <Upload className="h-3.5 w-3.5" />
            <span>Impor Proyek (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {projects.map((proj) => {
            const isCurrent = proj.id === currentProjectId;
            const totalDur = (proj.scenes || []).reduce((a, b) => a + (b.duration || 3.5), 0);

            return (
              <div
                key={proj.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition ${
                  isCurrent
                    ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {editingId === proj.id ? (
                      <div className="flex items-center gap-1 flex-1 max-w-sm">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="rounded bg-neutral-900 px-2 py-1 text-sm font-semibold text-neutral-100 border border-amber-500/60 focus:outline-none w-full"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(proj.id);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(proj.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-sm text-neutral-100 truncate">
                          {proj.title}
                        </span>
                        <button
                          onClick={() => handleStartRename(proj)}
                          className="text-neutral-500 hover:text-neutral-300 transition"
                          title="Ganti Nama"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        {isCurrent && (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            AKTIF
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Film className="h-3 w-3 text-neutral-500" />
                      {proj.scenes?.length || 0} Adegan
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-neutral-500" />
                      {totalDur.toFixed(1)}s
                    </span>
                    <span className="text-neutral-500 font-mono">
                      Rasio {proj.aspectRatio || '16:9'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onSwitchProject(proj.id);
                        onClose();
                      }}
                      className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition"
                    >
                      Buka Proyek
                    </button>
                  )}

                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    className="p-1.5 text-neutral-400 hover:text-white transition rounded hover:bg-neutral-800"
                    title="Duplikasi Proyek"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleExportJSON(proj)}
                    className="p-1.5 text-neutral-400 hover:text-white transition rounded hover:bg-neutral-800"
                    title="Ekspor File Backup JSON"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {projects.length > 1 && (
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 transition rounded hover:bg-rose-950/30"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
