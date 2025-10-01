/**
 * Theme and styling type definitions
 */

/**
 * Color scheme for a theme
 */
export interface ThemeColors {
  highlight: string;
  frames: string;
  'lighter-background': string;
  'darker-background': string;
  'background-contrast': string;
  [key: string]: string; // Allow additional color properties
}

/**
 * Theme effects configuration
 */
export interface ThemeEffects {
  matrixBackground: boolean;
  animations: boolean;
}

/**
 * Individual theme definition
 */
export interface Theme {
  name: string;
  colors: ThemeColors;
  effects: ThemeEffects;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  themes: Record<string, Theme>;
  customization: {
    allowUserColors: boolean;
    colorMappings: Record<string, string[]>;
  };
}

/**
 * Theme ID type (union of possible theme keys)
 */
export type ThemeId = string;
