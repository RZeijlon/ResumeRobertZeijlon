/**
 * Content and CMS type definitions
 */

/**
 * Metadata value types supported in frontmatter
 */
export type MetadataValue = string | number | boolean;

/**
 * Content item with parsed frontmatter metadata
 */
export interface ContentItem {
  id: string;
  content: string;
  metadata: Record<string, MetadataValue>;
  rawContent: string;
}

/**
 * Site configuration
 */
export interface SiteConfig {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
  };
  features: {
    chatBot: {
      enabled: boolean;
      welcomeFile: string;
      ragEnabled: boolean;
    };
    accessibility: {
      highVisibilityMode: boolean;
      noAnimationMode: boolean;
      keyboardNavigation: boolean;
    };
    matrixBackground: {
      enabled: boolean;
      particles: number;
      speed: number;
    };
  };
  version: string;
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  layout: {
    sections: LayoutSection[];
  };
  responsive: {
    breakpoints: Record<string, string>;
    gridSettings: Record<string, Record<string, string>>;
  };
}

/**
 * Section configuration in layout
 */
export interface LayoutSection {
  id: string;
  component: string;
  file?: string;
  files?: string[];
  width: 'full' | 'dynamic';
  navbar: false | { label: string; order: number };
}

/**
 * Design system configuration
 */
export interface DesignConfig {
  spacing: {
    box_padding: string;
    box_margin: string;
    section_gap: string;
    grid_gap: string;
  };
  typography: {
    font_family: {
      primary: string;
      monospace: string;
    };
    font_sizes: {
      hero_title: string;
      section_title: string;
      body: string;
    };
  };
  borders: {
    radius: string;
    width: string;
    style: string;
  };
  effects: {
    box_shadow: string;
    transition_speed: string;
  };
}

/**
 * Personal information
 */
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  social: {
    linkedin: { url: string; username: string };
    github: { url: string; username: string };
  };
  professional: {
    specialization: string;
    focus: string;
  };
}

/**
 * Navigation item for navbar
 */
export interface NavbarItem {
  id: string;
  label: string;
  order: number;
}
