'use client';

import { Editor, EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import { useEffect, useState } from 'react';
import 'draft-js/dist/Draft.css';

export default function DraftJSEditor({ value, onChange }) {
  let initialState;
  try {
    const parsed = JSON.parse(value);
    initialState = EditorState.createWithContent(convertFromRaw(parsed));
  } catch {
    initialState = value
      ? EditorState.createWithContent(ContentState.createFromText(value))
      : EditorState.createEmpty();
  }
  const [editorState, setEditorState] = useState(() => initialState);

  useEffect(() => {
    const content = convertToRaw(editorState.getCurrentContent());
    onChange(JSON.stringify(content));
  }, [editorState, onChange]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 6, minHeight: 200 }}>
      <Editor editorState={editorState} onChange={setEditorState} />
    </div>
  );
}
