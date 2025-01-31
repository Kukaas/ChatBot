import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useChat } from './ChatProvider';

export default function ChatWidget() {
    const { isOpen, setIsOpen, messages, setMessages } = useChat();
    const [suggestions, setSuggestions] = useState([]);
    const [showFAQ, setShowFAQ] = useState(true);
    const [topFAQs, setTopFAQs] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

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
            } else {
                try {
                    const aiResponse = await axios.post('/api/chat/ai', {
                        message: data.message
                    });
                    
                    setMessages(prev => [...prev, {
                        type: 'ai',
                        content: aiResponse.data.message
                    }]);
                } catch (error) {
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        content: 'No matching guide found, and AI assistance is currently unavailable. Please try a different search or contact support.'
                    }]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: 'Sorry, there was an error processing your request. Please try again.'
            }]);
        }

        setData('message', '');
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setInputValue(value);
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
        
        // Automatically submit the form with the suggestion
        const message = suggestion.title;
        setMessages(prev => [...prev, { type: 'user', content: message }]);

        try {
            const response = await axios.post('/api/chat/troubleshoot', {
                message: message
            });

            if (response.data.guide) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: response.data.guide.solution,
                    title: response.data.guide.title,
                    image_path: response.data.guide.image_path
                }]);
            } else {
                // Handle AI fallback...
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: 'Sorry, there was an error processing your request. Please try again.'
            }]);
        }

        setData('message', '');
        inputRef.current?.focus();
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                // Chat button when closed
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
                // Chat widget when open
                <div className="w-[450px] max-w-[calc(100vw-2rem)] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl flex flex-col h-[600px] font-poppins">
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

                    {/* FAQ Section */}
                    <div className="border-b border-gray-700/50">
                        <button
                            onClick={() => setShowFAQ(!showFAQ)}
                            className="w-full px-5 py-4 flex justify-between items-center text-white hover:bg-white/5 transition-colors duration-200"
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-lg font-medium tracking-wide">Frequently Asked Questions</span>
                                <span className="text-sm text-indigo-400">({topFAQs.length})</span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${showFAQ ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showFAQ && (
                            <div className="px-5 py-3">
                                <div className="flex space-x-3 overflow-x-auto 
                                                  scrollbar-thin scrollbar-thumb-gray-500/50 scrollbar-track-gray-800/30 
                                                  hover:scrollbar-thumb-gray-400/50
                                                  pb-2 px-1"
                                >
                                    {topFAQs.map((faq) => (
                                        <button
                                            key={faq.id}
                                            onClick={() => handleSuggestionClick(faq)}
                                            className="flex-shrink-0 px-4 py-3 text-base text-gray-300 
                                                     bg-gray-800/50 rounded-md hover:bg-white/10 
                                                     transition-all duration-200 ease-in-out hover:translate-y-[-2px]
                                                     flex flex-col space-y-2 min-w-[200px] max-w-[250px]"
                                        >
                                            <div className="flex items-center space-x-2">
                                                {faq.frequency >= 3 ? (
                                                    <span className="text-indigo-400">🔥</span>
                                                ) : (
                                                    <span className="text-indigo-400">#</span>
                                                )}
                                                <span>{faq.title}</span>
                                            </div>
                                            {faq.frequency >= 3 && (
                                                <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full">
                                                    Trending • {faq.frequency} times
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.type === 'user' ? 'justify-end' : 'justify-start'
                                } mb-4`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                                        message.type === 'user'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                            : 'bg-white/10 text-gray-100 backdrop-blur-sm'
                                    }`}
                                >
                                    {message.title && (
                                        <div className="font-bold mb-2 text-lg text-inherit">{message.title}</div>
                                    )}
                                    <div className="whitespace-pre-wrap text-inherit text-base">{message.content}</div>
                                    {message.type === 'bot' && message.image_path && (
                                        <img
                                            src={message.image_path}
                                            alt={message.title}
                                            className="mt-4 rounded-lg max-w-full h-auto"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form with Suggestions */}
                    <form onSubmit={handleSubmit} className="p-5 bg-gray-800/50 rounded-b-lg backdrop-blur-sm relative">
                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 bottom-[100%] mx-5 mb-2">
                                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-thin">
                                    <div className="text-sm font-medium text-gray-300 p-3 border-b border-gray-700">
                                        Suggestions:
                                    </div>
                                    <div className="p-2">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                onClick={() => {
                                                    handleSuggestionClick(suggestion);
                                                    setInputValue('');
                                                    setSuggestions([]);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-300 
                                                         rounded-md hover:bg-gray-700/50
                                                         transition-colors duration-150 ease-in-out
                                                         flex flex-col gap-1"
                                            >
                                                <span className="font-medium">{suggestion.title}</span>
                                                <span className="text-xs text-gray-400 line-clamp-1">
                                                    {suggestion.description}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input and Send Button */}
                        <div className="flex space-x-3">
                            <input
                                type="text"
                                value={data.message}
                                onChange={handleInputChange}
                                ref={inputRef}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Type your question here..."
                                disabled={processing}
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white 
                                         hover:from-indigo-700 hover:to-purple-700 
                                         disabled:opacity-50 transition-all duration-200 text-base font-medium
                                         hover:shadow-lg hover:scale-105"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
} 