import React from 'react';
import { Clock, MoveHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { ScenePanel } from '../types';

interface TimelineBarProps {
  scenes: ScenePanel[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  totalDuration: number;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  scenes,
  selectedSceneId,
  onSelectScene,
  totalDuration,
}) => {
  if (scenes.length === 0) return null;

  return (
    <div
      id="timeline-bar-container"
      className="border-b border-neutral-800 bg-neutral-900/60 px-4 py-2.5 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-2 pb-1.5 text-[11px] font-medium text-neutral-400">
          <div className="flex items-center gap-1.5">
            <MoveHorizontal className="h-3 w-3 text-amber-400" />
            <span className="uppercase tracking-wider">Garis Waktu Alur Narasi</span>
            <span className="text-neutral-500">• Klik adegan untuk lompat ke panel</span>
          </div>
          <div className="font-mono text-neutral-300">
            Total: <span className="font-semibold text-amber-400">{totalDuration.toFixed(1)}s</span>
          </div>
        </div>

        {/* Scene Duration Blocks */}
        <div className="flex h-9 w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-0.5 shadow-inner">
          {scenes.map((scene) => {
            const widthPercent = totalDuration > 0 ? (scene.duration / totalDuration) * 100 : 100 / scenes.length;
            const isSelected = selectedSceneId === scene.id;

            return (
              <button
                key={scene.id}
                id={`timeline-scene-block-${scene.sceneNumber}`}
                onClick={() => onSelectScene(scene.id)}
                style={{ width: `${Math.max(4, widthPercent)}%` }}
                className={`group relative flex h-full items-center justify-center border-r border-neutral-900 px-1 text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/25 ring-1 ring-inset ring-amber-400'
                    : 'bg-neutral-900/90 hover:bg-neutral-800/90'
                }`}
                title={`Adegan #${scene.sceneNumber}: ${scene.title} (${scene.duration.toFixed(1)}s)`}
              >
                <span
                  className={`truncate text-[10px] font-semibold font-mono ${
                    isSelected ? 'text-amber-300' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  #{scene.sceneNumber} ({scene.duration.toFixed(1)}s)
                </span>

                {/* Subtle bottom indicator */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    isSelected ? 'bg-amber-400' : 'bg-neutral-700/50 group-hover:bg-neutral-500'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
