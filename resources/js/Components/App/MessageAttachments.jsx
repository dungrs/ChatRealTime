import {
    isPDF,
    isPreviewable,
    isAudio,
    isImage,
    isVideo,
} from "@/helpers";
import {
    PaperClipIcon,
    ArrowDownTrayIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/solid";

const MessageAttachments = ({ attachments, attachmentClick }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap justify-end gap-2">
            {attachments.map((attachment, ind) => {
                // Nhớ return
                return (
                    <div
                        onClick={() => attachmentClick(attachments, ind)}
                        key={attachment.id}
                        className={`group relative cursor-pointer rounded-lg overflow-hidden border-slate-700
                            flex items-center justify-center
                            ${isAudio(attachment) ? "w-full" : "w-32 aspect-square bg-gray-800"}`}
                    >
                        {/* Download button */}
                        <a
                            onClick={(ev) => ev.stopPropagation()}
                            download
                            href={attachment.url}
                            className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-800 text-gray-100 z-10"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </a>

                        {/* Image */}
                        {isImage(attachment) && (
                            <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Đang bị lỗi */}
                        {/* Video */}
                        {isVideo(attachment) && (
                            <div className="relative w-full h-full">
                                <video
                                    src={attachment.url}
                                    className="w-full h-full object-cover"
                                    controls
                                />
                                <PlayCircleIcon className="absolute w-12 h-12 text-white opacity-70 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        )}  

                        {/* Đang bị lỗi */}
                        {/* Audio */}
                        {isAudio(attachment) && (
                                            <audio
                                                src={attachment.url}
                                                controls
                                                onError={(e) => console.log("Audio load error:", e)}
                                            />
                            

                        )}

                        {/* PDF */}
                        {isPDF(attachment) && (
                            <iframe
                                src={attachment.url}
                                className="w-full h-32"
                            />
                        )}

                        {/* File không preview */}
                        {!isPreviewable(attachment) && !isImage(attachment) && !isVideo(attachment) && !isAudio(attachment) && !isPDF(attachment) && (
                            <div className="flex flex-col justify-center items-center p-2 text-gray-300">
                                <PaperClipIcon className="w-10 h-10 mb-1" />
                                <small>{attachment.name}</small>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MessageAttachments;