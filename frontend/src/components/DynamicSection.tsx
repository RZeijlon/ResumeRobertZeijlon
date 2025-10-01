import React from 'react'
import MarkdownRenderer from './shared/MarkdownRenderer'
import type { ContentItem, PersonalInfo } from '../types'
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone } from 'react-icons/fa'

interface DynamicSectionProps {
  sectionId: string
  component: string
  content?: ContentItem
  contents?: ContentItem[]
  width: 'full' | 'dynamic'
  personalInfo?: PersonalInfo
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  sectionId,
  component,
  content,
  contents,
  width,
  personalInfo
}) => {
  const renderHeroSection = () => {
    if (!content) return null
    
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
    )
  }

  const renderAboutSection = () => {
    if (!content) return null
    
    return (
      <section id={sectionId} className="about">
        <div className="about-header">
          <h2>{content.metadata.title}</h2>
        </div>
        <div className="about-content">
          <div className="about-intro">
            <MarkdownRenderer content={{...content, content: content.content.replace(/^#\s+.*$/m, '').trim()}} />
          </div>
        </div>
      </section>
    )
  }

  const renderSkillsGrid = () => {
    if (!contents) return null

    const sortedContents = contents.sort((a, b) => {
      const aOrder = typeof a.metadata.order === 'number' ? a.metadata.order : 0
      const bOrder = typeof b.metadata.order === 'number' ? b.metadata.order : 0
      return aOrder - bOrder
    })
    
    return (
      <div className={`skills-grid ${width === 'dynamic' ? 'dynamic-width' : 'full-width'}`}>
        {sortedContents.map((skillContent) => (
          <div key={skillContent.id} className="skill-category">
            <MarkdownRenderer content={skillContent} />
          </div>
        ))}
      </div>
    )
  }

  const renderPhilosophySection = () => {
    if (!content) return null
    
    return (
      <div className="philosophy-statement">
        <MarkdownRenderer content={content} />
      </div>
    )
  }

  const renderProjectsSection = () => {
    if (!content) return null

    const title = content.metadata.title || 'Featured Projects'

    return (
      <section id={sectionId} className="projects">
        <div className="projects-header">
          <h2>{title}</h2>
        </div>
      </section>
    )
  }

  const renderProjectGrid = () => {
    if (!contents) return null

    const sortedProjects = contents.sort((a, b) => {
      const aOrder = typeof a.metadata.order === 'number' ? a.metadata.order : 0
      const bOrder = typeof b.metadata.order === 'number' ? b.metadata.order : 0
      return aOrder - bOrder
    })

    return (
      <div className="project-grid">
        {sortedProjects.map((project) => {
          const image = typeof project.metadata.image === 'string' ? project.metadata.image : undefined
          const title = typeof project.metadata.title === 'string' ? project.metadata.title : undefined
          const tech = typeof project.metadata.tech === 'string' ? project.metadata.tech : undefined
          const github = typeof project.metadata.github === 'string' ? project.metadata.github : undefined

          return (
            <div key={project.id} className={`project-card ${project.metadata.featured ? 'featured' : ''}`}>
              {image && (
                <div className="project-image">
                  <img
                    src={image.startsWith('/') ? image : `/page_content/assets/images/${image}`}
                    alt={title || project.id}
                  />
                </div>
              )}
              <MarkdownRenderer content={project} />
              {tech && (
                <p className="project-tech">{tech}</p>
              )}
              {github && (
                <div className="project-links">
                  <a href={github} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderContactSection = () => {
    if (!content || !personalInfo) return null
    
    return (
      <section id={sectionId} className="contact">
        <div className="contact-header">
          <h2>{content.metadata.title}</h2>
        </div>
        
        <div className="contact-intro">
          <MarkdownRenderer content={{...content, content: content.content.replace(/^#\s+.*$/m, '').trim()}} />
        </div>
        
        <div className="contact-links">
          <a 
            href={personalInfo.social.linkedin.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-link linkedin"
          >
            <FaLinkedin className="contact-icon" />
            <span>LinkedIn</span>
          </a>
          
          <a 
            href={personalInfo.social.github.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-link github"
          >
            <FaGithub className="contact-icon" />
            <span>GitHub</span>
          </a>
          
          <a href={`mailto:${personalInfo.email}`} className="contact-link email">
            <FaEnvelope className="contact-icon" />
            <span>{personalInfo.email}</span>
          </a>
          
          <a href={`tel:${personalInfo.phone.replace(/[^\d+]/g, '')}`} className="contact-link phone">
            <FaPhone className="contact-icon" />
            <span>{personalInfo.phone}</span>
          </a>
        </div>
      </section>
    )
  }

  // Render based on component type
  switch (component) {
    case 'HeroSection':
      return renderHeroSection()
    case 'AboutSection':
      return renderAboutSection()
    case 'SkillsGrid':
      return renderSkillsGrid()
    case 'PhilosophySection':
      return renderPhilosophySection()
    case 'ProjectsSection':
      return renderProjectsSection()
    case 'ProjectGrid':
      return renderProjectGrid()
    case 'ContactSection':
      return renderContactSection()
    default:
      // Generic section renderer
      if (content) {
        return (
          <section id={sectionId} className={`section-${sectionId}`}>
            <MarkdownRenderer content={content} />
          </section>
        )
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
        )
      }
      return null
  }
}

export default DynamicSection