import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../hooks/useEditorStore';
import { useFileSystem } from '../hooks/useFileSystem';

export function TabBar() {
  const { files, activeFileId, setActiveFile, closeFile, renameFile, pendingRenameId, clearPendingRename } = useEditorStore();
  const { save } = useFileSystem();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-enter rename mode when a new file is created
  useEffect(() => {
    if (!pendingRenameId) return;
    const f = useEditorStore.getState().files.find((f) => f.id === pendingRenameId);
    if (f) {
      setEditValue(f.name.replace(/\.md$/, ''));
      setEditingId(pendingRenameId);
    }
    clearPendingRename();
  }, [pendingRenameId, clearPendingRename]);

  // Focus & select-all when input appears
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const commitRename = useCallback(() => {
    if (!editingId) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      const name = trimmed.match(/\.\w+$/) ? trimmed : `${trimmed}.md`;
      renameFile(editingId, name);
    }
    setEditingId(null);
  }, [editingId, editValue, renameFile]);

  const startRename = (id: string, currentName: string) => {
    setEditValue(currentName.replace(/\.md$/, ''));
    setEditingId(id);
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const file = files.find((f) => f.id === id);
    if (file?.isDirty) {
      const ok = window.confirm(`Save changes to "${file.name}" before closing?`);
      if (ok) {
        save(id).then(() => closeFile(id));
        return;
      }
    }
    closeFile(id);
  };

  return (
    <div
      id="tabbar"
      className="flex items-end bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto shrink-0"
      style={{ minHeight: '36px' }}
    >
      {files.map((file) => {
        const isActive = file.id === activeFileId;
        const isEditing = editingId === file.id;
        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`
              flex items-center gap-1.5 px-3 h-9 text-sm whitespace-nowrap border-r border-gray-200
              transition-colors duration-100 shrink-0 relative cursor-pointer select-none
              ${isActive
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium border-t-2 border-t-indigo-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                  if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm border border-indigo-400 rounded px-1 outline-none"
              />
            ) : (
              <span
                className="max-w-[160px] truncate"
                title="Double-click to rename"
                onDoubleClick={(e) => { e.stopPropagation(); startRename(file.id, file.name); }}
              >
                {file.name}
              </span>
            )}
            {file.isDirty && !isEditing && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" title="Unsaved changes" />
            )}
            <span
              role="button"
              title="Close tab"
              onClick={(e) => handleClose(e, file.id)}
              className="w-4 h-4 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 leading-none shrink-0"
            >
              ×
            </span>
          </div>
        );
      })}

      {/* New tab button */}
      <button
        title="New file"
        onClick={() => useEditorStore.getState().newFile()}
        className="flex items-center justify-center w-8 h-9 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-100 shrink-0"
      >
        +
      </button>
    </div>
  );
}
