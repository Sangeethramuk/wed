import os
import re
from pathlib import Path

def bump_tiny_fonts(directory):
    count = 0
    # Match text-[7px], text-[8px], text-[9px], text-[10px], text-[11px]
    pattern = re.compile(r'text-\[(?:7|8|9|10|11)px\]')
    
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = pattern.sub('text-xs', content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {path.name}")
            
    print(f"Total files updated: {count}")

if __name__ == '__main__':
    bump_tiny_fonts('c:/Users/tanya/.gemini/antigravity/scratch/educ/wed/src')
