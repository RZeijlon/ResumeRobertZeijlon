import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
import './ChatBot.css';
import type { ContentItem, Message } from './types';

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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Use Vite proxy in development, environment variable in production
  // In development, use empty string to leverage Vite proxy
  // In production, use environment variable or fallback to localhost
  const API_BASE_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || 'http://localhost:8000') : '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkMobile = () => {
      // Use fullscreen chat on screens smaller than 1024px to avoid layout issues
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleOpenChat = () => {
      if (!isOpen) {
        toggleChat();
      }
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [isOpen]);

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
      setTimeout(() => setIsKeyboardOpen(true), 300); // Delay to ensure keyboard is open
    };
    
    const handleBlur = () => {
      setTimeout(() => setIsKeyboardOpen(false), 300); // Delay to prevent flickering
    };

    // Multiple detection methods for better reliability
    window.addEventListener('resize', handleResize);
    visualViewport?.addEventListener('resize', handleVisualViewportChange);
    inputRef.current?.addEventListener('focus', handleFocus);
    inputRef.current?.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('resize', handleResize);
      visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      inputRef.current?.removeEventListener('focus', handleFocus);
      inputRef.current?.removeEventListener('blur', handleBlur);
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

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const requestUrl = `${API_BASE_URL}/api/v1/chat/message`;
      const requestBody = {
        message: messageToSend,
        conversation_id: conversationId || undefined,
        use_rag: true // Enable RAG for intelligent responses
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend request failed:', response.status, response.statusText, errorText);
        throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update conversation ID if we got a new one
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Sorry, I couldn\'t process that request.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat API Error:', error);

      let errorContent = 'I\'m experiencing technical difficulties. Please try again later.';

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
      setMessages(prev => [...prev, errorMessage]);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(/* audioBlob */);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (/* audioBlob: Blob */) => {
    setIsTranscribing(true);

    try {
      // TODO: Implement speech transcription via backend API
      // This will be added when the backend transcription endpoint is ready
      alert('Speech transcription will be available soon via the backend API!');

    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      const welcomeContent = welcomeMessage?.content || 'Hi! I\'m here to help answer questions about Robert Zeijlon\'s background, skills, and projects. What would you like to know?';
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
      {/* Floating Chat Button - Hidden when chat is open on mobile */}
      {!(isOpen && isMobile) && (
        <button
          className={`chat-toggle ${isOpen ? 'open' : ''}`}
          onClick={toggleChat}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <FaTimes /> : <FaComments />}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={`chat-window ${isMobile ? 'mobile' : ''} ${isKeyboardOpen ? 'keyboard-open' : ''}`}
        >
          <div className="chat-header">
            <h3>Ask about Robert</h3>
            <button 
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
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

          <div className="chat-input">
            {isMobile && (
              <button 
                className="chat-close-mobile"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <FaTimes />
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isTranscribing ? "Transcribing..." : isRecording ? "Recording..." : "Ask about Robert's experience..."}
              disabled={isLoading || isRecording || isTranscribing}
            />
            <button
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={isLoading || isTranscribing}
              aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
              title={isRecording ? 'Stop recording' : 'Voice message'}
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
            </button>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || isRecording || isTranscribing}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;