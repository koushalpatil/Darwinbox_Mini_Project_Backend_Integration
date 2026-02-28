import { Upload } from "lucide-react";
import Loader from "./ui/Loader";

const UploadZone = ({
  isProcessing,
  isExtracting,
  uploadProgress,
  onClick,
  onDrop,
  onDragOver,
  maxSizeMB,
}) => {
  return (
    <div
      className="relative m-6 p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 border-gray-300 bg-gray-50 hover:border-gray-900 hover:bg-white hover:-translate-y-0.5"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {isProcessing ? (
        <div>
          <Loader text="Uploading PDF to S3..." />
          {uploadProgress > 0 && (
            <div style={{ marginTop: "12px", width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    backgroundColor: "#6366f1",
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#9ca3af",
                  marginTop: "6px",
                }}
              >
                {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      ) : isExtracting ? (
        <Loader text="PDF Uploaded to S3. Extracting fields..." />
      ) : (
        <div className="text-center">
          <Upload
            size={48}
            className="mx-auto text-gray-400 mb-3 transition-colors"
          />
          <h3 className="font-semibold text-gray-900 text-lg mb-2 tracking-tight">
            Upload PDF
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            Drag and drop your file or{" "}
            <span className="text-red-400 font-medium underline">browse</span>
          </p>
          <p className="text-xs text-gray-500 font-mono">
            Max {maxSizeMB}MB • PDF only • Uploaded to S3
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
