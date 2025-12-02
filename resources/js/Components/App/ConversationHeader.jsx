import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import useOnlineTracking from "@/helpers";
import { useState } from "react";
import { useEventBus } from "@/EventBus";
import axios from "axios";
import GroupDescriptionPopover from "./GroupDescriptionPopover";
import GroupUsersPopover from "./GroupUsersPopover";

const ConversationHeader = ({ selectedConversation }) => {
    if (!selectedConversation) return null;

    const page = usePage();
    const [onlineUser, setOnlineUser] = useState({});
    const { emit } = useEventBus();
    const authUser = page.props.auth.user

    useOnlineTracking(setOnlineUser)
    const isUserOnline = (userId) => !!onlineUser[userId];

    const onDeleteGroup = () => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        
        axios.delete(route("group.destroy", selectedConversation))
            .then((res) => {
                emit("toast.show", res.data.message)
            })
            .catch((error) => {
                console.log(error)
            })
    }

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
                    <UserAvatar user={selectedConversation} online={isUserOnline(selectedConversation.id)} size="lg" />
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
            {selectedConversation.is_group && (
                <div className="flex gap-3">
                    <GroupDescriptionPopover 
                        description={selectedConversation.description}
                    />
                    <GroupUsersPopover
                        users={selectedConversation.users}
                    />
                    {selectedConversation.owner_id == authUser.id && (
                        <>
                            <div
                                className="tooltip tooltip-left"
                                data-tip="Edit Group"
                            >
                                <button
                                    onClick={(ev) => {
                                        emit(
                                            "GroupModal.show",
                                            selectedConversation
                                        )
                                    }}
                                    className="text-gray-400 hover:text-gray-200"
                                >
                                    <PencilSquareIcon className="w-4" />
                                </button>
                            </div>
                            <div 
                                className="tooltip tooltip-left"
                                data-tip="Delete Group"
                            >
                                <button
                                    onClick={onDeleteGroup}
                                    className="text-gray-400 hover:text-gray-200"
                                >
                                    <TrashIcon className="w-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConversationHeader;
