import { useState } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';
import { getStorageBackend, migrateAndSwitch, type StorageBackend } from '../utils/storage';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
        checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateError, setMigrateError] = useState('');
  const { autoSave, toggleAutoSave } = useSettingsStore();
  const currentBackend = getStorageBackend();

  const handleSwitchBackend = async (to: StorageBackend) => {
    if (to === currentBackend || migrating) return;
    const label = to === 'indexedDB' ? 'IndexedDB (browser database)' : 'localStorage';
    const ok = window.confirm(
      `Switch file storage to ${label}?\n\nYour open files will be migrated and the page will reload.`
    );
    if (!ok) return;
    setMigrateError('');
    setMigrating(true);
    try {
      await migrateAndSwitch(to); // reloads on success
    } catch (err) {
      setMigrateError(String(err));
      setMigrating(false);
    }
  };

  return (
    <div className="relative">
      {/* Gear button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Settings"
        className={`p-1 rounded hover:bg-indigo-600 transition-colors ${open ? 'bg-indigo-600' : ''}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Settings</h3>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Auto-save */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Auto-save to disk
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Writes to file 1.5 s after last keystroke. Only applies to files opened from disk.
                  </p>
                </div>
                <Toggle checked={autoSave} onChange={toggleAutoSave} />
              </div>

              {/* Storage backend */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  File storage backend
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Where open files are kept between sessions. Switching migrates your files and reloads.
                </p>

                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      {
                        id: 'localStorage' as StorageBackend,
                        label: 'localStorage',
                        desc: '~5 MB limit · synchronous · universal',
                      },
                      {
                        id: 'indexedDB' as StorageBackend,
                        label: 'IndexedDB  (browser database)',
                        desc: 'Large files · async · structured storage',
                      },
                    ] as const
                  ).map(({ id, label, desc }) => {
                    const active = currentBackend === id;
                    return (
                      <button
                        key={id}
                        disabled={migrating}
                        onClick={() => handleSwitchBackend(id)}
                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors w-full disabled:opacity-50 ${
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-300 dark:ring-indigo-600'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                            active
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}
                        />
                        <div>
                          <p className={`text-sm ${active ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                            {label}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {migrating && (
                  <p className="text-xs text-indigo-500 mt-2">Migrating… page will reload.</p>
                )}
                {migrateError && (
                  <p className="text-xs text-red-500 mt-2">{migrateError}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
