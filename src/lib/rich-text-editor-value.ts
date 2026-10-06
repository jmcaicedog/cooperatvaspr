type RichTextEditorValue = {
  html: string;
  text: string;
};

const HTML_TAG_PATTERN = /<(?:a|blockquote|br|div|h[1-6]|li|ol|p|pre|strong|ul)\b/i;

function htmlToText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:div|h[1-6]|li|p)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function toRichTextEditorValue(value: string | null): RichTextEditorValue {
  if (!value) {
    return { html: "", text: "" };
  }

  if (HTML_TAG_PATTERN.test(value)) {
    return {
      html: value,
      text: htmlToText(value),
    };
  }

  const html = value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.split("\n").map(escapeHtml).join("<br>")}</p>`)
    .join("");

  return { html, text: value };
}
