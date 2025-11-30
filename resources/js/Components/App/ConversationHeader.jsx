import { Link } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const ConversationHeader = ({ selectedConversation }) => {
    if (!selectedConversation) return null;

    return (
        <div className="p-4 flex justify-between items-center border-b border-slate-700 bg-slate-900/40 backdrop-blur">
            <div className="flex items-center gap-4">

                {/* Back button (only mobile) */}
                <Link
                    href={route("dashboard")}
                    className="inline-block sm:hidden p-1 hover:bg-slate-700/40 rounded-full transition"
                >
                    <ArrowLeftIcon className="w-6 text-slate-300" />
                </Link>

                {/* Avatar */}
                {selectedConversation.is_user && (
                    <UserAvatar user={selectedConversation} size="lg" />
                )}

                {selectedConversation.is_group && (
                    <GroupAvatar size="lg" />
                )}

                {/* Name + Info */}
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-100">
                        {selectedConversation.name}
                    </h3>

                    {selectedConversation.is_group && (
                        <p className="text-xs text-slate-400 mt-0.5">
                            {selectedConversation.users.length} members
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationHeader;
