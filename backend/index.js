require("dotenv").config();

const path = require("path");
const { Worker } = require("worker_threads");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const PORT = process.env.PORT || 5000;
const BUCKET = process.env.S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION || "ap-south-1";

if (!BUCKET) {
  console.error("S3_BUCKET_NAME is not set in .env");
  process.exit(1);
}

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  }),
);

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const file = req.file;
    const fileKey = `pdfs/${uuidv4()}-${file.originalname}`;

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: "application/pdf",
      ServerSideEncryption: "AES256",
    });

    await s3.send(putCommand);

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3, getCommand, {
      expiresIn: 3600,
    });

    console.log(`Uploaded "${file.originalname}" → s3://${BUCKET}/${fileKey}`);

    res.json({
      success: true,
      file: {
        key: fileKey,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString(),
        presignedUrl,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file to S3" });
  }
});

app.get(/^\/api\/pdf\/(.+)/, async (req, res) => {
  try {
    const fileKey = req.params[0];

    if (!fileKey) {
      return res.status(400).json({ error: "Missing S3 key" });
    }

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3, getCommand, {
      expiresIn: 3600,
    });

    res.json({ presignedUrl });
  } catch (err) {
    console.error("Presigned URL error:", err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
});

app.delete(/^\/api\/pdf\/(.+)/, async (req, res) => {
  try {
    const fileKey = req.params[0];

    if (!fileKey) {
      return res.status(400).json({ error: "Missing S3 key" });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    await s3.send(deleteCommand);

    console.log(`Deleted s3://${BUCKET}/${fileKey}`);

    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete file from S3" });
  }
});

function runExtractWorker(pdfBuffer) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, "workers", "pdfExtractWorker.js"),
    );

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker timed out after 30s"));
    }, 30_000);

    worker.on("message", (result) => {
      clearTimeout(timeout);
      worker.terminate();
      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result);
      }
    });

    worker.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    worker.postMessage({ pdfBuffer });
  });
}

app.post("/api/extract", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Missing 'key' in request body" });
    }

    const getCommand = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const s3Response = await s3.send(getCommand);

    const chunks = [];
    for await (const chunk of s3Response.Body) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    console.log(
      `Extracting fields from s3://${BUCKET}/${key} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`,
    );

    const result = await runExtractWorker(pdfBuffer);

    console.log(`Extracted ${result.fields.length} fields from "${key}"`);

    res.json({
      success: true,
      fields: result.fields,
      documentJS: result.documentJS,
      cleanedPdfBase64: result.cleanedPdfBase64,
    });
  } catch (err) {
    console.error("Extract error:", err);
    res.status(500).json({ error: err.message || "Failed to extract fields" });
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large (max 10 MB)" });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`S3 Bucket: ${BUCKET} | Region: ${REGION}`);
});
