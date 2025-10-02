import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import ChatWindow from '../ChatWindow';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import type { ContentItem, Message } from '../../../types';
import './ChatBot.css';

interface ChatBotProps {
  onChatToggle?: (isOpen: boolean) => void;
  welcomeMessage?: ContentItem | null;
}

const ChatBot = ({ onChatToggle, welcomeMessage }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder();

  // Use Vite proxy in development, environment variable in production
  const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || 'http://localhost:8000')
    : '';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleOpenChat = () => {
      if (!isOpen) {
        setIsOpen(true);
        if (messages.length === 0) {
          const welcomeContent =
            welcomeMessage?.content ||
            "Hi! I'm here to help answer questions about Robert Zeijlon's background, skills, and projects. What would you like to know?";
          const welcomeMsg: Message = {
            id: 'welcome',
            content: welcomeContent,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages([welcomeMsg]);
        }
      }
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [isOpen, messages.length, welcomeMessage]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    onChatToggle?.(isOpen);
  }, [isOpen, onChatToggle]);

  useEffect(() => {
    if (!isMobile) return;

    const initialHeight = window.innerHeight;
    const visualViewport = window.visualViewport;
    const inputElement = inputRef.current;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;

      setIsKeyboardOpen(heightDifference > 150);
    };

    const handleVisualViewportChange = () => {
      if (visualViewport) {
        const heightDifference = window.innerHeight - visualViewport.height;
        setIsKeyboardOpen(heightDifference > 100);
      }
    };

    const handleFocus = () => {
      setTimeout(() => setIsKeyboardOpen(true), 300);
    };

    const handleBlur = () => {
      setTimeout(() => setIsKeyboardOpen(false), 300);
    };

    window.addEventListener('resize', handleResize);
    visualViewport?.addEventListener('resize', handleVisualViewportChange);
    inputElement?.addEventListener('focus', handleFocus);
    inputElement?.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('resize', handleResize);
      visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      inputElement?.removeEventListener('focus', handleFocus);
      inputElement?.removeEventListener('blur', handleBlur);
    };
  }, [isMobile]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const requestUrl = `${API_BASE_URL}/api/v1/chat/message`;
      const requestBody = {
        message: messageToSend,
        conversation_id: conversationId || undefined,
        use_rag: true
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend request failed:', response.status, response.statusText, errorText);
        throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || "Sorry, I couldn't process that request.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat API Error:', error);

      let errorContent = "I'm experiencing technical difficulties. Please try again later.";

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorContent = 'Cannot connect to the chat service. Please check your network connection.';
        } else if (error.message.includes('Backend request failed')) {
          errorContent = 'The chat service returned an error. Please try again.';
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      const welcomeContent =
        welcomeMessage?.content ||
        "Hi! I'm here to help answer questions about Robert Zeijlon's background, skills, and projects. What would you like to know?";
      const welcomeMsg: Message = {
        id: 'welcome',
        content: welcomeContent,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  };

  return (
    <>
      {!(isOpen && isMobile) && (
        <button
          className={`chat-toggle ${isOpen ? 'open' : ''}`}
          onClick={toggleChat}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <FaTimes /> : <FaComments />}
        </button>
      )}

      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
          onToggleRecording={toggleRecording}
          onClose={() => setIsOpen(false)}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          isMobile={isMobile}
          isKeyboardOpen={isKeyboardOpen}
          inputRef={inputRef}
        />
      )}
    </>
  );
};

export default ChatBot;
