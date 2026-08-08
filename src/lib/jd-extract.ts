/** Client-side text extraction for job description files (PDF, DOCX, TXT). */

export const JD_MAX_BYTES = 10 * 1024 * 1024;

export const JD_ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export function validateJdFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const ok = name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".txt");
  if (!ok) return "Unsupported file type. Upload a PDF, DOCX or TXT file.";
  if (file.size > JD_MAX_BYTES) return "File is too large. Maximum size is 10MB.";
  return null;
}

export async function extractJdText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const buffer = await file.arrayBuffer();
    const result = await (mammoth as unknown as {
      extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    }).extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }

  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }
  return pages.filter(Boolean).join("\n\n").trim();
}
