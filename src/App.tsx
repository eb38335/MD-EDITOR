import { useEffect, useState } from 'react';
import { TabBar } from './components/TabBar';
import { Sidebar } from './components/Sidebar';
import { EditorView } from './components/EditorView';
import { SettingsPanel } from './components/SettingsPanel';
import { useEditorStore } from './hooks/useEditorStore';
import { useFileSystem } from './hooks/useFileSystem';
import { useSettingsStore } from './hooks/useSettingsStore';

export default function App() {
  const { newFile } = useEditorStore();
  const { open, save, saveAs, createNew } = useFileSystem();
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const { darkMode, toggleDarkMode } = useSettingsStore();

  // Apply dark class to <html> so Tailwind dark: variants activate
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const dirty = useEditorStore.getState().files.some((f) => f.isDirty);
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 'n') { e.preventDefault(); createNew(); }
      if (e.key === 'o') { e.preventDefault(); open(); }
      if (e.key === 's' && !e.shiftKey && activeFileId) { e.preventDefault(); save(activeFileId); }
      if (e.key === 's' && e.shiftKey && activeFileId) { e.preventDefault(); saveAs(activeFileId); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeFileId, open, save, saveAs, createNew, newFile]);

  return (
    <div
      className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={async (e) => {
        e.preventDefault();
        for (const f of Array.from(e.dataTransfer.files)) {
          if (/\.(md|txt|markdown)$/i.test(f.name)) {
            useEditorStore.getState().openFile(f.name, await f.text(), null);
          }
        }
      }}
    >
      <header className="flex items-center gap-3 px-4 py-2 bg-indigo-700 text-white shrink-0">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          title="Toggle sidebar"
          className="p-1 rounded hover:bg-indigo-600 shrink-0"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
        </svg>
        <span className="font-semibold text-sm tracking-wide">MD Editor</span>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-indigo-300 text-xs hidden sm:block mr-2">
            Ctrl+N New · Ctrl+O Open · Ctrl+S Save · Ctrl+Shift+S Save As
          </span>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1 rounded hover:bg-indigo-600"
          >
            {darkMode ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <SettingsPanel />
        </div>
      </header>
      <TabBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
          <EditorView />
        </main>
      </div>
    </div>
  );
}

