import UploadZone from "./UploadZone";
import { FilePreview } from "./FilePreview";
import { useRef, useEffect } from "react";
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

  const { pdfFile, error, isProcessing, uploadProgress, handleFile } =
    usePDFUpload({
      maxSizeMB,
    });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (pdfFile && !isExtracting) {
      const extract = async () => {
        setIsExtracting(true);
        try {
          await extractFields(pdfFile);
        } catch (error) {
          console.log("Error in extracting fields : ", error);
        }
        setIsExtracting(false);
      };
      extract();
    }
  }, [pdfFile]);

  return (
    <div
      className={pdfFile ? "" : "w-full mx-auto max-w-2xl"}
      style={
        pdfFile
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
      {!pdfFile ? (
        <UploadZone
          maxSizeMB={maxSizeMB}
          isExtracting={isExtracting}
          isProcessing={isProcessing}
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
