import UploadZone from "./UploadZone";
import { FilePreview } from "./FilePreview";
import { useRef, useEffect, useMemo } from "react";
import { usePDFUpload } from "../hooks/usePDFUpload";
import { toast } from "react-toastify";
import { usePDFExtract } from "../hooks/usePDFExtract";

export const PDFUploader = ({ maxSizeMB = 10 }) => {
  const inputRef = useRef(null);
  const {
    extractFields,
    isExtracting,
    setIsExtracting,
    fields,
    cleanedPdfBuffer,
    documentJS,
  } = usePDFExtract();

  const {
    pdfFile,
    error,
    isProcessing,
    uploadProgress,
    setUploadProgress,
    uploadStage,
    setUploadStage,
    handleFile,
  } = usePDFUpload({
    maxSizeMB,
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (pdfFile && !isExtracting && !fields.length) {
      const extract = async () => {
        setIsExtracting(true);
        setUploadStage("extracting_fields");
        setUploadProgress(90);

        try {
          const minDisplayTime = new Promise((r) => setTimeout(r, 600));
          await Promise.all([extractFields(pdfFile), minDisplayTime]);
        } catch (error) {
          console.log("Error in extracting fields : ", error);
        }

        setIsExtracting(false);
        setUploadProgress(100);
        setUploadStage("completed");

        await new Promise((r) => setTimeout(r, 500));
        setUploadStage("done");
      };
      extract();
    }
  }, [pdfFile]);

  const currentStage = useMemo(() => {
    if (uploadStage) return uploadStage;
    return null;
  }, [uploadStage]);

  const pipelineComplete =
    pdfFile && fields.length > 0 && cleanedPdfBuffer && currentStage === "done";

  return (
    <div
      className={pipelineComplete ? "" : "w-full mx-auto max-w-2xl"}
      style={
        pipelineComplete
          ? {
              width: "100%",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }
          : {}
      }
    >
      {!pipelineComplete ? (
        <UploadZone
          maxSizeMB={maxSizeMB}
          currentStage={currentStage}
          uploadProgress={uploadProgress}
          onClick={() => inputRef.current.click()}
          onDrop={(e) => handleFile(e.dataTransfer.files[0])}
          onDragOver={(e) => e.preventDefault()}
        />
      ) : (
        <FilePreview
          pdfFile={pdfFile}
          fields={fields}
          cleanedPdfBuffer={cleanedPdfBuffer}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
};
