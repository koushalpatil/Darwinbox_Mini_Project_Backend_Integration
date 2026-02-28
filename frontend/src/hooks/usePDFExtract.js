import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { extractFieldsFromDocument } from "../utils/pdf/fieldExtractor";
import { createCleanedPdf } from "../utils/pdf/pdfCleaner";
import { extractAllDocumentJS } from "../utils/js-actions";

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

      const pdfDoc = await PDFDocument.load(file.arrayBuffer.slice(0));

      const allJS = extractAllDocumentJS(pdfDoc);
      setDocumentJS(allJS);
      console.log("Full document JS extraction result:", allJS);

      const extractedFields = extractFieldsFromDocument(pdfDoc);
      setFields(extractedFields);
      console.log("Extracted fillable fields:", extractedFields);

      const cleanedBuffer = await createCleanedPdf(file.arrayBuffer);
      setCleanedPdfBuffer(cleanedBuffer);

      console.log(
        "Created cleaned PDF buffer (values removed, annotations preserved)",
      );

      return extractedFields;
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
