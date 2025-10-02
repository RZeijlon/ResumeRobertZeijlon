import React from 'react';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';
import MarkdownRenderer from './shared/MarkdownRenderer';
import type { ContentItem, PersonalInfo } from '../types';

interface DynamicSectionProps {
  sectionId: string;
  component: string;
  content?: ContentItem;
  contents?: ContentItem[];
  width: 'full' | 'dynamic';
  personalInfo?: PersonalInfo;
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  sectionId,
  component,
  content,
  contents,
  width,
  personalInfo
}) => {
  // Route to specialized section components
  switch (component) {
    case 'HeroSection':
      return content ? <HeroSection sectionId={sectionId} content={content} /> : null;

    case 'AboutSection':
      return content ? <AboutSection sectionId={sectionId} content={content} /> : null;

    case 'SkillsGrid':
      return contents ? <SkillsSection contents={contents} width={width} /> : null;

    case 'PhilosophySection':
      return content ? (
        <div className="philosophy-statement">
          <MarkdownRenderer content={content} />
        </div>
      ) : null;

    case 'ProjectsSection':
    case 'ProjectGrid':
      return <ProjectsSection sectionId={sectionId} content={content} contents={contents} />;

    case 'ContactSection':
      return content && personalInfo ? (
        <ContactSection sectionId={sectionId} content={content} personalInfo={personalInfo} />
      ) : null;

    default:
      // Generic section renderer for unknown component types
      if (content) {
        return (
          <section id={sectionId} className={`section-${sectionId}`}>
            <MarkdownRenderer content={content} />
          </section>
        );
      }
      if (contents) {
        return (
          <div className={`section-${sectionId} ${width === 'dynamic' ? 'dynamic-width' : 'full-width'}`}>
            {contents.map((item) => (
              <div key={item.id} className="content-item">
                <MarkdownRenderer content={item} />
              </div>
            ))}
          </div>
        );
      }
      return null;
  }
};

export default DynamicSection;
