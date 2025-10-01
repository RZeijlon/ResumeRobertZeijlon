import type { MetadataValue } from '../types';

// Simple frontmatter parser for browser compatibility
export function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)$/s;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      data: {},
      content: content
    };
  }

  const [, yamlContent, markdownContent] = match;
  const data: Record<string, MetadataValue> = {};

  // Simple YAML parsing for basic key-value pairs
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.slice(0, colonIndex).trim();
    let value: MetadataValue = trimmedLine.slice(colonIndex + 1).trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Parse numbers
    if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    } else if (/^\d+\.\d+$/.test(value)) {
      value = parseFloat(value);
    }
    
    // Parse booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    data[key] = value;
  }
  
  return {
    data,
    content: markdownContent.trim()
  };
}