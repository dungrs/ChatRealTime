import { useState, Fragment } from "react";
import { FaceSmileIcon, HandThumbUpIcon, PaperAirplaneIcon, PaperClipIcon, PhotoIcon } from "@heroicons/react/24/solid";
import NewMessageInput from "./NewMessageInput";
import axios from "axios";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import { Popover, Transition } from '@headlessui/react'

const MessageInput = ({ selectedConversation }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const formData = new FormData();
        formData.append("message", newMessage)
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
            }
        }).then(() => {
            setMessageSending(false);
            setNewMessage("");
        }).catch(() => {
            setMessageSending(false);
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

    return (
        <div className="flex flex-row items-center gap-2 p-3 border-t border-slate-700 bg-slate-900 w-full">

            {/* Left icons */}
            <div className="flex flex-row gap-2 flex-shrink-0">
                <label className="p-2 rounded-full hover:bg-slate-700 cursor-pointer relative">
                    <PaperClipIcon className="w-6 h-6 text-slate-300"/>
                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer"/>
                </label>
                <label className="p-2 rounded-full hover:bg-slate-700 cursor-pointer relative">
                    <PhotoIcon className="w-6 h-6 text-slate-300"/>
                    <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"/>
                </label>
            </div>

            {/* Input */}
            <div className="flex-1 flex items-end gap-2">
                <NewMessageInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onSend={handleSend}
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    className={`flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 shrink-0`}
                    disabled={messageSending || !newMessage.trim()}
                >
                    {messageSending && <span className="loading loading-spinner loading-xs"></span>}
                    <PaperAirplaneIcon className="w-5 h-5 rotate-45"/>
                    <span className="hidden sm:inline">Send</span>
                </button>
            </div>

            {/* Right icons */}
            <div className="flex flex-row gap-2 flex-shrink-0">
                <Popover className="relative">
                    <Popover.Button className="p-2 rounded-full hover:bg-slate-700">
                        <FaceSmileIcon className="w-6 h-6 text-slate-300"/>
                    </Popover.Button>
                    <Popover.Panel className="absolute z-10 right-0 bottom-full">
                        <EmojiPicker 
                            theme="dark"
                            onEmojiClick={(ev) => setNewMessage(newMessage + ev.emoji)}
                        ></EmojiPicker>
                    </Popover.Panel>
                 </Popover>
                <button onClick={onLikeClick} className="p-2 rounded-full hover:bg-slate-700">
                    <HandThumbUpIcon className="w-6 h-6 text-slate-300"/>
                </button>
            </div>

        </div>
    );
};

export default MessageInput;