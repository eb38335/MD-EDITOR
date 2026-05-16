import { useEditorStore } from '../hooks/useEditorStore';

interface Props {
  fileId: string;
  content: string;
  viewMode: 'wysiwyg' | 'source';
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function StatusBar({ fileId, content, viewMode, zoom, onZoomIn, onZoomOut, onZoomReset }: Props) {
  const file = useEditorStore((s) => s.files.find((f) => f.id === fileId));
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div
      id="statusbar"
      className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-indigo-100 text-xs shrink-0"
    >
      <span className="font-medium truncate max-w-[8rem] sm:max-w-none">{file?.name ?? 'Untitled.md'}</span>
      {file?.isDirty && <span className="text-yellow-300 shrink-0">● Unsaved</span>}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline">{words}w · {chars}c</span>

        {/* Zoom controls */}
        <div className="flex items-center border-l border-indigo-500 pl-2 gap-0.5">
          <button
            onClick={onZoomOut}
            title="Zoom out (Ctrl+−)"
            disabled={zoom <= 50}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-indigo-500 disabled:opacity-40 cursor-pointer select-none"
          >−</button>
          <button
            onClick={onZoomReset}
            title="Reset zoom (Ctrl+0)"
            className="w-10 h-5 rounded hover:bg-indigo-500 tabular-nums text-center cursor-pointer select-none"
          >{zoom}%</button>
          <button
            onClick={onZoomIn}
            title="Zoom in (Ctrl+=)"
            disabled={zoom >= 200}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-indigo-500 disabled:opacity-40 cursor-pointer select-none"
          >+</button>
        </div>

        <span className="px-2 py-0.5 rounded bg-indigo-700">
          {viewMode === 'wysiwyg' ? 'WYSIWYG' : 'Source'}
        </span>
      </div>
    </div>
  );
}
