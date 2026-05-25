"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  name: string;
  defaultHtml: string;
  defaultText: string;
};

export function RichTextEditor({ name, defaultHtml, defaultText }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const didInitContentRef = useRef(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isParagraphActive, setIsParagraphActive] = useState(false);

  const syncHiddenInputs = () => {
    if (!editorRef.current || !htmlInputRef.current || !textInputRef.current) {
      return;
    }

    htmlInputRef.current.value = editorRef.current.innerHTML;
    textInputRef.current.value = editorRef.current.innerText;
  };

  const normalizeEditorStructure = () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    // `execCommand` can generate invalid nesting (e.g. p > p, h2 > p) in contentEditable.
    // Flatten those nodes to keep formatting commands predictable.
    editor.querySelectorAll("p p").forEach((nestedParagraph) => {
      const parent = nestedParagraph.parentElement;
      if (!parent) {
        return;
      }

      parent.insertAdjacentElement("afterend", nestedParagraph);
    });

    editor
      .querySelectorAll("h1 p, h2 p, h3 p, h4 p, h5 p, h6 p")
      .forEach((nestedParagraph) => {
        const heading = nestedParagraph.parentElement;
        if (!heading) {
          return;
        }

        while (nestedParagraph.firstChild) {
          heading.insertBefore(nestedParagraph.firstChild, nestedParagraph);
        }

        nestedParagraph.remove();
      });

    const invalidChildTags = new Set([
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "DIV",
      "UL",
      "OL",
      "PRE",
      "BLOCKQUOTE",
    ]);

    editor.querySelectorAll("p").forEach((paragraph) => {
      const hasInvalidBlockChild = Array.from(paragraph.children).some((child) =>
        invalidChildTags.has(child.tagName),
      );

      if (!hasInvalidBlockChild) {
        return;
      }

      const fragment = document.createDocumentFragment();
      while (paragraph.firstChild) {
        fragment.appendChild(paragraph.firstChild);
      }

      paragraph.replaceWith(fragment);
    });
  };

  useEffect(() => {
    if (!editorRef.current || didInitContentRef.current) {
      return;
    }

    editorRef.current.innerHTML = defaultHtml;
    didInitContentRef.current = true;
    syncHiddenInputs();
  }, [defaultHtml]);

  const normalizeUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
    return hasScheme ? trimmed : `https://${trimmed}`;
  };

  const getCurrentRange = (): Range | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    return selection.getRangeAt(0);
  };

  const isRangeInsideEditor = (range: Range | null): boolean => {
    if (!editorRef.current || !range) {
      return false;
    }

    return editorRef.current.contains(range.commonAncestorContainer);
  };

  const saveSelection = () => {
    const range = getCurrentRange();
    if (!isRangeInsideEditor(range)) {
      return;
    }

    savedRangeRef.current = range?.cloneRange() ?? null;
  };

  const restoreSelection = (): boolean => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) {
      return false;
    }

    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
    return true;
  };

  const updateToolbarState = () => {
    const range = getCurrentRange();
    if (!isRangeInsideEditor(range)) {
      setIsBoldActive(false);
      setIsParagraphActive(false);
      return;
    }

    let bold = false;
    try {
      bold = document.queryCommandState("bold");
    } catch {
      bold = false;
    }

    const node = range?.commonAncestorContainer ?? null;
    const element = (node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement) as
      | HTMLElement
      | null;

    const blockParent = element?.closest("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div") ?? null;
    const isParagraph = blockParent?.tagName === "P";

    setIsBoldActive(bold);
    setIsParagraphActive(isParagraph);
  };

  const runToolbarCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();

    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false, value);
    normalizeEditorStructure();
    syncHiddenInputs();
    saveSelection();
    updateToolbarState();
  };

  const handleToolbarMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    saveSelection();
    event.preventDefault();
  };

  const insertLink = () => {
    saveSelection();
    const rawUrl = window.prompt("URL del enlace");
    if (!rawUrl) {
      return;
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    if (!normalizedUrl) {
      return;
    }

    editorRef.current?.focus();
    restoreSelection();

    const selection = window.getSelection();
    const hasSelectedText =
      !!selection &&
      selection.rangeCount > 0 &&
      isRangeInsideEditor(selection.getRangeAt(0)) &&
      !selection.getRangeAt(0).collapsed;

    if (hasSelectedText) {
      runToolbarCommand("createLink", normalizedUrl);
      return;
    }

    const linkLabel = window.prompt("Texto del enlace", normalizedUrl) ?? normalizedUrl;
    const safeLabel = linkLabel
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
    const safeUrl = normalizedUrl
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");

    runToolbarCommand("insertHTML", `<a href="${safeUrl}">${safeLabel}</a>`);
  };

  const applyHeading = (tag: "h1" | "h2") => {
    editorRef.current?.focus();
    restoreSelection();

    const attempts = [`<${tag}>`, tag, tag.toUpperCase()];
    let ok = false;

    for (const value of attempts) {
      if (document.execCommand("formatBlock", false, value)) {
        ok = true;
        break;
      }
    }

    if (!ok) {
      document.execCommand("heading", false, tag.toUpperCase());
    }

    normalizeEditorStructure();
    syncHiddenInputs();
    saveSelection();
    updateToolbarState();
  };

  const applyParagraph = () => {
    editorRef.current?.focus();
    restoreSelection();

    const attempts = ["<p>", "p", "P"];
    let ok = false;

    for (const value of attempts) {
      if (document.execCommand("formatBlock", false, value)) {
        ok = true;
        break;
      }
    }

    if (!ok) {
      document.execCommand("insertParagraph");
    }

    normalizeEditorStructure();
    syncHiddenInputs();
    saveSelection();
    updateToolbarState();
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          aria-label="Negrita"
          aria-pressed={isBoldActive}
          className={`inline-flex h-8 w-8 items-center justify-center rounded border transition-colors ${
            isBoldActive
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => runToolbarCommand("bold")}
          title="Negrita"
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M8 5h6a4 4 0 0 1 0 8H8zm0 8h7a4 4 0 1 1 0 8H8z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
        <button
          aria-label="Vinetas"
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => runToolbarCommand("insertUnorderedList")}
          title="Vinetas"
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle cx="5" cy="7" fill="currentColor" r="1.3" />
            <circle cx="5" cy="12" fill="currentColor" r="1.3" />
            <circle cx="5" cy="17" fill="currentColor" r="1.3" />
            <path d="M9 7h10M9 12h10M9 17h10" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyHeading("h1")}
          title="Encabezado 1"
          type="button"
        >
          H1
        </button>
        <button
          className="rounded border border-zinc-300 px-2 py-1 text-xs"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyHeading("h2")}
          title="Encabezado 2"
          type="button"
        >
          H2
        </button>
        <button
          aria-label="Parrafo"
          aria-pressed={isParagraphActive}
          className={`inline-flex h-8 w-8 items-center justify-center rounded border transition-colors ${
            isParagraphActive
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
          onMouseDown={handleToolbarMouseDown}
          onClick={applyParagraph}
          title="Parrafo"
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M6 6h9a4 4 0 0 1 0 8h-3m0-8v12m0-12h-2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
        <button
          aria-label="Enlace"
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          onMouseDown={handleToolbarMouseDown}
          onClick={insertLink}
          title="Enlace"
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M9.5 14.5 14.5 9.5m-7 8.5H6a4 4 0 1 1 0-8h2m10 4h1a4 4 0 0 0 0-8h-2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
        <button
          aria-label="Quitar enlace"
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => runToolbarCommand("unlink")}
          title="Quitar enlace"
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="m8 16 8-8m-9.5 1.5L5 11a4 4 0 0 0 5.7 5.6l1.4-1.4m.9-6.3 1.3-1.3a4 4 0 1 1 5.7 5.6L18.5 15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      <div
        className="min-h-56 rounded-md border border-zinc-300 bg-white p-3 [&_a]:text-sky-700 [&_a]:underline [&_b]:font-bold [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_strong]:font-bold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
        contentEditable
        onBlur={saveSelection}
        onFocus={updateToolbarState}
        onInput={() => {
          normalizeEditorStructure();
          syncHiddenInputs();
          saveSelection();
          updateToolbarState();
        }}
        onKeyUp={() => {
          saveSelection();
          updateToolbarState();
        }}
        onMouseUp={() => {
          saveSelection();
          updateToolbarState();
        }}
        ref={editorRef}
        suppressContentEditableWarning
      />

      <input defaultValue={defaultHtml} name={`${name}Html`} ref={htmlInputRef} type="hidden" />
      <input defaultValue={defaultText} name={`${name}Text`} ref={textInputRef} type="hidden" />
    </div>
  );
}
