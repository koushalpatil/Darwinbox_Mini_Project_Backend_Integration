import {
  Upload,
  CloudUpload,
  CheckCircle2,
  Download,
  FileSearch,
  Sparkles,
} from "lucide-react";

const STAGES = [
  { key: "uploading_to_s3", label: "Uploading to S3", icon: CloudUpload },
  {
    key: "retrieving_from_s3",
    label: "Retrieving PDF from S3",
    icon: Download,
  },
  { key: "extracting_fields", label: "Extracting fields", icon: FileSearch },
  { key: "completed", label: "Completed", icon: Sparkles },
];

const getStageIndex = (stageKey) => STAGES.findIndex((s) => s.key === stageKey);

const UploadZone = ({
  currentStage,
  uploadProgress,
  onClick,
  onDrop,
  onDragOver,
  maxSizeMB,
}) => {
  const isActive = currentStage !== null;
  const currentIndex = getStageIndex(currentStage);

  return (
    <div
      className={`relative m-6 p-12 border-2 border-dashed rounded-xl transition-all duration-300 ${
        isActive
          ? "border-indigo-300 bg-indigo-50/50 cursor-default"
          : "border-gray-300 bg-gray-50 hover:border-gray-900 hover:bg-white hover:-translate-y-0.5 cursor-pointer"
      }`}
      onClick={!isActive ? onClick : undefined}
      onDrop={!isActive ? onDrop : undefined}
      onDragOver={onDragOver}
    >
      {isActive ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs mb-8">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${uploadProgress}%`,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-1.5 font-mono">
              {uploadProgress}%
            </p>
          </div>

          <div className="flex flex-col gap-0 w-full max-w-xs">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isCompleted = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isLast = i === STAGES.length - 1;

              return (
                <div key={stage.key}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-300"
                          : isCurrent
                            ? "bg-indigo-100 text-indigo-600 border-2 border-indigo-400 shadow-md shadow-indigo-200"
                            : "bg-gray-100 text-gray-300 border-2 border-gray-200"
                      } ${isCurrent && currentStage !== "completed" ? "animate-pulse" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      ) : (
                        <Icon size={16} strokeWidth={2} />
                      )}
                    </div>

                    <span
                      className={`text-sm font-medium transition-all duration-500 ${
                        isCompleted
                          ? "text-emerald-600"
                          : isCurrent
                            ? "text-gray-900"
                            : "text-gray-300"
                      }`}
                    >
                      {stage.label}
                      {isCompleted && (
                        <span className="ml-1.5 text-emerald-500">✓</span>
                      )}
                      {isCurrent && currentStage !== "completed" && (
                        <span className="inline-flex ml-0.5">
                          <span
                            className="animate-bounce inline-block"
                            style={{ animationDelay: "0ms" }}
                          >
                            .
                          </span>
                          <span
                            className="animate-bounce inline-block"
                            style={{ animationDelay: "150ms" }}
                          >
                            .
                          </span>
                          <span
                            className="animate-bounce inline-block"
                            style={{ animationDelay: "300ms" }}
                          >
                            .
                          </span>
                        </span>
                      )}
                    </span>
                  </div>

                  {!isLast && (
                    <div className="flex items-center ml-4 my-0">
                      <div
                        className={`w-0.5 h-5 transition-all duration-500 ${
                          isCompleted ? "bg-emerald-300" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
