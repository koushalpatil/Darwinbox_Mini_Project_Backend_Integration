import React, { useState, useCallback, useEffect } from "react";

export const TOOLBAR_HEIGHT = 48;

const iconProps = {
  width: "18",
  height: "18",
  strokeWidth: "1.8",
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  className: "shrink-0",
};

const ZoomInIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ResetIcon = () => (
  <svg {...iconProps}>
    <path d="M3 12a9 9 0 1 1 3 6.7" />
    <polyline points="3 7 3 13 9 13" />
  </svg>
);

const DownloadIcon = () => (
  <svg {...iconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PrintIcon = () => (
  <svg {...iconProps}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const FullscreenIcon = () => (
  <svg {...iconProps}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg {...iconProps}>
    <path d="M4 14h4v4" />
    <path d="M20 10h-4V6" />
    <path d="M14 10l7-7" />
    <path d="M3 21l7-7" />
  </svg>
);

const ToolbarBtn = ({ title, onClick, children, id }) => (
  <button
    id={id}
    title={title}
    onClick={onClick}
    className="
      inline-flex items-center justify-center gap-1.5
      h-8 px-2.5
      rounded-md border-none
      bg-transparent text-[#c8cdd5]
      text-[13px] font-medium
      cursor-pointer whitespace-nowrap outline-none
      transition-all duration-150 ease-in-out
      hover:bg-white/[0.08] hover:text-white
      focus-visible:ring-2 focus-visible:ring-white/30
    "
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />;

const PDFToolbar = ({
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownload,
  onPrint,
  fileName = "document.pdf",
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      id="pdf-toolbar"
      style={{ height: `${TOOLBAR_HEIGHT}px` }}
      className="
        fixed top-0 left-0 right-0 z-[1000]
        flex items-center justify-between
        px-4
        bg-[rgba(30,32,38,0.92)]
        backdrop-blur-md
        border-b border-white/[0.06]
        box-border
        font-sans
      "
    >
      <div className="flex items-center gap-1">
        <span
          className="
            text-[#e4e7ec] text-[13px] font-semibold
            max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap
            tracking-[0.01em]
          "
          title={fileName}
        >
          {fileName}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarBtn id="toolbar-zoom-out" title="Zoom Out" onClick={onZoomOut}>
          <ZoomOutIcon />
        </ToolbarBtn>

        <span
          className="
            text-[12px] font-semibold text-[#9ca3af]
            min-w-[48px] text-center select-none tracking-[0.02em]
          "
        >
          {zoom}%
        </span>

        <ToolbarBtn id="toolbar-zoom-in" title="Zoom In" onClick={onZoomIn}>
          <ZoomInIcon />
        </ToolbarBtn>

        <ToolbarBtn
          id="toolbar-reset-zoom"
          title="Reset Zoom"
          onClick={onResetZoom}
        >
          <ResetIcon />
        </ToolbarBtn>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarBtn
          id="toolbar-download"
          title="Download PDF"
          onClick={onDownload}
        >
          <DownloadIcon />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn id="toolbar-print" title="Print PDF" onClick={onPrint}>
          <PrintIcon />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          id="toolbar-fullscreen"
          title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </ToolbarBtn>
      </div>
    </div>
  );
};

export default PDFToolbar;
