"""
Markdown processing utilities (matching frontend implementation)
"""

import re
from typing import Dict, Any


def parse_frontmatter(content: str) -> Dict[str, Any]:
    """
    Parse frontmatter from markdown content
    This matches the frontend implementation exactly
    """
    frontmatter_regex = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.search(frontmatter_regex, content, re.DOTALL)
    
    if not match:
        return {
            'data': {},
            'content': content
        }
    
    yaml_content, markdown_content = match.groups()
    data: Dict[str, Any] = {}
    
    # Simple YAML parsing for basic key-value pairs
    lines = yaml_content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        colon_index = line.find(':')
        if colon_index == -1:
            continue
        
        key = line[:colon_index].strip()
        value = line[colon_index + 1:].strip()
        
        # Remove quotes
        if ((value.startswith('"') and value.endswith('"')) or 
            (value.startswith("'") and value.endswith("'"))):
            value = value[1:-1]
        
        # Parse numbers
        if re.match(r'^\d+$', value):
            value = int(value)
        elif re.match(r'^\d+\.\d+$', value):
            value = float(value)
        
        # Parse booleans
        if value == 'true':
            value = True
        elif value == 'false':
            value = False
        
        data[key] = value
    
    return {
        'data': data,
        'content': markdown_content.strip()
    }