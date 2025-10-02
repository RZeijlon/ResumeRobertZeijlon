import MarkdownRenderer from '../../shared/MarkdownRenderer';
import type { ContentItem, PersonalInfo } from '../../../types';
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone } from 'react-icons/fa';
import './ContactSection.css';

interface ContactSectionProps {
  sectionId: string;
  content: ContentItem;
  personalInfo: PersonalInfo;
}

const ContactSection = ({ sectionId, content, personalInfo }: ContactSectionProps) => {
  // Remove the first markdown heading since we display it separately
  const contentWithoutHeading = content.content.replace(/^#\s+.*$/m, '').trim();

  return (
    <section id={sectionId} className="contact">
      <div className="contact-header">
        <h2>{content.metadata.title}</h2>
      </div>

      <div className="contact-intro">
        <MarkdownRenderer content={{ ...content, content: contentWithoutHeading }} />
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
  );
};

export default ContactSection;
