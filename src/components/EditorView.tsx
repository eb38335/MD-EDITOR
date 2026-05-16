import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useEditorStore, useActiveFile } from '../hooks/useEditorStore';
import { useFileSystem } from '../hooks/useFileSystem';
import { useSettingsStore } from '../hooks/useSettingsStore';
import { Toolbar } from './Toolbar';
import { WysiwygEditor } from './WysiwygEditor';
import { SourceEditor } from './SourceEditor';
import { StatusBar } from './StatusBar';
import { printContent } from '../utils/print';

export function EditorView() {
  const activeFile = useActiveFile();
  const { updateContent, setViewMode } = useEditorStore();
  const { save } = useFileSystem();
  const { darkMode, autoSave } = useSettingsStore();

  const [tiptapEditor, setTiptapEditor] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Disk auto-save (1.5 s after last keystroke, files with a handle) ──
  useEffect(() => {
    if (!autoSave || !activeFile?.isDirty || !activeFile.fileHandle) return;
    const fileId = activeFile.id;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      const file = useEditorStore.getState().files.find((f) => f.id === fileId);
      if (!file?.fileHandle || !file.isDirty) return;
      try {
        const writable = await file.fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
        useEditorStore.getState().markSaved(fileId, null);
      } catch { /* permission revoked — ignore */ }
    }, 1500);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [autoSave, activeFile?.content, activeFile?.isDirty, activeFile?.id, activeFile?.fileHandle]);

  // ── Zoom ──────────────────────────────────────────────
  const [zoom, setZoom] = useState(100);
  const zoomIn    = useCallback(() => setZoom((z) => Math.min(200, z + 10)), []);
  const zoomOut   = useCallback(() => setZoom((z) => Math.max(50,  z - 10)), []);
  const zoomReset = useCallback(() => setZoom(100), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
      if (e.key === '-')                  { e.preventDefault(); zoomOut(); }
      if (e.key === '0')                  { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomIn, zoomOut, zoomReset]);

  const handleEditorReady = useCallback((editor: Editor | null) => {
    setTiptapEditor(editor);
    editorRef.current = editor;
  }, []);

  const handleContentChange = useCallback(
    (content: string) => {
      if (!activeFile) return;
      updateContent(activeFile.id, content);
    },
    [activeFile, updateContent]
  );

  const handleToggleMode = () => {
    if (!activeFile) return;
    const next = activeFile.viewMode === 'wysiwyg' ? 'source' : 'wysiwyg';
    setViewMode(activeFile.id, next);
  };

  const handlePrint = () => {
    if (!activeFile) return;
    if (editorRef.current) {
      printContent(editorRef.current.getHTML(), activeFile.name);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) save(activeFile.id);
      }
    },
    [activeFile, save]
  );

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        No file open. Create a new file or open one.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0" onKeyDown={handleKeyDown}>
      <Toolbar
        editor={tiptapEditor}
        viewMode={activeFile.viewMode}
        onToggleMode={handleToggleMode}
        onPrint={handlePrint}
        fileId={activeFile.id}
      />

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeFile.viewMode === 'wysiwyg' ? (
          <WysiwygEditor
            key={activeFile.id}
            content={activeFile.content}
            onChange={handleContentChange}
            onEditorReady={handleEditorReady}
            zoom={zoom}
          />
        ) : (
          <SourceEditor
            key={activeFile.id}
            content={activeFile.content}
            onChange={handleContentChange}
            zoom={zoom}
            darkMode={darkMode}
          />
        )}
      </div>

      <StatusBar
        fileId={activeFile.id}
        content={activeFile.content}
        viewMode={activeFile.viewMode}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
      />
    </div>
  );
}
