import MarkdownRenderer from '../../shared/MarkdownRenderer';
import type { ContentItem } from '../../../types';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  sectionId: string;
  content?: ContentItem;
  contents?: ContentItem[];
}

const ProjectsSection = ({ sectionId, content, contents }: ProjectsSectionProps) => {
  const title = content?.metadata.title || 'Featured Projects';
  // Only show header for the main projects section, not for accomplishments
  const showHeader = sectionId === 'project-cards';

  const renderProjectGrid = () => {
    if (!contents) return null;

    const sortedProjects = contents.sort((a, b) => {
      const aOrder = typeof a.metadata.order === 'number' ? a.metadata.order : 0;
      const bOrder = typeof b.metadata.order === 'number' ? b.metadata.order : 0;
      return aOrder - bOrder;
    });

    return (
      <div className="project-grid">
        {sortedProjects.map((project) => {
          const image = typeof project.metadata.image === 'string' ? project.metadata.image : undefined;
          const projectTitle = typeof project.metadata.title === 'string' ? project.metadata.title : undefined;
          const tech = typeof project.metadata.tech === 'string' ? project.metadata.tech : undefined;
          const github = typeof project.metadata.github === 'string' ? project.metadata.github : undefined;

          return (
            <div key={project.id} className={`project-card ${project.metadata.featured ? 'featured' : ''}`}>
              {image && (
                <div className="project-image">
                  <img
                    src={image.startsWith('/') ? image : `/page_content/assets/images/${image}`}
                    alt={projectTitle || project.id}
                  />
                </div>
              )}
              <MarkdownRenderer content={project} />
              {tech && <p className="project-tech">{tech}</p>}
              {github && (
                <div className="project-links">
                  <a href={github} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section id={sectionId} className="projects">
      {showHeader && (
        <div className="projects-header">
          <h2>{title}</h2>
        </div>
      )}
      {renderProjectGrid()}
    </section>
  );
};

export default ProjectsSection;
