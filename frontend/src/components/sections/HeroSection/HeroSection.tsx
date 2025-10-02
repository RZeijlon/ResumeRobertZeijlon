import MarkdownRenderer from '../../shared/MarkdownRenderer';
import type { ContentItem } from '../../../types';
import './HeroSection.css';

interface HeroSectionProps {
  sectionId: string;
  content: ContentItem;
}

const HeroSection = ({ sectionId, content }: HeroSectionProps) => {
  return (
    <section id={sectionId} className="hero">
      <div className="hero-title">
        <h1>{content.metadata.title}</h1>
      </div>
      {content.metadata.subtitle && (
        <div className="hero-text">
          <p>{content.metadata.subtitle}</p>
        </div>
      )}
      {content.content.trim() && (
        <div className="hero-text">
          <MarkdownRenderer content={content} />
        </div>
      )}
    </section>
  );
};

export default HeroSection;
