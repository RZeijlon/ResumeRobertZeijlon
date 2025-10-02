import MarkdownRenderer from '../../shared/MarkdownRenderer';
import type { ContentItem } from '../../../types';
import './SkillsSection.css';

interface SkillsSectionProps {
  contents: ContentItem[];
  width: 'full' | 'dynamic';
}

const SkillsSection = ({ contents, width }: SkillsSectionProps) => {
  const sortedContents = contents.sort((a, b) => {
    const aOrder = typeof a.metadata.order === 'number' ? a.metadata.order : 0;
    const bOrder = typeof b.metadata.order === 'number' ? b.metadata.order : 0;
    return aOrder - bOrder;
  });

  return (
    <div className={`skills-grid ${width === 'dynamic' ? 'dynamic-width' : 'full-width'}`}>
      {sortedContents.map((skillContent) => (
        <div key={skillContent.id} className="skill-category">
          <MarkdownRenderer content={skillContent} />
        </div>
      ))}
    </div>
  );
};

export default SkillsSection;
