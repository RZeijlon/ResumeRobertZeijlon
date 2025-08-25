import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
import Groq from 'groq-sdk';
import './ChatBot.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatBotProps {
  onChatToggle?: (isOpen: boolean) => void;
}

const ChatBot = ({ onChatToggle }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const portfolioContext = `
    You are an AI assistant representing Robert Zeijlon, an AI Developer and Infrastructure Enthusiast. 
    Here's information about Robert based on his portfolio:

    BACKGROUND:
    - Recent AI Developer graduate specializing in artificial intelligence and machine learning
    - Passionate about local AI models and self-hosted solutions
    - Focus on building AI solutions from research to production

    SKILLS:
    AI/ML Technologies:
    - Machine Learning: TensorFlow, PyTorch, scikit-learn
    - Generative AI: Local LLM implementations, API integrations
    - Speech Processing: Near real-time transcription (KB-Whisper)
    - Computer Vision: ComfyUI, custom vision models
    - Model Deployment: LM-Studio, local model optimization

    Development Stack:
    - Languages: Python, R, JavaScript, TypeScript
    - Frameworks: FastAPI, React, Node.js
    - Data Science: pandas, numpy, Jupyter
    - Cloud: AWS, Google Cloud, Azure ML

    Infrastructure & DevOps:
    - Kubernetes: k3s 3-node HA cluster deployment
    - Linux Distributions: Arch, Fedora, NixOS, Debian, Ubuntu
    - Containerization: Podman, Docker, Docker Compose
    - Self-Hosting: Custom server builds and management
    - Home Automation: Home Assistant, Mosquitto, Zigbee2MQTT

    FEATURED PROJECTS:
    1. Transcriptomatic - Speech-to-text evaluation platform with multiple AI model comparisons (Azure, Deepgram, ElevenLabs, local Whisper). Built with React frontend and FastAPI backend, containerized with Docker.
    
    2. DIY AI Server Build - Custom AI training server using Dell PowerEdge R730 and NVIDIA Tesla P100, documenting the journey of building self-hosted AI infrastructure.

    PHILOSOPHY:
    Believes in local, self-hosted AI solutions that give users control over their data while delivering enterprise-grade performance. Passionate about making AI accessible and practical for real-world applications.

    CONTACT:
    - LinkedIn: https://www.linkedin.com/in/robert-zeijlon-14015928b
    - GitHub: https://github.com/RZeijlon
    - Email: robert.zeijlon.92@gmail.com
    - Phone: 072-233 16 26

    Answer questions about Robert's background, skills, projects, and experience in a helpful and professional manner. Be conversational but informative.
  `;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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

    let initialHeight = window.innerHeight;
    let visualViewport = window.visualViewport;

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
    setInputMessage('');
    setIsLoading(true);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: portfolioContext },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: inputMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: completion.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Groq API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
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

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3-turbo',
        response_format: 'text'
      });

      // Set the transcribed text in the input field
      setInputMessage(transcription.trim());
      
      // Optionally auto-send the message
      // await sendMessage();
      
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
      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Hi! I\'m here to help answer questions about Robert Zeijlon\'s background, skills, and projects. What would you like to know?',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
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
          {!isKeyboardOpen && (
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
          )}

          {!isKeyboardOpen && (
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
          )}

          <div className="chat-input">
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