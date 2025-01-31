import ChatWidget from '@/Components/Chat/ChatWidget';

export default function AppLayout({ children }) {
    return (
        <div>
            {children}
            <ChatWidget />
        </div>
    );
} 