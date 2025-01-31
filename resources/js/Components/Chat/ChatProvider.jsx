import { createContext, useContext, useState } from 'react';
import ChatWidget from './ChatWidget';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, messages, setMessages }}>
            {children}
            <ChatWidget />
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
} 