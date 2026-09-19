import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-5 py-3">
          <span className="text-sm font-bold text-neutral-200 truncate">{title}</span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download={`${title.replace(/\s+/g, '_')}.png`}
              className="flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Still</span>
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center p-2 bg-black overflow-auto">
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="max-h-[78vh] w-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
