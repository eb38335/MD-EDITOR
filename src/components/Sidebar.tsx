import { useEditorStore } from '../hooks/useEditorStore';
import { useFileSystem } from '../hooks/useFileSystem';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const { files, activeFileId, setActiveFile } = useEditorStore();
  const { createNew, open: openFile } = useFileSystem();

  if (!open) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-20 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        className="fixed md:relative inset-y-0 left-0 z-30 w-52 shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
      >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Files</span>
        <div className="flex gap-1">
          <button
            title="New file"
            onClick={createNew}
            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-lg leading-none"
          >
            +
          </button>
          <button
            title="Open file"
            onClick={openFile}
            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto py-1">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <li key={file.id}>
              <button
                onClick={() => setActiveFile(file.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left truncate
                  transition-colors duration-100
                  ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-gray-400">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{file.name}</span>
                {file.isDirty && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  </>);
}
