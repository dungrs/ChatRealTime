import { isPDF, isPreviewable, formatBytes } from "@/helpers"
import { PaperClipIcon } from "@heroicons/react/24/solid"

const AttachmentPreview = ({ file }) => {
    const isFilePreviewable = isPreviewable(file.file);
    const isFilePDF = isPDF(file.file);

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-shadow shadow-sm">
            {/* File thumbnail / icon */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden">
                {isFilePDF && <img src="/img/pdf.png" alt="PDF" className="w-8 h-8 object-contain" />}
                {!isFilePreviewable && !isFilePDF && (
                    <PaperClipIcon className="w-6 h-6 text-gray-400" />
                )}
                {isFilePreviewable && !isFilePDF && (
                    <img src={file.url} alt={file.file.name} className="w-full h-full object-cover" />
                )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-200 truncate">{file.file.name}</h3>
                <p className="text-xs text-gray-400">{formatBytes(file.file.size)}</p>
            </div>
        </div>
    )
}

export default AttachmentPreview;