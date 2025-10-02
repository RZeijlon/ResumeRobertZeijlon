import { FaPaperPlane, FaMicrophone, FaStop, FaTimes } from 'react-icons/fa';
import './ChatInput.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onToggleRecording: () => void;
  isLoading: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  isMobile: boolean;
  onClose?: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onToggleRecording,
  isLoading,
  isRecording,
  isTranscribing,
  isMobile,
  onClose,
  inputRef
}: ChatInputProps) => {
  const placeholder = isTranscribing
    ? "Transcribing..."
    : isRecording
    ? "Recording..."
    : "Ask about Robert's experience...";

  return (
    <div className="chat-input">
      {isMobile && onClose && (
        <button
          className="chat-close-mobile"
          onClick={onClose}
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={isLoading || isRecording || isTranscribing}
      />
      <button
        className={`voice-button ${isRecording ? 'recording' : ''}`}
        onClick={onToggleRecording}
        disabled={isLoading || isTranscribing}
        aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
        title={isRecording ? 'Stop recording' : 'Voice message'}
      >
        {isRecording ? <FaStop /> : <FaMicrophone />}
      </button>
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading || isRecording || isTranscribing}
        aria-label="Send message"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
};

export default ChatInput;
