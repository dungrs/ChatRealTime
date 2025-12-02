import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import { React, useState } from "react";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";

const MessageItem = ({ message, onAttachmentClick }) => {
    const currentUser = usePage().props.auth.user;
    const isCurrentUser = message.sender_id === currentUser.id;

    return (
        <div
            className={`flex gap-3 mb-4 items-end ${
                isCurrentUser ? "justify-end" : "justify-start"
            }`}
        >
            {/* Avatar chỉ hiển thị bên trái nếu không phải current user */}
            {!isCurrentUser && <UserAvatar user={message.sender} online={null} />}

            <div className="flex flex-col max-w-[70%]">

                {/* Time tùy thuộc bên trái/phải */}
                <time
                    className={`text-xs text-slate-400 mb-1 ${
                        isCurrentUser ? "self-end" : "self-start"
                    }`}
                >
                    {formatMessageDateLong(message.created_at)}
                </time>

                {/* Bubble */}
                <div
                    className={`p-3 rounded-xl break-words chat-message-content relative
                    ${isCurrentUser ? "bg-blue-600 text-white self-end" : "bg-slate-700 text-slate-100"}`}
                >   
                    {message.sender_id == currentUser.id && (
                        <MessageOptionsDropdown message={message} />
                    )}
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                    <MessageAttachments 
                        attachments={message.attachments}
                        attachmentClick={onAttachmentClick}
                    />
                </div>
            </div>

            {/* Avatar bên phải nếu là current user */}
            {isCurrentUser && <UserAvatar user={currentUser} online={null} />}
        </div>
    );
};

export default MessageItem;