import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
        {message.role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="chat-heading-1">{children}</h1>,
              h2: ({ children }) => <h2 className="chat-heading-2">{children}</h2>,
              h3: ({ children }) => <h3 className="chat-heading-3">{children}</h3>,
              h4: ({ children }) => <h4 className="chat-heading-4">{children}</h4>,
              p: ({ children }) => <p className="chat-paragraph">{children}</p>,
              ul: ({ children }) => <ul className="chat-list">{children}</ul>,
              ol: ({ children }) => <ol className="chat-list-ordered">{children}</ol>,
              li: ({ children }) => <li className="chat-list-item">{children}</li>,
              strong: ({ children }) => <strong className="chat-bold">{children}</strong>,
              em: ({ children }) => <em className="chat-italic">{children}</em>,
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="chat-code-inline">{children}</code>
                ) : (
                  <code className="chat-code-block">{children}</code>
                );
              },
              blockquote: ({ children }) => <blockquote className="chat-blockquote">{children}</blockquote>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="chat-link"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
              table: ({ children }) => <table className="chat-table">{children}</table>,
              thead: ({ children }) => <thead className="chat-table-head">{children}</thead>,
              tbody: ({ children }) => <tbody className="chat-table-body">{children}</tbody>,
              tr: ({ children }) => <tr className="chat-table-row">{children}</tr>,
              th: ({ children }) => <th className="chat-table-header">{children}</th>,
              td: ({ children }) => <td className="chat-table-cell">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          message.content
        )}
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
