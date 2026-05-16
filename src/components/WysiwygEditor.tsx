import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';
import { useEffect, useRef } from 'react';

const lowlight = createLowlight(common);

interface Props {
  content: string;
  onChange: (markdown: string) => void;
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
  zoom: number;
}

export function WysiwygEditor({ content, onChange, onEditorReady, zoom }: Props) {
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image,
      Placeholder.configure({ placeholder: 'Start writing… (or open a file)' }),
      Markdown.configure({
        html: true,
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],
    content,
    onUpdate({ editor }) {
      if (isExternalUpdate.current) return;
      const md = (editor.storage as unknown as Record<string, { getMarkdown?: () => string }>).markdown?.getMarkdown?.() ?? '';
      onChange(md);
    },
  });

  // Propagate external content changes (e.g., switching tabs or source edits)
  useEffect(() => {
    if (!editor) return;
    const markdownStorage = (editor.storage as unknown as Record<string, { getMarkdown?: () => string }>).markdown;
    const current = markdownStorage?.getMarkdown?.() ?? '';
    if (current === content) return;
    isExternalUpdate.current = true;
    editor.commands.setContent(content);
    isExternalUpdate.current = false;
  }, [content, editor]);

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900" style={{ fontSize: `${zoom}%` }}>
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}
