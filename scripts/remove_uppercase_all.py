import re
from pathlib import Path

def remove_uppercase_all(directory):
    count = 0
    # Remove standalone 'uppercase' class from any className string
    pattern = re.compile(r'\buppercase\b\s*')
    
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = pattern.sub('', content)
        # Clean up any double spaces inside className strings
        new_content = re.sub(r'  +', ' ', new_content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {path.name}")
            
    print(f"\nTotal files updated: {count}")

if __name__ == '__main__':
    remove_uppercase_all('c:/Users/tanya/.gemini/antigravity/scratch/educ/wed/src')
