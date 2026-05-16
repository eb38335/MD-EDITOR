import { Editor } from '@tiptap/react';
import type { ViewMode } from '../hooks/useEditorStore';
import { useEditorStore } from '../hooks/useEditorStore';
import { useFileSystem } from '../hooks/useFileSystem';
import { printContent } from '../utils/print';

interface Props {
  editor: Editor | null;
  viewMode: ViewMode;
  onToggleMode: () => void;
  onPrint?: () => void;
  fileId: string;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; title: string };

function Btn({ children, active, className = '', title, ...rest }: BtnProps) {
  return (
    <button
      title={title}
      {...rest}
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded text-sm
        transition-colors duration-100 select-none cursor-pointer
        ${active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
        disabled:opacity-40 disabled:cursor-default
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />;
}

export function Toolbar({ editor, viewMode, onToggleMode, onPrint, fileId }: Props) {
  const { open, save, saveAs, createNew } = useFileSystem();
  const fileName = useEditorStore((s) => s.files.find((f) => f.id === fileId)?.name ?? 'document');
  const isWysiwyg = viewMode === 'wysiwyg';
  const e = editor;

  const canEdit = isWysiwyg && !!e;

  const addLink = () => {
    if (!e) return;
    const url = window.prompt('URL:');
    if (!url) return;
    e.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!e) return;
    const url = window.prompt('Image URL:');
    if (!url) return;
    e.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () => {
    if (!e) return;
    e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const exportHtml = () => {
    if (!e) return;
    const baseName = fileName.replace(/\.(md|txt|markdown)$/i, '');
    const html = e.getHTML();
    const full = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${baseName}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#1a1a1a}h1,h2,h3,h4,h5,h6{font-weight:700;margin:1.5rem 0 .5rem}h1{font-size:2em;border-bottom:2px solid #e5e7eb;padding-bottom:.25rem}h2{font-size:1.5em;border-bottom:1px solid #e5e7eb}code{background:#f3f4f6;padding:.1em .35em;border-radius:4px;font-family:Consolas,monospace;font-size:.875em}pre{background:#1e1e1e;color:#d4d4d4;padding:1rem;border-radius:8px;overflow-x:auto}pre code{background:none;color:inherit;padding:0}blockquote{border-left:4px solid #6366f1;margin:1rem 0;padding:.5rem 1rem;background:#f5f3ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #d1d5db;padding:.5rem .75rem}th{background:#f9fafb;font-weight:600}a{color:#2563eb}img{max-width:100%}hr{border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0}</style></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${baseName}.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (onPrint) { onPrint(); return; }
    if (e) {
      printContent(e.getHTML(), 'Markdown Document');
    }
  };

  return (
    <div
      id="toolbar"
      className="flex flex-nowrap items-center gap-0.5 px-2 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 select-none overflow-x-auto"
    >
      {/* File operations */}
      <Btn title="New file (Ctrl+N)" onClick={createNew}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm8 1.5V7h3.5L12 3.5zM5 10.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5z" />
        </svg>
      </Btn>
      <Btn title="Open file (Ctrl+O)" onClick={open}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      </Btn>
      <Btn title="Save (Ctrl+S)" onClick={() => save(fileId)}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M15.5 2h-11A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2zM10 15a3 3 0 110-6 3 3 0 010 6zm3.5-9.5h-7a.5.5 0 010-1h7a.5.5 0 010 1z" />
        </svg>
      </Btn>
      <Btn title="Save As" onClick={() => saveAs(fileId)}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M15.5 2h-11A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2zM10 15a3 3 0 110-6 3 3 0 010 6zm3.5-9.5h-7a.5.5 0 010-1h7a.5.5 0 010 1z" />
        </svg>
        <span className="text-xs leading-none ml-0.5">↓</span>
      </Btn>
      <Btn title="Export HTML" disabled={!canEdit} onClick={exportHtml}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Print" onClick={handlePrint}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm8 0H7v3h6V4zM5 14h10v3H5v-3z" clipRule="evenodd" />
        </svg>
      </Btn>

      <Divider />

      {/* Mode toggle */}
      <button
        title={isWysiwyg ? 'Switch to Markdown Source' : 'Switch to WYSIWYG'}
        onClick={onToggleMode}
        className={`
          inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-semibold
          transition-colors duration-100 cursor-pointer
          ${isWysiwyg
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-700 text-white hover:bg-gray-800'}
        `}
      >
        {isWysiwyg ? (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Source
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            WYSIWYG
          </>
        )}
      </button>

      <Divider />

      {/* Heading picker */}
      <select
        title="Heading level"
        disabled={!canEdit}
        className="h-8 text-sm border border-gray-200 dark:border-gray-700 rounded px-1 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 disabled:opacity-40 cursor-pointer"
        value={
          e?.isActive('heading', { level: 1 }) ? '1' :
          e?.isActive('heading', { level: 2 }) ? '2' :
          e?.isActive('heading', { level: 3 }) ? '3' :
          e?.isActive('heading', { level: 4 }) ? '4' :
          e?.isActive('heading', { level: 5 }) ? '5' :
          e?.isActive('heading', { level: 6 }) ? '6' : '0'
        }
        onChange={(ev) => {
          if (!e) return;
          const v = Number(ev.target.value);
          if (v === 0) e.chain().focus().setParagraph().run();
          else e.chain().focus().setHeading({ level: v as 1|2|3|4|5|6 }).run();
        }}
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="5">Heading 5</option>
        <option value="6">Heading 6</option>
      </select>

      <Divider />

      {/* Inline formatting */}
      <Btn title="Bold (Ctrl+B)" active={e?.isActive('bold')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Btn>
      <Btn title="Italic (Ctrl+I)" active={e?.isActive('italic')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Btn>
      <Btn title="Strikethrough" active={e?.isActive('strike')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </Btn>
      <Btn title="Inline Code" active={e?.isActive('code')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleCode().run()}>
        {'`'}
      </Btn>

      <Divider />

      {/* Block formatting */}
      <Btn title="Blockquote" active={e?.isActive('blockquote')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleBlockquote().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Code Block" active={e?.isActive('codeBlock')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleCodeBlock().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Horizontal Rule" disabled={!canEdit}
        onClick={() => e?.chain().focus().setHorizontalRule().run()}>
        —
      </Btn>

      <Divider />

      {/* Lists */}
      <Btn title="Bullet List" active={e?.isActive('bulletList')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleBulletList().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Ordered List" active={e?.isActive('orderedList')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleOrderedList().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M3 4h1v3H3V4zm1 9H3v-.5l1.5-1.5H3v-1h2.5v.5L4 12h1.5v1H3v-.5L4 13zm10-8H6v1h8V5zm0 5H6v1h8v-1zm0 5H6v1h8v-1z" />
        </svg>
      </Btn>
      <Btn title="Task List" active={e?.isActive('taskList')} disabled={!canEdit}
        onClick={() => e?.chain().focus().toggleTaskList().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm5.707 4.293a1 1 0 00-1.414 1.414L9 11.414l3.707-3.707a1 1 0 00-1.414-1.414L9 8.586 8.707 8.293z" clipRule="evenodd" />
        </svg>
      </Btn>

      <Divider />

      {/* Link / Image / Table */}
      <Btn title="Insert Link" active={e?.isActive('link')} disabled={!canEdit} onClick={addLink}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Insert Image" disabled={!canEdit} onClick={addImage}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Insert Table" disabled={!canEdit} onClick={addTable}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M3 3h14v14H3V3zm2 4v2h4V7H5zm0 4v2h4v-2H5zm6-4v2h4V7h-4zm0 4v2h4v-2h-4zM5 15h4v-2H5v2zm6 0h4v-2h-4v2z" />
        </svg>
      </Btn>

      {/* Table row/col controls — only shown when cursor is inside a table */}
      {canEdit && e?.isActive('table') && (
        <>
          <Divider />
          <Btn title="Add column before" onClick={() => e.chain().focus().addColumnBefore().run()}>C+</Btn>
          <Btn title="Add column after"  onClick={() => e.chain().focus().addColumnAfter().run()}>+C</Btn>
          <Btn title="Delete column"     onClick={() => e.chain().focus().deleteColumn().run()}>C-</Btn>
          <Divider />
          <Btn title="Add row before" onClick={() => e.chain().focus().addRowBefore().run()}>R+</Btn>
          <Btn title="Add row after"  onClick={() => e.chain().focus().addRowAfter().run()}>+R</Btn>
          <Btn title="Delete row"     onClick={() => e.chain().focus().deleteRow().run()}>R-</Btn>
          <Btn title="Delete table"   onClick={() => e.chain().focus().deleteTable().run()}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </Btn>
        </>
      )}

      <Divider />

      {/* Undo / Redo */}
      <Btn title="Undo (Ctrl+Z)" disabled={!canEdit} onClick={() => e?.chain().focus().undo().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn title="Redo (Ctrl+Y)" disabled={!canEdit} onClick={() => e?.chain().focus().redo().run()}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Btn>
    </div>
  );
}
