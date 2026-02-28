import React, { useRef, useState, useEffect, useCallback } from "react";
import { usePDFRenderer } from "../hooks/usePDFRenderer";
import { useContainerWidth } from "../hooks/useContainerWidth";
import PDFPage from "./PDF/PDFPage";
import PDFToolbar, { TOOLBAR_HEIGHT } from "./PDF/PDFToolbar";

const ZOOM_STEP = 10;
const ZOOM_MIN = 25;
const ZOOM_MAX = 300;
const ZOOM_DEFAULT = 100;

export const FilePreview = ({
  pdfFile,
  fields,
  cleanedPdfBuffer,
  onFormDataChange,
}) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [fieldOverrides, setFieldOverrides] = useState({});
  const fieldOverridesRef = useRef(fieldOverrides);
  const containerWidth = useContainerWidth(containerRef);

  const { pdfPages, loading, error } = usePDFRenderer(
    pdfFile,
    fields,
    cleanedPdfBuffer,
  );

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialData = {};
      fields.forEach((field) => {
        if (field.value !== undefined && field.value !== null) {
          initialData[field.name] = field.value;
          if (field.type === "PDFRadioGroup") {
            initialData[`${field.name}-page-${field.page}`] = field.value;
          } else {
            const widgetIdx =
              field.widgetIndex !== undefined ? field.widgetIndex : 0;
            initialData[`${field.name}-page-${field.page}-w${widgetIdx}`] =
              field.value;
          }
        }
      });

      if (Object.keys(initialData).length > 0) {
        setFormData((prev) => ({
          ...initialData,
          ...prev,
        }));
      }
    }
  }, [fields]);

  const handleFieldChange = (fieldKey, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [fieldKey]: value };

      const bareMatch = fieldKey.match(/^(.+?)-page-/);
      if (bareMatch) {
        updated[bareMatch[1]] = value;
      }

      if (onFormDataChange) {
        onFormDataChange(updated);
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    console.log("FORM SUBMISSION");
    console.log("Complete Form Data:", JSON.stringify(formData, null, 2));
  };

  useEffect(() => {
    fieldOverridesRef.current = fieldOverrides;
  }, [fieldOverrides]);

  useEffect(() => {
    const setFieldReadOnly = (fieldName, value) => {
      setFieldOverrides((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], readOnly: !!value },
      }));
    };

    const setFieldRequired = (fieldName, value) => {
      setFieldOverrides((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], required: !!value },
      }));
    };

    window.pdfForm = {
      setFieldReadOnly,
      setFieldRequired,
      getFieldOverrides: () => fieldOverridesRef.current,
    };

    return () => {
      delete window.pdfForm;
    };
  }, []);

  const handleZoomIn = useCallback(
    () => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX)),
    [],
  );
  const handleZoomOut = useCallback(
    () => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN)),
    [],
  );
  const handleResetZoom = useCallback(() => setZoom(ZOOM_DEFAULT), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  const handleDownload = useCallback(() => {
    if (!pdfFile?.arrayBuffer) return;
    const blob = new Blob([pdfFile.arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile.name || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pdfFile]);

  const handlePrint = useCallback(() => {
    if (!pdfFile?.arrayBuffer) return;
    const blob = new Blob([pdfFile.arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [pdfFile]);

  const zoomScale = zoom / 100;

  if (loading) {
    return (
      <>
        <PDFToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onDownload={handleDownload}
          onPrint={handlePrint}
          fileName={pdfFile?.name}
        />
        <div
          ref={containerRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`,
            marginTop: `${TOOLBAR_HEIGHT}px`,
            background: "#1a1c22",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,255,255,0.08)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              marginTop: "16px",
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Rendering PDF…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PDFToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onDownload={handleDownload}
          onPrint={handlePrint}
          fileName={pdfFile?.name}
        />
        <div
          style={{
            padding: "40px 20px",
            color: "#ef4444",
            textAlign: "center",
            marginTop: `${TOOLBAR_HEIGHT}px`,
            height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1c22",
            fontSize: "15px",
          }}
        >
          Error loading PDF: {error.message}
        </div>
      </>
    );
  }

  return (
    <>
      <PDFToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onDownload={handleDownload}
        onPrint={handlePrint}
        fileName={pdfFile?.name}
      />

      <div
        ref={scrollRef}
        id="pdf-scroll-container"
        style={{
          position: "fixed",
          top: `${TOOLBAR_HEIGHT}px`,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          overflowX: "auto",
          background: "#2a2d35",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            minHeight: "100%",
            padding: "24px 0",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              transform: `scale(${zoomScale})`,
              transformOrigin: "top center",
              minHeight: zoomScale > 1 ? `${100 * zoomScale}%` : undefined,
            }}
          >
            {pdfPages.map((page) => (
              <PDFPage
                key={page.pageNum}
                page={page}
                containerWidth={containerWidth}
                formData={formData}
                allDocFields={fields}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
                fieldOverrides={fieldOverrides}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
