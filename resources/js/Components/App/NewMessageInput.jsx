import { useEffect, useRef, useState } from "react";

const NewMessageInput = ({ value, onChange, onSend }) => {
    const input = useRef();

    const onInputKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    }

    const onChangeEvent = (event) => {
        onChange(event);
        setTimeout(() => adjustHeight(), 10);
    }

    const adjustHeight = () => {
        if (!input.current) return;
        input.current.style.height = "auto";
        input.current.style.height = input.current.scrollHeight + "px";
    }

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            rows={1}
            placeholder="Type a message..."
            onKeyDown={onInputKeyDown}
            onChange={onChangeEvent}
            className="w-full rounded-xl border border-slate-600 px-3 py-2 text-slate-600 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 max-h-36 transition-all"
        />
    );
};

export default NewMessageInput
