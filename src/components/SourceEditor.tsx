import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  content: string;
  onChange: (value: string) => void;
  zoom: number;
  darkMode: boolean;
}

const lightTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    background: '#fafafa',
    color: '#1a1a1a',
  },
  '.cm-content': { padding: '16px 20px', fontFamily: "'Fira Code', 'Consolas', monospace" },
  '.cm-gutters': { background: '#f1f5f9', border: 'none', color: '#94a3b8', paddingRight: '8px' },
  '.cm-activeLineGutter': { background: '#e2e8f0' },
  '.cm-activeLine': { background: '#f0f9ff' },
  '.cm-selectionBackground, ::selection': { background: '#bfdbfe !important' },
  '.cm-cursor': { borderLeftColor: '#6366f1' },
  '.cm-scroller': { overflow: 'auto' },
});

export function SourceEditor({ content, onChange, zoom, darkMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;
  const themeCompartment = useRef(new Compartment());

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        bracketMatching(),
        history(),
        drawSelection(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(defaultHighlightStyle),
        themeCompartment.current.of(darkMode ? oneDark : lightTheme),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const val = update.state.doc.toString();
            if (val !== contentRef.current) {
              onChange(val);
            }
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external content changes (tab switch, WYSIWYG edits synced to source)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === content) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: content },
    });
  }, [content]);

  // Sync dark/light theme
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: themeCompartment.current.reconfigure(darkMode ? oneDark : lightTheme),
    });
  }, [darkMode]);

  // Sync zoom to CodeMirror font-size
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dom.style.fontSize = `${Math.round(14 * zoom / 100)}px`;
    }
  }, [zoom]);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden h-full" />
  );
}
