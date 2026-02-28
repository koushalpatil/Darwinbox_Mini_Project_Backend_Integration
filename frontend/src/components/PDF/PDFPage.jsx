import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import FormField from "./FormField";

const PDFPage = ({
  page,
  containerWidth,
  formData,
  allDocFields,
  onFieldChange,
  onSubmit,
  fieldOverrides,
}) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const scaleFactor = containerWidth > 0 ? containerWidth / page.width : 1;

  useEffect(() => {
    const renderPage = async () => {
      if (!page.pdfPage || !canvasRef.current || !textLayerRef.current) return;

      const pdfPage = page.pdfPage;
      const viewport = page.viewport;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      textLayerRef.current.innerHTML = "";

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      try {
        renderTaskRef.current = pdfPage.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;

        const textContent = await pdfPage.getTextContent();

        if (textLayerRef.current) {
          pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerRef.current,
            viewport: viewport,
            textDivs: [],
          });
        }
      } catch (error) {
        if (error.name !== "RenderingCancelledException") {
          console.error("Error rendering PDF page or text layer:", error);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [page.pdfPage, page.viewport]);

  return (
    <div
      style={{
        width: `${containerWidth || page.width}px`,
        height: `${page.height * scaleFactor}px`,
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        borderRadius: "4px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          width: `${page.width}px`,
          height: `${page.height}px`,
          transform: `scale(${scaleFactor})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: `${page.width}px`,
            height: `${page.height}px`,
          }}
        />

        <div
          ref={textLayerRef}
          className="textLayer"
          style={{
            width: `${page.width}px`,
            height: `${page.height}px`,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${page.width}px`,
            height: `${page.height}px`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {page.fields.map((field, idx) => {
            const wIdx =
              field.widgetIndex !== undefined ? field.widgetIndex : idx;
            const specificKey =
              field.type === "PDFRadioGroup"
                ? `${field.name}-page-${field.page}`
                : `${field.name}-page-${field.page}-w${wIdx}`;
            const genericKey = field.name;
            const specificValue = formData[specificKey];
            const genericValue = formData[genericKey];

            const displayValue =
              specificValue !== undefined ? specificValue : genericValue;

            return (
              <FormField
                key={`${field.name}-${page.pageNum}-${idx}`}
                field={field}
                widgetIndex={wIdx}
                value={displayValue}
                onChange={(key, val) => {
                  onFieldChange(key, val);
                }}
                onSubmit={onSubmit}
                formData={formData}
                allFields={allDocFields || page.fields}
                fieldOverrides={fieldOverrides}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PDFPage;
