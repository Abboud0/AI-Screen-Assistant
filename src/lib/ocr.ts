import Tesseract from "tesseract.js";

export type OcrProgress = (p: { status: string; progress?: number }) => void;

export async function ocrBase64Png(b64: string, onProgress?: OcrProgress): Promise<string> {
  const source = `data:image/png;base64,${b64}`;
  const { data } = await Tesseract.recognize(source, "eng", {
    logger: (m) => {
      if (onProgress) onProgress({ status: m.status, progress: m.progress });
    },
  });
  return (data.text || "").trim();
}
