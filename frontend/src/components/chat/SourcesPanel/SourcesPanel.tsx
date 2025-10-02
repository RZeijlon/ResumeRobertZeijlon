import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaFile } from 'react-icons/fa';
import type { ChatSource } from '../../../types';
import './SourcesPanel.css';

interface SourcesPanelProps {
  sources: ChatSource[];
}

const SourcesPanel = ({ sources }: SourcesPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Sort sources by similarity (highest first)
  const sortedSources = [...sources].sort((a, b) =>
    (b.similarity || 0) - (a.similarity || 0)
  );

  const formatFileName = (filePath: string): string => {
    // Extract filename from path and make it readable
    const fileName = filePath.split('/').pop() || filePath;
    return fileName.replace(/\.md$/, '').replace(/-/g, ' ');
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.9) return 'high';
    if (similarity >= 0.7) return 'medium';
    return 'low';
  };

  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 0.9) return 'Highly Relevant';
    if (similarity >= 0.7) return 'Moderately Relevant';
    return 'Low Relevance';
  };

  const truncateContent = (content: string, maxLength: number = 200): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className="sources-panel">
      <button
        className="sources-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="sources-toggle-text">
          <FaFile className="sources-icon" />
          View Sources ({sources.length})
        </span>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {isExpanded && (
        <div className="sources-content">
          <div className="sources-header">
            <h4>Knowledge Base Sources</h4>
            <button
              className="info-button"
              onClick={() => setShowInfo(!showInfo)}
              aria-label="Information about RAG"
            >
              <FaInfoCircle />
            </button>
          </div>

          {showInfo && (
            <div className="rag-info">
              <p>
                <strong>How RAG Works:</strong> This response was generated using Retrieval Augmented Generation (RAG).
                The system searched through Robert's knowledge base, found the most relevant information,
                and used it to provide an accurate, context-aware answer.
              </p>
              <p>
                <strong>Similarity Score:</strong> Shows how relevant each source is to your question (0-100%).
                Higher scores mean the content is more closely related to what you asked.
              </p>
            </div>
          )}

          <div className="sources-list">
            {sortedSources.map((source, index) => {
              const similarity = source.similarity || 0;
              const similarityPercent = Math.round(similarity * 100);
              const isSourceExpanded = expandedSourceIndex === index;

              return (
                <div key={index} className="source-card">
                  <div className="source-header">
                    <div className="source-info">
                      <span className="source-filename">
                        {formatFileName(source.file_path)}
                      </span>
                      <span className={`similarity-badge ${getSimilarityColor(similarity)}`}>
                        {similarityPercent}% {getSimilarityLabel(similarity)}
                      </span>
                    </div>
                    <button
                      className="source-expand-button"
                      onClick={() => setExpandedSourceIndex(isSourceExpanded ? null : index)}
                      aria-label={isSourceExpanded ? 'Collapse source' : 'Expand source'}
                    >
                      {isSourceExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  <div className="similarity-bar-container">
                    <div
                      className={`similarity-bar ${getSimilarityColor(similarity)}`}
                      style={{ width: `${similarityPercent}%` }}
                    />
                  </div>

                  <div className="source-content">
                    <p>
                      {isSourceExpanded
                        ? source.content
                        : truncateContent(source.content)}
                    </p>
                  </div>

                  {source.content.length > 200 && !isSourceExpanded && (
                    <button
                      className="read-more-button"
                      onClick={() => setExpandedSourceIndex(index)}
                    >
                      Read more
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sources-footer">
            <small>
              Based on {sources.length} source{sources.length !== 1 ? 's' : ''} from Robert's knowledge base
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcesPanel;
