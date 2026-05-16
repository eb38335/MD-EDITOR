import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { proxyStorage } from '../utils/storage';

export type ViewMode = 'wysiwyg' | 'source';

export interface EditorFile {
  id: string;
  name: string;
  content: string;
  fileHandle: FileSystemFileHandle | null;
  isDirty: boolean;
  viewMode: ViewMode;
}

interface EditorStore {
  files: EditorFile[];
  activeFileId: string | null;
  pendingRenameId: string | null;

  newFile: () => void;
  clearPendingRename: () => void;
  openFile: (name: string, content: string, handle: FileSystemFileHandle | null) => void;
  updateContent: (id: string, content: string) => void;
  markSaved: (id: string, handle: FileSystemFileHandle | null) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  setViewMode: (id: string, mode: ViewMode) => void;
  renameFile: (id: string, name: string) => void;
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

const makeFile = (name: string, content: string, handle: FileSystemFileHandle | null): EditorFile => ({
  id: makeId(),
  name,
  content,
  fileHandle: handle,
  isDirty: false,
  viewMode: 'wysiwyg',
});

const _initial = makeFile('Untitled.md', '', null);

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      files: [_initial],
      activeFileId: _initial.id,
      pendingRenameId: null,

  clearPendingRename: () => set({ pendingRenameId: null }),

  newFile: () =>
    set((state) => {
      const f = makeFile('Untitled.md', '', null);
      return { files: [...state.files, f], activeFileId: f.id, pendingRenameId: f.id };
    }),

  openFile: (name, content, handle) =>
    set((state) => {
      const existing = handle
        ? state.files.find((f) => f.fileHandle && f.name === name)
        : undefined;
      if (existing) {
        return { activeFileId: existing.id };
      }
      const f = makeFile(name, content, handle);
      return { files: [...state.files, f], activeFileId: f.id };
    }),

  updateContent: (id, content) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, content, isDirty: true } : f
      ),
    })),

  markSaved: (id, handle) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, isDirty: false, fileHandle: handle ?? f.fileHandle } : f
      ),
    })),

  closeFile: (id) =>
    set((state) => {
      const remaining = state.files.filter((f) => f.id !== id);
      if (remaining.length === 0) {
        const f = makeFile('Untitled.md', '', null);
        return { files: [f], activeFileId: f.id };
      }
      const isActive = state.activeFileId === id;
      const idx = state.files.findIndex((f) => f.id === id);
      const newActive = isActive
        ? remaining[Math.max(0, idx - 1)]?.id ?? remaining[0].id
        : state.activeFileId;
      return { files: remaining, activeFileId: newActive };
    }),

  setActiveFile: (id) => set({ activeFileId: id }),

  setViewMode: (id, mode) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, viewMode: mode } : f)),
    })),

  renameFile: (id, name) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, name } : f)),
    })),
    }),
    {
      name: 'md-editor-files',
      storage: createJSONStorage(() => proxyStorage),
      partialize: (state) => ({
        files: state.files.map((f) => ({ ...f, fileHandle: null })),
        activeFileId: state.activeFileId,
      }),
    }
  )
);

export const useActiveFile = () => {
  const { files, activeFileId } = useEditorStore();
  return files.find((f) => f.id === activeFileId) ?? null;
};
