import { useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import type { Message } from '../../../types';
import './ChatWindow.css';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onToggleRecording: () => void;
  onClose: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isMobile: boolean;
  isKeyboardOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const ChatWindow = ({
  messages,
  isLoading,
  inputMessage,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onToggleRecording,
  onClose,
  isRecording,
  isTranscribing,
  isMobile,
  isKeyboardOpen,
  inputRef
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className={`chat-window ${isMobile ? 'mobile' : ''} ${isKeyboardOpen ? 'keyboard-open' : ''}`}
    >
      <div className="chat-header">
        <h3>Ask about Robert</h3>
        <button
          className="chat-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={inputMessage}
        onChange={onInputChange}
        onSend={onSendMessage}
        onKeyPress={onKeyPress}
        onToggleRecording={onToggleRecording}
        isLoading={isLoading}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        isMobile={isMobile}
        onClose={isMobile ? onClose : undefined}
        inputRef={inputRef}
      />
    </div>
  );
};

export default ChatWindow;
