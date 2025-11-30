import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from '@/Components/TextInput';
import ConversationItem from '@/Components/App/ConversationItem';

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;

    const [onlineUsers, setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);

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
    useEffect(() => {
        if (!window.Echo) {
            console.warn("Echo chưa được khởi tạo!");
            return;
        }

        window.Echo.join("online")
            .here((users) => {
                const onlineObj = Object.fromEntries(
                    users.map((u) => [u.id, u])
                );
                setOnlineUsers(onlineObj);
            })
            .joining((user) => {
                setOnlineUsers((prev) => ({
                    ...prev,
                    [user.id]: user,
                }));
            })
            .leaving((user) => {
                setOnlineUsers((prev) => {
                    const updated = { ...prev };
                    delete updated[user.id];
                    return updated;
                });
            })
            .error((err) => console.error("Echo Error:", err));

        return () => {
            window.Echo.leave("online");
        };
    }, []);

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
        <AuthenticatedLayout>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[300px] bg-slate-800 flex flex-col overflow-hidden 
                    ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""}`}
                >
                    <div className="flex item-center justify-between py-2 px-3 text-xl font-medium">
                        <p className='mt-1 ml-1'>
                            My Conversations
                        </p>
                        <div className="tooltip tooltip-left" data-tip="Create new Group">
                            <button className="text-gray-400 hover:text-gray-200">
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
                                    key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
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
        </AuthenticatedLayout>
    );
};

export default ChatLayout;
