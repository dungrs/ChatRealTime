import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import React from "react";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";

const MessageItem = ({ message }) => {
    const currentUser = usePage().props.auth.user;
    const isCurrentUser = message.sender_id === currentUser.id;

    return (
        <div
            className={`flex gap-3 mb-4 items-end ${
                isCurrentUser ? "justify-end" : "justify-start"
            }`}
        >
            {/* Avatar chỉ hiển thị bên trái nếu không phải current user */}
            {!isCurrentUser && <UserAvatar user={message.sender} />}

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
                    className={`p-3 rounded-xl break-words 
                    ${isCurrentUser ? "bg-blue-600 text-white self-end" : "bg-slate-700 text-slate-100"}`}
                >
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                </div>
            </div>

            {/* Avatar bên phải nếu là current user */}
            {isCurrentUser && <UserAvatar user={currentUser} />}
        </div>
    );
};

export default MessageItem;