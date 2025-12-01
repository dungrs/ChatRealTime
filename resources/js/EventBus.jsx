import React, { createContext, useContext, useRef } from "react";

const EventBusContext = createContext();

export const EventBusProvider = ({ children }) => {
    // dùng useRef để lưu callbacks, KHÔNG dùng state
    const events = useRef({});

    const emit = (name, data) => {
        const handlers = events.current[name];
        if (handlers) {
            handlers.forEach(cb => cb(data));
        }
    };

    const on = (name, cb) => {
        if (!events.current[name]) {
            events.current[name] = [];
        }
        events.current[name].push(cb);

        // return hàm để hủy đăng ký
        return () => {
            events.current[name] = events.current[name].filter(fn => fn !== cb);
        };
    };

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => useContext(EventBusContext);
