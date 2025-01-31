import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useChat } from './ChatProvider';
import ChatMessage from './ChatMessage';
import ChatFAQ from './ChatFAQ';
import ChatInput from './ChatInput';

export default function ChatWidget() {
    const { isOpen, setIsOpen, messages, setMessages } = useChat();
    const [suggestions, setSuggestions] = useState([]);
    const [showFAQ, setShowFAQ] = useState(true);
    const [topFAQs, setTopFAQs] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { data, setData, processing } = useForm({
        message: '',
    });

    useEffect(() => {
        const fetchTopFAQs = async () => {
            try {
                const response = await axios.get('/api/chat/top-faqs');
                setTopFAQs(response.data.faqs);
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            }
        };

        fetchTopFAQs();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!data.message.trim()) return;

        setMessages(prev => [...prev, { type: 'user', content: data.message }]);

        try {
            const response = await axios.post('/api/chat/troubleshoot', {
                message: data.message
            });

            if (response.data.guide) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: response.data.guide.solution,
                    title: response.data.guide.title,
                    image_path: response.data.guide.image_path
                }]);
            } else if (response.data.ai_response) {
                setMessages(prev => [...prev, {
                    type: 'ai',
                    content: response.data.ai_response
                }]);
            } else if (response.data.error) {
                setMessages(prev => [...prev, {
                    type: 'error',
                    content: response.data.error
                }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Sorry, there was an error processing your request. Please try again.'
            }]);
        }

        setData('message', '');
        setSuggestions([]);
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setData('message', value);
        
        if (value.length > 0) {
            try {
                const response = await axios.get(`/api/chat/suggestions?query=${encodeURIComponent(value)}`);
                setSuggestions(response.data.suggestions);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = async (suggestion) => {
        setData('message', suggestion.title);
        setSuggestions([]);
        
        // Add the user message first
        setMessages(prev => [...prev, { type: 'user', content: suggestion.title }]);

        try {
            const response = await axios.post('/api/chat/troubleshoot', {
                message: suggestion.title
            });

            if (response.data.guide) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: response.data.guide.solution,
                    title: response.data.guide.title,
                    image_path: response.data.guide.image_path
                }]);
            } else if (response.data.ai_response) {
                setMessages(prev => [...prev, {
                    type: 'ai',
                    content: response.data.ai_response
                }]);
            } else if (response.data.error) {
                setMessages(prev => [...prev, {
                    type: 'error',
                    content: response.data.error
                }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Sorry, there was an error processing your request. Please try again.'
            }]);
        }

        setData('message', '');
        inputRef.current?.focus();
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-16 h-16 rounded-full 
                             bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg 
                             hover:from-indigo-700 hover:to-purple-700 
                             transition-all duration-300 hover:scale-105"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            ) : (
                <div className="w-[450px] max-w-[calc(100vw-2rem)] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl flex flex-col h-[600px]">
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
                        <h3 className="text-xl font-semibold text-white tracking-wide">Help & Support</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <ChatFAQ 
                        showFAQ={showFAQ}
                        setShowFAQ={setShowFAQ}
                        topFAQs={topFAQs}
                        handleSuggestionClick={handleSuggestionClick}
                    />

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                        {messages.map((message, index) => (
                            <ChatMessage key={index} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <ChatInput 
                        handleSubmit={handleSubmit}
                        data={data}
                        handleInputChange={handleInputChange}
                        processing={processing}
                        suggestions={suggestions}
                        handleSuggestionClick={handleSuggestionClick}
                        inputRef={inputRef}
                    />
                </div>
            )}
        </div>
    );
} 