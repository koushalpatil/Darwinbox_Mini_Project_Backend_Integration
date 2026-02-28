import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


export const usePDFRenderer = (pdfFile, fields, cleanedPdfBuffer) => {
  const [pdfPages, setPdfPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfFile?.arrayBuffer || !fields) return;

  
    if (!cleanedPdfBuffer) return;

    let cancelled = false;

    const renderPDF = async () => {
      try {
        setLoading(true);
        setError(null);

       
        const bufferToRender = cleanedPdfBuffer.slice(0);

        const loadingTask = pdfjsLib.getDocument({
          data: bufferToRender,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const pages = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          
          const baseScale = 1.5;
          const viewport = page.getViewport({ scale: baseScale });

      
          const pageFields = fields
            .filter((field) => field.page === pageNum - 1)
            .map((field) => {
              const rect = [
                field.x,
                field.y,
                field.x + field.width,
                field.y + field.height,
              ];

              const viewportRect = viewport.convertToViewportRectangle(rect);

              const x = Math.min(viewportRect[0], viewportRect[2]);
              const y = Math.min(viewportRect[1], viewportRect[3]);
              const width = Math.abs(viewportRect[2] - viewportRect[0]);
              const height = Math.abs(viewportRect[3] - viewportRect[1]);

              return { ...field, x, y, width, height };
            });

          pages.push({
            pageNum,
            pdfPage: page, 
            viewport,     
            width: viewport.width,
            height: viewport.height,
            fields: pageFields,
          });
        }

        if (!cancelled) {
          setPdfPages(pages);
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF Render Error:", err);
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    };

    renderPDF();

    return () => {
      cancelled = true;
    };
  }, [pdfFile, fields, cleanedPdfBuffer]);

  return { pdfPages, loading, error };
};
