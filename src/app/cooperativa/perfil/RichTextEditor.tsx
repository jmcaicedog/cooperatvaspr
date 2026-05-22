"use client";

import { useRef } from "react";

type RichTextEditorProps = {
  name: string;
  defaultHtml: string;
  defaultText: string;
};

export function RichTextEditor({ name, defaultHtml, defaultText }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHiddenInputs();
  };

  const syncHiddenInputs = () => {
    if (!editorRef.current || !htmlInputRef.current || !textInputRef.current) {
      return;
    }

    htmlInputRef.current.value = editorRef.current.innerHTML;
    textInputRef.current.value = editorRef.current.innerText;
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onClick={() => runCommand("bold")}
          type="button"
        >
          Negrita
        </button>
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onClick={() => runCommand("insertUnorderedList")}
          type="button"
        >
          Vinetas
        </button>
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onClick={() => runCommand("formatBlock", "H1")}
          type="button"
        >
          H1
        </button>
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onClick={() => runCommand("formatBlock", "H2")}
          type="button"
        >
          H2
        </button>
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onClick={() => {
            const url = window.prompt("URL del enlace");
            if (url) {
              runCommand("createLink", url);
            }
          }}
          type="button"
        >
          Enlace
        </button>
      </div>

      <div
        className="min-h-56 rounded-md border border-zinc-300 bg-white p-3"
        contentEditable
        dangerouslySetInnerHTML={{ __html: defaultHtml }}
        onInput={syncHiddenInputs}
        ref={editorRef}
        suppressContentEditableWarning
      />

      <input defaultValue={defaultHtml} name={`${name}Html`} ref={htmlInputRef} type="hidden" />
      <input defaultValue={defaultText} name={`${name}Text`} ref={textInputRef} type="hidden" />
    </div>
  );
}
