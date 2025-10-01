import ReactMarkdown from 'react-markdown'
import type { ContentItem } from '../../types'

interface MarkdownRendererProps {
  content: ContentItem
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="section-title">{children}</h1>,
          h2: ({ children }) => <h2 className="subsection-title">{children}</h2>,
          h3: ({ children }) => <h3 className="category-title">{children}</h3>,
          h4: ({ children }) => <h4 className="item-title">{children}</h4>,
          p: ({ children }) => <p className="content-paragraph">{children}</p>,
          ul: ({ children }) => <ul className="content-list">{children}</ul>,
          li: ({ children }) => <li className="content-list-item">{children}</li>,
          strong: ({ children }) => <strong className="content-emphasis">{children}</strong>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="content-link"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img 
              src={src?.startsWith('/') ? src : `/page_content/assets/images/${src}`} 
              alt={alt} 
              className="content-image"
            />
          )
        }}
      >
        {content.content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer