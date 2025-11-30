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
                {/* Tên người gửi (chỉ hiển thị nếu không phải current user) + thời gian */}
                {!isCurrentUser && (
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-100">
                            {message.sender.name}
                        </span>
                        <time className="text-xs text-slate-400">
                            {formatMessageDateLong(message.created_at)}
                        </time>
                    </div>
                )}

                {/* Chat bubble */}
                <div
                    className={`p-3 rounded-xl break-words relative 
                    ${isCurrentUser ? "bg-blue-600 text-white self-end" : "bg-slate-700 text-slate-100"}`}
                >
                    <ReactMarkdown>
                        {message.message}
                    </ReactMarkdown>

                    {/* Thời gian nhỏ ở góc bubble nếu là current user */}
                    {isCurrentUser && (
                        <time className="text-[10px] opacity-50 absolute bottom-1 right-2">
                            {formatMessageDateLong(message.created_at)}
                        </time>
                    )}
                </div>
            </div>

            {/* Avatar bên phải nếu là current user */}
            {isCurrentUser && <UserAvatar user={currentUser} />}
        </div>
    );
};

export default MessageItem;