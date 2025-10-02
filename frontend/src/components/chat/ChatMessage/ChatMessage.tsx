import type { Message } from '../../../types';
import SourcesPanel from '../SourcesPanel';
import './ChatMessage.css';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`message ${message.role}`}>
      <div className="message-content">
        {message.content}
      </div>
      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
        <SourcesPanel sources={message.sources} />
      )}
      <div className="message-time">
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default ChatMessage;
