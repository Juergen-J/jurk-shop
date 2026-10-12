import { LegalDocument } from "./documents"

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Renders a legal document as simple email-safe HTML. */
export const renderLegalHtml = (doc: LegalDocument) =>
  [
    `<h2 style="margin:24px 0 8px;font-size:16px;color:#18181b;">${escape(doc.title)}</h2>`,
    ...doc.blocks.map((block) => {
      switch (block.type) {
        case "h2":
          return `<p style="margin:16px 0 4px;font-weight:600;color:#18181b;">${escape(block.text)}</p>`
        case "h3":
          return `<p style="margin:12px 0 4px;font-weight:600;color:#3f3f46;">${escape(block.text)}</p>`
        case "p":
          return `<p style="margin:0 0 8px;">${escape(block.text)}</p>`
        case "lines":
          return `<p style="margin:0 0 8px;">${block.lines.map(escape).join("<br>")}</p>`
        case "list":
          return `<ul style="margin:0 0 8px;padding-left:20px;">${block.items.map((i) => `<li>${escape(i)}</li>`).join("")}</ul>`
      }
    }),
    `<p style="margin:8px 0 0;color:#a1a1aa;">Stand: ${escape(doc.updated)}</p>`,
  ].join("")
