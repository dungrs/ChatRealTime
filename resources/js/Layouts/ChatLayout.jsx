import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, router, usePage } from "@inertiajs/react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationItem from "@/Components/App/ConversationItem";
import { useEventBus } from "@/EventBus";
import useOnlineTracking from "@/helpers";
import GroupModal from "@/Components/App/GroupModal";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;

    const [onlineUsers, setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false)

    const { emit, on } = useEventBus();

    const isUserOnline = (userId) => !!onlineUsers[userId];

    // SEARCH
    const onSearch = (event) => {
        const search = event.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) =>
                conversation.name.toLowerCase().includes(search)
            )
        );
    };

    // SOCKET CHECK ONLINE
    useOnlineTracking(setOnlineUsers);

    const messageCreated = (message) => {
        setLocalConversations((oldUsers) => {
            return oldUsers.map((u) => {
                if (
                    message.receiver_id &&
                    !u.is_group &&
                    (u.id == message.sender_id ||
                        u.id == parseInt(message.receiver_id))
                ) {
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }

                if (u.is_group && u.id == parseInt(message.group_id)) {
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }

                return u;
            });
        });
    };

    const messageDeleted = ({ prevMessage }) => {
        if (!prevMessage) return;
        setLocalConversations((oldUsers) => {
            return oldUsers.map((u) => {
                if (
                    prevMessage.receiver_id &&
                    !u.is_group &&
                    (u.id === prevMessage.sender_id ||
                        u.id === prevMessage.receiver_id)
                ) {
                    console.log(u);
                    u.last_message = prevMessage.message;
                    u.last_message_date = prevMessage.created_at;
                    return u;
                }

                if (u.is_group && u.id === parseInt(prevMessage.group_id)) {
                    u.last_message = prevMessage.message;
                    u.last_message_date = prevMessage.created_at;
                    return u;
                }

                return u;
            });
        });
    };

    useEffect(() => {
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);
        const offModalShow = on("GroupModal.show", (group) => {
            setShowGroupModal(true)
        });

        const offGroupDelete = on("group.deleted", ({ id, name }) => {
            setLocalConversations((oldConversations) => {
                return oldConversations.filter((con) => con.id != id)
            })

            emit("toast.show", `Group ${name} was deleted`)
            
            console.log(selectedConversation)
            if (
                !selectedConversation
            ) {
                router.visit(route("dashboard"))
            }
        })

        return () => {
            offCreated();
            offDeleted();
            offModalShow();
            offGroupDelete();
        };
    }, [on]);

    // SORT CONVERSATIONS
    useEffect(() => {
        const sorted = [...localConversations].sort((a, b) => {
            // Blocked sorting
            if (a.blocked_at && !b.blocked_at) return 1;
            if (!a.blocked_at && b.blocked_at) return -1;

            // Sort by last message
            if (a.last_message_date && b.last_message_date) {
                return b.last_message_date.localeCompare(a.last_message_date);
            }
            if (a.last_message_date) return -1;
            if (b.last_message_date) return 1;
            return 0;
        });

        setSortedConversations(sorted);
    }, [localConversations]);

    // LOAD CONVERSATIONS
    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    return (
        <AuthenticatedLayout conversations={conversations}>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[300px] bg-slate-800 flex flex-col overflow-hidden 
                    ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""}`}
                >
                    <div className="flex item-center justify-between py-2 px-3 text-xl font-medium">
                        <p className="mt-1 ml-1">My Conversations</p>
                        <div
                            className="tooltip tooltip-left"
                            data-tip="Create new Group"
                        >
                            <button onClick={(ev) => setShowGroupModal(true)} className="text-gray-400 hover:text-gray-200">
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="p-3">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full"
                        />
                    </div>

                    <div className="flex-1 overflow-auto">
                        {sortedConversations.length > 0 &&
                            sortedConversations.map((conversation) => (
                                <ConversationItem
                                    key={`${
                                        conversation.is_group
                                            ? "group_"
                                            : "user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
            <GroupModal show={showGroupModal} onClose={() => setShowGroupModal(false) } />
        </AuthenticatedLayout>
    );
};

export default ChatLayout;
