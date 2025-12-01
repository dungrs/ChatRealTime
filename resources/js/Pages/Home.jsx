import ChatLayout from '@/Layouts/ChatLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import axios from 'axios';

function Home({ selectedConversation, messages }) {
    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);
    const { on } = useEventBus();
    const loadMoreIntersect = useRef(null);
    const [noMoreMessages, setNoMoreMessages] = useState(false);

    // -----------------------------
    // Khi conversation hoặc messages thay đổi → set localMessages
    // -----------------------------
    useEffect(() => {
        if (messages && messages.data) {
            // reverse để tin nhắn cũ ở trên cùng
            setLocalMessages([...messages.data].reverse());
        } else {
            setLocalMessages([]);
        }
        setNoMoreMessages(false);

        // Scroll xuống cuối khi load conversation mới
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 50);
    }, [messages]);

    // -----------------------------
    // Nhận tin nhắn mới từ EventBus
    // -----------------------------
    useEffect(() => {
        const offCreated = on("message.created", (message) => {
            if (!selectedConversation) return;
            console.log(selectedConversation)
            const isCurrentConversation =
                (selectedConversation.is_group && selectedConversation.id === parseInt(message.group_id)) ||
                (!selectedConversation.is_group && 
                    (selectedConversation.id === message.sender_id || selectedConversation.id === parseInt(message.receiver_id))
                );

            if (isCurrentConversation) {
                setLocalMessages(prev => {
                    // tránh duplicate message
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });

                // Scroll xuống cuối khi nhận tin nhắn mới
                setTimeout(() => {
                    if (messagesCtrRef.current) {
                        messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
                    }
                }, 50);
            }
        });

        return () => offCreated();
    }, [selectedConversation, on]);

    // -----------------------------
    // Load thêm tin nhắn cũ
    // -----------------------------
    const loadMoreMessage = useCallback(() => {
        if (!localMessages || localMessages.length === 0 || noMoreMessages) return;

        const firstMessage = localMessages[0];

        const scrollHeightBefore = messagesCtrRef.current?.scrollHeight || 0;

        axios.get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (!data.data || data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }

                setLocalMessages(prev => {
                    // tránh duplicate
                    const newMessages = data.data.filter(msg => !prev.some(m => m.id === msg.id));
                    return [...newMessages.reverse(), ...prev];
                });

                // Giữ scroll position sau khi prepend message
                setTimeout(() => {
                    if (messagesCtrRef.current) {
                        const scrollHeightAfter = messagesCtrRef.current.scrollHeight;
                        messagesCtrRef.current.scrollTop = scrollHeightAfter - scrollHeightBefore;
                    }
                }, 20);
            })
            .catch(err => console.error(err));
    }, [localMessages, noMoreMessages]);

    // -----------------------------
    // IntersectionObserver để load thêm tin nhắn cũ
    // -----------------------------
    useEffect(() => {
        if (!messagesCtrRef.current || noMoreMessages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadMoreMessage();
                    }
                });
            },
            {
                root: messagesCtrRef.current,
                rootMargin: "0px 0px 250px 0px",
                threshold: 0
            }
        );

        if (loadMoreIntersect.current) {
            observer.observe(loadMoreIntersect.current);
        }

        return () => observer.disconnect();
    }, [loadMoreMessage, noMoreMessages]);

    return (
        <>
            {!messages && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                    <div className="max-w-sm space-y-4">
                        <h2 className="text-xl md:text-3xl font-semibold text-slate-100">
                            No conversation selected
                        </h2>
                        <p className="text-slate-300 text-sm md:text-base">
                            Choose a chat on the left to start messaging.
                        </p>
                    </div>
                    <ChatBubbleLeftRightIcon className="w-28 h-28 text-slate-300 mt-10 animate-pulse" />
                </div>
            )}

            {messages && (
                <>
                    <ConversationHeader selectedConversation={selectedConversation} />
                    <div ref={messagesCtrRef} className='flex-1 overflow-y-auto p-5'>
                        {localMessages.length === 0 ? (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>No Message Found</div>
                            </div>
                        ) : (
                            <div className='flex-1 flex flex-col'>
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map(message => (
                                    <MessageItem key={message.id} message={message} />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput selectedConversation={selectedConversation} />
                </>
            )}
        </>
    );
}

Home.layout = (page) => <ChatLayout>{page}</ChatLayout>;

export default Home;
