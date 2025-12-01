import { isAudio, isImage, isPDF, isPreviewable, isVideo } from "@/helpers";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon, PaperClipIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState, Fragment } from "react";

export default function AttachmentPreviewModal({
    attachments,
    index,
    show = false,
    onClose = () => {},
}) {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const [currentIndex, setCurrentIndex] = useState(0);

    const attachment = useMemo(() => safeAttachments[currentIndex], [safeAttachments, currentIndex]);
    const previewableAttachments = useMemo(
        () => safeAttachments.filter((att) => isPreviewable(att)),
        [safeAttachments]
    );

    const close = () => onClose();
    const prev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
    const next = () =>
        currentIndex < previewableAttachments.length - 1 && setCurrentIndex(currentIndex + 1);

    useEffect(() => setCurrentIndex(index), [index]);

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={close}>
                {/* Background */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel
                            className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col"
                        >
                            {/* Close button */}
                            <button
                                onClick={close}
                                className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 
                                text-white rounded-full w-10 h-10 flex items-center justify-center 
                                backdrop-blur transition"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            {/* Content */}
                            <div className="relative flex-1 flex items-center justify-center bg-slate-800">

                                {/* Prev Button */}
                                {currentIndex > 0 && (
                                    <button
                                        onClick={prev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2
                                        w-14 h-14 bg-black/40 hover:bg-black/60 text-white rounded-full 
                                        flex items-center justify-center transition backdrop-blur z-30"
                                    >
                                        <ChevronLeftIcon className="w-10 h-10" />
                                    </button>
                                )}

                                {/* Next Button */}
                                {currentIndex < previewableAttachments.length - 1 && (
                                    <button
                                        onClick={next}
                                        className="absolute right-4 top-1/2 -translate-y-1/2
                                        w-14 h-14 bg-black/40 hover:bg-black/60 text-white rounded-full 
                                        flex items-center justify-center transition backdrop-blur z-30"
                                    >
                                        <ChevronRightIcon className="w-10 h-10" />
                                    </button>
                                )}

                                {/* Attachment Preview */}
                                {attachment && (
                                    <div className="max-w-full max-h-full flex items-center justify-center p-4">

                                        {isImage(attachment) && (
                                            <img
                                                src={attachment.url}
                                                className="max-w-full max-h-full rounded-lg shadow-lg"
                                            />
                                        )}

                                        {isVideo(attachment) && (
                                            <video
                                                src={attachment.url}
                                                controls
                                                onError={(e) => console.log("Video load error:", e)}
                                            />
                                        )}

                                        {isAudio(attachment) && (
                                            <audio
                                                src={attachment.url}
                                                controls
                                                onError={(e) => console.log("Audio load error:", e)}
                                            />
                                        )}

                                        {isPDF(attachment) && (
                                            <iframe
                                                src={attachment.url}
                                                className="w-full h-full bg-white rounded-lg shadow"
                                            />
                                        )}

                                        {!isPreviewable(attachment) && (
                                            <div className="p-10 flex flex-col items-center text-white">
                                                <PaperClipIcon className="w-12 h-12 mb-4 opacity-70" />
                                                <span className="text-lg">{attachment.name}</span>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}