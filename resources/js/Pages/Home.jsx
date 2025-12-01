import ChatLayout from '@/Layouts/ChatLayout';
import { useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';

function Home({ selectedConversation, messages }) {
    const [localMessages, setLocalMessages] = useState([])
    const messagesCtrRef = useRef(null)
    const { on } = useEventBus();

    // useEffect chạy mỗi khi selectedConversation thay đổi
    useEffect(() => {
        // setTimeout 10ms để đảm bảo DOM đã render xong
        // Nếu scroll luôn mà DOM chưa render, scrollHeight sẽ sai
        setTimeout(() => {
            // scroll container xuống cuối
            // messagesCtrRef.current.scrollTop = scrollHeight
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight
        }, 10)

        const offCreated = on("message.created", (message) => {
            console.log("message.created received", message);
            let sender_id = parseInt(message.sender_id)
            let receiver_id = parseInt(message.receiver_id)

            if (
                selectedConversation &&
                selectedConversation.is_group &&
                selectedConversation.id === message.group_id
            ) {
                setLocalMessages(prev => [...prev, message]);
            }

            if (
                selectedConversation &&
                (selectedConversation.id === sender_id ||
                selectedConversation.id === receiver_id)
            ) {
                setLocalMessages(prev => [...prev, message]);
            }
        });

        return () => offCreated();

    }, [selectedConversation]) // dependency: chạy lại khi người dùng chọn conversation khác


    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : [])
    }, [messages])

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
                    <ConversationHeader 
                        selectedConversation={selectedConversation}
                    />
                    <div
                        ref={messagesCtrRef}
                        className='flex-1 overflow-y-auto p-5'
                    >
                        {localMessages.length === 0 && (
                            <div className='flex justify-center item-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    No Message Found
                                </div>
                            </div>
                        )}

                        {localMessages.length > 0 && (
                            <div className='flex-1 flex flex-col'>
                                {localMessages.map((message) => (
                                    <MessageItem 
                                        key={message.id}
                                        message={message}
                                    />
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

Home.layout = (page) => {
    return (
        <ChatLayout children={page} />
    )
}

export default Home
