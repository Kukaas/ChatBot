export default function ChatMessage({ message }) {
    return (
        <div
            className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
            } mb-4`}
        >
            <div
                className={`max-w-[85%] rounded-lg p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    message.type === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-500/10 text-red-500 backdrop-blur-sm border border-red-500/20'
                        : 'bg-white/10 text-gray-100 backdrop-blur-sm'
                }`}
            >
                {message.title && (
                    <div className="font-bold mb-2 text-lg text-inherit">{message.title}</div>
                )}
                <div className="whitespace-pre-wrap text-inherit text-base">
                    {message.type === 'error' && (
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {message.content}
                        </span>
                    )}
                    {message.type !== 'error' && message.content}
                </div>
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
    );
} 