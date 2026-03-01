import { useState } from "react";

const API_BASE = "/api";

export const usePDFExtract = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);
  const [cleanedPdfBuffer, setCleanedPdfBuffer] = useState(null);
  const [documentJS, setDocumentJS] = useState(null);

  const extractFields = async (file) => {
    try {
      setIsExtracting(true);
      setError(null);

      const res = await fetch(`${API_BASE}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: file.s3Key }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Extraction failed (${res.status})`);
      }

      const data = await res.json();

      setFields(data.fields);
      setDocumentJS(data.documentJS);
      console.log("Extracted fields from backend:", data.fields.length);
      console.log("Document JS:", data.documentJS);

      // Convert base64 cleaned PDF back to ArrayBuffer
      if (data.cleanedPdfBase64) {
        const binaryStr = atob(data.cleanedPdfBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        setCleanedPdfBuffer(bytes.buffer);
        console.log(
          "Received cleaned PDF from backend (values cleared, annotations preserved)",
        );
      }

      return data.fields;
    } catch (err) {
      console.error(err);
      setError("Failed to extract fillable fields from PDF");
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    extractFields,
    isExtracting,
    error,
    fields,
    setFields,
    setIsExtracting,
    cleanedPdfBuffer,
    documentJS,
  };
};
