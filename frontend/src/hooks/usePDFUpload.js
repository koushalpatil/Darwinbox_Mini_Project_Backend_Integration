import { useState, useCallback } from "react";

const API_BASE = "/api";

export const usePDFUpload = ({ maxSizeMB }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [s3Key, setS3Key] = useState(null);

  const validateFile = useCallback(
    (file) => {
      if (!file) return ["No file selected"];
      if (file.type !== "application/pdf") return ["Only PDF files allowed"];
      if (!file.name.toLowerCase().endsWith(".pdf"))
        return ["File must have .pdf extension"];
      if (file.size > maxSizeMB * 1024 * 1024)
        return [`Max size is ${maxSizeMB}MB`];
      return [];
    },
    [maxSizeMB],
  );

  const processFile = useCallback(async (file) => {
    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      setUploadProgress(10);

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errBody = await uploadRes.json().catch(() => ({}));
        throw new Error(errBody.error || `Upload failed (${uploadRes.status})`);
      }

      const uploadData = await uploadRes.json();
      setUploadProgress(50);

      console.log("✅ PDF uploaded to S3:", uploadData.file);

      const { key, name, size, type, uploadedAt, presignedUrl } =
        uploadData.file;

      setS3Key(key);

      setUploadProgress(70);

      const pdfRes = await fetch(presignedUrl);
      if (!pdfRes.ok) {
        throw new Error("Failed to download PDF from S3 for rendering");
      }

      const arrayBuffer = await pdfRes.arrayBuffer();
      setUploadProgress(100);

      const fileData = {
        name,
        size,
        type,
        arrayBuffer,
        uploadedAt,
        s3Key: key,
      };

      console.log("Loaded PDF into memory for rendering:", fileData);
      setPdfFile(fileData);
    } catch (err) {
      console.error("Upload/fetch error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, []);

  const handleFile = useCallback(
    (file) => {
      const errors = validateFile(file);
      if (errors.length) {
        setError(errors.join(". "));
        return;
      }
      processFile(file);
    },
    [validateFile, processFile],
  );

  return {
    pdfFile,
    error,
    isProcessing,
    uploadProgress,
    handleFile,
    s3Key,
  };
};
