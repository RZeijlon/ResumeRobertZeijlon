import MarkdownRenderer from '../../shared/MarkdownRenderer';
import type { ContentItem } from '../../../types';
import './AboutSection.css';

interface AboutSectionProps {
  sectionId: string;
  content: ContentItem;
}

const AboutSection = ({ sectionId, content }: AboutSectionProps) => {
  // Remove the first markdown heading since we display it separately
  const contentWithoutHeading = content.content.replace(/^#\s+.*$/m, '').trim();

  return (
    <section id={sectionId} className="about">
      <div className="about-header">
        <h2>{content.metadata.title}</h2>
      </div>
      <div className="about-content">
        <div className="about-intro">
          <MarkdownRenderer content={{ ...content, content: contentWithoutHeading }} />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
