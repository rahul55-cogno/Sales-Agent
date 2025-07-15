import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/Customer';
import { Bot, User, Clock } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isBot 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {isBot ? <Bot size={16} /> : <User size={16} />}
          </div>
        </div>
        
        <div className={`rounded-2xl px-4 py-3 ${
          isBot 
            ? 'bg-white border border-gray-200 text-gray-800' 
            : 'bg-blue-500 text-white'
        }`}>
          <div className="text-sm leading-relaxed">
            {message.content}
          </div>
          
          {message.data && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(message.data, null, 2)}
              </pre>
            </div>
          )}
          
          <div className={`flex items-center mt-2 text-xs ${
            isBot ? 'text-gray-500' : 'text-blue-100'
          }`}>
            <Clock size={12} className="mr-1" />
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};