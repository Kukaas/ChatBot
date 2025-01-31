export default function ChatFAQ({ showFAQ, setShowFAQ, topFAQs, handleSuggestionClick }) {
    return (
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
    );
} 