import os
import re
from pathlib import Path

def remove_uppercase_from_buttons(directory):
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Regex to match <Button ... className="..." ... > where className contains uppercase
        # This is a bit complex, so we can split it.
        # Find all <Button tags
        
        # A simpler approach: find all occurrences of 'uppercase'
        # Check if they are inside a <Button tag
        
        # We can look for `<Button[^>]*className=[^>]*>` 
        def replacer(match):
            tag = match.group(0)
            if 'uppercase' in tag:
                # Remove the word uppercase, taking care of spaces
                tag = re.sub(r'\buppercase\b\s*', '', tag)
                # Cleanup potential trailing spaces before quotes
                tag = tag.replace('  "', ' "').replace(' "', '"')
            return tag
            
        new_content = re.sub(r'<Button[^>]*>', replacer, content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {path}")

if __name__ == '__main__':
    remove_uppercase_from_buttons('c:/Users/tanya/.gemini/antigravity/scratch/educ/wed/src')
