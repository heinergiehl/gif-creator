export const GIF_EDITOR_PATH = '/edit-gifs' as const;

export const EDITOR_INTENTS = [
  'edit',
  'add-text',
  'crop',
  'resize',
  'rotate',
  'speed',
  'trim',
  'reverse',
  'optimize',
  'export',
  'record-demo',
] as const;

export type EditorIntent = (typeof EDITOR_INTENTS)[number];

const editorIntentSet: ReadonlySet<string> = new Set(EDITOR_INTENTS);

export function isEditorIntent(value: string | null | undefined): value is EditorIntent {
  return typeof value === 'string' && editorIntentSet.has(value);
}

export function getGifEditorIntentHref(intent: EditorIntent): string {
  return `${GIF_EDITOR_PATH}?intent=${encodeURIComponent(intent)}#gif-editor-tool`;
}
