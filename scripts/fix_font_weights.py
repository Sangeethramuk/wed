import re
from pathlib import Path

def fix_font_weights(directory):
    count = 0
    
    for path in Path(directory).rglob('*.tsx'):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        # font-black -> font-medium (used in filters, labels, badges, table headers)
        new_content = new_content.replace('font-black', 'font-medium')
        # font-bold -> font-medium for small UI text (tracking-widest/wider labels)
        # Only replace font-bold that appears alongside tracking classes (label/filter patterns)
        new_content = re.sub(r'font-bold(\s+[^"]*?tracking)', r'font-medium\1', new_content)

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {path.name}")
            
    print(f"\nTotal files updated: {count}")

if __name__ == '__main__':
    fix_font_weights('c:/Users/tanya/.gemini/antigravity/scratch/educ/wed/src')
