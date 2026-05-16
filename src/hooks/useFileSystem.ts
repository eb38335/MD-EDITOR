import { useEditorStore } from './useEditorStore';

const OPEN_OPTS = {
  types: [{ description: 'Markdown / Text', accept: { 'text/*': ['.md', '.txt', '.markdown'] } }],
  multiple: false,
} as const;

const SAVE_OPTS = (currentName: string) => ({
  suggestedName: currentName,
  types: [{ description: 'Markdown File', accept: { 'text/markdown': ['.md'] } }],
});

const hasFSA = () =>
  typeof window !== 'undefined' && 'showOpenFilePicker' in window;

export function useFileSystem() {
  const { openFile, markSaved, files, activeFileId, newFile } = useEditorStore();

  const open = async () => {
    try {
      if (hasFSA()) {
        const [handle] = await (window as any).showOpenFilePicker(OPEN_OPTS);
        const file: File = await handle.getFile();
        const text = await file.text();
        openFile(file.name, text, handle);
      } else {
        // Fallback: hidden <input type="file">
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.txt,.markdown';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const text = await file.text();
          openFile(file.name, text, null);
        };
        input.click();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Open failed:', err);
    }
  };

  const save = async (id?: string) => {
    const fileId = id ?? activeFileId;
    if (!fileId) return;
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    if (file.fileHandle) {
      try {
        const writable = await file.fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
        markSaved(file.id, file.fileHandle);
        return;
      } catch {
        // fall through to saveAs
      }
    }
    await saveAs(fileId);
  };

  const saveAs = async (id?: string) => {
    const fileId = id ?? activeFileId;
    if (!fileId) return;
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    try {
      if (hasFSA()) {
        const handle = await (window as any).showSaveFilePicker(SAVE_OPTS(file.name));
        const writable = await handle.createWritable();
        await writable.write(file.content);
        await writable.close();
        // update the stored handle and clear dirty flag
        useEditorStore.getState().renameFile(file.id, handle.name ?? file.name);
        markSaved(file.id, handle);
      } else {
        // Fallback: trigger download
        const blob = new Blob([file.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        markSaved(file.id, null);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Save failed:', err);
    }
  };

  const createNew = () => newFile();

  return { open, save, saveAs, createNew };
}
