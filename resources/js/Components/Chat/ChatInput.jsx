export default function ChatInput({ handleSubmit, data, handleInputChange, processing, suggestions, handleSuggestionClick, inputRef }) {
    return (
        <form onSubmit={handleSubmit} className="p-5 bg-gray-800/50 rounded-b-lg backdrop-blur-sm relative">
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-[100%] mx-5 mb-2">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 flex flex-col">
                        <div className="text-sm font-medium text-gray-300 p-3 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                            Suggestions:
                        </div>
                        <div className="overflow-y-auto scrollbar-thin">
                            <div className="p-2">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
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
    );
} 