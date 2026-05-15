"use client";

interface Props {
  url: string;
  filename: string;
  onClose: () => void;
}

export default function PDFPreviewModal({ url, filename, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
      {/* ツールバー */}
      <div className="bg-white shadow flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none font-bold"
        >
          ×
        </button>
        <span className="text-sm text-gray-600 flex-1 truncate">{filename}</span>
        <a
          href={url}
          download={filename}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          ダウンロード
        </a>
      </div>

      {/* iframeプレビュー */}
      <iframe
        src={url}
        className="flex-1 w-full border-0"
        title="PDFプレビュー"
      />
    </div>
  );
}
