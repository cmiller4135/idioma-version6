import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, MessageSquare, User, Bot } from 'lucide-react';
import { callOpenAI } from '../../lib/edgeFunctions';
import { Button } from '../../components/ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const data = await callOpenAI({
        type: 'chat',
        model: 'gpt-4o',
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="px-4 py-3 bg-primary-600 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Language Learning Assistant</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearConversation}
            className="p-2 rounded-lg text-primary-200 hover:text-white hover:bg-primary-500 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Bot className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">Start a conversation</p>
            <p className="text-sm">Ask questions about Spanish, get help with translations, or practice conversations.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${msg.role === 'user' ? 'bg-primary-100' : 'bg-accent-100'}
            `}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary-600" />
              ) : (
                <Bot className="w-4 h-4 text-accent-600" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`
              max-w-[75%] rounded-2xl px-4 py-2.5
              ${msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
              }
            `}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none min-h-[44px] max-h-[120px] text-sm"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="flex-shrink-0"
            size="md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default Chat;
