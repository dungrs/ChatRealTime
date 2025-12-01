import { useState, Fragment } from "react";
import { FaceSmileIcon, HandThumbUpIcon, PaperAirplaneIcon, PaperClipIcon, PhotoIcon, XCircleIcon } from "@heroicons/react/24/solid";
import NewMessageInput from "./NewMessageInput";
import axios from "axios";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import { Popover, Transition } from '@headlessui/react'
import { isAudio, isImage } from "@/helpers";
import CustomAudioPlayer from "./CustomAudioPlayer";
import AttachmentPreview from "./AttachmentPreview";
import AudioRecorder from "./AudioRecorder";

const MessageInput = ({ selectedConversation }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [inputErrorMessage, setInputErrorMessage] = useState("*");
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(null);

    const onFileChange = (ev) => {
        const files = ev.target.files;

        const uploadFiles = [...files].map((file) => {
            return {
                file: file,
                url: URL.createObjectURL(file)
            }
        })

        setChosenFiles((prevFiles) => {
            return [...prevFiles, ...uploadFiles]
        })
    }

    const handleSend = () => {
        // Nếu không có tin nhắn và cũng không có file → dừng
        if (!newMessage.trim() && chosenFiles.length === 0) return;

        const formData = new FormData();
        formData.append("message", newMessage)
        chosenFiles.forEach(file => {
            formData.append("attachments[]", file.file)
        });

        if (selectedConversation.is_user) {
            formData.append("receiver_id", selectedConversation.id)
        } else {
            formData.append("group_id", selectedConversation.id)
        }
        
        setMessageSending(true);
        axios.post(route("message.store"), formData, {
            onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                );
                console.log(progress);
                setUploadProgress(progress)
            }
        }).then(() => {
            setMessageSending(false);
            setNewMessage("");
            setUploadProgress(null)
            setChosenFiles([])
        }).catch((error) => {
            setMessageSending(false);
            setChosenFiles([])
            const message = error?.response?.data?.message;
            setInputErrorMessage(
                message || "An error occured while sending message"
            )
        })
    };

    const onLikeClick = () => {
        if (messageSending) {
            return;
        }

        const data = {
            message: "👍"
        }

        if (selectedConversation.is_user) {
            data["receiver_id"] = selectedConversation.id;
        } else {
            data["group_id"] = selectedConversation.id;
        }

        axios.post(route("message.store"), data)
    }

    const recordedAudioReady = (file, url) => {
        setChosenFiles((prevFiles) => [...prevFiles, { file, url } ])
    }

    return (
        <div className="flex flex-col w-full border-t border-slate-700 bg-slate-900">

            {/* Hàng trên: icon + input + send */}
            <div className="flex flex-row items-center gap-2 p-3 w-full">

                {/* Left icons */}
                <div className="flex flex-row gap-2 flex-shrink-0">
                    <label className="p-2 rounded-full hover:bg-slate-700 cursor-pointer relative">
                        <PaperClipIcon className="w-6 h-6 text-slate-300" />
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={onFileChange}
                        />
                    </label>

                    <label className="p-2 rounded-full hover:bg-slate-700 cursor-pointer relative">
                        <PhotoIcon className="w-6 h-6 text-slate-300" />
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={onFileChange}
                        />
                    </label>

                    <AudioRecorder fileReady={recordedAudioReady} />
                </div>

                {/* Input + Progress */}
                <div className="flex-1 flex flex-col gap-1">

                {/* textarea */}
                <NewMessageInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onSend={handleSend}
                />

                {/* Progress bar */}
                {uploadProgress !== null && (
                    <progress
                        className="progress progress-info w-full h-1 rounded-full mb-2"
                        value={uploadProgress}
                        max="100"
                    ></progress>
                )}

                {/* File previews - hiển thị ngang */}
                <div className="flex gap-2 mb-2 overflow-x-auto">
                    {chosenFiles.map((file) => (
                        <div
                            key={file.file.name}
                            className="relative flex-shrink-0 flex flex-col items-center p-2 rounded-xl bg-slate-800 border border-slate-700 shadow-sm"
                        >
                            {/* Image preview */}
                            {isImage(file.file) && (
                                <img
                                    src={file.url}
                                    alt="preview"
                                    className="w-16 h-16 rounded-lg object-cover border border-slate-600 mb-1"
                                />
                            )}

                            {/* Audio preview */}
                            {isAudio(file.file) && (
                                <CustomAudioPlayer file={file} showVolume={false} className="mb-1" />
                            )}

                            {/* File preview (PDF, DOCX, ZIP, etc.) */}
                            {!isAudio(file.file) && !isImage(file.file) && (
                                <AttachmentPreview file={file} className="mb-1" />
                            )}

                            {/* Remove button */}
                            <button
                                onClick={() =>
                                    setChosenFiles(
                                        chosenFiles.filter((f) => f.file.name !== file.file.name)
                                    )
                                }
                                className="absolute -top-2 -right-2 bg-slate-900 border border-slate-600 
                                        rounded-full p-1 hover:bg-slate-700 transition"
                            >
                                <XCircleIcon className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Send button */}
            <button
                onClick={handleSend}
                disabled={messageSending || (!newMessage.trim() && chosenFiles.length === 0)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white 
                        px-4 py-2 rounded-xl transition-all disabled:opacity-50 shrink-0"
            >
                {messageSending && (
                    <span className="loading loading-spinner loading-xs"></span>
                )}
                <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                <span className="hidden sm:inline">Send</span>
            </button>


            {/* Right icons */}
            <div className="flex flex-row gap-2 flex-shrink-0">
                <Popover className="relative">
                    <Popover.Button className="p-2 rounded-full hover:bg-slate-700">
                        <FaceSmileIcon className="w-6 h-6 text-slate-300" />
                    </Popover.Button>
                    <Popover.Panel className="absolute z-10 right-0 bottom-full">
                        <EmojiPicker
                            theme="dark"
                            onEmojiClick={(ev) =>
                                setNewMessage(newMessage + ev.emoji)
                            }
                        />
                    </Popover.Panel>
                </Popover>

                <button
                    onClick={onLikeClick}
                    className="p-2 rounded-full hover:bg-slate-700"
                >
                    <HandThumbUpIcon className="w-6 h-6 text-slate-300" />
                </button>
            </div>
        </div>
    </div>

    );
};

export default MessageInput;